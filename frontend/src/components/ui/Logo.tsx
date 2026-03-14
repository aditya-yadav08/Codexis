import { cn } from "@/lib/utils";
import { Sparkles, Hexagon } from "lucide-react";

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 min-w-0 group cursor-pointer", className)}>
      {/* Icon Wrapper */}
      <div className="relative shrink-0 flex items-center justify-center size-8 md:size-9">
        {/* Outer Glow Animation */}
        <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md transition-all duration-300 group-hover:bg-indigo-500/40 group-hover:blur-lg" />
        
        {/* Logo Base Container (Glassmorphic) */}
        <div className="relative z-10 size-full rounded-xl bg-gradient-to-br from-indigo-500/80 to-violet-600/80 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
          {/* Inner Light Sweep Effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          
          <div className="relative z-20 flex items-center justify-center">
            <Hexagon className="absolute size-6 text-indigo-200/50" strokeWidth={1.5} />
            <Sparkles className="size-4 text-white drop-shadow-md" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Text Label */}
      {!collapsed && (
        <span className="font-bold text-lg md:text-xl tracking-tight bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-sm truncate transition-all duration-300 group-hover:drop-shadow-md">
          Codexis
        </span>
      )}
    </div>
  );
}
