import { Hono } from "hono";
import {
  addMembers,
  createGroupChat,
  deleteGroupChat,
  getGroupChat,
  getGroupMembers,
  getGroupsByUser,
  leaveGroup,
  removeMember,
  updateGroupChat,
  updateMemberRole,
} from "../controllers/groupChats";
import type { Env } from "../types/index";

const app = new Hono<{ Bindings: Env }>();

// Get groups by user
app.get("/user/:userId", getGroupsByUser);

// Create group chat
app.post("/", createGroupChat);

// Get group details
app.get("/:groupId", getGroupChat);

// Update group
app.put("/:groupId", updateGroupChat);

// Delete group
app.delete("/:groupId", deleteGroupChat);

// Add members
app.post("/:groupId/members", addMembers);

// Remove member
app.delete("/:groupId/members/:userId", removeMember);

// Update member role
app.put("/:groupId/members/:userId/role", updateMemberRole);

// Leave group
app.post("/:groupId/leave", leaveGroup);

// Get members
app.get("/:groupId/members", getGroupMembers);

export default app;
