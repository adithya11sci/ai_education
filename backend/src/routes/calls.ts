import { Hono } from "hono";
import {
  endCall,
  getActiveCall,
  getCallHistory,
  getCallToken,
  initiateCall,
  joinCall,
} from "../controllers/calls";
import type { Env } from "../types/index";

const app = new Hono<{ Bindings: Env }>();

// Initiate a call
app.post("/initiate", initiateCall);

// Join a call
app.post("/:callId/join", joinCall);

// End a call
app.post("/:callId/end", endCall);

// Get call history
app.get("/history", getCallHistory);

// Get active call
app.get("/active", getActiveCall);

// Get LiveKit token for a call
app.get("/:callId/token", getCallToken);

export default app;
