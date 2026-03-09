import { and, desc, eq, ilike } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { getDb } from "../db";
import { notes, sessions, skills } from "../db/schema";

interface NotesEnv {
  DATABASE_URL: string;
}

const app = new Hono<{ Bindings: NotesEnv }>();

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
 * GET /notes
 * Get all notes for the current user
 */
app.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const search = c.req.query("search");

  const query = db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      tags: notes.tags,
      isShared: notes.isShared,
      skillName: skills.name,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .leftJoin(skills, eq(notes.skillId, skills.id))
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt));

  const userNotes = await query;

  // Filter by search if provided
  const filteredNotes = search
    ? userNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content?.toLowerCase().includes(search.toLowerCase()),
      )
    : userNotes;

  // Format notes with preview
  const formattedNotes = filteredNotes.map((note) => ({
    ...note,
    preview:
      note.content?.substring(0, 100) +
      (note.content && note.content.length > 100 ? "..." : ""),
    updatedAtFormatted: formatRelativeTime(note.updatedAt),
  }));

  return c.json({ notes: formattedNotes });
});

/**
 * GET /notes/:id
 * Get a single note
 */
app.get("/:id", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);
  const noteId = parseInt(c.req.param("id"));

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const note = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .then((rows) => rows[0]);

  if (!note) {
    return c.json({ error: "Note not found" }, 404);
  }

  return c.json({ note });
});

/**
 * POST /notes
 * Create a new note
 */
app.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { title, content, tags, skillId } = await c.req.json();

  const [note] = await db
    .insert(notes)
    .values({
      userId,
      title: title || "Untitled Note",
      content,
      tags: tags || [],
      skillId,
    })
    .returning();

  return c.json({ note }, 201);
});

/**
 * PUT /notes/:id
 * Update a note
 */
app.put("/:id", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);
  const noteId = parseInt(c.req.param("id"));

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { title, content, tags, isShared } = await c.req.json();

  const [note] = await db
    .update(notes)
    .set({
      title,
      content,
      tags,
      isShared,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  if (!note) {
    return c.json({ error: "Note not found" }, 404);
  }

  return c.json({ note });
});

/**
 * DELETE /notes/:id
 * Delete a note
 */
app.delete("/:id", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const userId = await getCurrentUser(c);
  const noteId = parseInt(c.req.param("id"));

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  return c.json({ success: true });
});

// Helper function to format relative time
function formatRelativeTime(date: Date | null): string {
  if (!date) return "Unknown";

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
}

export default app;
