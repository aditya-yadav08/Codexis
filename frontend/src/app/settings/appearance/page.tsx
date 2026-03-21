"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette, Moon, Sun, Monitor, Check, RefreshCw, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

const themes = [
  {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
    preview: "bg-gradient-to-br from-slate-900 to-slate-800",
    border: "border-slate-700",
    dot: "bg-slate-600",
  },
  {
    id: "light",
    name: "Light",
    description: "Clean & bright",
    icon: Sun,
    preview: "bg-gradient-to-br from-slate-100 to-white",
    border: "border-slate-200",
    dot: "bg-slate-300",
  },
  {
    id: "system",
    name: "System",
    description: "Syncs with OS",
    icon: Monitor,
    preview: "bg-gradient-to-br from-slate-900 via-slate-600 to-white",
    border: "border-slate-500",
    dot: "bg-slate-500",
  },
];

const accents = [
  { name: "Indigo", tw: "bg-indigo-500", hex: "#6366f1" },
  { name: "Violet", tw: "bg-violet-500", hex: "#8b5cf6" },
  { name: "Blue", tw: "bg-blue-500", hex: "#3b82f6" },
  { name: "Rose", tw: "bg-rose-500", hex: "#f43f5e" },
  { name: "Emerald", tw: "bg-emerald-500", hex: "#10b981" },
  { name: "Amber", tw: "bg-amber-500", hex: "#f59e0b" },
];

export default function AppearanceSettingsPage() {
  const { theme, accentColor, setTheme, setAccentColor } = useStore();
  const [selectedTheme, setSelectedThemeState] = useState(theme);
  const [selectedAccent, setSelectedAccentState] = useState(accentColor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (data.theme) {
          setSelectedThemeState(data.theme);
          setTheme(data.theme);
        }
        if (data.accent_color) {
          setSelectedAccentState(data.accent_color);
          setAccentColor(data.accent_color);
        }
      } catch (err) {
        console.error("Fetch appearance error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (field: "theme" | "accent_color", value: string) => {
    // Optimistic update
    if (field === "theme") setTheme(value);
    if (field === "accent_color") setAccentColor(value);

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
        body: JSON.stringify({ [field]: value }),
      });

      if (res.ok) {
        toast.success(field === "theme" ? "Theme updated" : "Accent color updated");
      } else {
        toast.error("Failed to update appearance");
      }
    } catch (err) {
      console.error("Update appearance error:", err);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="size-7 animate-spin text-accent-primary/60" />
        <p className="text-sm text-muted-foreground">Loading preferences…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Theme section */}
      <Card className="border-border bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <Palette className="size-4 text-accent-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Theme Preference</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Choose how Codexis looks on your device.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((themeItem) => {
              const active = selectedTheme === themeItem.id;
              return (
                <button
                  key={themeItem.id}
                  disabled={saving}
                  onClick={() => {
                    setSelectedThemeState(themeItem.id);
                    handleSave("theme", themeItem.id);
                  }}
                  className={cn(
                    "group relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-center focus-visible:outline-none",
                    active
                      ? "border-accent-primary shadow-lg shadow-accent-glow/20 bg-accent-primary/5"
                      : "border-border bg-muted/30 hover:border-border hover:bg-muted/50",
                    saving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Theme preview thumbnail */}
                  <div className={cn(
                    "w-full h-14 rounded-xl border overflow-hidden relative",
                    themeItem.preview,
                    themeItem.border
                  )}>
                    {/* Fake UI elements inside the preview */}
                    <div className="absolute inset-0 p-2 flex gap-1.5">
                      <div className={cn("w-8 h-full rounded-md opacity-60", themeItem.dot)} />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className={cn("w-full h-2 rounded-sm opacity-40", themeItem.dot)} />
                        <div className={cn("w-3/4 h-2 rounded-sm opacity-30", themeItem.dot)} />
                        <div className={cn("w-1/2 h-2 rounded-sm opacity-20", themeItem.dot)} />
                      </div>
                    </div>
                    {/* Active checkmark */}
                    {active && (
                      <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-accent-primary flex items-center justify-center">
                        <Check className="size-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Icon + label */}
                  <div className="flex flex-col items-center gap-1">
                    <themeItem.icon className={cn(
                      "size-4 transition-colors",
                      active ? "text-accent-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <p className={cn(
                      "text-xs font-semibold leading-none",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {themeItem.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 leading-tight">
                      {themeItem.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accent color section */}
      <Card className="border-border bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold">Accent Color</CardTitle>
          <CardDescription className="text-xs">
            Personalize the primary color used throughout the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {accents.map((accent) => {
              const active = selectedAccent === accent.name;
              return (
                <button
                  key={accent.name}
                  disabled={saving}
                  onClick={() => {
                    setSelectedAccentState(accent.name);
                    handleSave("accent_color", accent.name);
                  }}
                  className={cn(
                    "group flex flex-col items-center gap-2 transition-all focus-visible:outline-none",
                    saving && "opacity-50 cursor-not-allowed"
                  )}
                  title={accent.name}
                >
                  <div className={cn(
                    "relative size-9 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 active:scale-95",
                    accent.tw,
                    active && "ring-2 ring-offset-2 ring-offset-background scale-110 shadow-lg"
                  )}
                    style={active ? { outlineColor: accent.hex, outlineWidth: "2px", outlineOffset: "3px", outlineStyle: "solid" } : {}}
                  >
                    {active && <Check className="size-4 text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    active ? "text-foreground" : "text-muted-foreground/60"
                  )}>
                    {accent.name}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status bar */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground/50 text-[10px] uppercase tracking-widest font-bold select-none">
        {saving ? (
          <><RefreshCw className="size-3 animate-spin" /> Saving…</>
        ) : (
          <><CheckCircle2 className="size-3 text-emerald-500" /> Appearance settings auto-save</>
        )}
      </div>
    </div>
  );
}
