import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getCreditPurchaseHistory } from '@/lib/billing/credits';

/**
 * GET /api/billing/credits/history
 * Get credit purchase history for the user
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

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status') || undefined;

        const { purchases, total } = await getCreditPurchaseHistory(
            session.user.id,
            { limit, offset, status }
        );

        return NextResponse.json({
            purchases: purchases.map(p => ({
                id: p.id,
                amount: p.amount,
                creditsAdded: p.creditsAdded,
                status: p.status,
                createdAt: p.createdAt,
            })),
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Error fetching credit history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch credit history' },
            { status: 500 }
        );
    }
}
