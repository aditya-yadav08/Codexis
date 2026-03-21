"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Settings as SettingsIcon, ShieldCheck, Bell, Palette } from "lucide-react";

const sidebarNavItems = [
  { title: "General", href: "/settings", icon: SettingsIcon },
  { title: "Profile", href: "/settings/profile", icon: User },
  { title: "Security", href: "/settings/security", icon: ShieldCheck },
  { title: "Notifications", href: "/settings/notifications", icon: Bell },
  { title: "Appearance", href: "/settings/appearance", icon: Palette },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-glow/25">
            <SettingsIcon className="size-3.5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-accent text-foreground ring-1 ring-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <item.icon className={cn(
                  "size-4 shrink-0",
                  pathname === item.href ? "text-accent-primary" : "text-muted-foreground"
                )} />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1 max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
