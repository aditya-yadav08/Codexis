"use client";

import { Toaster as Sonner } from "sonner";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

export function ThemedToaster() {
  const { theme } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : (theme as "dark" | "light");

  return (
    <Sonner 
      closeButton 
      position="bottom-right" 
      theme={currentTheme} 
      richColors 
    />
  );
}
