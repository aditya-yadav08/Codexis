"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GitPullRequest, ArrowLeft, Loader2, Play, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function RepoPRsPage({ params }: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = use(params);
  const router = useRouter();
  const [pulls, setPulls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingPr, setAnalyzingPr] = useState<number | null>(null);
  const [analyses, setAnalyses] = useState<Record<number, string>>({});
  const [expandedPr, setExpandedPr] = useState<number | null>(null);

  const fetchPulls = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/${owner}/${repo}/pr/pulls`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      setPulls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch PRs:", error);
      toast.error("Failed to fetch pull requests.");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePR = async (pullNumber: number) => {
    setAnalyzingPr(pullNumber);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/${owner}/${repo}/pr/pulls/${pullNumber}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      
      if (!res.ok) throw new Error("Analysis failed");
      
      const data = await res.json();
      setAnalyses(prev => ({ ...prev, [pullNumber]: data.analysis }));
      setExpandedPr(pullNumber);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze PR.");
    } finally {
      setAnalyzingPr(null);
    }
  };

  useEffect(() => { fetchPulls(); }, [owner, repo]);

  return (
    <div className="space-y-7 animate-fade-up">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full size-9 hover:bg-accent"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{repo}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-normal">
              {owner}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Open Pull Requests</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Fetching open PRs...</p>
        </div>
      ) : pulls.length > 0 ? (
        <div className="space-y-4">
          {pulls.map((pr) => (
            <div
              key={pr.number}
              className={cn(
                "rounded-2xl border border-border bg-card/50 overflow-hidden transition-all",
                expandedPr === pr.number && "border-indigo-500/30 bg-card/80 ring-1 ring-indigo-500/10"
              )}
            >
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <GitPullRequest className="size-5 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {pr.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{pr.number}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-500 border border-green-500/20 uppercase font-bold tracking-wider">
                        Open
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {pr.user.login}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {analyses[pr.number] ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPr(expandedPr === pr.number ? null : pr.number)}
                      className="gap-2 rounded-xl text-xs"
                    >
                      {expandedPr === pr.number ? (
                        <><ChevronUp className="size-3.5" /> Hide Analysis</>
                      ) : (
                        <><ChevronDown className="size-3.5" /> Show Analysis</>
                      )}
                    </Button>
                  ) : null}
                  
                  <Button
                    size="sm"
                    disabled={analyzingPr === pr.number}
                    onClick={() => analyzePR(pr.number)}
                    className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md shadow-indigo-500/20 text-xs font-semibold h-9 px-4"
                  >
                    {analyzingPr === pr.number ? (
                      <><Loader2 className="size-3.5 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Play className="size-3.5 fill-current" /> Analyze with AI</>
                    )}
                  </Button>
                </div>
              </div>

              {expandedPr === pr.number && analyses[pr.number] && (
                <div className="border-t border-border bg-muted/30 p-6 animate-fade-in">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{analyses[pr.number]}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 rounded-2xl border border-dashed border-border bg-muted/20">
          <div className="size-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <GitPullRequest className="size-6" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">No open pull requests</p>
            <p className="text-sm text-muted-foreground">This repository doesn't have any open PRs right now.</p>
          </div>
        </div>
      )}
    </div>
  );
}
