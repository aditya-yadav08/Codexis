import { useEffect, useState, useRef } from "react";
import {
  Github,
  Search,
  Loader2,
  Database,
  GitBranch,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Repo {
  id: string;
  name: string;
  owner: { login: string };
  description?: string;
  size: number;
  archived: boolean;
  disabled: boolean;
  language?: string;
}

interface ConnectRepoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ConnectRepoModal({
  open,
  onClose,
  onSuccess,
}: ConnectRepoModalProps) {
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [existingRepos, setExistingRepos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyMyRepos, setShowOnlyMyRepos] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingRepo, setLoadingRepo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingTarget, setIndexingTarget] = useState<{
    owner: string;
    repo: string;
  } | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGitHubRepos = async () => {
    setFetchingRepos(true);
    setErrorMsg(null);
    setRepos([]);
    setExistingRepos([]);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      // Fetch GitHub repos, indexed ones, and current user info
      const [ghReposRes, existingReposRes, settingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/indexed`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/settings`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        })
      ]);
      
      const [ghData, existingData, settingsData] = await Promise.all([
        ghReposRes.json(),
        existingReposRes.json(),
        settingsRes.json()
      ]);
      
      if (!ghReposRes.ok) {
        if (ghReposRes.status === 404 || ghReposRes.status === 401) {
          setErrorMsg("GitHub authentication required. Please sign out and sign in again.");
        } else {
          setErrorMsg(ghData.error || "Failed to fetch repositories.");
        }
        return;
      }
      
      setRepos(Array.isArray(ghData) ? ghData : []);
      setExistingRepos(Array.isArray(existingData) ? existingData : []);
      setCurrentUser(settingsData);
    } catch (err) {
      console.error("Failed to fetch GitHub repos:", err);
      setErrorMsg("Network error. Please try again.");
      setRepos([]);
    } finally {
      setFetchingRepos(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchGitHubRepos();
    } else {
      // Clear state when closed
      setIsIndexing(false);
      setIndexingTarget(null);
      setLoadingRepo(null);
      setErrorMsg(null);
      setShowOnlyMyRepos(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [open]);

  const [indexingProgress, setIndexingProgress] = useState({
    processed: 0,
    total: 0,
    status: "pending"
  });

  const pollIndexingStatus = (owner: string, repo: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/status?owner=${owner}&repo=${repo}`,
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          },
        );
        const data = await res.json();

        if (data && !data.error) {
          setIndexingProgress({
            processed: data.processed_files || 0,
            total: data.total_files || 0,
            status: data.status
          });

          if (data.status === "completed") {
            if (pollingIntervalRef.current)
              clearInterval(pollingIntervalRef.current);

            toast.success(`Repository ${repo} indexed successfully!`);
            setTimeout(() => {
              setIsIndexing(false);
              onSuccess?.();
              onClose();
              router.push("/dashboard");
            }, 1000);
          } else if (data.status === "failed") {
            if (pollingIntervalRef.current)
              clearInterval(pollingIntervalRef.current);
            setIsIndexing(false);
            setErrorMsg(data.indexing_error || "Indexing failed.");
            toast.error("Indexing failed.");
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);
  };

  const connectRepo = async (repo: Repo) => {
    setLoadingRepo(repo.id);
    setErrorMsg(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/repos/index`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          owner: repo.owner.login,
          repo: repo.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
          throw new Error(data.error || "Failed to start indexing.");
      }

      if (data.message === "Repo already indexed and up to date") {
        toast.success("Repository is already up to date");
        onSuccess?.();
        onClose();
        router.push("/dashboard");
      } else {
        toast.info(`Indexing started for ${repo.name}...`);
        setIsIndexing(true);
        setIndexingTarget({ owner: repo.owner.login, repo: repo.name });
        pollIndexingStatus(repo.owner.login, repo.name);
      }
    } catch (error: any) {
      console.error("Failed to connect repo:", error);
      setErrorMsg(error.message);
      toast.error(error.message || "Failed to connect repository");
    } finally {
      setLoadingRepo(null);
    }
  };

  const filteredRepos = repos.filter((repo) => {
    // 1. Filter out unindexable repos
    if (repo.size === 0 || repo.archived || repo.disabled) return false;

    // 2. Filter by ownership if requested
    const isOwner = repo.owner.login.toLowerCase() === currentUser?.username?.toLowerCase();
    if (showOnlyMyRepos && !isOwner) return false;

    // 3. Check if already indexed
    const isAlreadyConnected = existingRepos.some(
      (existing) => 
        existing.owner.toLowerCase() === repo.owner.login.toLowerCase() && 
        existing.repo.toLowerCase() === repo.name.toLowerCase()
    );

    if (isAlreadyConnected) return false;

    // 4. Apply search filter
    return (
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.login.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !val && !isIndexing && onClose()}
    >
      <DialogContent className="max-w-xl p-0 overflow-hidden border-white/10 bg-zinc-900/90 glass rounded-3xl gap-0">
        <DialogHeader className="p-6 border-b border-white/8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                {isIndexing ? (
                  <Loader2 className="size-5 text-indigo-400 animate-spin" />
                ) : (
                  <Github className="size-5 text-indigo-400" />
                )}
                {isIndexing ? "Indexing Repository..." : "Connect Repository"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isIndexing
                  ? `Our workers are currently indexing ${indexingTarget?.repo}. Please wait...`
                  : "Select a repository to index and start chatting."}
              </DialogDescription>
            </div>
            {!isIndexing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchGitHubRepos}
                className="text-xs cursor-pointer text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              >
                Refresh
              </Button>
            )}
          </div>
        </DialogHeader>

        {isIndexing ? (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="size-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse">
                <Database className="size-10 text-indigo-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-zinc-900 border border-indigo-500/30 flex items-center justify-center shadow-xl">
                <Loader2 className="size-4 text-indigo-400 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-foreground">
                Processing Codebase
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                We're analyzing your code and preparing it for AI chat. This
                usually takes a few moments.
              </p>
            </div>

            <div className="w-full max-w-xs space-y-3">
              {indexingProgress.total > 0 ? (
                <>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out" 
                      style={{ width: `${Math.min(100, (indexingProgress.processed / indexingProgress.total) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground/60">
                      Processing {indexingProgress.processed} / {indexingProgress.total} files
                    </span>
                    <span className="text-indigo-400">
                      {Math.round((indexingProgress.processed / indexingProgress.total) * 100)}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-[shimmer_2s_infinite] w-full" />
                  </div>
                  <div className="flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Preparing indexing pipeline...
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {errorMsg && (
              <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20 flex items-start gap-3">
                <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm text-red-200 font-medium">
                    {errorMsg}
                  </p>
                  <p className="text-xs text-red-200/60">
                    If this persists, try logging out and logging back in to refresh your GitHub session.
                  </p>
                </div>
              </div>
            )}

            {/* Search & Filter */}
            <div className="px-6 py-4 border-b border-white/8 bg-white/2 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search your GitHub repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-black/40 border-white/10 focus-visible:ring-indigo-500/50"
                  disabled={!!errorMsg && !repos.length}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {filteredRepos.length} Repositories Available
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    My Repos Only
                  </span>
                  <button
                    onClick={() => setShowOnlyMyRepos(!showOnlyMyRepos)}
                    className={cn(
                      "w-8 h-4.5 rounded-full transition-colors relative cursor-pointer",
                      showOnlyMyRepos ? "bg-indigo-500" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 size-3.5 rounded-full bg-white transition-all",
                      showOnlyMyRepos ? "left-4" : "left-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar max-h-[50vh]">
              {fetchingRepos ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="size-8 text-indigo-500 animate-spin" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Fetching your repositories...
                  </p>
                </div>
              ) : filteredRepos.length > 0 ? (
                <div className="grid gap-2">
                  {filteredRepos.map((repo) => {
                    const isOwner = repo.owner.login.toLowerCase() === currentUser?.username?.toLowerCase();
                    return (
                      <button
                        key={repo.id}
                        onClick={() => connectRepo(repo)}
                        disabled={!!loadingRepo}
                        className={cn(
                          "group w-full cursor-pointer text-left p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/15 transition-all duration-200 flex items-center gap-4 relative overflow-hidden",
                          loadingRepo === repo.id &&
                            "bg-indigo-500/5 border-indigo-500/20",
                        )}
                      >
                        <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:from-indigo-500/20 group-hover:to-violet-500/20">
                          <GitBranch className="size-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate">
                              {repo.name}
                            </span>
                            {loadingRepo === repo.id ? (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/20">
                                <Loader2 className="size-2.5 animate-spin" />
                                Connecting
                              </span>
                            ) : isOwner ? (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/80 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">
                                Owner
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400/80 bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10">
                                Collaborator
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{repo.owner.login}</span>
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <Plus className="size-4 cursor-pointer text-indigo-400" />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="size-16 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/10">
                    <Database className="size-8 text-white/10" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground/80">
                      {searchQuery
                        ? "No repositories found"
                        : "No repositories available"}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                      {searchQuery
                        ? `We couldn't find anything matching "${searchQuery}"`
                        : "Make sure you have authorized Codexis on GitHub."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/8 text-center shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            {isIndexing ? "Live Indexing Status" : "Connected with GitHub API"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
