"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GitBranch, FolderKanban, Loader2, GitPullRequest } from "lucide-react";
import { toast } from "sonner";

export default function PRAnalyzerIndex() {
  const router = useRouter();
  const [repos, setRepos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRepos = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/indexed`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch repos:", error);
      toast.error("Failed to fetch repositories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRepos(); }, []);

  return (
    <div className="space-y-7 animate-fade-up">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GitPullRequest className="size-3.5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI PR Analyzer</h1>
        </div>
        <p className="text-sm text-muted-foreground">Select a repository to analyze its open pull requests.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card/30 p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : repos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {repos.map((repo: any) => (
            <div
              key={repo.id}
              className="group relative rounded-2xl border border-border bg-card/50 p-5 hover:border-border/80 hover:bg-card hover:shadow-md transition-all duration-200 flex flex-col gap-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <GitBranch className="size-4 text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">{repo.repo}</h3>
                  <p className="text-xs text-muted-foreground truncate">{repo.owner}</p>
                </div>
              </div>

              <Button
                onClick={() => router.push(`/pr-analyzer/${repo.owner}/${repo.repo}`)}
                className="mt-auto w-full gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md shadow-indigo-500/20 text-xs font-semibold h-9"
              >
                Show open PRs
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 rounded-2xl border border-dashed border-border bg-muted/20">
          <div className="size-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FolderKanban className="size-6 text-indigo-500" />
          </div>
          <p className="font-semibold text-foreground">No indexed repositories found</p>
        </div>
      )}
    </div>
  );
}
