import { create } from "zustand";
import { User } from "@supabase/supabase-js";

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // Auth State
  user: User | null;
  setUser: (user: User | null) => void;

  activeRepo: { owner: string; repo: string } | null;
  setActiveRepo: (repo: { owner: string; repo: string } | null) => void;

  // Appearance State
  theme: string;
  accentColor: string;
  setTheme: (theme: string) => void;
  setAccentColor: (accent: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // UI Initial State
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  // Auth Initial State
  user: null,
  setUser: (user) => set({ user }),

  activeRepo: null,
  setActiveRepo: (repo) => set({ activeRepo: repo }),

  // Appearance Initial State
  theme: "dark",
  accentColor: "Indigo",
  setTheme: (theme) => set({ theme }),
  setAccentColor: (accentColor) => set({ accentColor }),
}));
