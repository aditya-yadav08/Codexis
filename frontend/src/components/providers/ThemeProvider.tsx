"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

const THEME_STORAGE_KEY = "codexis-theme";

function applyTheme(theme: string) {
  const root = document.documentElement;
  if (theme === "system") {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", systemDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, accentColor, setTheme } = useStore();

  // On mount: restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && saved !== theme) {
      setTheme(saved);
    } else {
      applyTheme(theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever theme changes: persist + apply
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <>{children}</>;
}
