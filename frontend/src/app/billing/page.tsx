"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, CreditCard, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Hobby",
    price: "$0",
    description: "Perfect for exploring AI on small personal projects.",
    features: ["Up to 3 repositories", "50 questions / day", "Standard community support", "Public repos only"],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    current: true,
  },
  {
    name: "Professional",
    price: "$29",
    description: "Best for individual developers and high-growth projects.",
    features: ["Unlimited repositories", "Unlimited questions", "Priority email support", "Private repositories", "Advanced analytics"],
    buttonText: "Upgrade to Pro",
    buttonVariant: "default" as const,
    popular: true,
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    name: "Business",
    price: "$99",
    description: "The ultimate power for teams and enterprise workflows.",
    features: ["Everything in Pro", "Team collaboration", "Dedicated account manager", "Custom AI training", "Audit logs & SSO"],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    gradient: "from-violet-600 to-purple-700",
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

      {/* Current Plan Overview */}
      <Card className="border-white/8 bg-white/4 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Status</span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">Active</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Hobby Plan</h2>
            <p className="text-sm text-muted-foreground">Your next billing cycle starts on April 14, 2026.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">Manage Payment</Button>
             <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 border-0 shadow-lg shadow-indigo-500/20">Upgrade Now</Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card 
            key={tier.name} 
            className={cn(
              "border-white/8 bg-white/4 flex flex-col transition-all duration-300",
              tier.popular ? "ring-2 ring-indigo-500/50 scale-[1.02] bg-white/6" : "hover:border-white/15 hover:bg-white/5"
            )}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {tier.name === "Professional" && <Zap className="size-4 text-indigo-400" />}
                {tier.name === "Business" && <Sparkles className="size-4 text-violet-400" />}
                {tier.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {tier.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              
              <div className="space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="size-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Check className="size-2.5 text-indigo-400" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <div className="p-6 pt-0">
              <Button 
                variant={tier.buttonVariant} 
                className={cn(
                  "w-full rounded-xl transition-all duration-300",
                  tier.gradient ? `bg-gradient-to-r ${tier.gradient} border-0 text-white shadow-lg` : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
                disabled={tier.current}
              >
                {tier.buttonText}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
