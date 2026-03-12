import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth";
import callRoutes from "./routes/calls";
import contentRoutes from "./routes/content";
import groupChatRoutes from "./routes/groupChats";
import interviewRoutes from "./routes/interview";
import learningRoutes from "./routes/learning";
import livekitRoutes from "./routes/livekit";
import messageRoutes from "./routes/messages";
import notesRoutes from "./routes/notes";
import userRoutes from "./routes/users";
import wsRoutes from "./routes/ws";
import type { Env } from "./types/index";

// Extended environment with auth
interface AppEnv extends Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  API_URL: string;
}

const app = new Hono<{ Bindings: AppEnv }>();

// Enable CORS with credentials
app.use(
  "/*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (c) => {
  return c.json({
    message: "Optimus Learning Platform API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth",
      users: "/users",
      interview: "/interview",
      learning: "/learning",
      notes: "/notes",
      content: "/content",
      messages: "/messages",
      groups: "/groups",
      calls: "/calls",
      livekit: "/livekit",
      websocket: "/ws",
    },
  });
});

// Register routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/interview", interviewRoutes);
app.route("/learning", learningRoutes);
app.route("/notes", notesRoutes);
app.route("/content", contentRoutes);
app.route("/messages", messageRoutes);
app.route("/groups", groupChatRoutes);
app.route("/calls", callRoutes);
app.route("/livekit", livekitRoutes);
app.route("/ws", wsRoutes);

export default app;

export { CallRoom } from "./durable-objects/CallRoom";
// Export Durable Objects
export { ChatRoom } from "./durable-objects/ChatRoom";
