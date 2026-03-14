"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GitBranch, FolderKanban, Plus, Trash2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import ConnectRepoModal from "@/components/repos/ConnectRepoModal";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const [openConnectModal, setOpenConnectModal] = useState(false);

  type Repo = {
    id: string;
    owner: string;
    repo: string;
    indexed_at: string;
  };
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingRepo, setDeletingRepo] = useState<Repo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reindexingRepoId, setReindexingRepoId] = useState<string | null>(null);

  const fetchRepos = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/indexed`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch repos:", error);
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const deleteRepo = async (repo: Repo) => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/${repo.owner}/${repo.repo}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (res.ok) {
        setRepos((prev) => prev.filter((r) => r.id !== repo.id));
        setDeletingRepo(null);
        toast.success(`Repository ${repo.repo} deleted successfully`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Delete failed with status:", res.status, errorData);
        toast.error(errorData.error || "Failed to delete repository");
      }
    } catch (error) {
      console.error("Failed to delete repo (fetch error):", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const reindexRepo = async (repo: Repo) => {
    setReindexingRepoId(repo.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/index`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          owner: repo.owner,
          repo: repo.repo,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.message === "Repo already indexed and up to date") {
          toast.success("Repository is already up to date");
        } else {
          toast.info(`Indexing started for ${repo.repo}...`);
        }
      } else {
        toast.error(data.error || "Failed to start indexing");
      }
    } catch (error) {
      console.error("Reindex error:", error);
      toast.error("Failed to start indexing");
    } finally {
      setReindexingRepoId(null);
    }
  };

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
            Your connected repositories.
          </p>
        </div>

        <Button
          onClick={() => setOpenConnectModal(true)}
          className="gap-1.5 h-9 px-4 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 hover:from-indigo-400 hover:to-violet-500 shadow-md shadow-indigo-500/20 text-sm font-semibold"
        >
          <Plus className="size-3.5" />
          Connect Repo
        </Button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        /* Skeleton Loader */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-white/2 p-5 flex flex-col gap-4 animate-pulse"
            >
              <div className="flex items-start gap-2.5">
                <div className="size-8 rounded-xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded-md w-3/4" />
                  <div className="h-3 bg-white/5 rounded-md w-1/2" />
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="h-3 bg-white/5 rounded-md w-1/3" />
                <div className="h-6 bg-white/5 rounded-md w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : repos.length > 0 ? (
        /* Repo grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {repos.map((repo: any, index: number) => {
            return (
              <div
                key={repo.id || `${repo.owner}-${repo.repo}-${index}`}
                className="group relative rounded-2xl border border-white/8 bg-white/4 p-5 hover:border-white/15 hover:bg-white/6 hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
                      <GitBranch className="size-4 text-indigo-400" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {repo.repo}
                      </h3>

                      <p className="text-xs text-muted-foreground truncate">
                        {repo.owner}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => reindexRepo(repo)}
                      disabled={reindexingRepoId === repo.id}
                      className="p-2 rounded-lg hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-400 transition-all cursor-pointer disabled:opacity-50"
                      title="Re-index repository"
                    >
                      <RefreshCw className={cn("size-4", reindexingRepoId === repo.id && "animate-spin")} />
                    </button>
                    <button
                      onClick={() => setDeletingRepo(repo)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all cursor-pointer"
                      title="Delete repository"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-muted-foreground">
                    Updated - {new Date(repo.indexed_at).toLocaleString()}
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/chat?owner=${repo.owner}&repo=${repo.repo}`)
                    }
                    className="h-7 px-2.5 rounded-lg text-xs cursor-pointer text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
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
            <p className="font-semibold text-foreground">
              No indexed repositories
            </p>

            <p className="text-sm text-muted-foreground">
              Connect and index a GitHub repo to start chatting with your code.
            </p>
          </div>

          <Button
            onClick={() => setOpenConnectModal(true)}
            className="gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 hover:from-indigo-400 hover:to-violet-500 shadow-md shadow-indigo-500/20 text-sm font-semibold"
          >
            <Plus className="size-3.5" />
            Connect your first repo
          </Button>
        </div>
      )}

      <ConnectRepoModal
        open={openConnectModal}
        onClose={() => setOpenConnectModal(false)}
        onSuccess={fetchRepos}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingRepo}
        onOpenChange={(open: boolean) => !open && !isDeleting && setDeletingRepo(null)}
      >
        <AlertDialogContent className="bg-zinc-900 border-white/10 rounded-3xl glass max-w-md">
          <AlertDialogHeader>
            <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="size-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl">
              Delete Repository?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete{" "}
              <span className="text-foreground font-semibold">
                "{deletingRepo?.repo}"
              </span>{" "}
              and all its indexed data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel
              className="rounded-xl bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white border-0 cursor-pointer shadow-lg shadow-red-500/20"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                if (deletingRepo) deleteRepo(deletingRepo);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Repository"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
