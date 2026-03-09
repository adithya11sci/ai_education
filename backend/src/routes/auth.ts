import { Google } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { getDb } from "../db";
import { sessions, userStats, users } from "../db/schema";

interface AuthEnv {
  DATABASE_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  API_URL: string;
}

const app = new Hono<{ Bindings: AuthEnv }>();

// Helper to generate session ID
function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper to create session
async function createSession(db: ReturnType<typeof getDb>, userId: number) {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return { sessionId, expiresAt };
}

// Initialize Google OAuth
function getGoogleClient(env: AuthEnv) {
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.API_URL}/auth/google/callback`,
  );
}

/**
 * GET /auth/google
 * Redirect to Google OAuth
 */
app.get("/google", async (c) => {
  const google = getGoogleClient(c.env);
  const state = generateSessionId();
  const codeVerifier = generateSessionId();

  // Store state and code verifier in cookies
  setCookie(c, "google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  setCookie(c, "google_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 60 * 10,
    path: "/",
  });

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  return c.redirect(url.toString());
});

/**
 * GET /auth/google/callback
 * Handle Google OAuth callback
 */
app.get("/google/callback", async (c) => {
  const google = getGoogleClient(c.env);
  const db = getDb(c.env.DATABASE_URL);

  const code = c.req.query("code");
  const state = c.req.query("state");
  const storedState = getCookie(c, "google_oauth_state");
  const codeVerifier = getCookie(c, "google_code_verifier");

  // Verify state
  if (
    !code ||
    !state ||
    !storedState ||
    state !== storedState ||
    !codeVerifier
  ) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=invalid_state`);
  }

  try {
    // Exchange code for tokens
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    // Get user info from Google
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    const googleUser = (await response.json()) as {
      sub: string;
      email: string;
      name: string;
      picture: string;
    };

    // Check if user exists
    let user = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleUser.sub))
      .then((rows) => rows[0]);

    if (!user) {
      // Check if email exists (link accounts)
      user = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email))
        .then((rows) => rows[0]);

      if (user) {
        // Link Google account to existing user
        await db
          .update(users)
          .set({ googleId: googleUser.sub, avatarUrl: googleUser.picture })
          .where(eq(users.id, user.id));
      } else {
        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.sub,
            avatarUrl: googleUser.picture,
            isOnboarded: false,
          })
          .returning();
        user = newUser;

        // Initialize user stats
        await db.insert(userStats).values({
          userId: user.id,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
        });
      }
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Create session
    const { sessionId, expiresAt } = await createSession(db, user.id);

    // Clear OAuth cookies
    deleteCookie(c, "google_oauth_state");
    deleteCookie(c, "google_code_verifier");

    // Set session cookie
    setCookie(c, "session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: expiresAt,
      path: "/",
    });

    // Redirect to frontend
    const redirectUrl =
      user.isOnboarded && user.currentSkillPath
        ? `${c.env.FRONTEND_URL}/dashboard`
        : `${c.env.FRONTEND_URL}/onboarding`;

    return c.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth error:", error);
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * GET /auth/me
 * Get current user from session
 */
app.get("/me", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const sessionId = getCookie(c, "session");

  if (!sessionId) {
    return c.json({ user: null }, 401);
  }

  // Get session
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .then((rows) => rows[0]);

  if (!session || new Date(session.expiresAt) < new Date()) {
    deleteCookie(c, "session");
    return c.json({ user: null }, 401);
  }

  // Get user
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      isOnboarded: users.isOnboarded,
      currentSkillPath: users.currentSkillPath,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .then((rows) => rows[0]);

  if (!user) {
    deleteCookie(c, "session");
    return c.json({ user: null }, 401);
  }

  // Get user stats
  const stats = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .then((rows) => rows[0]);

  return c.json({
    user: {
      ...user,
      isOnboarded: !!(user.isOnboarded && user.currentSkillPath),
      stats: stats || { totalXp: 0, currentStreak: 0 },
    },
  });
});

/**
 * POST /auth/logout
 * Clear session
 */
app.post("/logout", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const sessionId = getCookie(c, "session");

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    deleteCookie(c, "session");
  }

  return c.json({ success: true });
});

/**
 * POST /auth/onboarding
 * Complete onboarding process
 */
app.post("/onboarding", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const sessionId = getCookie(c, "session");

  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Get session
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .then((rows) => rows[0]);

  if (!session || new Date(session.expiresAt) < new Date()) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { role, experience } = await c.req.json();

  // Update user
  await db
    .update(users)
    .set({
      isOnboarded: true,
      currentSkillPath: role, // Use role as skill path for now
    })
    .where(eq(users.id, session.userId));

  return c.json({ success: true });
});

export default app;
