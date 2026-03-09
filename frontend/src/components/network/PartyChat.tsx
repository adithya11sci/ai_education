"use client";

import { Send } from "lucide-react";
import usePartySocket from "partysocket/react";
import React, { useRef, useState } from "react";

interface PartyChatProps {
  roomId: string;
  currentUser: { name: string; id: number };
  className?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ||
  process.env.NEXT_PUBLIC_PARTY_HOST ||
  "optimus-party.ajaybalajiprasad.partykit.dev";

export function PartyChat({
  roomId,
  currentUser,
  className = "",
}: PartyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomId,
    onMessage(event) {
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        setMessages((prev) => [...prev, data.payload]);
      } else if (data.type === "history") {
        setMessages(data.data);
      }
    },
  });

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sender: currentUser.name,
      text: inputValue,
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, message]);

    // Send to server
    socket.send(JSON.stringify({ type: "chat", payload: message }));
    setInputValue("");
  };

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll should trigger on messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className={`flex flex-col h-full bg-gray-900 border-l border-white/10 ${className}`}
    >
      <div className="p-4 border-b border-white/10 bg-gray-800/50">
        <h3 className="text-white font-semibold flex items-center gap-2">
          Chat Room
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender === currentUser.name;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {!isMe && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                    {msg.sender[0]}
                  </div>
                )}
                <span className="text-xs text-gray-400">{msg.sender}</span>
              </div>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-800/80 text-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-white/10 bg-gray-800/50"
      >
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-gray-900 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-1 top-1 p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
