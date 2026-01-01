import { NextRequest, NextResponse } from 'next/server';
import { processPolarWebhook, verifyPolarWebhook } from '@/lib/billing/webhooks';

/**
 * POST /api/billing/webhooks/polar
 * Handle Polar.sh webhooks
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('polar-signature') || '';

        // Verify webhook signature
        const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
        if (webhookSecret) {
            const isValid = verifyPolarWebhook(signature, body, webhookSecret);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        }

        const event = JSON.parse(body);
        const eventType = event.type;

        // Process webhook
        await processPolarWebhook(eventType, event.data);

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
