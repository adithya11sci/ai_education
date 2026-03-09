import { pgEnum } from "drizzle-orm/pg-core";

// Message related enums
export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "video",
  "audio",
  "file",
]);

// Group chat related enums
export const memberRoleEnum = pgEnum("member_role", ["admin", "member"]);

// Call related enums
export const callTypeEnum = pgEnum("call_type", ["audio", "video"]);

export const callCategoryEnum = pgEnum("call_category", ["direct", "group"]);

export const callStatusEnum = pgEnum("call_status", [
  "initiated",
  "ongoing",
  "ended",
  "missed",
  "rejected",
]);

export const participantStatusEnum = pgEnum("participant_status", [
  "joined",
  "left",
  "rejected",
]);
