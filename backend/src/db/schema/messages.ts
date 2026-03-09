import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { messageTypeEnum } from "./enums";
import { groupChats } from "./groupChats";
import { users } from "./users";

/**
 * Messages table
 * Stores all messages for both direct and group chats
 */
export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    senderId: integer("sender_id")
      .notNull()
      .references(() => users.id),
    groupChatId: integer("group_chat_id").references(() => groupChats.id, {
      onDelete: "cascade",
    }),
    recipientId: integer("recipient_id").references(() => users.id),
    content: text("content").notNull(),
    type: messageTypeEnum("type").notNull().default("text"),
    metadata: jsonb("metadata"), // For storing file URLs, dimensions, etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    senderIdx: index("messages_sender_idx").on(table.senderId),
    groupChatIdx: index("messages_group_chat_idx").on(table.groupChatId),
    recipientIdx: index("messages_recipient_idx").on(table.recipientId),
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
  }),
);
