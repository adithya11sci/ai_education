import { Hono } from "hono";
import { getDb } from "../db";
import { users } from "../db/schema";

const app = new Hono<{ Bindings: { DATABASE_URL: string } }>();

app.get("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users);
  return c.json(allUsers);
});

app.post("/", async (c) => {
  const db = getDb(c.env.DATABASE_URL);
  const body = await c.req.json();

  try {
    // Validate required fields
    if (!body.email || !body.password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // TODO: Hash password before storing (use bcrypt or argon2)
    // For now, storing plain text - MUST be hashed in production!
    const [user] = await db
      .insert(users)
      .values({
        name: body.name,
        email: body.email,
        password: body.password, // WARNING: Should be hashed!
      })
      .returning();

    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    return c.json(userWithoutPassword, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

export default app;
