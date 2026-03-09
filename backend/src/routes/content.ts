import { Hono } from "hono";
import type { Env } from "../types/index";

const app = new Hono<{ Bindings: Env }>();

// YouTube thumbnail URL helper
const getYouTubeThumbnail = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

interface RujamVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
}

interface ContentItem {
  id: string;
  type: "video" | "article" | "project";
  title: string;
  source: string;
  duration?: string;
  thumbnail: string;
  url: string;
}

/**
 * Search for learning content (YouTube videos via RUJAM API)
 * GET /content/search?q=javascript%20tutorial
 */
app.get("/search", async (c) => {
  const query = c.req.query("q");

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  try {
    const response = await fetch(
      `https://rujam-api.vercel.app/search?q=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from RUJAM API");
    }

    const videos: RujamVideo[] = await response.json();

    // Transform to our content format with thumbnails
    const content: ContentItem[] = videos.map((video) => ({
      id: video.id,
      type: "video" as const,
      title: video.title,
      source: video.channel,
      duration: video.duration,
      thumbnail: getYouTubeThumbnail(video.id),
      url: `https://www.youtube.com/watch?v=${video.id}`,
    }));

    return c.json({
      results: content,
      query,
      count: content.length,
    });
  } catch (error) {
    console.error("Content search error:", error);
    return c.json({ error: "Failed to search content" }, 500);
  }
});

/**
 * Get recommended content for a topic
 * GET /content/recommended?topic=javascript
 */
app.get("/recommended", async (c) => {
  const topic = c.req.query("topic") || "programming tutorial";

  try {
    const response = await fetch(
      `https://rujam-api.vercel.app/search?q=${encodeURIComponent(topic)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from RUJAM API");
    }

    const videos: RujamVideo[] = await response.json();

    const content: ContentItem[] = videos.slice(0, 6).map((video) => ({
      id: video.id,
      type: "video" as const,
      title: video.title,
      source: video.channel,
      duration: video.duration,
      thumbnail: getYouTubeThumbnail(video.id),
      url: `https://www.youtube.com/watch?v=${video.id}`,
    }));

    return c.json({
      results: content,
      topic,
    });
  } catch (error) {
    console.error("Recommended content error:", error);
    return c.json({ error: "Failed to get recommendations" }, 500);
  }
});

export default app;
