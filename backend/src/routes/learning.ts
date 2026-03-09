import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { getDb } from "../db";
import {
  achievements,
  challenges,
  dailyGoals,
  notes,
  roadmapNodes,
  roadmaps,
  sessions,
  skills,
  userAchievements,
  userChallenges,
  userProgress,
  userStats,
} from "../db/schema";

interface LearningEnv {
  DATABASE_URL: string;
}

const app = new Hono<{ Bindings: LearningEnv }>();

// Middleware to get current user
async function getCurrentUser(c: any) {
  const db = getDb(c.env.DATABASE_URL);
  const sessionId = getCookie(c, "session");

  if (!sessionId) return null;

  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .then((rows) => rows[0]);

  if (!session || new Date(session.expiresAt) < new Date()) {
    return null;
  }

  return session.userId;
}

/**
 * GET /learning/dashboard
 * Get dashboard data for the current user
 */
app.get("/dashboard", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Get user stats
  const stats = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .then((rows) => rows[0]);

  // Get today's goals
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayGoals = await db
    .select({
      id: dailyGoals.id,
      skillName: skills.name,
      skillId: dailyGoals.skillId,
      targetMinutes: dailyGoals.targetMinutes,
      completedMinutes: dailyGoals.completedMinutes,
      isCompleted: dailyGoals.isCompleted,
    })
    .from(dailyGoals)
    .leftJoin(skills, eq(dailyGoals.skillId, skills.id))
    .where(
      and(
        eq(dailyGoals.userId, userId),
        sql`DATE(${dailyGoals.date}) = DATE(${today})`,
      ),
    );

  // Get weak areas (low scores)
  const weakAreas = await db
    .select({
      id: userProgress.id,
      topic: skills.name,
      score: userProgress.score,
      skillId: userProgress.skillId,
    })
    .from(userProgress)
    .leftJoin(skills, eq(userProgress.skillId, skills.id))
    .where(
      and(
        eq(userProgress.userId, userId),
        sql`${userProgress.score} < 70`,
        sql`${userProgress.status} != 'not_started'`,
      ),
    )
    .orderBy(userProgress.score)
    .limit(5);

  // Get current roadmap progress
  const userRoadmaps = await db
    .select({
      id: roadmaps.id,
      name: roadmaps.name,
    })
    .from(roadmaps)
    .where(eq(roadmaps.userId, userId))
    .limit(1);

  let roadmapPreview: any[] = [];
  if (userRoadmaps.length > 0) {
    roadmapPreview = await db
      .select({
        id: roadmapNodes.id,
        title: skills.name,
        status: userProgress.status,
        progress: userProgress.progressPercent,
      })
      .from(roadmapNodes)
      .leftJoin(skills, eq(roadmapNodes.skillId, skills.id))
      .leftJoin(
        userProgress,
        and(
          eq(userProgress.skillId, roadmapNodes.skillId),
          eq(userProgress.userId, userId),
        ),
      )
      .where(eq(roadmapNodes.roadmapId, userRoadmaps[0].id))
      .orderBy(roadmapNodes.orderIndex)
      .limit(5);
  }

  // Get current topic (first incomplete node)
  let currentTopic = null;
  if (userRoadmaps.length > 0) {
    const allNodes = await db
      .select({
        title: skills.name,
        category: skills.category,
        progress: userProgress.progressPercent,
        status: userProgress.status,
      })
      .from(roadmapNodes)
      .leftJoin(skills, eq(roadmapNodes.skillId, skills.id))
      .leftJoin(
        userProgress,
        and(
          eq(userProgress.skillId, roadmapNodes.skillId),
          eq(userProgress.userId, userId),
        ),
      )
      .where(eq(roadmapNodes.roadmapId, userRoadmaps[0].id))
      .orderBy(roadmapNodes.orderIndex);

    const nextNode =
      allNodes.find((n) => n.status !== "completed") ||
      allNodes[allNodes.length - 1]; // Fallback to last if all done

    if (nextNode) {
      currentTopic = {
        title: nextNode.title,
        module: nextNode.category || "General",
        progress: nextNode.progress || 0,
      };
    }
  }

  return c.json({
    currentTopic,
    stats: {
      xp: stats?.totalXp || 0,
      streak: stats?.currentStreak || 0,
      lessonsToday: todayGoals.filter((g) => g.isCompleted).length,
      totalLessons: todayGoals.length,
      quizScore: stats?.quizzesCompleted || 0,
      timeSpent: stats?.totalTimeMinutes || 0,
    },
    todayGoals,
    weakAreas: weakAreas.map((w) => ({
      id: w.id,
      topic: w.topic,
      score: w.score || 0,
      suggestion:
        (w.score || 0) < 50
          ? "Practice 3 more exercises"
          : "Quick revision needed",
    })),
    roadmapPreview: roadmapPreview.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status || "locked",
      progress: r.progress || 0,
    })),
  });
});

/**
 * POST /learning/progress
 * Update learning progress for a skill
 */
app.post("/progress", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { skillId, progressPercent, timeSpentMinutes } = await c.req.json();

  // Get or create progress record
  const progress = await db
    .select()
    .from(userProgress)
    .where(
      and(eq(userProgress.userId, userId), eq(userProgress.skillId, skillId)),
    )
    .then((rows) => rows[0]);

  const newProgress = Math.min(
    100,
    (progress?.progressPercent || 0) + progressPercent,
  );
  const newTime = (progress?.timeSpentMinutes || 0) + timeSpentMinutes;

  if (progress) {
    await db
      .update(userProgress)
      .set({
        progressPercent: newProgress,
        timeSpentMinutes: newTime,
        status: newProgress >= 100 ? "completed" : "in_progress",
        completedAt: newProgress >= 100 ? new Date() : null,
        lastAccessedAt: new Date(),
      })
      .where(eq(userProgress.id, progress.id));
  } else {
    await db.insert(userProgress).values({
      userId,
      skillId,
      progressPercent: newProgress,
      timeSpentMinutes: newTime,
      status: newProgress >= 100 ? "completed" : "in_progress",
      lastAccessedAt: new Date(),
    });
  }

  // Update user stats
  await db
    .update(userStats)
    .set({
      totalTimeMinutes: sql`${userStats.totalTimeMinutes} + ${timeSpentMinutes}`,
      lastActivityDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));

  // Award XP if completed
  if (newProgress >= 100 && (!progress || progress.progressPercent < 100)) {
    const skill = await db
      .select()
      .from(skills)
      .where(eq(skills.id, skillId))
      .then((rows) => rows[0]);

    if (skill) {
      await db
        .update(userStats)
        .set({
          totalXp: sql`${userStats.totalXp} + ${skill.xpReward || 100}`,
          lessonsCompleted: sql`${userStats.lessonsCompleted} + 1`,
        })
        .where(eq(userStats.userId, userId));
    }
  }

  return c.json({ success: true, progress: newProgress });
});

/**
 * GET /learning/roadmap
 * Get user's roadmaps
 */
app.get("/roadmap", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const userRoadmaps = await db
    .select()
    .from(roadmaps)
    .where(eq(roadmaps.userId, userId));

  const roadmapsWithNodes = await Promise.all(
    userRoadmaps.map(async (roadmap) => {
      const nodes = await db
        .select({
          id: roadmapNodes.id,
          skillId: roadmapNodes.skillId,
          title: skills.name,
          description: skills.description,
          xp: skills.xpReward,
          status: userProgress.status,
          progress: userProgress.progressPercent,
          orderIndex: roadmapNodes.orderIndex,
        })
        .from(roadmapNodes)
        .leftJoin(skills, eq(roadmapNodes.skillId, skills.id))
        .leftJoin(
          userProgress,
          and(
            eq(userProgress.skillId, roadmapNodes.skillId),
            eq(userProgress.userId, userId),
          ),
        )
        .where(eq(roadmapNodes.roadmapId, roadmap.id))
        .orderBy(roadmapNodes.orderIndex);

      const completedNodes = nodes.filter(
        (n) => n.status === "completed",
      ).length;

      return {
        ...roadmap,
        nodes: nodes.map((n) => ({
          ...n,
          status: n.status || "locked",
          progress: n.progress || 0,
        })),
        progress:
          nodes.length > 0
            ? Math.round((completedNodes / nodes.length) * 100)
            : 0,
        completedNodes,
        totalNodes: nodes.length,
      };
    }),
  );

  return c.json({ roadmaps: roadmapsWithNodes });
});

/**
 * POST /learning/roadmap
 * Create a new roadmap
 */
app.post("/roadmap", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { name, description, skillIds } = await c.req.json();

  const [roadmap] = await db
    .insert(roadmaps)
    .values({
      userId,
      name,
      description,
    })
    .returning();

  // Add skills as nodes
  if (skillIds && skillIds.length > 0) {
    await db.insert(roadmapNodes).values(
      skillIds.map((skillId: number, index: number) => ({
        roadmapId: roadmap.id,
        skillId,
        orderIndex: index,
      })),
    );
  }

  return c.json({ roadmap }, 201);
});

/**
 * GET /learning/challenges
 * Get available challenges
 */
app.get("/challenges", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const activeChallenges = await db
    .select()
    .from(challenges)
    .where(eq(challenges.isActive, true));

  // Get user's challenge progress
  const userChallengeProgress = await db
    .select()
    .from(userChallenges)
    .where(eq(userChallenges.userId, userId));

  const challengesWithStatus = activeChallenges.map((challenge) => {
    const userChallenge = userChallengeProgress.find(
      (uc) => uc.challengeId === challenge.id,
    );

    return {
      ...challenge,
      started: !!userChallenge,
      completed: !!userChallenge?.completedAt,
      score: userChallenge?.score || 0,
    };
  });

  return c.json({ challenges: challengesWithStatus });
});

/**
 * GET /learning/achievements
 * Get user achievements
 */
app.get("/achievements", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const allAchievements = await db.select().from(achievements);

  const earnedAchievements = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const achievementsWithStatus = allAchievements.map((achievement) => ({
    ...achievement,
    earned: earnedAchievements.some(
      (ea) => ea.achievementId === achievement.id,
    ),
    earnedAt: earnedAchievements.find(
      (ea) => ea.achievementId === achievement.id,
    )?.earnedAt,
  }));

  return c.json({ achievements: achievementsWithStatus });
});

/**
 * GET /learning/leaderboard
 * Get weekly leaderboard
 */
app.get("/leaderboard", async (c) => {
  const db = getDb(c.env.DATABASE_URL);

  const leaderboard = await db
    .select({
      rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${userStats.totalXp} DESC)`,
      userId: userStats.userId,
      xp: userStats.totalXp,
      streak: userStats.currentStreak,
    })
    .from(userStats)
    .orderBy(desc(userStats.totalXp))
    .limit(10);

  return c.json({ leaderboard });
});

export default app;
