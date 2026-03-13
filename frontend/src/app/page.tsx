"use client";

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
} from "lucide-react";

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
    <Card className="relative rounded-2xl border-white/8 bg-white/4 overflow-hidden group hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5">
      {/* Subtle glow blob */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient} blur-2xl scale-150`}
      />
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div
          className={`size-9 rounded-xl flex items-center justify-center ${gradient} opacity-90`}
        >
          <Icon className="size-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative space-y-1.5 pb-4">
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="size-3 text-emerald-400" />
          {subtext}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ index }: { index: number }) {
  const labels = [
    "Indexed src/api/auth.ts",
    "Chat session started",
    "Repository connected",
    "56 files re-indexed",
    "Settings updated",
  ];
  const times = ["2m ago", "14m ago", "1h ago", "3h ago", "Yesterday"];
  const dots = [
    "bg-indigo-400",
    "bg-violet-400",
    "bg-emerald-400",
    "bg-amber-400",
    "bg-muted-foreground",
  ];

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/3 border border-white/6 hover:bg-white/5 transition-colors">
      <span className={`size-2 rounded-full shrink-0 ${dots[index]}`} />
      <span className="text-sm text-foreground/85 flex-1 truncate">
        {labels[index]}
      </span>
      <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
        <Clock className="size-3" />
        {times[index]}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="h-full min-h-0 space-y-8 animate-fade-up">
      {/* Header */}
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
          className="rounded-xl border-white/10 bg-white/4 hover:bg-white/8 hover:border-white/20 gap-2 text-sm"
        >
          View activity
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Repositories"
          value="—"
          subtext="Connected repos"
          icon={GitBranch}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="Indexed files"
          value="—"
          subtext="Available to chat"
          icon={Database}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <StatCard
          title="Questions"
          value="—"
          subtext="Asked in last 7 days"
          icon={MessageSquare}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Response time"
          value="—"
          subtext="Average (p50)"
          icon={Activity}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Usage chart */}
        <Card className="xl:col-span-2 rounded-2xl border-white/8 bg-white/4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Usage (coming soon)</CardTitle>
              <span className="text-xs text-muted-foreground bg-white/6 border border-white/10 rounded-full px-2.5 py-0.5">
                Last 7 days
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-52 rounded-xl border border-white/8 bg-background/50 overflow-hidden flex items-center justify-center">
              {/* shimmer overlay */}
              <div className="absolute inset-0 animate-shimmer opacity-60" />
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Activity className="size-8 opacity-30" />
                <span className="text-sm">Chart coming soon</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="rounded-2xl border-white/8 bg-white/4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <ActivityItem key={i} index={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
