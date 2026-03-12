const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// Types
export interface DashboardData {
  stats: {
    xp: number;
    streak: number;
    lessonsToday: number;
    totalLessons: number;
    quizScore: number;
    timeSpent: number;
  };
  todayGoals: TodayGoal[];
  weakAreas: WeakArea[];
  roadmapPreview: RoadmapNode[];
  currentTopic?: {
    title: string;
    module: string;
    progress: number;
  } | null;
}

export async function completeOnboarding(data: {
  role: string;
  experience: string;
  knowledge?: string;
  learning_style?: string;
  goal?: string;
  commitment?: string;
}) {
  return fetchWithAuth("/auth/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface TodayGoal {
  id: number;
  skillName: string;
  skillId: number;
  targetMinutes: number;
  completedMinutes: number;
  isCompleted: boolean;
}

export interface WeakArea {
  id: number;
  topic: string;
  score: number;
  suggestion: string;
}

export interface RoadmapNode {
  id: number;
  title: string;
  status: "completed" | "in_progress" | "locked" | "not_started";
  progress: number;
}

export interface Roadmap {
  id: number;
  name: string;
  description: string | null;
  nodes: RoadmapNode[];
  progress: number;
  completedNodes: number;
  totalNodes: number;
}

export interface Note {
  id: number;
  title: string;
  content: string | null;
  tags: string[];
  isShared: boolean;
  skillName: string | null;
  createdAt: string;
  updatedAt: string;
  preview: string;
  updatedAtFormatted: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string | null;
  type: string;
  difficulty: string;
  xpReward: number;
  timeLimitMinutes: number | null;
  started: boolean;
  completed: boolean;
  score: number;
}

// API Client
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    // Check if response is JSON before parsing
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const error = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Request failed");
    } else {
      throw new Error(`Request failed with status ${res.status}`);
    }
  }

  // Check content type before parsing response
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Expected JSON but received: ${contentType || "unknown"}`);
  }

  return res.json();
}

// Dashboard API
export async function getDashboardData(): Promise<DashboardData> {
  return fetchWithAuth("/learning/dashboard");
}

// Roadmap API
export async function getRoadmaps(): Promise<{ roadmaps: Roadmap[] }> {
  return fetchWithAuth("/learning/roadmap");
}

export async function createRoadmap(data: {
  name: string;
  description?: string;
  skillIds?: number[];
}): Promise<{ roadmap: Roadmap }> {
  return fetchWithAuth("/learning/roadmap", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Progress API
export async function updateProgress(data: {
  skillId: number;
  progressPercent: number;
  timeSpentMinutes: number;
}): Promise<{ success: boolean; progress: number }> {
  return fetchWithAuth("/learning/progress", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Challenges API
export async function getChallenges(): Promise<{ challenges: Challenge[] }> {
  return fetchWithAuth("/learning/challenges");
}

export interface Achievement {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  xpReward: number;
  earned: boolean;
  earnedAt?: string;
}

export interface LeaderboardItem {
  rank: number;
  userId: number;
  xp: number;
  streak: number;
}

// Achievements API
export async function getAchievements(): Promise<{
  achievements: Achievement[];
}> {
  return fetchWithAuth("/learning/achievements");
}

// Leaderboard API
export async function getLeaderboard(): Promise<{
  leaderboard: LeaderboardItem[];
}> {
  return fetchWithAuth("/learning/leaderboard");
}

// Notes API
export async function getNotes(search?: string): Promise<{ notes: Note[] }> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchWithAuth(`/notes${query}`);
}

export async function getNote(id: number): Promise<{ note: Note }> {
  return fetchWithAuth(`/notes/${id}`);
}

export async function createNote(data: {
  title?: string;
  content?: string;
  tags?: string[];
  skillId?: number;
}): Promise<{ note: Note }> {
  return fetchWithAuth("/notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateNote(
  id: number,
  data: {
    title?: string;
    content?: string;
    tags?: string[];
    isShared?: boolean;
  },
): Promise<{ note: Note }> {
  return fetchWithAuth(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteNote(id: number): Promise<{ success: boolean }> {
  return fetchWithAuth(`/notes/${id}`, {
    method: "DELETE",
  });
}
