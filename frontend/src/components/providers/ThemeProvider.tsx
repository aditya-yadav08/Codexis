"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

const THEME_STORAGE_KEY = "codexis-theme";
const ACCENT_STORAGE_KEY = "codexis-accent";

const ACCENT_CONFIG: Record<string, { primary: string, secondary: string, glow: string }> = {
  Indigo: { primary: "#6366f1", secondary: "#7c3aed", glow: "#6366f1" },
  Violet: { primary: "#8b5cf6", secondary: "#c026d3", glow: "#8b5cf6" },
  Blue:   { primary: "#3b82f6", secondary: "#0891b2", glow: "#3b82f6" },
  Rose:   { primary: "#f43f5e", secondary: "#db2777", glow: "#f43f5e" },
  Emerald:{ primary: "#10b981", secondary: "#0d9488", glow: "#10b981" },
  Amber:  { primary: "#f59e0b", secondary: "#ea580c", glow: "#f59e0b" },
};

function applyTheme(theme: string, accentColor?: string) {
  const root = document.documentElement;
  if (theme === "system") {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", systemDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }

  // Remove existing theme classes just in case
  Array.from(root.classList).forEach((c) => {
    if (c.startsWith("theme-")) root.classList.remove(c);
  });

  // Apply accent directly via CSS Variables
  const color = accentColor || "Indigo";
  const config = ACCENT_CONFIG[color] || ACCENT_CONFIG["Indigo"];
  
  root.style.setProperty("--theme-primary", config.primary);
  root.style.setProperty("--theme-secondary", config.secondary);
  root.style.setProperty("--theme-glow", config.glow);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, accentColor, setTheme, setAccentColor } = useStore();

  // On mount: restore from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY);
    
    let changed = false;
    
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
      changed = true;
    }
    
    if (savedAccent && savedAccent !== accentColor) {
      setAccentColor(savedAccent);
      changed = true;
    }
    
    if (!changed) {
      applyTheme(theme, accentColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever theme changes: persist + apply
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(ACCENT_STORAGE_KEY, accentColor);
    applyTheme(theme, accentColor);
  }, [theme, accentColor]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system", accentColor);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, accentColor]);

  return <>{children}</>;
}
