/**
 * Database Schema - Main Export
 *
 * Schema is now organized into separate files by domain:
 * - enums.ts: All PostgreSQL enum definitions
 * - users.ts: User table
 * - groupChats.ts: Group chat and member tables
 * - messages.ts: Message table
 * - calls.ts: Call and participant tables
 *
 * All schemas are re-exported from schema/index.ts
 */

export * from "./schema/index";
