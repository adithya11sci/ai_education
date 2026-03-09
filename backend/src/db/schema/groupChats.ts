import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { memberRoleEnum } from "./enums";
import { users } from "./users";

/**
 * Group Chats table
 * Stores group chat information
 */
export const groupChats = pgTable("group_chats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Group Members table
 * Junction table for group membership and roles
 */
export const groupMembers = pgTable(
  "group_members",
  {
    id: serial("id").primaryKey(),
    groupChatId: integer("group_chat_id")
      .notNull()
      .references(() => groupChats.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    role: memberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    leftAt: timestamp("left_at"),
  },
  (table) => ({
    groupChatIdx: index("group_members_group_chat_idx").on(table.groupChatId),
    userIdx: index("group_members_user_idx").on(table.userId),
  }),
);
