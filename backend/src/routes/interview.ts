import { Hono } from "hono";
import type { Env } from "../types/index";

/**
 * Extended environment with Groq AI config
 */
interface InterviewEnv extends Env {
    GROQ_API_KEY: string;
    INTERVIEW_MODEL?: string; // e.g. "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"
}

const app = new Hono<{ Bindings: InterviewEnv }>();

/**
 * Available Groq models (for reference):
 *
 * Fast & Free:
 *   - "llama-3.3-70b-versatile"   (recommended - best quality)
 *   - "llama-3.1-8b-instant"      (fastest)
 *   - "mixtral-8x7b-32768"        (good balance)
 *   - "gemma2-9b-it"              (Google's model)
 *
 * To change the model:
 *   1. Set INTERVIEW_MODEL in your .dev.vars file
 *   2. Or pass ?model=<model-name> as query parameter
 *
 * Example: INTERVIEW_MODEL=llama-3.1-8b-instant
 */
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * System prompt that makes the AI behave as a professional interviewer
 */
const INTERVIEWER_SYSTEM_PROMPT = `You are an expert technical interviewer named "Optimus" for a learning platform. Your role is to conduct mock interviews to help students practice.

RULES:
1. Be professional but friendly and encouraging
2. Ask one question at a time
3. After the student answers, provide brief constructive feedback then ask a follow-up or new question
4. Cover topics relevant to software development: algorithms, system design, behavioral, coding concepts
5. Adapt difficulty based on the student's responses
6. If the student says "hello" or greets you, introduce yourself and ask what type of interview they'd like (technical, behavioral, or general)
7. Keep responses concise (2-3 sentences max for feedback, then the question)

RESPONSE FORMAT:
You must respond with ONLY valid JSON in this exact format, no markdown, no code blocks:
{"text": "your response text here", "facialExpression": "smile", "animation": "Talking_1"}

Available facialExpressions: "smile", "default", "funnyFace", "sad"
Available animations: "Talking_0", "Talking_1", "Talking_2", "Idle"

Use "smile" for encouragement, "default" for questions, "sad" for when the student struggles.`;

/**
 * Generate lip-sync cues for the response text
 */
function generateLipSync(text: string) {
    const visemes = ["A", "B", "C", "D", "E", "F", "G", "H", "X"];
    const words = text.split(" ");
    const cues = [];
    let currentTime = 0;

    for (const word of words) {
        for (let i = 0; i < word.length; i++) {
            const duration = 0.08 + Math.random() * 0.04;
            cues.push({
                start: Math.round(currentTime * 100) / 100,
                end: Math.round((currentTime + duration) * 100) / 100,
                value: visemes[Math.floor(Math.random() * visemes.length)],
            });
            currentTime += duration;
        }
        currentTime += 0.1;
    }

    return { mouthCues: cues };
}

/**
 * Conversation history per session (in-memory, resets on worker restart)
 * In production, use Durable Objects or KV for persistence
 */
const conversationHistory = new Map<
    string,
    Array<{ role: "user" | "assistant" | "system"; content: string }>
>();

/**
 * POST /interview/chat
 * AI-powered interview chat using Groq LLM
 */
app.post("/chat", async (c) => {
    const apiKey = c.env.GROQ_API_KEY;

    if (!apiKey) {
        // Fallback to mock response if no API key configured
        return c.json({
            messages: [
                {
                    text: "AI interview is not configured. Please add GROQ_API_KEY to your environment variables.",
                    audio: "",
                    lipsync: generateLipSync("AI interview is not configured."),
                    facialExpression: "sad",
                    animation: "Idle",
                },
            ],
        });
    }

    try {
        const body = await c.req.json().catch(() => ({}));
        const userMessage = (body as { message?: string; sessionId?: string })
            .message;
        const sessionId =
            (body as { sessionId?: string }).sessionId || "default";

        // Get or create conversation history for this session
        if (!conversationHistory.has(sessionId)) {
            conversationHistory.set(sessionId, [
                { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
            ]);
        }
        const history = conversationHistory.get(sessionId)!;

        // Add user message to history
        if (userMessage && userMessage.trim() !== "") {
            history.push({ role: "user", content: userMessage });
        } else {
            history.push({
                role: "user",
                content:
                    "Hi, I'd like to start a mock interview session.",
            });
        }

        // Select model: query param > env var > default
        const queryModel = c.req.query("model");
        const model =
            queryModel || c.env.INTERVIEW_MODEL || DEFAULT_MODEL;

        // Call Groq API
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: history,
                    temperature: 0.7,
                    max_tokens: 300,
                    response_format: { type: "json_object" },
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API error:", response.status, errorText);
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = (await response.json()) as {
            choices: Array<{
                message: { content: string };
            }>;
            model: string;
        };

        const aiContent = data.choices[0]?.message?.content || "";

        // Parse the JSON response from the AI
        let parsed: {
            text: string;
            facialExpression: string;
            animation: string;
        };
        try {
            parsed = JSON.parse(aiContent);
        } catch {
            // If AI didn't return valid JSON, wrap it
            parsed = {
                text: aiContent,
                facialExpression: "default",
                animation: "Talking_1",
            };
        }

        // Add assistant response to history
        history.push({ role: "assistant", content: aiContent });

        // Keep history manageable (last 20 messages + system prompt)
        if (history.length > 21) {
            const systemPrompt = history[0];
            conversationHistory.set(sessionId, [
                systemPrompt,
                ...history.slice(-20),
            ]);
        }

        // Generate lip-sync for the response
        const lipsync = generateLipSync(parsed.text);

        return c.json({
            messages: [
                {
                    text: parsed.text,
                    audio: "",
                    lipsync,
                    facialExpression: parsed.facialExpression || "default",
                    animation: parsed.animation || "Talking_1",
                },
            ],
            model: data.model, // Return which model was used
        });
    } catch (error) {
        console.error("Interview chat error:", error);
        return c.json(
            {
                messages: [
                    {
                        text: "I'm having trouble connecting right now. Please try again in a moment.",
                        audio: "",
                        lipsync: generateLipSync("I'm having trouble connecting."),
                        facialExpression: "sad",
                        animation: "Idle",
                    },
                ],
                error: String(error),
            },
            500,
        );
    }
});

/**
 * GET /interview/models
 * List available models for the interview
 */
app.get("/models", async (c) => {
    const currentModel =
        c.env.INTERVIEW_MODEL || DEFAULT_MODEL;

    return c.json({
        current: currentModel,
        available: [
            {
                id: "llama-3.3-70b-versatile",
                name: "Llama 3.3 70B",
                description: "Best quality, recommended",
                speed: "fast",
            },
            {
                id: "llama-3.1-8b-instant",
                name: "Llama 3.1 8B",
                description: "Fastest response time",
                speed: "fastest",
            },
            {
                id: "mixtral-8x7b-32768",
                name: "Mixtral 8x7B",
                description: "Good balance of speed and quality",
                speed: "fast",
            },
            {
                id: "gemma2-9b-it",
                name: "Gemma 2 9B",
                description: "Google's compact model",
                speed: "fast",
            },
        ],
        usage:
            "Pass ?model=<model-id> to POST /interview/chat, or set INTERVIEW_MODEL env var",
    });
});

/**
 * POST /interview/reset
 * Reset conversation history for a session
 */
app.post("/reset", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const sessionId =
        (body as { sessionId?: string }).sessionId || "default";

    conversationHistory.delete(sessionId);

    return c.json({ success: true, message: "Conversation reset" });
});

export default app;
