import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
    getCurrentSubscription,
    cancelSubscription,
    getUserSubscriptionTier,
} from '@/lib/billing/subscriptions';
import { getUserDefaultPaymentMethod } from '@/lib/billing/payment-methods';

/**
 * GET /api/billing/subscription
 * Get current user's subscription details
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

        const subscription = await getCurrentSubscription(session.user.id);
        const tier = await getUserSubscriptionTier(session.user.id);
        const paymentMethod = await getUserDefaultPaymentMethod(session.user.id);

        return NextResponse.json({
            subscription,
            tier,
            paymentMethod: paymentMethod ? {
                id: paymentMethod.id,
                brand: paymentMethod.brand,
                last4: paymentMethod.last4,
                expiryMonth: paymentMethod.expiryMonth,
                expiryYear: paymentMethod.expiryYear,
            } : null,
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/billing/subscription
 * Cancel current subscription
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

        const { immediate } = await request.json();

        const subscription = await getCurrentSubscription(session.user.id);
        if (!subscription) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            );
        }

        const cancelled = await cancelSubscription(subscription.id, immediate);

        return NextResponse.json({
            success: true,
            subscription: cancelled,
            message: immediate
                ? 'Subscription cancelled immediately'
                : 'Subscription will be cancelled at the end of the billing period',
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
