"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function InvoiceList() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    async function fetchInvoices() {
        try {
            setLoading(true);
            const response = await fetch("/api/billing/invoices?limit=10");
            if (response.ok) {
                const data = await response.json();
                setInvoices(data.invoices);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload(invoiceId: string) {
        try {
            setDownloadingId(invoiceId);
            const response = await fetch(`/api/billing/invoices/${invoiceId}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to generate PDF");
            }

            const { pdfUrl } = await response.json();
            window.open(pdfUrl, "_blank");
        } catch (error) {
            console.error("Error downloading invoice:", error);
            toast.error("Failed to download invoice");
        } finally {
            setDownloadingId(null);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-500";
            case "open":
                return "bg-blue-500";
            case "void":
                return "bg-gray-500";
            default:
                return "bg-yellow-500";
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>View and download your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (invoices.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>View and download your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No invoices yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{invoice.invoiceNumber}</span>
                                    <Badge className={getStatusColor(invoice.status)}>
                                        {invoice.status}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(invoice.invoiceDate).toLocaleDateString()} • {invoice.currency}{" "}
                                    {invoice.total}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(invoice.id)}
                                disabled={downloadingId === invoice.id}
                            >
                                {downloadingId === invoice.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
