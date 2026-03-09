"use client";

import type { Message } from "@/lib/api/network";

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] ${
          isOwn ? "bg-orange-500 text-black" : "bg-white/10 text-white"
        } rounded-2xl px-4 py-2`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isOwn ? "text-black/60" : "text-gray-400"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
