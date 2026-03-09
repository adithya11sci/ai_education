import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { getDb } from "../db";
import { callParticipants, calls } from "../db/schema";
import type { Env } from "../types/index";

/**
 * Handle LiveKit webhooks
 * LiveKit sends webhooks for various events like room created, participant joined, etc.
 */
export async function handleWebhook(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const event = body.event;

    console.log("LiveKit webhook received:", event);

    switch (event) {
      case "room_started":
        await handleRoomStarted(c, body);
        break;

      case "room_finished":
        await handleRoomFinished(c, body);
        break;

      case "participant_joined":
        await handleParticipantJoined(c, body);
        break;

      case "participant_left":
        await handleParticipantLeft(c, body);
        break;

      default:
        console.log("Unhandled webhook event:", event);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return c.json({ error: "Failed to handle webhook" }, 500);
  }
}

async function handleRoomStarted(c: Context<{ Bindings: Env }>, body: any) {
  const db = getDb(c.env.DATABASE_URL);
  const roomName = body.room?.name;

  if (!roomName) return;

  try {
    // Update call status to ongoing
    await db
      .update(calls)
      .set({
        status: "ongoing",
        startedAt: new Date(),
      })
      .where(eq(calls.livekitRoomName, roomName));
  } catch (error) {
    console.error("Error handling room started:", error);
  }
}

async function handleRoomFinished(c: Context<{ Bindings: Env }>, body: any) {
  const db = getDb(c.env.DATABASE_URL);
  const roomName = body.room?.name;

  if (!roomName) return;

  try {
    // Get call
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.livekitRoomName, roomName));

    if (!call) return;

    // Calculate duration
    const endedAt = new Date();
    const duration = call.startedAt
      ? Math.floor((endedAt.getTime() - call.startedAt.getTime()) / 1000)
      : 0;

    // Update call status
    await db
      .update(calls)
      .set({
        status: "ended",
        endedAt,
        duration,
      })
      .where(eq(calls.id, call.id));
  } catch (error) {
    console.error("Error handling room finished:", error);
  }
}

async function handleParticipantJoined(
  c: Context<{ Bindings: Env }>,
  body: any,
) {
  const db = getDb(c.env.DATABASE_URL);
  const roomName = body.room?.name;
  const participantIdentity = body.participant?.identity;

  if (!roomName || !participantIdentity) return;

  try {
    // Get call
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.livekitRoomName, roomName));

    if (!call) return;

    // Update participant join time
    await db
      .update(callParticipants)
      .set({
        joinedAt: new Date(),
        status: "joined",
      })
      .where(
        and(
          eq(callParticipants.callId, call.id),
          eq(callParticipants.userId, Number.parseInt(participantIdentity)),
        ),
      );
  } catch (error) {
    console.error("Error handling participant joined:", error);
  }
}

async function handleParticipantLeft(c: Context<{ Bindings: Env }>, body: any) {
  const db = getDb(c.env.DATABASE_URL);
  const roomName = body.room?.name;
  const participantIdentity = body.participant?.identity;

  if (!roomName || !participantIdentity) return;

  try {
    // Get call
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.livekitRoomName, roomName));

    if (!call) return;

    // Update participant left time
    await db
      .update(callParticipants)
      .set({
        leftAt: new Date(),
        status: "left",
      })
      .where(
        and(
          eq(callParticipants.callId, call.id),
          eq(callParticipants.userId, Number.parseInt(participantIdentity)),
        ),
      );
  } catch (error) {
    console.error("Error handling participant left:", error);
  }
}
