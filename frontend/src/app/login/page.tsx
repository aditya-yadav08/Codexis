"use client";

import { Github, Zap, Code2, MessageSquare } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: "repo read:user",
      },
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.10_0.01_265)]">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-[600px] rounded-full bg-accent-primary/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 size-[600px] rounded-full bg-accent-secondary/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] rounded-full bg-accent-primary/30 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 mx-4 w-full max-w-sm animate-fade-up">
        <div className="rounded-3xl border border-white/10 bg-white/6 backdrop-blur-2xl p-8 shadow-2xl shadow-black/40 flex flex-col items-center">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8 scale-125 origin-center">
            <Logo />
          </div>
          
          <p className="text-sm text-muted-foreground mb-8 text-center -mt-2">
            AI-powered code intelligence
          </p>

          {/* Features */}
          <div className="space-y-2.5 mb-8">
            {[
              { icon: Code2, text: "Index any GitHub repository instantly" },
              { icon: MessageSquare, text: "Ask questions in natural language" },
              { icon: Zap, text: "Get AI answers with source citations" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="size-6 rounded-lg bg-accent-primary/15 border border-accent-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="size-3.5 text-accent-primary" />
                </div>
                {text}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={login}
            className="group w-full flex items-center justify-center gap-2.5 rounded-xl px-5 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/80 hover:to-accent-secondary/80 text-white font-semibold text-sm shadow-lg shadow-accent-glow/25 transition-all duration-200 hover:shadow-accent-glow/40 hover:scale-[1.02] active:scale-[0.99]"
          >
            <Github className="size-4" />
            Continue with GitHub
          </button>

          <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}