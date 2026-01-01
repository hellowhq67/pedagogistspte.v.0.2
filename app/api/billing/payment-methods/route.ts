import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
} from '@/lib/billing/payment-methods';

/**
 * GET /api/billing/payment-methods
 * List all payment methods for the user
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const methods = await getPaymentMethods(session.user.id);

        return NextResponse.json({
            paymentMethods: methods.map(m => ({
                id: m.id,
                type: m.type,
                brand: m.brand,
                last4: m.last4,
                expiryMonth: m.expiryMonth,
                expiryYear: m.expiryYear,
                isDefault: m.isDefault,
                createdAt: m.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment methods' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/billing/payment-methods
 * Add a new payment method
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await request.json();

        const method = await addPaymentMethod(session.user.id, {
            polarPaymentMethodId: data.polarPaymentMethodId,
            type: data.type,
            brand: data.brand,
            last4: data.last4,
            expiryMonth: data.expiryMonth,
            expiryYear: data.expiryYear,
            isDefault: data.isDefault,
            metadata: data.metadata,
        });

        return NextResponse.json({
            success: true,
            paymentMethod: {
                id: method.id,
                type: method.type,
                brand: method.brand,
                last4: method.last4,
                expiryMonth: method.expiryMonth,
                expiryYear: method.expiryYear,
                isDefault: method.isDefault,
            },
        });
    } catch (error) {
        console.error('Error adding payment method:', error);
        return NextResponse.json(
            { error: 'Failed to add payment method' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/billing/payment-methods
 * Remove a payment method
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { methodId } = await request.json();

        if (!methodId) {
            return NextResponse.json(
                { error: 'Method ID is required' },
                { status: 400 }
            );
        }

        await removePaymentMethod(session.user.id, methodId);

        return NextResponse.json({
            success: true,
            message: 'Payment method removed successfully',
        });
    } catch (error) {
        console.error('Error removing payment method:', error);
        return NextResponse.json(
            { error: 'Failed to remove payment method' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/billing/payment-methods
 * Set default payment method
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { methodId } = await request.json();

        if (!methodId) {
            return NextResponse.json(
                { error: 'Method ID is required' },
                { status: 400 }
            );
        }

        const method = await setDefaultPaymentMethod(session.user.id, methodId);

        return NextResponse.json({
            success: true,
            paymentMethod: {
                id: method.id,
                type: method.type,
                brand: method.brand,
                last4: method.last4,
                isDefault: method.isDefault,
            },
        });
    } catch (error) {
        console.error('Error setting default payment method:', error);
        return NextResponse.json(
            { error: 'Failed to set default payment method' },
            { status: 500 }
        );
    }
}
