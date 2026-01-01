"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { TIER_PRICING, TIER_FEATURES_DISPLAY, SubscriptionTier } from "@/lib/subscription/tiers";

interface PlansModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentTier: string;
}

export function PlansModal({ open, onOpenChange, currentTier }: PlansModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSelectPlan = (tier: string) => {
        if (tier === "free") {
            onOpenChange(false);
            return;
        }

        // Redirect to checkout page
        router.push(`/checkout/${tier}`);
        onOpenChange(false);
    };

    const tiers = [
        { key: SubscriptionTier.FREE, name: "Free", color: "bg-gray-500" },
        { key: SubscriptionTier.PRO, name: "Pro", color: "bg-blue-500" },
        { key: SubscriptionTier.PREMIUM, name: "Premium", color: "bg-purple-500" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Choose Your Plan</DialogTitle>
                    <DialogDescription>
                        Select the plan that best fits your learning needs
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                    {tiers.map((tier) => {
                        const pricing = TIER_PRICING[tier.key];
                        const features = TIER_FEATURES_DISPLAY[tier.key];
                        const isCurrent = currentTier === tier.key;

                        return (
                            <Card
                                key={tier.key}
                                className={`relative ${isCurrent ? "ring-2 ring-primary" : ""}`}
                            >
                                {isCurrent && (
                                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                                        Current Plan
                                    </Badge>
                                )}

                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                                        <CardTitle>{tier.name}</CardTitle>
                                    </div>
                                    <CardDescription>
                                        <div className="text-3xl font-bold text-foreground">
                                            {tier.key === SubscriptionTier.FREE ? (
                                                "Free"
                                            ) : (
                                                <>
                                                    ${pricing.price}
                                                    <span className="text-sm text-muted-foreground">
                                                        /{pricing.period}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <ul className="space-y-2 mb-4">
                                        {features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleSelectPlan(tier.key)}
                                        disabled={isCurrent || loading}
                                        className="w-full"
                                        variant={isCurrent ? "outline" : "default"}
                                    >
                                        {isCurrent
                                            ? "Current Plan"
                                            : tier.key === SubscriptionTier.FREE
                                                ? "Downgrade"
                                                : currentTier === SubscriptionTier.FREE
                                                    ? "Upgrade"
                                                    : "Change Plan"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
