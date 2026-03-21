"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Bell, Plus, BellRing } from "lucide-react";
import { useState } from "react";
import ConnectRepoModal from "@/components/repos/ConnectRepoModal";
import { UserMenu } from "./UserMenu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AppNavbar({
  onOpenSidebarMobile,
}: {
  onOpenSidebarMobile?: () => void;
}) {
  const [openConnectModal, setOpenConnectModal] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center gap-3 px-4 md:px-6 shrink-0">
      {/* Mobile menu trigger */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden size-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
        onClick={onOpenSidebarMobile}
        aria-label="Open sidebar"
      >
        <Menu className="size-4" />
      </Button>

      {/* Search */}
      <div className="flex-1 flex items-center min-w-0">
        <div className="w-full max-w-md relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search repositories, chats…"
            className="pl-9 pr-14 h-9 rounded-xl bg-muted/60 border-border text-sm placeholder:text-muted-foreground/60 focus-visible:ring-accent-primary/50 focus-visible:border-accent-primary/40"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => setOpenConnectModal(true)}
          className="hidden sm:inline-flex gap-1.5 h-8 px-3 cursor-pointer rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white border-0 hover:from-accent-primary/80 hover:to-accent-secondary/80 shadow-md shadow-accent-glow/20 text-xs font-semibold transition-all"
        >
          <Plus className="size-3.5" />
          Connect Repo
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer relative text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent-primary ring-1 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 border-border bg-card/95 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center relative py-12 px-6 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/5 to-transparent pointer-events-none" />
              <div className="size-12 rounded-full bg-accent-primary/10 flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-accent-glow/20">
                <BellRing className="size-5 text-accent-primary" />
              </div>
              <div className="space-y-2 relative z-10">
                <h4 className="text-sm font-semibold text-foreground">Notifications Coming Soon</h4>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  We are building an all-new notification center to keep you up-to-date on your repository indexing, repository insights, and team activity.
                </p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu />
      </div>

      <ConnectRepoModal
        open={openConnectModal}
        onClose={() => setOpenConnectModal(false)}
      />
    </header>
  );
}
