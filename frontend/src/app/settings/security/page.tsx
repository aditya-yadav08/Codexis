"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Fingerprint, Github, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SecuritySettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    }
    fetchUser();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Github className="size-4 text-accent-primary" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage the social accounts linked to your Codexis profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center border border-border">
                <Github className="size-5 text-foreground" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-xs text-muted-foreground">
                  Connected as <span className="text-foreground">{user?.user_metadata?.user_name || user?.email}</span>
                </p>
              </div>
            </div>
            <a
              href="https://github.com/settings/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-accent-primary hover:text-accent-primary/80 transition-colors font-medium"
            >
              Manage on GitHub
              <ExternalLink className="size-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 opacity-60">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Fingerprint className="size-4 text-accent-secondary" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            You are currently using GitHub for authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-xl bg-muted/40 border border-border text-center">
            <p className="text-xs text-muted-foreground italic">
              2FA is managed through your GitHub account security settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-muted-foreground/60 text-[10px] uppercase tracking-widest font-bold">
        <ShieldCheck className="size-3" />
        Authentication Managed by GitHub OAuth
      </div>
    </div>
  );
}
