"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function PaymentMethodsSection() {
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    async function fetchPaymentMethods() {
        try {
            setLoading(true);
            const response = await fetch("/api/billing/payment-methods");
            if (response.ok) {
                const data = await response.json();
                setPaymentMethods(data.paymentMethods);
            }
        } catch (error) {
            console.error("Error fetching payment methods:", error);
            toast.error("Failed to load payment methods");
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(methodId: string) {
        try {
            setRemovingId(methodId);
            const response = await fetch("/api/billing/payment-methods", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ methodId }),
            });

            if (!response.ok) {
                throw new Error("Failed to remove payment method");
            }

            toast.success("Payment method removed");
            fetchPaymentMethods();
        } catch (error) {
            console.error("Error removing payment method:", error);
            toast.error("Failed to remove payment method");
        } finally {
            setRemovingId(null);
        }
    }

    async function handleSetDefault(methodId: string) {
        try {
            const response = await fetch("/api/billing/payment-methods", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ methodId }),
            });

            if (!response.ok) {
                throw new Error("Failed to set default payment method");
            }

            toast.success("Default payment method updated");
            fetchPaymentMethods();
        } catch (error) {
            console.error("Error setting default:", error);
            toast.error("Failed to update default payment method");
        }
    }

    const getCardBrandIcon = (brand: string) => {
        // You could add actual card brand icons here
        return <CreditCard className="h-5 w-5" />;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Manage your payment methods</CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Method
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No payment methods added</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    {getCardBrandIcon(method.brand)}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium capitalize">{method.brand}</span>
                                            <span className="text-muted-foreground">•••• {method.last4}</span>
                                            {method.isDefault && (
                                                <Badge variant="secondary">Default</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Expires {method.expiryMonth}/{method.expiryYear}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!method.isDefault && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetDefault(method.id)}
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(method.id)}
                                        disabled={removingId === method.id}
                                    >
                                        {removingId === method.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
