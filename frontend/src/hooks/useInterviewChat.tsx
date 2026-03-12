"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface LipSyncCue {
  start: number;
  end: number;
  value: string;
}

interface LipSync {
  mouthCues: LipSyncCue[];
}

interface Message {
  text: string;
  audio?: string;
  lipsync?: LipSync;
  facialExpression?: string;
  animation?: string;
}

interface ChatContextType {
  chat: (message?: string) => Promise<void>;
  message: Message | null;
  onMessagePlayed: () => void;
  loading: boolean;
  cameraZoomed: boolean;
  setCameraZoomed: (zoomed: boolean) => void;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
const BACKEND_URL = `${API_URL}/interview`;

const ChatContext = createContext<ChatContextType | null>(null);

export function InterviewChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const chat = async (userMessage?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Expected JSON but received:", contentType);
        throw new Error("Backend returned non-JSON response");
      }

      const json = await response.json();
      if (json.messages) {
        setMessages((prev) => [...prev, ...json.messages]);
      } else {
        console.warn("No messages in response:", json);
      }
    } catch (e) {
      console.error("Chat Error:", e);
      // Don't propagate error to UI for now
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = useCallback(() => {
    setMessages((msgs) => msgs.slice(1));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useInterviewChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error(
      "useInterviewChat must be used within an InterviewChatProvider",
    );
  }
  return context;
}
