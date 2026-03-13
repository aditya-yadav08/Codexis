"use client";

import { Github, Zap, Code2, MessageSquare } from "lucide-react";

export default function LoginPage() {
  const login = () => {
    window.location.href = "http://localhost:4000/auth/github";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[oklch(0.10_0.01_265)]">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-[600px] rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 size-[600px] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] rounded-full bg-indigo-900/30 blur-[80px]" />
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
        <div className="rounded-3xl border border-white/10 bg-white/6 backdrop-blur-2xl p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Zap className="size-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold gradient-text">Codexis</h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered code intelligence
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2.5 mb-8">
            {[
              { icon: Code2, text: "Index any GitHub repository instantly" },
              { icon: MessageSquare, text: "Ask questions in natural language" },
              { icon: Zap, text: "Get AI answers with source citations" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="size-6 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon className="size-3.5 text-indigo-400" />
                </div>
                {text}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={login}
            className="group w-full flex items-center justify-center gap-2.5 rounded-xl px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.99]"
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