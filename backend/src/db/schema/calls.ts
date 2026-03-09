import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import {
  callCategoryEnum,
  callStatusEnum,
  callTypeEnum,
  participantStatusEnum,
} from "./enums";
import { groupChats } from "./groupChats";
import { users } from "./users";

/**
 * Calls table
 * Stores call history and metadata
 */
export const calls = pgTable(
  "calls",
  {
    id: serial("id").primaryKey(),
    type: callTypeEnum("type").notNull(),
    callType: callCategoryEnum("call_type").notNull(),
    initiatorId: integer("initiator_id")
      .notNull()
      .references(() => users.id),
    groupChatId: integer("group_chat_id").references(() => groupChats.id, {
      onDelete: "set null",
    }),
    recipientId: integer("recipient_id").references(() => users.id),
    livekitRoomName: text("livekit_room_name").notNull().unique(),
    status: callStatusEnum("status").notNull().default("initiated"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    duration: integer("duration"), // in seconds
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    initiatorIdx: index("calls_initiator_idx").on(table.initiatorId),
    groupChatIdx: index("calls_group_chat_idx").on(table.groupChatId),
    recipientIdx: index("calls_recipient_idx").on(table.recipientId),
    statusIdx: index("calls_status_idx").on(table.status),
    livekitRoomIdx: index("calls_livekit_room_idx").on(table.livekitRoomName),
  }),
);

/**
 * Call Participants table
 * Tracks participants in calls
 */
export const callParticipants = pgTable(
  "call_participants",
  {
    id: serial("id").primaryKey(),
    callId: integer("call_id")
      .notNull()
      .references(() => calls.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    leftAt: timestamp("left_at"),
    status: participantStatusEnum("status").notNull().default("joined"),
  },
  (table) => ({
    callIdx: index("call_participants_call_idx").on(table.callId),
    userIdx: index("call_participants_user_idx").on(table.userId),
  }),
);
