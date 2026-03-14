"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.provider_token) {
        syncToken(session.provider_token);
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.provider_token) {
          syncToken(session.provider_token);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const syncToken = async (token: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log("Syncing GitHub token to backend...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sync-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider_token: token }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Token sync failed:", res.status, err);
      } else {
        console.log("GitHub token synced successfully");
      }
    } catch (err) {
      console.error("Failed to sync GitHub token:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
