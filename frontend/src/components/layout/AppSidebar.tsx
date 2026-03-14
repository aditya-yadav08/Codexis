"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Repositories", icon: FolderKanban },
  { href: "/docs", label: "Documentation", icon: BookOpen },
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
        "relative h-screen flex flex-col border-r border-white/8 bg-[oklch(0.12_0.015_265)] transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-white/8 px-4 shrink-0 gap-3",
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
            className="hidden cursor-pointer md:inline-flex size-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/8 rounded-lg"
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
          className="hidden cursor-pointer md:inline-flex absolute -right-3 top-[72px] z-10 size-6 bg-[oklch(0.14_0.015_265)] border border-white/10 rounded-full text-muted-foreground hover:text-foreground shadow-sm"
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
                  ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white ring-1 ring-indigo-500/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/6",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active
                    ? "text-indigo-400"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto size-1.5 rounded-full bg-indigo-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "shrink-0 p-3 border-t border-white/8 space-y-2",
          collapsed ? "flex flex-col items-center" : "",
        )}
      >
        {collapsed ? (
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow">
            U
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-1">
            <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow shrink-0">
              U
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                User
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Pro plan
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              PRO
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors",
            collapsed ? "justify-center size-9" : "px-3 h-9",
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
