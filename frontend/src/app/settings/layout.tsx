"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Settings as SettingsIcon, ShieldCheck, Bell, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sidebarNavItems = [
  {
    title: "General",
    href: "/settings",
    icon: SettingsIcon,
  },
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: ShieldCheck,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
    icon: Palette,
  },
];

const ComingSoon = ({ title }: { title: string }) => (
  <Card className="border-white/8 bg-white/4 p-12 flex flex-col items-center justify-center text-center space-y-4">
    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
       <SettingsIcon className="size-8 text-muted-foreground/40 animate-spin-slow" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-foreground">{title} Settings</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        We're working hard to bring you more customization options. This feature will be available in a future update.
      </p>
    </div>
    <Link href="/settings">
      <Button variant="outline" className="rounded-xl border-white/10">Go Back</Button>
    </Link>
  </Card>
);

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <SettingsIcon className="size-3.5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-white/10 text-white ring-1 ring-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>
        
        <div className="flex-1 max-w-2xl">
          {pathname === "/settings/notifications" ? <ComingSoon title="Notification" /> : 
           pathname === "/settings/appearance" ? <ComingSoon title="Appearance" /> : 
           children}
        </div>
      </div>
    </div>
  );
}
