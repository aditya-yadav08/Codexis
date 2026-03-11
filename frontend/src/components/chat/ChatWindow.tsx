"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
  const [messages, setMessages] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question) return;

    const userMessage = { role: "user", content: question };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    const res = await fetch("http://localhost:4000/api/chat/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    const aiMessage = {
      role: "assistant",
      content: data.answer,
      sources: data.sources,
    };

    setMessages((prev) => [...prev, aiMessage]);

    setQuestion("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && <p className="text-sm text-gray-500">AI is thinking...</p>}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="resize-none h-12"
          placeholder="Ask about this repository..."
        />

        <Button onClick={askQuestion}>Ask</Button>
      </div>
    </div>
  );
}
