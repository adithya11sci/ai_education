/**
 * FramVR Integration Utilities
 * Helper functions for working with FramVR virtual classrooms
 */

export interface FramVRRoom {
  id: string;
  name: string;
  url: string;
  description?: string;
  participants?: number;
  createdAt: Date;
  maxParticipants?: number;
  settings?: {
    enableChat?: boolean;
    enableVoice?: boolean;
    enableVideo?: boolean;
    allowScreenShare?: boolean;
  };
}

export interface FramVRConfig {
  baseUrl: string;
  defaultSettings: {
    enableChat: boolean;
    enableVoice: boolean;
    enableVideo: boolean;
    allowScreenShare: boolean;
  };
}

/**
 * Default FramVR configuration
 */
export const DEFAULT_FRAMEVR_CONFIG: FramVRConfig = {
  baseUrl: process.env.NEXT_PUBLIC_FRAMEVR_BASE_URL || "https://framevr.io",
  defaultSettings: {
    enableChat: true,
    enableVoice: true,
    enableVideo: true,
    allowScreenShare: true,
  },
};

/**
 * Validate a FramVR URL
 */
export function isValidFramVRUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "framevr.io" ||
      urlObj.hostname.endsWith(".framevr.io")
    );
  } catch {
    return false;
  }
}

/**
 * Generate a unique room ID
 */
export function generateRoomId(): string {
  return `room-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a FramVR room URL
 */
export function createFramVRUrl(roomId: string, baseUrl?: string): string {
  const base = baseUrl || DEFAULT_FRAMEVR_CONFIG.baseUrl;
  return `${base}/${roomId}`;
}

/**
 * Parse FramVR room ID from URL
 */
export function parseRoomIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    return pathParts[0] || null;
  } catch {
    return null;
  }
}

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  VR_ROOMS: "vr-rooms",
  VR_SETTINGS: "vr-settings",
  LAST_ROOM: "last-vr-room",
} as const;

/**
 * Load VR rooms from localStorage
 */
export function loadVRRooms(): FramVRRoom[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VR_ROOMS);
    if (!stored) return [];

    const rooms = JSON.parse(stored);
    return rooms.map((room: FramVRRoom) => ({
      ...room,
      createdAt: new Date(room.createdAt),
    }));
  } catch (error) {
    console.error("Error loading VR rooms:", error);
    return [];
  }
}

/**
 * Save VR rooms to localStorage
 */
export function saveVRRooms(rooms: FramVRRoom[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.VR_ROOMS, JSON.stringify(rooms));
  } catch (error) {
    console.error("Error saving VR rooms:", error);
  }
}

/**
 * Add a new VR room
 */
export function addVRRoom(
  room: Omit<FramVRRoom, "id" | "createdAt">,
): FramVRRoom {
  const newRoom: FramVRRoom = {
    ...room,
    id: generateRoomId(),
    createdAt: new Date(),
  };

  const rooms = loadVRRooms();
  rooms.push(newRoom);
  saveVRRooms(rooms);

  return newRoom;
}

/**
 * Delete a VR room
 */
export function deleteVRRoom(roomId: string): void {
  const rooms = loadVRRooms();
  const filtered = rooms.filter((r) => r.id !== roomId);
  saveVRRooms(filtered);
}

/**
 * Update a VR room
 */
export function updateVRRoom(
  roomId: string,
  updates: Partial<FramVRRoom>,
): FramVRRoom | null {
  const rooms = loadVRRooms();
  const index = rooms.findIndex((r) => r.id === roomId);

  if (index === -1) return null;

  rooms[index] = { ...rooms[index], ...updates };
  saveVRRooms(rooms);

  return rooms[index];
}

/**
 * Get iframe parameters for FramVR
 */
export function getFramVRIframeProps(url: string) {
  return {
    src: url,
    allow:
      "camera; microphone; display-capture; xr-spatial-tracking; fullscreen; accelerometer; gyroscope; magnetometer",
    allowFullScreen: true,
    frameBorder: "0",
    style: {
      border: "none",
      width: "100%",
      height: "100%",
    },
  };
}
