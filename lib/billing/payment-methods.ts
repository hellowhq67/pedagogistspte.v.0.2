/**
 * Payment Method Management Business Logic
 */

import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
    paymentMethods,
    type PaymentMethod,
    type NewPaymentMethod,
} from '@/lib/db/schema/billing';
import {
    getUserPaymentMethods,
    getDefaultPaymentMethod,
    getPaymentMethodById,
} from '@/lib/db/queries/billing';

/**
 * Get all payment methods for a user
 */
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return getUserPaymentMethods(userId);
}

/**
 * Add a new payment method
 */
export async function addPaymentMethod(
    userId: string,
    data: {
        polarPaymentMethodId?: string;
        stripePaymentMethodId?: string;
        type?: string;
        brand?: string;
        last4?: string;
        expiryMonth?: number;
        expiryYear?: number;
        isDefault?: boolean;
        metadata?: any;
    }
): Promise<PaymentMethod> {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
        await db
            .update(paymentMethods)
            .set({ isDefault: false })
            .where(eq(paymentMethods.userId, userId));
    }

    const [paymentMethod] = await db
        .insert(paymentMethods)
        .values({
            userId,
            polarPaymentMethodId: data.polarPaymentMethodId,
            stripePaymentMethodId: data.stripePaymentMethodId,
            type: data.type || 'card',
            brand: data.brand,
            last4: data.last4,
            expiryMonth: data.expiryMonth,
            expiryYear: data.expiryYear,
            isDefault: data.isDefault || false,
            metadata: data.metadata,
        })
        .returning();

    return paymentMethod;
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(
    userId: string,
    methodId: string
): Promise<void> {
    const method = await getPaymentMethodById(methodId);
    if (!method || method.userId !== userId) {
        throw new Error('Payment method not found');
    }

    await db
        .delete(paymentMethods)
        .where(eq(paymentMethods.id, methodId));

    // If this was the default, set another as default
    if (method.isDefault) {
        const remaining = await getUserPaymentMethods(userId);
        if (remaining.length > 0) {
            await setDefaultPaymentMethod(userId, remaining[0].id);
        }
    }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(
    userId: string,
    methodId: string
): Promise<PaymentMethod> {
    const method = await getPaymentMethodById(methodId);
    if (!method || method.userId !== userId) {
        throw new Error('Payment method not found');
    }

    // Unset all other defaults
    await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.userId, userId));

    // Set this one as default
    const [updated] = await db
        .update(paymentMethods)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(paymentMethods.id, methodId))
        .returning();

    return updated;
}

/**
 * Get the default payment method for a user
 */
export async function getUserDefaultPaymentMethod(
    userId: string
): Promise<PaymentMethod | null> {
    return getDefaultPaymentMethod(userId);
}
