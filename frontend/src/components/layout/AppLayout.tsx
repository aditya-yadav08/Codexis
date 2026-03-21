"use client";

import { useStore } from "@/store/useStore";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import AppSidebar from "./AppSidebar";
import AppNavbar from "./AppNavbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useStore();

  const isPublicRoute = pathname === "/login";

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.push("/login");
    }
  }, [user, loading, isPublicRoute, router]);

  const showAuthUI = user && !isPublicRoute;

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden font-sans">
      {/* Desktop sidebar */}
      {showAuthUI && (
        <div className="hidden md:flex">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>
      )}

      {/* Mobile sidebar */}
      {showAuthUI && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-[--sidebar] border-r border-white/8">
            <AppSidebar collapsed={false} onToggle={() => {}} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {showAuthUI && <AppNavbar onOpenSidebarMobile={() => setMobileSidebarOpen(true)} />}

        <main className={cn(
          "flex-1 min-h-0 overflow-y-auto",
          showAuthUI ? "px-4 py-5 md:px-8 md:py-7" : "p-0"
        )}>
          <div className={cn(
            "h-full",
            showAuthUI ? "max-w-7xl mx-auto" : "max-w-none"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
