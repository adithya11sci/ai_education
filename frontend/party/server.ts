import type * as Party from "partykit/server";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, _ctx: Party.ConnectionContext) {
    console.log(`Connected: ${conn.id} in room ${this.room.id}`);

    // Send chat history to new user
    const chatLog =
      (await this.room.storage.get<ChatMessage[]>("chatLog")) || [];
    if (chatLog.length > 0) {
      conn.send(JSON.stringify({ type: "history", data: chatLog }));
    }

    // Send current code to new user
    const code =
      (await this.room.storage.get<string>("code")) || "// Start coding...";
    conn.send(JSON.stringify({ type: "code-sync", code }));

    this.room.broadcast(
      JSON.stringify({
        type: "system",
        text: `User joined`,
        userId: conn.id,
      }),
      [conn.id],
    );
  }

  async onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message);

    if (data.type === "chat") {
      // Save to persistent storage
      const chatLog =
        (await this.room.storage.get<ChatMessage[]>("chatLog")) || [];
      chatLog.push(data.payload);
      // Keep last 100 messages
      if (chatLog.length > 100) chatLog.shift();
      await this.room.storage.put("chatLog", chatLog);
    } else if (data.type === "code-change") {
      // Save code snapshot (debouncing ideally done on client, but saving here is safe)
      await this.room.storage.put("code", data.code);
    }

    // Relay message to everyone else
    this.room.broadcast(message, [sender.id]);
  }

  async onFetch(req: Request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return new Response("Hello from PartyKit!", {
      status: 200,
      headers: corsHeaders,
    });
  }
}

Server satisfies Party.Worker;
