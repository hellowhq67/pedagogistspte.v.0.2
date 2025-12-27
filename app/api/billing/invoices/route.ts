import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getInvoices } from '@/lib/billing/invoices';

/**
 * GET /api/billing/invoices
 * List all invoices for the user
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

        const { invoices, total } = await getInvoices(session.user.id, {
            limit,
            offset,
            status,
        });

        return NextResponse.json({
            invoices: invoices.map(inv => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                status: inv.status,
                total: inv.total,
                amountPaid: inv.amountPaid,
                amountDue: inv.amountDue,
                currency: inv.currency,
                invoiceDate: inv.invoiceDate,
                dueDate: inv.dueDate,
                paidAt: inv.paidAt,
                pdfUrl: inv.pdfUrl,
                lineItems: inv.lineItems,
            })),
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}
