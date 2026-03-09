import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Users table
 * Stores user account information with OAuth support
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  password: text("password"), // Nullable for OAuth users
  avatarUrl: text("avatar_url"),
  // OAuth fields
  googleId: text("google_id").unique(),
  githubId: text("github_id").unique(),
  // Profile fields
  bio: text("bio"),
  isOnboarded: boolean("is_onboarded").default(false),
  currentSkillPath: text("current_skill_path"), // e.g., 'web-dev', 'python', 'ml'
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

/**
 * Sessions table for auth
 */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // UUID or random string
  userId: serial("user_id")
    .references(() => users.id)
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
