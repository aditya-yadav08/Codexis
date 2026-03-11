"use client";

import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="h-screen flex justify-center bg-gray-50">
      <div className="w-[900px] flex flex-col">
        <h1 className="text-2xl font-semibold py-4">Codexis AI</h1>

        <ChatWindow />
      </div>
    </div>
  );
}
