import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Learning status enum
 */
export const learningStatusEnum = pgEnum("learning_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

/**
 * Skills/Topics table - the knowledge units students learn
 */
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // 'web', 'python', 'js', 'react', etc.
  parentSkillId: integer("parent_skill_id").references(() => skills.id), // For nested skills
  xpReward: integer("xp_reward").default(100),
  estimatedMinutes: integer("estimated_minutes").default(30),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Roadmaps table - learning paths created by users or system
 */
export const roadmaps = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Roadmap nodes - skills in a roadmap with order
 */
export const roadmapNodes = pgTable("roadmap_nodes", {
  id: serial("id").primaryKey(),
  roadmapId: integer("roadmap_id")
    .references(() => roadmaps.id)
    .notNull(),
  skillId: integer("skill_id")
    .references(() => skills.id)
    .notNull(),
  orderIndex: integer("order_index").notNull(), // Position in the roadmap
  prereqNodeId: integer("prereq_node_id").references(() => roadmapNodes.id), // Previous node that must be completed
});

/**
 * User progress on skills
 */
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  skillId: integer("skill_id")
    .references(() => skills.id)
    .notNull(),
  status: learningStatusEnum("status").default("not_started"),
  progressPercent: integer("progress_percent").default(0),
  score: integer("score").default(0), // Quiz/assessment score
  timeSpentMinutes: integer("time_spent_minutes").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * User stats - gamification
 */
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  totalXp: integer("total_xp").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lessonsCompleted: integer("lessons_completed").default(0),
  quizzesCompleted: integer("quizzes_completed").default(0),
  totalTimeMinutes: integer("total_time_minutes").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Notes - user's personal notes
 */
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  content: text("content"), // Markdown content
  skillId: integer("skill_id").references(() => skills.id), // Optional: linked to a skill
  tags: jsonb("tags").$type<string[]>().default([]),
  isShared: boolean("is_shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Daily goals - what the user should learn today
 */
export const dailyGoals = pgTable("daily_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  date: timestamp("date").notNull(),
  skillId: integer("skill_id")
    .references(() => skills.id)
    .notNull(),
  targetMinutes: integer("target_minutes").default(30),
  completedMinutes: integer("completed_minutes").default(0),
  isCompleted: boolean("is_completed").default(false),
});

/**
 * Challenges - daily/weekly challenges for gamification
 */
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'daily', 'quiz', 'coding', 'battle'
  difficulty: difficultyEnum("difficulty").default("medium"),
  xpReward: integer("xp_reward").default(50),
  timeLimitMinutes: integer("time_limit_minutes"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  isActive: boolean("is_active").default(true),
});

/**
 * User challenge progress
 */
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id)
    .notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  xpEarned: integer("xp_earned").default(0),
});

/**
 * Achievements/Badges
 */
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"), // Emoji or icon name
  condition: jsonb("condition"), // JSON describing the unlock condition
  xpReward: integer("xp_reward").default(0),
});

/**
 * User achievements
 */
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  achievementId: integer("achievement_id")
    .references(() => achievements.id)
    .notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});
