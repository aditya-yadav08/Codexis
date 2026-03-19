"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  showName?: boolean;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom" | "left" | "right";
  isSidebar?: boolean;
}

export function UserMenu({ showName = false, align = "end", side = "bottom", isSidebar = false }: UserMenuProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    name?: string;
    email?: string;
    avatar?: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const data = await res.json();

        const email = session.user.email || "";
        const name = data.full_name || data.username || email.split("@")[0];
        const initials = name
          .split(/[\s-]+/)
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        setUserData({
          name,
          email,
          avatar: data.avatar || session.user.user_metadata?.avatar_url,
          initials
        });
      } catch (err) {
        console.error("Fetch user menu data error:", err);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!userData) return <div className="size-8 rounded-full bg-muted animate-pulse" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center gap-2.5 outline-none cursor-pointer group transition-all",
          isSidebar && !showName ? "justify-center" : "px-0.5"
        )}>
          <div className="relative">
            <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className="size-full object-cover" />
              ) : (
                userData.initials
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>

          {showName && (
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium text-foreground/90 truncate max-w-[120px]">
                {userData.name}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                Pro Plan
              </span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={12}
        className="w-64 p-2 bg-popover border-border backdrop-blur-2xl shadow-2xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-200 z-50"
      >
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none text-foreground">
                {userData.name}
              </p>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border mx-1" />

        <DropdownMenuGroup className="space-y-0.5 p-1">
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground focus:text-foreground focus:bg-accent cursor-pointer transition-colors"
            onClick={() => router.push("/settings/profile")}
          >
            <User className="size-4" />
            <span className="flex-1">My Profile</span>
            <ChevronRight className="size-3 opacity-30" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground focus:text-foreground focus:bg-accent cursor-pointer transition-colors"
            onClick={() => router.push("/settings")}
          >
            <Settings className="size-4" />
            <span className="flex-1">Settings</span>
            <ChevronRight className="size-3 opacity-30" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground focus:text-foreground focus:bg-accent cursor-pointer transition-colors"
            onClick={() => router.push("/billing")}
          >
            <CreditCard className="size-4" />
            <span className="flex-1">Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border mx-1" />

        <DropdownMenuGroup className="space-y-0.5 p-1">
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-indigo-400 focus:text-indigo-300 focus:bg-indigo-500/10 cursor-pointer transition-colors"
            onClick={() => router.push("/billing")}
          >
            <Sparkles className="size-4" />
            <span className="flex-1 font-medium">Upgrade to Business</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground focus:text-foreground focus:bg-accent cursor-pointer transition-colors"
            onClick={() => router.push("/settings/security")}
          >
            <ShieldCheck className="size-4" />
            <span className="flex-1">Security</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border mx-1" />

        <div className="p-1">
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            <span className="font-medium">Logout</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
