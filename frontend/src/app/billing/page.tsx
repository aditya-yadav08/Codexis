"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, CreditCard, Sparkles, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Hobby",
    price: "$0",
    period: "month",
    description: "Perfect for exploring AI on small personal projects.",
    features: [
      "Up to 3 repositories",
      "50 questions / day",
      "Standard community support",
      "Public repos only",
    ],
    buttonText: "Current Plan",
    current: true,
  },
  {
    name: "Professional",
    price: "$29",
    period: "month",
    description: "Best for individual developers and high-growth projects.",
    features: [
      "Unlimited repositories",
      "Unlimited questions",
      "Priority email support",
      "Private repositories",
      "Advanced analytics",
    ],
    buttonText: "Upgrade to Pro",
    popular: true,
    icon: Zap,
    iconColor: "text-indigo-400",
  },
  {
    name: "Business",
    price: "$99",
    period: "month",
    description: "The ultimate power for teams and enterprise workflows.",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Dedicated account manager",
      "Custom AI training",
      "Audit logs & SSO",
    ],
    buttonText: "Contact Sales",
    icon: Sparkles,
    iconColor: "text-violet-400",
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <CreditCard className="size-3.5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Billing & Plans</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your subscription, usage limits, and payment methods.
        </p>
      </div>

      {/* Current Plan Banner */}
      <Card className="border-border bg-gradient-to-r from-indigo-500/8 via-card/50 to-violet-500/8 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Status
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                Active
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Hobby Plan</h2>
            <p className="text-sm text-muted-foreground">
              Your next billing cycle starts on April 14, 2026.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <Button
              variant="outline"
              className="rounded-xl border-border bg-muted/50 hover:bg-muted"
            >
              Manage Payment
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 border-0 shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-violet-500 gap-1.5">
              Upgrade Now
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
          Choose your plan
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div key={tier.name} className="relative flex">
                {/* Popular badge — positioned OUTSIDE the card above it */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-10">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-indigo-500/30">
                      <Zap className="size-2.5" />
                      Most Popular
                    </span>
                  </div>
                )}

                <Card
                  className={cn(
                    "flex flex-col w-full transition-all duration-300",
                    tier.popular
                      ? "border-indigo-500/50 bg-gradient-to-b from-indigo-500/5 to-card/50 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30 mt-2"
                      : "border-border bg-card/50 hover:border-border/70 hover:shadow-md"
                  )}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      {Icon && <Icon className={cn("size-4", tier.iconColor)} />}
                      {tier.name}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-6">
                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">
                        {tier.price}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">
                        / {tier.period}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border" />

                    {/* Features */}
                    <ul className="space-y-2.5 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <div
                            className={cn(
                              "mt-0.5 size-4 rounded-full flex items-center justify-center shrink-0",
                              tier.popular
                                ? "bg-indigo-500/15 ring-1 ring-indigo-500/30"
                                : "bg-muted"
                            )}
                          >
                            <Check
                              className={cn(
                                "size-2.5",
                                tier.popular ? "text-indigo-400" : "text-muted-foreground"
                              )}
                              strokeWidth={3}
                            />
                          </div>
                          <span className="text-sm text-foreground/80 leading-snug">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      className={cn(
                        "w-full rounded-xl font-semibold transition-all duration-200",
                        tier.current
                          ? "border-border bg-muted text-muted-foreground cursor-default"
                          : tier.popular
                          ? "bg-gradient-to-r from-indigo-500 to-violet-600 border-0 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-500"
                          : "bg-gradient-to-r from-violet-600 to-purple-700 border-0 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-600"
                      )}
                      variant={tier.current ? "outline" : "default"}
                      disabled={tier.current}
                    >
                      {tier.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground/60 pb-2">
        All plans include a 14-day free trial. No credit card required. Cancel anytime.
      </p>
    </div>
  );
}
