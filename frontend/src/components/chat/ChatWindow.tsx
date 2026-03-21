"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import { ArrowUp, Sparkles, Code2, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Msg =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; sources?: any[] };

const STARTER_PROMPTS = [
  { icon: Code2, text: "Explain the main entry point" },
  { icon: GitBranch, text: "Summarise recent changes" },
  { icon: Sparkles, text: "Find potential bugs" },
];

export default function ChatWindow({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const canSend = useMemo(
    () => question.trim().length > 0 && !loading,
    [question, loading],
  );

  const askQuestion = async (override?: string) => {
    const q = override ?? question;
    if (!q.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      
      const res = await fetch(`${backendUrl}/api/chat/ask`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          question: q,
          owner,
          repo,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer ?? "",
          sources: data.sources ?? [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col rounded-2xl border border-black/10 dark:border-white/8 bg-black/5 dark:bg-white/3 overflow-hidden">
      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 space-y-6">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-6 pt-12 pb-6 animate-fade-up">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-xl shadow-accent-glow/30">
                <Sparkles className="size-8 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold">
                  Ask anything about your code
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Connect a repository and start a conversation. Use{" "}
                  <kbd className="px-1.5 py-0.5 rounded-md border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/6 text-xs font-mono">
                    Shift+Enter
                  </kbd>{" "}
                  for a new line.
                </p>
              </div>

              {/* Starter prompts */}
              <div className="flex flex-wrap justify-center gap-2">
                {STARTER_PROMPTS.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => askQuestion(text)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/4 hover:bg-black/10 dark:hover:bg-white/8 hover:border-accent-primary/30 text-sm text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Icon className="size-3.5 text-accent-primary" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              isLatest={i === messages.length - 1}
            />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="size-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow shrink-0">
                <Sparkles className="size-3.5 text-white" />
              </div>
              <div className="rounded-2xl border border-black/10 dark:border-white/8 bg-card px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full bg-muted-foreground"
                    style={{
                      animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="shrink-0 border-t border-black/10 dark:border-white/8 bg-background/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-4 flex items-end gap-3">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this repository…"
            className={cn(
              "min-h-[44px] max-h-[180px] resize-none rounded-xl bg-black/5 dark:bg-white/6 border-black/10 dark:border-white/10 text-sm",
              "placeholder:text-muted-foreground/50 focus-visible:ring-accent-primary/50 focus-visible:border-accent-primary/40",
              "transition-all",
            )}
          />

          <Button
            onClick={() => askQuestion()}
            disabled={!canSend}
            size="icon"
            className={cn(
              "size-11 shrink-0 rounded-xl transition-all",
              canSend
                ? "bg-gradient-to-br from-accent-primary to-accent-secondary hover:from-accent-primary/80 hover:to-accent-secondary/80 shadow-lg shadow-accent-glow/25 glow-accent"
                : "bg-white/8 text-muted-foreground",
            )}
            title="Send"
            aria-label="Send"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
