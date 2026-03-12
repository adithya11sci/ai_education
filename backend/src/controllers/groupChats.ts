import { and, eq, isNull } from "drizzle-orm";
import type { Context } from "hono";
import { getDb } from "../db";
import { groupChats, groupMembers, users } from "../db/schema";
import type {
  AddMembersRequest,
  CreateGroupChatRequest,
  Env,
  UpdateMemberRoleRequest,
} from "../types/index";

/**
 * Create a new group chat
 */
export async function createGroupChat(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.json<
    CreateGroupChatRequest & { createdBy: number }
  >();

  if (!body.name || !body.createdBy) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    // Create group chat
    const [group] = await db
      .insert(groupChats)
      .values({
        name: body.name,
        description: body.description,
        createdBy: body.createdBy,
        avatarUrl: body.avatarUrl,
      })
      .returning();

    // Add creator as admin
    await db.insert(groupMembers).values({
      groupChatId: group.id,
      userId: body.createdBy,
      role: "admin",
    });

    // Add other members
    if (body.memberIds && body.memberIds.length > 0) {
      const memberValues = body.memberIds.map((userId) => ({
        groupChatId: group.id,
        userId,
        role: "member" as const,
      }));

      await db.insert(groupMembers).values(memberValues);
    }

    return c.json(group, 201);
  } catch (error) {
    console.error("Error creating group chat:", error);
    return c.json({ error: "Failed to create group chat" }, 500);
  }
}

/**
 * Get group chat details
 */
export async function getGroupChat(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");

  try {
    const [group] = await db
      .select()
      .from(groupChats)
      .where(eq(groupChats.id, Number.parseInt(groupId)));

    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    return c.json(group);
  } catch (error) {
    console.error("Error fetching group chat:", error);
    return c.json({ error: "Failed to fetch group chat" }, 500);
  }
}

/**
 * Update group chat
 */
export async function updateGroupChat(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");
  const body = await c.req.json<{
    name?: string;
    description?: string;
    avatarUrl?: string;
  }>();

  try {
    const [updatedGroup] = await db
      .update(groupChats)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(groupChats.id, Number.parseInt(groupId)))
      .returning();

    if (!updatedGroup) {
      return c.json({ error: "Group not found" }, 404);
    }

    return c.json(updatedGroup);
  } catch (error) {
    console.error("Error updating group chat:", error);
    return c.json({ error: "Failed to update group chat" }, 500);
  }
}

/**
 * Delete group chat
 */
export async function deleteGroupChat(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");

  try {
    await db
      .delete(groupChats)
      .where(eq(groupChats.id, Number.parseInt(groupId)));

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting group chat:", error);
    return c.json({ error: "Failed to delete group chat" }, 500);
  }
}

/**
 * Add members to group
 */
export async function addMembers(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");
  const body = await c.req.json<AddMembersRequest>();

  if (!body.userIds || body.userIds.length === 0) {
    return c.json({ error: "No user IDs provided" }, 400);
  }

  try {
    const memberValues = body.userIds.map((userId) => ({
      groupChatId: Number.parseInt(groupId),
      userId,
      role: "member" as const,
    }));

    const newMembers = await db
      .insert(groupMembers)
      .values(memberValues)
      .returning();

    return c.json(newMembers, 201);
  } catch (error) {
    console.error("Error adding members:", error);
    return c.json({ error: "Failed to add members" }, 500);
  }
}

/**
 * Remove member from group
 */
export async function removeMember(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");
  const userId = c.req.param("userId");

  try {
    // Set leftAt timestamp instead of deleting
    const [updatedMember] = await db
      .update(groupMembers)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(groupMembers.groupChatId, Number.parseInt(groupId)),
          eq(groupMembers.userId, Number.parseInt(userId)),
          isNull(groupMembers.leftAt),
        ),
      )
      .returning();

    if (!updatedMember) {
      return c.json({ error: "Member not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return c.json({ error: "Failed to remove member" }, 500);
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");
  const userId = c.req.param("userId");
  const body = await c.req.json<UpdateMemberRoleRequest>();

  if (!body.role) {
    return c.json({ error: "Role is required" }, 400);
  }

  try {
    const [updatedMember] = await db
      .update(groupMembers)
      .set({ role: body.role })
      .where(
        and(
          eq(groupMembers.groupChatId, Number.parseInt(groupId)),
          eq(groupMembers.userId, Number.parseInt(userId)),
          isNull(groupMembers.leftAt),
        ),
      )
      .returning();

    if (!updatedMember) {
      return c.json({ error: "Member not found" }, 404);
    }

    return c.json(updatedMember);
  } catch (error) {
    console.error("Error updating member role:", error);
    return c.json({ error: "Failed to update member role" }, 500);
  }
}

/**
 * Leave group
 */
export async function leaveGroup(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");
  const body = await c.req.json<{ userId: number }>();

  if (!body.userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    const [updatedMember] = await db
      .update(groupMembers)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(groupMembers.groupChatId, Number.parseInt(groupId)),
          eq(groupMembers.userId, body.userId),
          isNull(groupMembers.leftAt),
        ),
      )
      .returning();

    if (!updatedMember) {
      return c.json({ error: "Member not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error leaving group:", error);
    return c.json({ error: "Failed to leave group" }, 500);
  }
}

/**
 * Get group members
 */
export async function getGroupMembers(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const groupId = c.req.param("groupId");

  try {
    const members = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        leftAt: groupMembers.leftAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(
          eq(groupMembers.groupChatId, Number.parseInt(groupId)),
          isNull(groupMembers.leftAt),
        ),
      );

    return c.json(members);
  } catch (error) {
    console.error("Error fetching group members:", error);
    return c.json({ error: "Failed to fetch group members" }, 500);
  }
}

/**
 * Get all groups for a user
 */
export async function getGroupsByUser(c: Context<{ Bindings: Env }>) {
  const db = getDb(c.env.DATABASE_URL);
  const userId = c.req.param("userId");

  try {
    const userGroups = await db
      .select({
        id: groupChats.id,
        name: groupChats.name,
        description: groupChats.description,
        createdBy: groupChats.createdBy,
        avatarUrl: groupChats.avatarUrl,
        createdAt: groupChats.createdAt,
        updatedAt: groupChats.updatedAt,
      })
      .from(groupMembers)
      .innerJoin(groupChats, eq(groupMembers.groupChatId, groupChats.id))
      .where(
        and(
          eq(groupMembers.userId, Number.parseInt(userId)),
          isNull(groupMembers.leftAt),
        ),
      );

    return c.json(userGroups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return c.json({ error: "Failed to fetch user groups" }, 500);
  }
}
