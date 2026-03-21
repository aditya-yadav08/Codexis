"use client";

import { useEffect, useState, Suspense } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import { MessageSquare, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

function ChatContent() {
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchRepos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/indexed`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
        const data = await res.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (err) {
        setRepos([]);
      }
    };
    fetchRepos();
  }, []);

  // Handle auto-selection from query params
  useEffect(() => {
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (owner && repo && repos.length > 0 && !selectedRepo) {
      const match = repos.find(r => r.owner === owner && r.repo === repo);
      if (match) {
        setSelectedRepo({ owner: match.owner, repo: match.repo });
      }
    }
  }, [searchParams, repos, selectedRepo]);

  return (
    <div className="h-full flex flex-col min-h-0 gap-4 animate-fade-up">
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-glow/25">
            <MessageSquare className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI Chat</h1>
        </div>

        {/* Repo selector in header */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              className="appearance-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent-primary/40 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer min-w-[200px]"
              value={selectedRepo ? JSON.stringify({ owner: selectedRepo.owner, repo: selectedRepo.repo }) : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedRepo(JSON.parse(e.target.value));
                } else {
                  setSelectedRepo(null);
                }
              }}
            >
              <option value="" className="bg-white dark:bg-zinc-900">Select repository</option>
              {repos.map((repo) => (
                <option
                  key={`${repo.owner}-${repo.repo}`}
                  className="bg-white dark:bg-zinc-900"
                  value={JSON.stringify({
                    owner: repo.owner,
                    repo: repo.repo,
                  })}
                >
                  {repo.owner}/{repo.repo}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </div>

      {/* Chat / Empty State */}
      <div className="flex-1 min-h-0">
        {selectedRepo ? (
          <ChatWindow owner={selectedRepo.owner} repo={selectedRepo.repo} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-6 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/5 dark:bg-white/2 animate-pulse">
            <div className="size-16 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10">
              <MessageSquare className="size-8 text-black/20 dark:text-white/20" strokeWidth={1.5} />
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-foreground/80">Ready to start</p>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Choose a repository from the menu above to begin your session.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
