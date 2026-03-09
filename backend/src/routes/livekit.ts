import { Hono } from "hono";
import { handleWebhook } from "../controllers/livekit";
import type { Env } from "../types/index";

const app = new Hono<{ Bindings: Env }>();

// LiveKit webhook endpoint
app.post("/webhook", handleWebhook);

export default app;
