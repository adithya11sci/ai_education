"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

import {
  ArrowLeft,
  Code2,
  Copy,
  MessageSquare,
  MicOff,
  Send,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import usePartySocket from "partysocket/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id?: string;
  type: "chat" | "system";
  text: string;
  sender?: string;
  timestamp: number;
}

const PARTY_HOST =
  process.env.NEXT_PUBLIC_PARTY_HOST ||
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ||
  "optimus-party.ajaybalajiprasad.partykit.dev";

export default function RoomClient() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [code, setCode] = useState(
    "// Start coding together!\n// Type here to broadcast changes...",
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [participants, _setParticipants] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // PartySocket Connection
  const socket = usePartySocket({
    host: PARTY_HOST,
    room: roomId,
    onOpen: () => {
      // Send a "join" presence signal
      socket.send(
        JSON.stringify({
          type: "presence",
          action: "join",
          user: user?.name || "Guest",
        }),
      );
    },
    onMessage: (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "code-sync":
          // Initial load
          if (data.code) setCode(data.code);
          break;
        case "code-change":
          // Remote update
          if (!isTypingRef.current) setCode(data.code);
          break;
        case "history":
          setMessages(data.data);
          break;
        case "chat":
          setMessages((prev) => [...prev, data.payload]);
          break;
        case "system":
          // Add system message
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              text: data.text,
              timestamp: Date.now(),
            } as Message,
          ]);

          // Basic presence tracking (add user if not exists)
          if (data.userId && !participants.includes(data.userId)) {
            // Ideally server sends full list, but we can accumulate locally for this demo
            // Or we can rely on system messages to deduce
          }
          break;
      }
    },
  });

  const status =
    socket.readyState === 1
      ? "connected"
      : socket.readyState === 0
        ? "connecting"
        : "disconnected";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;
      isTypingRef.current = true;
      setCode(value);

      // Broadcast code change
      socket.send(
        JSON.stringify({
          type: "code-change",
          code: value,
        }),
      );

      // Debounce the "isTyping" release
      setTimeout(() => {
        isTypingRef.current = false;
      }, 500);
    },
    [socket],
  );

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msg = {
      id: crypto.randomUUID(),
      type: "chat",
      text: inputText,
      sender: user?.name || "Guest",
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, msg as Message]);
    socket.send(JSON.stringify({ type: "chat", payload: msg }));
    setInputText("");
  };

  return (
    <div className="h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1e] via-[#050505] to-black text-white flex flex-col overflow-hidden selection:bg-blue-500/30">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-[#0a0a0c]/60 backdrop-blur-xl flex items-center justify-between px-6 z-20 sticky top-0">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => router.push("/collaborate")}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  SESSION
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-500 border border-white/5">
                  {roomId}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "connected" ? "bg-green-400" : "bg-red-400"}`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${status === "connected" ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500"}`}
                  />
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {status === "connected"
                    ? "Live Connection"
                    : status === "connecting"
                      ? "Establishing Link..."
                      : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-[#1a1a1e] border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:border-white/20 hover:bg-[#222] transition-all flex items-center gap-2 group shadow-sm"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors" />
            <span>Copy Invite Link</span>
          </button>
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2" />
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${
              isSidebarOpen
                ? "bg-gradient-to-br from-orange-500 to-red-500 border-orange-400/50 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Area */}
        <div className="flex-1 relative min-w-0 p-4 transition-all duration-300">
          <div className="h-full w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-[#0a0a0c]/50 backdrop-blur-sm relative group">
            {/* Editor Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-orange-500/5 opacity-50 pointer-events-none" />

            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                lineHeight: 24,
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                renderLineHighlight: "all",
              }}
            />
          </div>
        </div>

        {/* Right Sidebar (Collaboration) */}
        {isSidebarOpen && (
          <div className="w-80 shrink-0 bg-[#0a0a0c]/90 backdrop-blur-xl border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl z-10">
            {/* Participants Tab */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-b from-white/5 via-transparent to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-200 text-xs font-bold uppercase tracking-widest">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Squad ({participants.length})
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {/* Self */}
                <div className="group flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-xs font-black text-black shadow-lg shadow-orange-500/20">
                      {(user?.name?.[0] || "Y").toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#0a0a0c] rounded-full flex items-center justify-center border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                      {user?.name || "You"} (You)
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Captain
                    </p>
                  </div>
                  <MicOff className="w-4 h-4 text-gray-600 hover:text-white cursor-pointer transition-colors" />
                </div>

                {/* Others */}
                {participants
                  .filter((pid) => pid !== (user?.name || ""))
                  .map((pid) => (
                    <div
                      key={pid}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-[#1a1a1e] border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                          {pid.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#0a0a0c] rounded-full flex items-center justify-center border border-white/10">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">
                          {pid}
                        </p>
                        <p className="text-[10px] text-blue-400/80">
                          Collaborator
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              {/* Chat Header */}
              <div className="p-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest pl-2">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  Live Chat
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-40">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4 rotate-3">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-300">
                      Quiet in here...
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Start the conversation with your team!
                    </p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={`${msg.timestamp}-${idx}`}
                    className={`flex flex-col group ${msg.type === "system" ? "items-center my-4" : msg.sender === (user?.name || "Guest") ? "items-end" : "items-start"}`}
                  >
                    {msg.type === "system" ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-white/5">
                        <span className="text-[10px] font-medium text-gray-500 tracking-wide uppercase">
                          {msg.text}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`flex items-end gap-2 max-w-[90%] ${msg.sender === (user?.name || "Guest") ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Avatar for chat bubble (only if not me) */}
                          {msg.sender !== (user?.name || "Guest") && (
                            <div className="w-6 h-6 rounded-lg bg-[#1a1a1e] border border-white/10 flex shrink-0 items-center justify-center text-[8px] font-bold text-gray-400">
                              {msg.sender?.slice(0, 1).toUpperCase()}
                            </div>
                          )}

                          <div
                            className={`px-4 py-2.5 shadow-sm text-sm break-words leading-relaxed ${
                              msg.sender === (user?.name || "Guest")
                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_10px_rgba(37,99,235,0.2)]"
                                : "bg-[#1a1a1e] border border-white/10 text-gray-300 rounded-2xl rounded-tl-sm hover:bg-[#222] transition-colors"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-medium text-gray-600 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.sender === (user?.name || "Guest") ? "mr-1" : "ml-9"}`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent z-10">
                <form onSubmit={sendMessage} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-12 py-3.5 bg-[#151518] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:bg-[#0a0a0c] relative z-10 transition-colors shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg hover:shadow-[0_0_10px_#3b82f6] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all z-20 hover:scale-105 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
