/**
 * Webhook Processing Logic for Polar.sh
 */

import crypto from 'crypto';
import { createSubscription, updateSubscription, syncSubscriptionFromPolar } from './subscriptions';
import { createInvoice, syncInvoiceFromPolar } from './invoices';
import { createCreditPurchase, completeCreditPurchase } from './credits';
import { db } from '@/lib/db/drizzle';
import { transactions } from '@/lib/db/schema/billing';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';

/**
 * Verify Polar webhook signature
 */
export function verifyPolarWebhook(
    signature: string,
    payload: string,
    secret: string
): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Handle checkout.completed event
 */
export async function handleCheckoutCompleted(event: any): Promise<void> {
    const { checkout } = event.data;

    // Determine if this is a subscription or one-time purchase
    if (checkout.product_type === 'subscription') {
        await handleSubscriptionCheckout(checkout);
    } else {
        await handleCreditPurchaseCheckout(checkout);
    }
}

/**
 * Handle subscription checkout
 */
async function handleSubscriptionCheckout(checkout: any): Promise<void> {
    const { customer_email, subscription_id, product, amount, metadata } = checkout;

    // Find user by email
    const user = await db.query.users.findFirst({
        where: eq(users.email, customer_email),
    });

    if (!user) {
        console.error('User not found for email:', customer_email);
        return;
    }

    // Determine tier from product or metadata
    const tier = metadata?.tier || 'pro';

    // Create subscription record
    await createSubscription(user.id, {
        polarSubscriptionId: subscription_id,
        tier,
        amount: (amount / 100).toString(), // Convert cents to dollars
        currency: checkout.currency || 'USD',
        interval: 'month',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        metadata: checkout.metadata,
    });

    // Create transaction record
    await db.insert(transactions).values({
        userId: user.id,
        type: 'subscription',
        status: 'completed',
        amount: (amount / 100).toString(),
        currency: checkout.currency || 'USD',
        description: `Subscription to ${tier} plan`,
        polarTransactionId: checkout.id,
        metadata: checkout.metadata,
    });
}

/**
 * Handle credit purchase checkout
 */
async function handleCreditPurchaseCheckout(checkout: any): Promise<void> {
    const { customer_email, amount, metadata } = checkout;

    // Find user by email
    const user = await db.query.users.findFirst({
        where: eq(users.email, customer_email),
    });

    if (!user) {
        console.error('User not found for email:', customer_email);
        return;
    }

    const dollarAmount = amount / 100;
    const creditsAdded = metadata?.credits || dollarAmount;

    // Create credit purchase record
    const purchase = await createCreditPurchase(user.id, {
        amount: dollarAmount,
        creditsAdded,
        polarCheckoutId: checkout.id,
        status: 'pending',
        metadata: checkout.metadata,
    });

    // Create transaction record
    const [transaction] = await db.insert(transactions).values({
        userId: user.id,
        type: 'credit_purchase',
        status: 'completed',
        amount: dollarAmount.toString(),
        currency: checkout.currency || 'USD',
        description: `Credit purchase: ${creditsAdded} credits`,
        polarTransactionId: checkout.id,
        metadata: checkout.metadata,
    }).returning();

    // Complete the purchase and add credits
    await completeCreditPurchase(purchase.id, transaction.id);
}

/**
 * Handle subscription.updated event
 */
export async function handleSubscriptionUpdated(event: any): Promise<void> {
    const { subscription } = event.data;

    await syncSubscriptionFromPolar(subscription.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
}

/**
 * Handle subscription.canceled event
 */
export async function handleSubscriptionCanceled(event: any): Promise<void> {
    const { subscription } = event.data;

    await syncSubscriptionFromPolar(subscription.id, {
        status: 'canceled',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: true,
    });
}

/**
 * Handle payment.succeeded event
 */
export async function handlePaymentSucceeded(event: any): Promise<void> {
    const { payment } = event.data;

    // Find user by customer email or ID
    const user = await db.query.users.findFirst({
        where: eq(users.email, payment.customer_email),
    });

    if (!user) {
        console.error('User not found for payment:', payment.id);
        return;
    }

    // Create invoice record
    await createInvoice(user.id, {
        polarInvoiceId: payment.invoice_id,
        invoiceNumber: payment.invoice_number || `INV-${payment.id}`,
        status: 'paid',
        subtotal: (payment.amount / 100).toString(),
        total: (payment.amount / 100).toString(),
        amountPaid: (payment.amount / 100).toString(),
        amountDue: '0',
        currency: payment.currency || 'USD',
        lineItems: payment.line_items || [],
        invoiceDate: new Date(),
        paidAt: new Date(),
        pdfUrl: payment.invoice_pdf,
        metadata: payment.metadata,
    });
}

/**
 * Handle payment.failed event
 */
export async function handlePaymentFailed(event: any): Promise<void> {
    const { payment } = event.data;

    // Find user by customer email
    const user = await db.query.users.findFirst({
        where: eq(users.email, payment.customer_email),
    });

    if (!user) {
        console.error('User not found for failed payment:', payment.id);
        return;
    }

    // Create transaction record for failed payment
    await db.insert(transactions).values({
        userId: user.id,
        type: 'subscription',
        status: 'failed',
        amount: (payment.amount / 100).toString(),
        currency: payment.currency || 'USD',
        description: `Failed payment: ${payment.failure_message || 'Unknown error'}`,
        polarTransactionId: payment.id,
        metadata: {
            ...payment.metadata,
            failureReason: payment.failure_message,
        },
    });

    // TODO: Send notification to user about failed payment
    console.log('Payment failed for user:', user.email, payment.failure_message);
}

/**
 * Main webhook handler
 */
export async function processPolarWebhook(eventType: string, data: any): Promise<void> {
    console.log('Processing Polar webhook:', eventType);

    try {
        switch (eventType) {
            case 'checkout.completed':
                await handleCheckoutCompleted({ data });
                break;

            case 'subscription.updated':
                await handleSubscriptionUpdated({ data });
                break;

            case 'subscription.canceled':
                await handleSubscriptionCanceled({ data });
                break;

            case 'payment.succeeded':
                await handlePaymentSucceeded({ data });
                break;

            case 'payment.failed':
                await handlePaymentFailed({ data });
                break;

            default:
                console.log('Unhandled webhook event:', eventType);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        throw error;
    }
}
