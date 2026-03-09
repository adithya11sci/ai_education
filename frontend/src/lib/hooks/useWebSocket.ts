"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
const WS_BASE_URL = API_URL.replace(/^http/, "ws"); // https -> wss, http -> ws

export interface WSMessage {
  type: string;
  payload: unknown;
}

export interface ChatMessage extends WSMessage {
  type: "chat_message";
  payload: {
    id: number;
    senderId: number;
    content: string;
    messageType: "text" | "image" | "video" | "audio" | "file";
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
}

export interface TypingIndicator extends WSMessage {
  type: "typing";
  payload: {
    userId: number;
    isTyping: boolean;
  };
}

export interface UserStatus extends WSMessage {
  type: "user_status";
  payload: {
    userId: number;
    status: "online" | "offline";
  };
}

interface UseWebSocketOptions {
  chatId: string;
  userId: number;
  userName: string;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (data: TypingIndicator["payload"]) => void;
  onUserStatus?: (data: UserStatus["payload"]) => void;
  autoConnect?: boolean;
}

export function useWebSocket({
  chatId,
  userId,
  userName,
  onMessage,
  onTyping,
  onUserStatus,
  autoConnect = true,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const messageQueueRef = useRef<WSMessage[]>([]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus("connecting");
    const url = `${WS_BASE_URL}/ws/chat/${chatId}?userId=${userId}&userName=${encodeURIComponent(userName)}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;

        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift();
          if (msg) {
            ws.send(JSON.stringify(msg));
          }
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSMessage;

          switch (message.type) {
            case "chat_message":
              onMessage?.(message as ChatMessage);
              break;
            case "typing":
              onTyping?.((message as TypingIndicator).payload);
              break;
            case "user_status":
              onUserStatus?.((message as UserStatus).payload);
              break;
            default:
              console.warn("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setConnectionStatus("disconnected");
        wsRef.current = null;

        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(
            1000 * 2 ** reconnectAttemptsRef.current,
            30000,
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setConnectionStatus("error");
    }
  }, [chatId, userId, userName, onMessage, onTyping, onUserStatus]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttemptsRef.current = 5;
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, []);

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      messageQueueRef.current.push(message);
    }
  }, []);

  const sendChatMessage = useCallback(
    (
      content: string,
      messageType: "text" | "image" | "video" | "audio" | "file" = "text",
    ) => {
      sendMessage({
        type: "chat_message",
        payload: {
          senderId: userId,
          content,
          messageType,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [userId, sendMessage],
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      sendMessage({
        type: "typing",
        payload: {
          userId,
          isTyping,
        },
      });
    },
    [userId, sendMessage],
  );

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    sendTypingIndicator,
  };
}
