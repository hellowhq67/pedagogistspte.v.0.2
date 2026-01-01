import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getCurrentSubscription, reactivateSubscription } from '@/lib/billing/subscriptions';

/**
 * POST /api/billing/subscription/reactivate
 * Reactivate a cancelled subscription
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

        const subscription = await getCurrentSubscription(session.user.id);
        if (!subscription) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 404 }
            );
        }

        if (subscription.status !== 'cancelled' && !subscription.cancelAtPeriodEnd) {
            return NextResponse.json(
                { error: 'Subscription is not cancelled' },
                { status: 400 }
            );
        }

        const reactivated = await reactivateSubscription(subscription.id);

        return NextResponse.json({
            success: true,
            subscription: reactivated,
            message: 'Subscription reactivated successfully',
        });
    } catch (error) {
        console.error('Error reactivating subscription:', error);
        return NextResponse.json(
            { error: 'Failed to reactivate subscription' },
            { status: 500 }
        );
    }
}
