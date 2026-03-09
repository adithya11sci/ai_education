"use client";

import { CheckCheck, MessageSquare, Search, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  groupAPI,
  type Message,
  messageAPI,
  type User,
  userAPI,
} from "@/lib/api/network";
import {
  useWebSocket,
  type ChatMessage as WSChatMessage,
} from "@/lib/hooks/useWebSocket";

interface Conversation {
  id: number;
  type: "direct" | "group";
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
  online?: boolean;
}

interface ChatsPanelProps {
  currentUser: { id: number; name: string; email: string };
  initialSelectedUser?: User | null;
}

export function ChatsPanel({
  currentUser,
  initialSelectedUser,
}: ChatsPanelProps) {
  const [selectedChat, setSelectedChat] = useState<{
    type: "direct" | "group";
    id: number;
    name: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      // Load direct conversations
      const allUsers = await userAPI.getAll();
      const convos: Conversation[] = [];

      for (const user of allUsers) {
        if (user.id === currentUser.id) continue;

        try {
          const msgs = await messageAPI.getDirectMessages(
            user.id,
            currentUser.id,
          );
          if (msgs.length > 0) {
            const lastMsg = msgs[msgs.length - 1];
            convos.push({
              id: user.id,
              type: "direct",
              name: user.name || user.email,
              avatar: (user.name?.[0] || user.email[0]).toUpperCase(),
              lastMessage: lastMsg.content,
              lastMessageTime: lastMsg.createdAt,
              online: Math.random() > 0.5, // Simulated for now
            });
          }
        } catch (_error) {
          // No messages with this user
        }
      }

      // Load group conversations
      try {
        const groups = await groupAPI.getByUser(currentUser.id);
        for (const group of groups) {
          try {
            const msgs = await messageAPI.getGroupMessages(group.id);
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            convos.push({
              id: group.id,
              type: "group",
              name: group.name,
              avatar: group.name[0].toUpperCase(),
              lastMessage: lastMsg?.content,
              lastMessageTime: lastMsg?.createdAt,
            });
          } catch {
            convos.push({
              id: group.id,
              type: "group",
              name: group.name,
              avatar: group.name[0].toUpperCase(),
            });
          }
        }
      } catch {
        // No groups
      }

      convos.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || 0).getTime();
        const timeB = new Date(b.lastMessageTime || 0).getTime();
        return timeB - timeA;
      });

      setConversations(convos);
    } catch (_error) {
      console.error("Failed to load conversations:", _error);
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedChat({
        type: "direct",
        id: initialSelectedUser.id,
        name: initialSelectedUser.name || initialSelectedUser.email,
      });
    }
  }, [initialSelectedUser]);

  const { isConnected, sendChatMessage } = useWebSocket({
    chatId: selectedChat
      ? `${selectedChat.type}-${selectedChat.id}`
      : "default",
    userId: currentUser.id,
    userName: currentUser.name,
    onMessage: (wsMessage: WSChatMessage) => {
      const newMessage: Message = {
        id: wsMessage.payload.id,
        senderId: wsMessage.payload.senderId,
        content: wsMessage.payload.content,
        type: wsMessage.payload.messageType,
        createdAt: wsMessage.payload.timestamp,
        recipientId:
          selectedChat?.type === "direct" ? selectedChat.id : undefined,
        groupChatId:
          selectedChat?.type === "group" ? selectedChat.id : undefined,
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    autoConnect: !!selectedChat,
  });

  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        let msgs: Message[];
        if (selectedChat.type === "direct") {
          msgs = await messageAPI.getDirectMessages(
            selectedChat.id,
            currentUser.id,
          );
        } else {
          msgs = await messageAPI.getGroupMessages(selectedChat.id);
        }
        setMessages(msgs.reverse());
      } catch (_error) {
        console.error("Failed to load messages:", _error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedChat, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    const content = messageInput.trim();
    setMessageInput("");

    // Optimistic update
    const optimisticMsg: Message = {
      id: Date.now(),
      senderId: currentUser.id,
      content,
      type: "text",
      createdAt: new Date().toISOString(),
      recipientId: selectedChat.type === "direct" ? selectedChat.id : undefined,
      groupChatId: selectedChat.type === "group" ? selectedChat.id : undefined,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    if (isConnected) {
      sendChatMessage(content);
    }

    try {
      if (selectedChat.type === "direct") {
        await messageAPI.sendDirect({
          senderId: currentUser.id,
          recipientId: selectedChat.id,
          content,
        });
      } else {
        await messageAPI.sendGroup({
          senderId: currentUser.id,
          groupChatId: selectedChat.id,
          content,
        });
      }
      loadConversations();
    } catch (_error) {
      console.error("Failed to send:", _error);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConversations = searchQuery
    ? conversations.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  return (
    <div className="h-[calc(100vh-10rem)] max-w-5xl mx-auto flex bg-[#0b141a] rounded-xl overflow-hidden border border-white/5">
      {/* Sidebar - Conversation List */}
      <div className="w-[340px] border-r border-white/5 flex flex-col bg-[#111b21]">
        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#202c33] border-0 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No chats yet</p>
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <button
                key={`${convo.type}-${convo.id}`}
                type="button"
                onClick={() =>
                  setSelectedChat({
                    type: convo.type,
                    id: convo.id,
                    name: convo.name,
                  })
                }
                className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-[#202c33] transition-colors ${
                  selectedChat?.id === convo.id &&
                  selectedChat?.type === convo.type
                    ? "bg-[#2a3942]"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${
                      convo.type === "group"
                        ? "bg-gradient-to-br from-teal-500 to-green-600"
                        : "bg-gradient-to-br from-purple-500 to-pink-500"
                    }`}
                  >
                    {convo.avatar}
                  </div>
                  {convo.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111b21] rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-white truncate">
                      {convo.name}
                    </span>
                    {convo.lastMessageTime && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(convo.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  {convo.lastMessage && (
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                      <CheckCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      {convo.lastMessage}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-14 px-4 border-b border-white/5 flex items-center gap-3 bg-[#202c33]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  selectedChat.type === "group"
                    ? "bg-gradient-to-br from-teal-500 to-green-600"
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                }`}
              >
                {selectedChat.name[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium text-white">{selectedChat.name}</h3>
                <p className="text-xs text-gray-400">
                  {isConnected ? "online" : "connecting..."}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{
                backgroundImage: "url('/chat-bg.png')",
                backgroundSize: "cover",
              }}
            >
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  <p>No messages yet</p>
                  <p className="text-xs mt-1">Start the conversation! 👋</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[65%] px-3 py-2 rounded-lg ${
                          isOwn
                            ? "bg-[#005c4b] text-white"
                            : "bg-[#202c33] text-white"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-400">
                            {formatTime(msg.createdAt)}
                          </span>
                          {isOwn && (
                            <CheckCheck className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-[#202c33]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 px-4 py-2.5 bg-[#2a3942] border-0 rounded-lg text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2.5 bg-[#00a884] rounded-full hover:bg-[#00c49a] transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#222e35]">
            <div className="text-center text-gray-500">
              <div className="w-72 h-72 mx-auto mb-4 rounded-full bg-[#364147] flex items-center justify-center">
                <MessageSquare className="w-24 h-24 opacity-30" />
              </div>
              <h2 className="text-2xl text-gray-300 mb-2">Optimus Chat</h2>
              <p className="text-sm">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
