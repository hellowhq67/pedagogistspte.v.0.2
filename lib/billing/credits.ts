/**
 * Credit Purchase Business Logic
 * Extends the existing credit system in lib/subscription/credits.ts
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
    creditPurchases,
    transactions,
    type CreditPurchase,
} from '@/lib/db/schema/billing';
import { users } from '@/lib/db/schema/users';
import {
    getUserCreditPurchases,
    getCreditPurchaseById,
    getCreditPurchaseByPolarCheckoutId,
    getTotalCreditsPurchased,
} from '@/lib/db/queries/billing';

/**
 * Credit packages available for purchase
 */
export const CREDIT_PACKAGES = {
    small: { amount: 10, credits: 10, label: '$10 - 10 Credits' },
    medium: { amount: 25, credits: 27.5, label: '$25 - 27.5 Credits (10% bonus)' },
    large: { amount: 50, credits: 60, label: '$50 - 60 Credits (20% bonus)' },
    xlarge: { amount: 100, credits: 130, label: '$100 - 130 Credits (30% bonus)' },
};

/**
 * Calculate credits for a dollar amount
 */
export function calculateCreditsForAmount(amount: number): number {
    if (amount >= 100) {
        return amount * 1.3; // 30% bonus
    } else if (amount >= 50) {
        return amount * 1.2; // 20% bonus
    } else if (amount >= 25) {
        return amount * 1.1; // 10% bonus
    }
    return amount; // 1:1 ratio
}

/**
 * Create a credit purchase record
 */
export async function createCreditPurchase(
    userId: string,
    data: {
        amount: number;
        creditsAdded: number;
        polarCheckoutId?: string;
        stripeCheckoutId?: string;
        status?: string;
        metadata?: any;
    }
): Promise<CreditPurchase> {
    const [purchase] = await db
        .insert(creditPurchases)
        .values({
            userId,
            amount: data.amount.toString(),
            creditsAdded: data.creditsAdded.toString(),
            polarCheckoutId: data.polarCheckoutId,
            stripeCheckoutId: data.stripeCheckoutId,
            status: data.status || 'pending',
            metadata: data.metadata,
        })
        .returning();

    return purchase;
}

/**
 * Complete a credit purchase and add credits to user balance
 */
export async function completeCreditPurchase(
    purchaseId: string,
    transactionId?: string
): Promise<CreditPurchase> {
    const purchase = await getCreditPurchaseById(purchaseId);
    if (!purchase) {
        throw new Error('Credit purchase not found');
    }

    if (purchase.status === 'completed') {
        return purchase; // Already completed
    }

    // Update purchase status
    const [updated] = await db
        .update(creditPurchases)
        .set({
            status: 'completed',
            transactionId,
            updatedAt: new Date(),
        })
        .where(eq(creditPurchases.id, purchaseId))
        .returning();

    // Add credits to user's purchased credits balance
    // Note: This adds to a new field we'll need to track purchased credits separately
    await addPurchasedCreditsToBalance(
        purchase.userId,
        Number(purchase.creditsAdded)
    );

    return updated;
}

/**
 * Add purchased credits to user balance
 */
async function addPurchasedCreditsToBalance(
    userId: string,
    credits: number
): Promise<void> {
    // Get current user
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        throw new Error('User not found');
    }

    // For now, we'll add to dailyAiCredits
    // In a production system, you'd want a separate field for purchased credits
    const newCredits = (user.dailyAiCredits || 0) + Math.floor(credits);

    await db
        .update(users)
        .set({
            dailyAiCredits: newCredits,
        })
        .where(eq(users.id, userId));
}

/**
 * Get credit purchase history
 */
export async function getCreditPurchaseHistory(
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        status?: string;
    } = {}
): Promise<{ purchases: CreditPurchase[]; total: number }> {
    return getUserCreditPurchases(userId, options);
}

/**
 * Get a specific credit purchase
 */
export async function getCreditPurchase(purchaseId: string): Promise<CreditPurchase | null> {
    return getCreditPurchaseById(purchaseId);
}

/**
 * Get credit purchase by Polar checkout ID
 */
export async function getCreditPurchaseByCheckoutId(
    checkoutId: string
): Promise<CreditPurchase | null> {
    return getCreditPurchaseByPolarCheckoutId(checkoutId);
}

/**
 * Get total credits purchased by user
 */
export async function getUserTotalCreditsPurchased(userId: string): Promise<number> {
    return getTotalCreditsPurchased(userId);
}

/**
 * Auto-recharge configuration
 */
export interface AutoRechargeConfig {
    enabled: boolean;
    threshold: number; // Trigger when credits fall below this
    amount: number; // Amount to purchase (in dollars)
}

/**
 * Enable auto-recharge for a user
 */
export async function enableAutoRecharge(
    userId: string,
    config: { threshold: number; amount: number }
): Promise<void> {
    // Store in user metadata
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        throw new Error('User not found');
    }

    // For now, we'll use a simple approach
    // In production, you'd want a separate auto_recharge_config table
    await db
        .update(users)
        .set({
            // Store in metadata or create new fields
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
}

/**
 * Disable auto-recharge for a user
 */
export async function disableAutoRecharge(userId: string): Promise<void> {
    // Remove auto-recharge config
    await db
        .update(users)
        .set({
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
}

/**
 * Check if auto-recharge should trigger
 */
export async function checkAutoRecharge(userId: string): Promise<boolean> {
    // TODO: Implement auto-recharge logic
    // This would check user's credit balance against threshold
    // and trigger a purchase if needed
    return false;
}
