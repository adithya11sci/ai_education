import { Hono } from "hono";
import {
  deleteMessage,
  getConversations,
  getDirectMessages,
  getGroupMessages,
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/messages";
import type { Env } from "../types/index";

const app = new Hono<{ Bindings: Env }>();

// Get direct messages with a user
app.get("/direct/:userId", getDirectMessages);

// Get group messages
app.get("/group/:groupId", getGroupMessages);

// Send direct message
app.post("/direct", sendDirectMessage);

// Send group message
app.post("/group", sendGroupMessage);

// Delete message
app.delete("/:messageId", deleteMessage);

// Get all conversations
app.get("/conversations", getConversations);

export default app;
