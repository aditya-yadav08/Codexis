import SourceCard from "./SourceCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export default function MessageBubble({
  message,
  isLatest,
}: {
  message: any;
  isLatest?: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-fade-up">
        <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white px-4 py-3 text-sm leading-relaxed shadow-md shadow-indigo-500/20">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3 animate-fade-up", isLatest && "")}>
      {/* AI avatar */}
      <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow shrink-0 mt-0.5">
        <Sparkles className="size-3.5 text-white" />
      </div>

      <div className="flex-1 space-y-4 min-w-0">
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl rounded-tl-sm border bg-card px-5 py-5",
            isLatest ? "border-indigo-500/20" : "border-white/8"
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // ── Paragraph ─────────────────────────────────────────────
              p({ node, children }) {
                const hasPre =
                  Array.isArray((node as any)?.children) &&
                  (node as any).children.some(
                    (child: any) => child?.tagName === "pre"
                  );
                if (hasPre) return <div className="my-4">{children}</div>;
                return (
                  <p className="text-[15px] leading-[1.8] text-foreground/85 mb-4 last:mb-0">
                    {children}
                  </p>
                );
              },

              // ── Headings ───────────────────────────────────────────────
              h1({ children }) {
                return (
                  <h1 className="text-xl font-bold mt-7 mb-3 text-foreground tracking-tight border-b border-white/8 pb-2">
                    {children}
                  </h1>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-lg font-semibold mt-6 mb-2.5 text-foreground tracking-tight">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-base font-semibold mt-5 mb-2 text-foreground/90">
                    {children}
                  </h3>
                );
              },
              h4({ children }) {
                return (
                  <h4 className="text-sm font-semibold mt-4 mb-1.5 text-foreground/80 uppercase tracking-wide">
                    {children}
                  </h4>
                );
              },

              // ── Inline code — "tile box" style ─────────────────────────
              code({ className, children }: any) {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="inline-flex items-center px-[6px] py-[2px] mx-[2px] rounded-md font-mono text-[13px] font-medium bg-[#3f3f46] border border-white/10 text-white leading-5 align-middle shadow-sm">
                      {children}
                    </code>
                  );
                }
                return <code className={className}>{children}</code>;
              },

              // ── Code block ─────────────────────────────────────────────
              pre({ children }) {
                return (
                  <pre className="rounded-xl border border-white/10 bg-[oklch(0.12_0.015_265)] px-4 py-4 overflow-x-auto text-[13px] my-5 leading-relaxed">
                    {children}
                  </pre>
                );
              },

              // ── Lists ──────────────────────────────────────────────────
              ul({ children }) {
                return (
                  <ul className="mb-4 space-y-1.5 pl-5 text-[15px] text-foreground/85 list-disc marker:text-indigo-400">
                    {children}
                  </ul>
                );
              },
              ol({ children }) {
                return (
                  <ol className="mb-4 space-y-1.5 pl-5 text-[15px] text-foreground/85 list-decimal marker:text-indigo-400 marker:font-semibold">
                    {children}
                  </ol>
                );
              },
              li({ children }) {
                return (
                  <li className="leading-[1.75] pl-1">
                    {children}
                  </li>
                );
              },

              // ── Blockquote ─────────────────────────────────────────────
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-2 border-indigo-500/60 pl-4 my-4 text-foreground/70 italic text-[14px]">
                    {children}
                  </blockquote>
                );
              },

              // ── Horizontal rule ────────────────────────────────────────
              hr() {
                return <hr className="my-5 border-white/10" />;
              },

              // ── Strong / Em ────────────────────────────────────────────
              strong({ children }) {
                return (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                );
              },
              em({ children }) {
                return (
                  <em className="italic text-foreground/75">{children}</em>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <div className="size-4 rounded-md bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <span className="text-[9px] text-indigo-400 font-bold">#</span>
              </div>
              Sources
            </div>
            {message.sources.map((s: any, i: number) => (
              <SourceCard key={i} source={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
