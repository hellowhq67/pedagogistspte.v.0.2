import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getInvoice, generateInvoicePDF } from '@/lib/billing/invoices';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/billing/invoices/[id]
 * Get specific invoice details
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
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

        const { id } = await params;
        const invoice = await getInvoice(id);

        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Verify invoice belongs to user
        if (invoice.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            invoice: {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                status: invoice.status,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
                total: invoice.total,
                amountPaid: invoice.amountPaid,
                amountDue: invoice.amountDue,
                currency: invoice.currency,
                lineItems: invoice.lineItems,
                invoiceDate: invoice.invoiceDate,
                dueDate: invoice.dueDate,
                paidAt: invoice.paidAt,
                pdfUrl: invoice.pdfUrl,
            },
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoice' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/billing/invoices/[id]
 * Download invoice PDF
 */
export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
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

        const { id } = await params;
        const invoice = await getInvoice(id);

        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Verify invoice belongs to user
        if (invoice.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const pdfUrl = await generateInvoicePDF(id);

        return NextResponse.json({
            pdfUrl,
        });
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate invoice PDF' },
            { status: 500 }
        );
    }
}
