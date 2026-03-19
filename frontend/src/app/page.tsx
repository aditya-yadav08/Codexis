"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Database,
  GitBranch,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Zap,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { UsageChart } from "@/components/dashboard/UsageChart";

function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: any;
  gradient: string;
}) {
  return (
    <Card className="relative rounded-2xl border-border bg-card/50 overflow-hidden group hover:border-border/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient} blur-2xl scale-150`}
      />
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`size-9 rounded-xl flex items-center justify-center ${gradient} opacity-90`}>
          <Icon className="size-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative space-y-1.5 pb-4">
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="size-3 text-emerald-500" />
          {subtext}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  label,
  timestamp,
  status,
}: {
  label: string;
  timestamp: string;
  status: string;
}) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-emerald-500";
      case "indexing": return "bg-indigo-400 animate-pulse";
      case "failed": return "bg-rose-500";
      default: return "bg-amber-400";
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/40 border border-border hover:bg-muted/60 transition-colors">
      <span className={`size-2 rounded-full shrink-0 ${getStatusColor(status)}`} />
      <span className="text-sm text-foreground/85 flex-1 truncate">{label}</span>
      <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
        <Clock className="size-3" />
        {timeAgo(timestamp)}
      </span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({
    repos: "—",
    files: "—",
    questions: "—",
    responseTime: "—",
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        const [statsRes, activityRes, usageRes] = await Promise.all([
          fetch(`${backendUrl}/stats/overview`, { headers }),
          fetch(`${backendUrl}/stats/activity`, { headers }),
          fetch(`${backendUrl}/stats/usage`, { headers }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            repos: statsData.repos.toString(),
            files: statsData.files.toLocaleString(),
            questions: statsData.questions.toString(),
            responseTime: statsData.responseTime,
          });
        }
        if (activityRes.ok) setActivities(await activityRes.json());
        if (usageRes.ok) setUsageData(await usageRes.json());
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
        setLoadingUsage(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="h-full min-h-0 space-y-8 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="size-3.5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Overview</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitor your repositories, indexing status, and AI usage at a glance.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl border-border bg-muted/40 hover:bg-muted hover:border-border gap-2 text-sm"
        >
          View Repositories
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Indexed Repos" value={stats.repos} subtext="Successfully indexed" icon={GitBranch} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" />
        <StatCard title="Indexed files" value={stats.files} subtext="Available to chat" icon={Database} gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
        <StatCard title="Questions" value={stats.questions} subtext="Asked in last 7 days" icon={MessageSquare} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard title="Response time" value={stats.responseTime} subtext="Average (p50)" icon={Activity} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 rounded-2xl border-border bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Usage</CardTitle>
              <span className="text-xs text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-0.5">
                Last 7 days
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-52 w-full rounded-xl border border-border bg-background/50 overflow-hidden flex items-center justify-center">
              {loadingUsage ? (
                <>
                  <div className="absolute inset-0 animate-shimmer opacity-60" />
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-8 animate-spin opacity-30" />
                    <span className="text-sm">Loading usage data...</span>
                  </div>
                </>
              ) : usageData.length > 0 ? (
                <UsageChart data={usageData} />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Activity className="size-8 opacity-30" />
                  <span className="text-sm">No usage data found</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
                <Loader2 className="size-5 animate-spin text-indigo-400" />
                <span className="text-xs">Loading activity...</span>
              </div>
            ) : activities.length > 0 ? (
              activities.map((act, i) => (
                <ActivityItem key={i} label={act.label} timestamp={act.timestamp} status={act.status} />
              ))
            ) : (
              <div className="text-center py-10 text-xs text-muted-foreground italic">
                No recent activity found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
