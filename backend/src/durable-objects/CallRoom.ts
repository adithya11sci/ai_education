import { DurableObject } from "cloudflare:workers";
import type { CallEvent, Env } from "../types/index";

/**
 * CallRoom Durable Object
 * Manages call session state and coordinates with LiveKit
 */
export class CallRoom extends DurableObject {
  private participants: Map<WebSocket, { userId: number; userName: string }>;
  private callId: number | null;
  private callStatus: "initiated" | "ongoing" | "ended";

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.participants = new Map();
    this.callId = null;
    this.callStatus = "initiated";
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle WebSocket upgrade for call signaling
    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocket(request);
    }

    // Handle HTTP requests for call state management
    if (path.endsWith("/status")) {
      return this.getStatus();
    }

    if (path.endsWith("/end")) {
      return this.endCall();
    }

    return new Response("Not found", { status: 404 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const userName = url.searchParams.get("userName");
    const callId = url.searchParams.get("callId");

    if (!userId || !userName || !callId) {
      return new Response("Missing required parameters", { status: 400 });
    }

    // Store call ID if not set
    if (!this.callId) {
      this.callId = Number.parseInt(callId);
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();

    // Store participant
    this.participants.set(server, {
      userId: Number.parseInt(userId),
      userName,
    });

    // Update call status to ongoing if first participant joins
    if (this.participants.size === 1) {
      this.callStatus = "ongoing";
    }

    // Set up event handlers
    server.addEventListener("message", (event) => {
      this.handleMessage(server, event.data);
    });

    server.addEventListener("close", () => {
      this.handleParticipantLeft(server);
    });

    server.addEventListener("error", () => {
      this.handleParticipantLeft(server);
    });

    // Broadcast participant joined
    this.broadcast({
      type: "call_event",
      payload: {
        callId: this.callId,
        event: "participant_joined",
        userId: Number.parseInt(userId),
      },
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private handleMessage(sender: WebSocket, data: string | ArrayBuffer) {
    try {
      const message = JSON.parse(data as string);

      // Forward signaling messages to other participants
      this.broadcast(message, sender);
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  private handleParticipantLeft(socket: WebSocket) {
    const participant = this.participants.get(socket);
    if (participant) {
      // Broadcast participant left
      this.broadcast({
        type: "call_event",
        payload: {
          callId: this.callId!,
          event: "participant_left",
          userId: participant.userId,
        },
      });

      this.participants.delete(socket);

      // End call if no participants left
      if (this.participants.size === 0) {
        this.callStatus = "ended";
      }
    }
  }

  private broadcast(message: CallEvent | unknown, exclude?: WebSocket) {
    const messageStr = JSON.stringify(message);

    for (const [socket, _participant] of this.participants) {
      if (socket !== exclude) {
        try {
          socket.send(messageStr);
        } catch (error) {
          console.error("Error broadcasting message:", error);
          this.participants.delete(socket);
        }
      }
    }
  }

  private getStatus(): Response {
    return Response.json({
      callId: this.callId,
      status: this.callStatus,
      participantCount: this.participants.size,
    });
  }

  private endCall(): Response {
    // Close all participant connections
    for (const [socket, _participant] of this.participants) {
      socket.close(1000, "Call ended");
    }

    this.participants.clear();
    this.callStatus = "ended";

    // Broadcast call ended
    this.broadcast({
      type: "call_event",
      payload: {
        callId: this.callId!,
        event: "call_ended",
      },
    });

    return Response.json({ success: true });
  }
}
