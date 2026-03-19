"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Bell, Plus } from "lucide-react";
import { useState } from "react";
import ConnectRepoModal from "@/components/repos/ConnectRepoModal";
import { UserMenu } from "./UserMenu";

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
            className="pl-9 pr-14 h-9 rounded-xl bg-muted/60 border-border text-sm placeholder:text-muted-foreground/60 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/40"
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
          className="hidden sm:inline-flex gap-1.5 h-8 px-3 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 hover:from-indigo-400 hover:to-violet-500 shadow-md shadow-indigo-500/20 text-xs font-semibold transition-all"
        >
          <Plus className="size-3.5" />
          Connect Repo
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 cursor-pointer relative text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-indigo-400 ring-1 ring-background" />
        </Button>

        <UserMenu />
      </div>

      <ConnectRepoModal
        open={openConnectModal}
        onClose={() => setOpenConnectModal(false)}
      />
    </header>
  );
}
