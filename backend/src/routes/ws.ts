import { Hono } from "hono";
import type { Env } from "../types/index";

const app = new Hono<{ Bindings: Env }>();

/**
 * WebSocket route for chat rooms
 */
app.get("/chat/:chatId", async (c) => {
  const chatId = c.req.param("chatId");
  const userId = c.req.query("userId");
  const userName = c.req.query("userName");

  if (!userId || !userName) {
    return c.json({ error: "userId and userName are required" }, 400);
  }

  // Get Durable Object stub
  const id = c.env.CHAT_ROOM.idFromName(chatId);
  const stub = c.env.CHAT_ROOM.get(id);

  // Forward the request to the Durable Object
  return stub.fetch(c.req.raw);
});

/**
 * WebSocket route for call rooms
 */
app.get("/call/:callId", async (c) => {
  const callId = c.req.param("callId");
  const userId = c.req.query("userId");
  const userName = c.req.query("userName");

  if (!userId || !userName) {
    return c.json({ error: "userId and userName are required" }, 400);
  }

  // Get Durable Object stub
  const id = c.env.CALL_ROOM.idFromName(callId);
  const stub = c.env.CALL_ROOM.get(id);

  // Forward the request to the Durable Object
  return stub.fetch(c.req.raw);
});

export default app;
