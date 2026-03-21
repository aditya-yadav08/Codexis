"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { UserMenu } from "./UserMenu";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Repositories", icon: FolderKanban },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "relative h-screen flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-sidebar-border px-4 shrink-0 gap-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Logo collapsed={collapsed} />

        {!collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="hidden cursor-pointer md:inline-flex size-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
      </div>

      {/* Collapsed toggle button */}
      {collapsed && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="hidden cursor-pointer md:inline-flex absolute -right-3 top-[72px] z-10 size-6 bg-card border border-border rounded-full text-muted-foreground hover:text-foreground shadow-sm"
        >
          <ChevronRight className="size-3" />
        </Button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
            Menu
          </p>
        )}
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center" : "",
                active
                  ? "bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-foreground ring-1 ring-accent-primary/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active
                    ? "text-accent-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto size-1.5 rounded-full bg-accent-primary shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "shrink-0 p-3 border-t border-sidebar-border",
          collapsed ? "flex justify-center" : "px-4",
        )}
      >
        <UserMenu
          showName={!collapsed}
          isSidebar
          side="right"
          align={collapsed ? "center" : "end"}
        />
      </div>
    </aside>
  );
}
