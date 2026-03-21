"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Mail, Smartphone, RefreshCw, CheckCircle2, Construction } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Premium animated toggle switch
const Switch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40",
      checked
        ? "bg-gradient-to-r from-accent-primary to-accent-secondary shadow-sm shadow-accent-glow/40"
        : "bg-muted-foreground/20"
    )}
  >
    <span
      className={cn(
        "pointer-events-none block size-3.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
        checked ? "translate-x-4.5" : "translate-x-0.5"
      )}
    />
  </button>
);

type NotificationSettings = {
  emailUpdates: boolean;
  securityAlerts: boolean;
  pushActivity: boolean;
  mentions: boolean;
  newFeatures: boolean;
};

const defaultSettings: NotificationSettings = {
  emailUpdates: true,
  securityAlerts: true,
  pushActivity: false,
  mentions: true,
  newFeatures: false,
};

function NotificationRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
      <div className="space-y-0.5 pr-4">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export default function NotificationsSettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-20 px-6 text-center space-y-6 animate-fade-in relative overflow-hidden rounded-2xl border border-white/5 bg-white/2">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="size-20 rounded-3xl bg-amber-500/10 flex items-center justify-center relative z-10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/20">
        <Construction className="size-10 text-amber-500" />
      </div>
      <div className="space-y-3 relative z-10 max-w-lg">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Notifications Coming Soon</h3>
        <p className="text-base text-muted-foreground/80 leading-relaxed">
          We're actively building a comprehensive notification engine. Soon you'll be able to receive alerts via Email and In-App Push for indexing status, team mentions, and security alerts.
        </p>
      </div>
    </div>
  );
}
