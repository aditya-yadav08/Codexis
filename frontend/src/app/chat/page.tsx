"use client";

import ChatWindow from "@/components/chat/ChatWindow";
import { MessageSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();

  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  return (
    <div className="h-full flex flex-col min-h-0 gap-4 animate-fade-up">
      <div className="flex items-center gap-2 shrink-0">
        <div className="size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <MessageSquare className="size-3.5 text-white" />
        </div>

        <h1 className="text-xl font-bold tracking-tight">AI Chat</h1>
      </div>

      <div className="flex-1 min-h-0">
        <ChatWindow owner={owner} repo={repo} />
      </div>
    </div>
  );
}
