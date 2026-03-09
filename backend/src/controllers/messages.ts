import { and, desc, eq, isNull, or } from "drizzle-orm";
import type { Context } from "hono";
import { getDb } from "../db";
import { messages, users } from "../db/schema";
import type { Env, SendMessageRequest } from "../types/index";

/**
 * Get direct messages between two users
 */
export async function getDirectMessages(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.req.param("userId");
  const currentUserId = c.req.query("currentUserId");

  if (!currentUserId) {
    return c.json({ error: "currentUserId is required" }, 400);
  }

  try {
    const directMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          or(
            and(
              eq(messages.senderId, Number.parseInt(currentUserId)),
              eq(messages.recipientId, Number.parseInt(userId)),
            ),
            and(
              eq(messages.senderId, Number.parseInt(userId)),
              eq(messages.recipientId, Number.parseInt(currentUserId)),
            ),
          ),
          isNull(messages.groupChatId),
          isNull(messages.deletedAt),
        ),
      )
      .orderBy(desc(messages.createdAt))
      .limit(100);

    return c.json(directMessages);
  } catch (error) {
    console.error("Error fetching direct messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
}

/**
 * Get group messages
 */
export async function getGroupMessages(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");

  try {
    const groupMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.groupChatId, Number.parseInt(groupId)),
          isNull(messages.deletedAt),
        ),
      )
      .orderBy(desc(messages.createdAt))
      .limit(100);

    return c.json(groupMessages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
}

/**
 * Send a direct message
 */
export async function sendDirectMessage(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.json<SendMessageRequest & { senderId: number }>();

  if (!body.recipientId || !body.senderId || !body.content) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    const [message] = await db
      .insert(messages)
      .values({
        senderId: body.senderId,
        recipientId: body.recipientId,
        content: body.content,
        type: body.type || "text",
        metadata: body.metadata,
      })
      .returning();

    return c.json(message, 201);
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
}

/**
 * Send a group message
 */
export async function sendGroupMessage(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.json<SendMessageRequest & { senderId: number }>();

  if (!body.groupChatId || !body.senderId || !body.content) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    const [message] = await db
      .insert(messages)
      .values({
        senderId: body.senderId,
        groupChatId: body.groupChatId,
        content: body.content,
        type: body.type || "text",
        metadata: body.metadata,
      })
      .returning();

    return c.json(message, 201);
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const messageId = c.req.param("messageId");

  try {
    const [deletedMessage] = await db
      .update(messages)
      .set({ deletedAt: new Date() })
      .where(eq(messages.id, Number.parseInt(messageId)))
      .returning();

    if (!deletedMessage) {
      return c.json({ error: "Message not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return c.json({ error: "Failed to delete message" }, 500);
  }
}

/**
 * Get all conversations for a user
 */
export async function getConversations(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.req.query("userId");

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    // Get latest message from each conversation
    const conversations = await db
      .select()
      .from(messages)
      .where(
        and(
          or(
            eq(messages.senderId, Number.parseInt(userId)),
            eq(messages.recipientId, Number.parseInt(userId)),
          ),
          isNull(messages.groupChatId),
          isNull(messages.deletedAt),
        ),
      )
      .orderBy(desc(messages.createdAt));

    // Group by conversation partner
    const conversationMap = new Map();
    for (const msg of conversations) {
      const partnerId =
        msg.senderId === Number.parseInt(userId)
          ? msg.recipientId
          : msg.senderId;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, msg);
      }
    }

    return c.json(Array.from(conversationMap.values()));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return c.json({ error: "Failed to fetch conversations" }, 500);
  }
}
