import { and, desc, eq, isNull, or } from "drizzle-orm";
import type { Context } from "hono";
import { getDb } from "../db";
import { callParticipants, calls } from "../db/schema";
import type { Env, InitiateCallRequest } from "../types/index";
import { LiveKitService } from "../utils/livekit";

/**
 * Initiate a new call
 */
export async function initiateCall(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.json<
    InitiateCallRequest & { initiatorId: number }
  >();

  if (!body.initiatorId || !body.type || !body.callType) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Validate call type
  if (body.callType === "direct" && !body.recipientId) {
    return c.json({ error: "recipientId required for direct calls" }, 400);
  }

  if (body.callType === "group" && !body.groupChatId) {
    return c.json({ error: "groupChatId required for group calls" }, 400);
  }

  try {
    // Generate unique LiveKit room name
    const roomName = `call-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create LiveKit room
    const livekitService = new LiveKitService(
      c.env.LIVEKIT_API_KEY,
      c.env.LIVEKIT_API_SECRET,
      c.env.LIVEKIT_WS_URL,
    );

    await livekitService.createRoom({
      name: roomName,
      emptyTimeout: 300,
      maxParticipants: body.callType === "direct" ? 2 : 50,
    });

    // Create call record
    const [call] = await db
      .insert(calls)
      .values({
        type: body.type,
        callType: body.callType,
        initiatorId: body.initiatorId,
        groupChatId: body.groupChatId,
        recipientId: body.recipientId,
        livekitRoomName: roomName,
        status: "initiated",
      })
      .returning();

    // Add initiator as participant
    await db.insert(callParticipants).values({
      callId: call.id,
      userId: body.initiatorId,
      status: "joined",
    });

    return c.json(call, 201);
  } catch (error) {
    console.error("Error initiating call:", error);
    return c.json({ error: "Failed to initiate call" }, 500);
  }
}

/**
 * Join an existing call
 */
export async function joinCall(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const callId = c.req.param("callId");
  const body = await c.req.json<{ userId: number }>();

  if (!body.userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    // Check if call exists and is ongoing
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.id, Number.parseInt(callId)));

    if (!call) {
      return c.json({ error: "Call not found" }, 404);
    }

    if (call.status === "ended") {
      return c.json({ error: "Call has ended" }, 400);
    }

    // Add participant
    const [participant] = await db
      .insert(callParticipants)
      .values({
        callId: call.id,
        userId: body.userId,
        status: "joined",
      })
      .returning();

    // Update call status to ongoing if it was initiated
    if (call.status === "initiated") {
      await db
        .update(calls)
        .set({
          status: "ongoing",
          startedAt: new Date(),
        })
        .where(eq(calls.id, call.id));
    }

    return c.json(participant, 201);
  } catch (error) {
    console.error("Error joining call:", error);
    return c.json({ error: "Failed to join call" }, 500);
  }
}

/**
 * End a call
 */
export async function endCall(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const callId = c.req.param("callId");

  try {
    // Get call details
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.id, Number.parseInt(callId)));

    if (!call) {
      return c.json({ error: "Call not found" }, 404);
    }

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

    // Update all participants who haven't left
    await db
      .update(callParticipants)
      .set({
        leftAt: endedAt,
        status: "left",
      })
      .where(
        and(
          eq(callParticipants.callId, call.id),
          isNull(callParticipants.leftAt),
        ),
      );

    // End LiveKit room
    const livekitService = new LiveKitService(
      c.env.LIVEKIT_API_KEY,
      c.env.LIVEKIT_API_SECRET,
      c.env.LIVEKIT_WS_URL,
    );

    await livekitService.endRoom(call.livekitRoomName);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error ending call:", error);
    return c.json({ error: "Failed to end call" }, 500);
  }
}

/**
 * Get call history for a user
 */
export async function getCallHistory(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.req.query("userId");

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    const history = await db
      .select()
      .from(calls)
      .where(
        or(
          eq(calls.initiatorId, Number.parseInt(userId)),
          eq(calls.recipientId, Number.parseInt(userId)),
        ),
      )
      .orderBy(desc(calls.createdAt))
      .limit(50);

    return c.json(history);
  } catch (error) {
    console.error("Error fetching call history:", error);
    return c.json({ error: "Failed to fetch call history" }, 500);
  }
}

/**
 * Get active call for a user
 */
export async function getActiveCall(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.req.query("userId");

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  const userIdNum = Number.parseInt(userId);

  try {
    // First, check if user is already a participant in an active call
    const activeParticipants = await db
      .select({
        call: calls,
      })
      .from(callParticipants)
      .leftJoin(calls, eq(callParticipants.callId, calls.id))
      .where(
        and(
          eq(callParticipants.userId, userIdNum),
          or(eq(calls.status, "initiated"), eq(calls.status, "ongoing")),
        ),
      )
      .limit(1);

    if (activeParticipants.length > 0 && activeParticipants[0].call) {
      return c.json({ call: activeParticipants[0].call });
    }

    // If not a participant, check if user is the recipient of an incoming call
    const incomingCall = await db
      .select()
      .from(calls)
      .where(
        and(eq(calls.recipientId, userIdNum), eq(calls.status, "initiated")),
      )
      .orderBy(desc(calls.createdAt))
      .limit(1);

    if (incomingCall.length > 0) {
      return c.json({ call: incomingCall[0] });
    }

    return c.json({ call: null });
  } catch (error) {
    console.error("Error fetching active call:", error);
    return c.json({ error: "Failed to fetch active call" }, 500);
  }
}

/**
 * Get LiveKit token for a call
 */
export async function getCallToken(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const callId = c.req.param("callId");
  const userId = c.req.query("userId");
  const userName = c.req.query("userName");

  if (!userId || !userName) {
    return c.json({ error: "userId and userName are required" }, 400);
  }

  try {
    // Get call details
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.id, Number.parseInt(callId)));

    if (!call) {
      return c.json({ error: "Call not found" }, 404);
    }

    // Generate LiveKit token
    const livekitService = new LiveKitService(
      c.env.LIVEKIT_API_KEY,
      c.env.LIVEKIT_API_SECRET,
      c.env.LIVEKIT_WS_URL,
    );

    const token = await livekitService.generateToken({
      roomName: call.livekitRoomName,
      participantName: userName,
      participantIdentity: userId,
    });

    return c.json({
      token,
      wsUrl: c.env.LIVEKIT_WS_URL,
      roomName: call.livekitRoomName,
    });
  } catch (error) {
    console.error("Error generating call token:", error);
    return c.json({ error: "Failed to generate call token" }, 500);
  }
}
