"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
  FolderKanban,
  Plus,
} from "lucide-react";

const langColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Go: "bg-cyan-400",
  Rust: "bg-orange-500",
  default: "bg-muted-foreground",
};

export default function Dashboard() {
  const router = useRouter();
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/repos", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setRepos(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-7 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <FolderKanban className="size-3.5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Repositories</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your connected GitHub repositories.
          </p>
        </div>

        <Button className="gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 hover:from-indigo-400 hover:to-violet-500 shadow-md shadow-indigo-500/20 text-sm font-semibold">
          <Plus className="size-3.5" />
          Connect Repo
        </Button>
      </div>

      {/* Repo grid */}
      {Array.isArray(repos) && repos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {repos.map((repo: any) => {
            const lang = repo.language || "default";
            const colorClass = langColors[lang] ?? langColors.default;

            return (
              <div
                key={repo.id}
                className="group relative rounded-2xl border border-white/8 bg-white/4 p-5 hover:border-white/15 hover:bg-white/6 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col gap-4"
              >
                {/* Repo name + icon */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
                      <GitBranch className="size-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {repo.name}
                      </h3>
                      {repo.full_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {repo.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </div>

                {/* Description */}
                {repo.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {repo.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${colorClass}`} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="size-3" />
                      {repo.stargazers_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="size-3" />
                      {repo.forks_count ?? 0}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(
                        `/chat?owner=${repo.owner.login}&repo=${repo.name}`,
                      )
                    }
                    className="h-7 px-2.5 rounded-lg text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20"
                  >
                    Open chat →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-4 py-24 rounded-2xl border border-dashed border-white/10 bg-white/2">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
            <FolderKanban className="size-6 text-indigo-400" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">No repositories yet</p>
            <p className="text-sm text-muted-foreground">
              Connect a GitHub repo to start chatting with your code.
            </p>
          </div>
          <Button className="gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 hover:from-indigo-400 hover:to-violet-500 shadow-md shadow-indigo-500/20 text-sm font-semibold">
            <Plus className="size-3.5" />
            Connect your first repo
          </Button>
        </div>
      )}
    </div>
  );
}
