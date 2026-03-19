"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Mail, Smartphone, RefreshCw, CheckCircle2 } from "lucide-react";
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
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40",
      checked
        ? "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/40"
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
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.notifications) setSettings(data.notifications);
      } catch (err) {
        console.error("Fetch notifications error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (newSettings: NotificationSettings) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSaving(false); return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ notifications: newSettings }),
      });
      if (res.ok) toast.success("Notification preferences updated");
      else toast.error("Failed to update preferences");
    } catch (err) {
      console.error("Update notifications error:", err);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof NotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    handleSave(updated);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="size-7 animate-spin text-indigo-400/60" />
        <p className="text-sm text-muted-foreground">Loading preferences…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Email section */}
      <Card className="border-border bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Mail className="size-4 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Email Notifications</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Choose what lands in your inbox.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-0 pt-2">
          <NotificationRow
            label="Product Updates"
            description="Stay informed about new features and improvements."
            checked={settings.emailUpdates}
            onChange={() => toggle("emailUpdates")}
            disabled={saving}
          />
          <NotificationRow
            label="Security Alerts"
            description="Get notified about significant account activity."
            checked={settings.securityAlerts}
            onChange={() => toggle("securityAlerts")}
            disabled={saving}
          />
          <NotificationRow
            label="New Features & Releases"
            description="Be the first to know about new releases."
            checked={settings.newFeatures}
            onChange={() => toggle("newFeatures")}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {/* Push section */}
      <Card className="border-border bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Smartphone className="size-4 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">In-App & Push</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Real-time updates delivered on your device.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-0 pt-2">
          <NotificationRow
            label="Activity Notifications"
            description="Repo indexing and analysis completion alerts."
            checked={settings.pushActivity}
            onChange={() => toggle("pushActivity")}
            disabled={saving}
          />
          <NotificationRow
            label="Mentions & Replies"
            description="Be notified when someone mentions or replies to you."
            checked={settings.mentions}
            onChange={() => toggle("mentions")}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {/* Status bar */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground/50 text-[10px] uppercase tracking-widest font-bold select-none">
        {saving ? (
          <><RefreshCw className="size-3 animate-spin" /> Saving…</>
        ) : (
          <><CheckCircle2 className="size-3 text-emerald-500" /> Preferences auto-save</>
        )}
      </div>
    </div>
  );
}
