"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { CREDIT_PACKAGES } from "@/lib/billing/credits";
import { toast } from "sonner";

interface CreditPurchaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPurchaseComplete?: () => void;
}

export function CreditPurchaseModal({
    open,
    onOpenChange,
    onPurchaseComplete,
}: CreditPurchaseModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

    const handlePurchase = async (packageKey: string) => {
        try {
            setLoading(true);
            setSelectedPackage(packageKey);

            const pkg = CREDIT_PACKAGES[packageKey as keyof typeof CREDIT_PACKAGES];

            const response = await fetch("/api/billing/credits/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: pkg.amount,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create checkout");
            }

            const { url } = await response.json();

            // Redirect to checkout
            window.location.href = url;
        } catch (error) {
            console.error("Error purchasing credits:", error);
            toast.error("Failed to start checkout");
            setLoading(false);
            setSelectedPackage(null);
        }
    };

    const packages = Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => ({
        key,
        ...pkg,
        bonus: pkg.credits - pkg.amount,
        bonusPercent: Math.round(((pkg.credits - pkg.amount) / pkg.amount) * 100),
    }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Buy Credits</DialogTitle>
                    <DialogDescription>
                        Purchase credits to use for AI scoring and premium features
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    {packages.map((pkg) => (
                        <Card
                            key={pkg.key}
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedPackage === pkg.key ? "ring-2 ring-primary" : ""
                                }`}
                            onClick={() => !loading && handlePurchase(pkg.key)}
                        >
                            <CardContent className="p-6">
                                {pkg.bonusPercent > 0 && (
                                    <Badge className="mb-2 bg-green-500">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        {pkg.bonusPercent}% Bonus
                                    </Badge>
                                )}

                                <div className="text-3xl font-bold mb-1">
                                    ${pkg.amount}
                                </div>

                                <div className="text-sm text-muted-foreground mb-4">
                                    {pkg.credits} Credits
                                </div>

                                {pkg.bonus > 0 && (
                                    <div className="text-xs text-green-600 dark:text-green-400 mb-3">
                                        +{pkg.bonus} bonus credits
                                    </div>
                                )}

                                <Button
                                    disabled={loading}
                                    className="w-full"
                                    variant={selectedPackage === pkg.key ? "default" : "outline"}
                                >
                                    {loading && selectedPackage === pkg.key ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Purchase"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Credits are used for AI-powered scoring of speaking and
                        writing tasks. They never expire and can be used anytime.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
