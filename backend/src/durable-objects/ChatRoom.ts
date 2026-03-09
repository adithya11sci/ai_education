import { DurableObject } from "cloudflare:workers";
import type {
  ChatMessage,
  Env,
  TypingIndicator,
  UserStatus,
} from "../types/index";

/**
 * ChatRoom Durable Object
 * Manages WebSocket connections for real-time messaging in both direct and group chats
 */
export class ChatRoom extends DurableObject {
  private sessions: Map<WebSocket, { userId: number; userName: string }>;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.sessions = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    // Expect WebSocket upgrade request
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    // Get user info from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const userName = url.searchParams.get("userName");

    if (!userId || !userName) {
      return new Response("Missing userId or userName", { status: 400 });
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket connection
    server.accept();

    // Store session info
    this.sessions.set(server, {
      userId: Number.parseInt(userId),
      userName,
    });

    // Set up event handlers
    server.addEventListener("message", (event) => {
      this.handleMessage(server, event.data);
    });

    server.addEventListener("close", () => {
      this.handleClose(server);
    });

    server.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
      this.handleClose(server);
    });

    // Broadcast user joined
    this.broadcast(
      {
        type: "user_status",
        payload: {
          userId: Number.parseInt(userId),
          status: "online",
        },
      },
      server,
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private handleMessage(sender: WebSocket, data: string | ArrayBuffer) {
    try {
      const message = JSON.parse(data as string);

      switch (message.type) {
        case "chat_message":
          // Broadcast message to all connected clients
          this.broadcast(message, sender);
          break;

        case "typing":
          // Broadcast typing indicator
          this.broadcast(message, sender);
          break;

        default:
          console.warn("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  private handleClose(socket: WebSocket) {
    const session = this.sessions.get(socket);
    if (session) {
      // Broadcast user left
      this.broadcast({
        type: "user_status",
        payload: {
          userId: session.userId,
          status: "offline",
        },
      });

      this.sessions.delete(socket);
    }
  }

  private broadcast(
    message: ChatMessage | TypingIndicator | UserStatus,
    exclude?: WebSocket,
  ) {
    const messageStr = JSON.stringify(message);

    for (const [socket, _session] of this.sessions) {
      if (socket !== exclude) {
        try {
          socket.send(messageStr);
        } catch (error) {
          console.error("Error broadcasting message:", error);
          // Remove failed socket
          this.sessions.delete(socket);
        }
      }
    }
  }

  /**
   * Get count of active connections
   */
  getActiveConnections(): number {
    return this.sessions.size;
  }
}
