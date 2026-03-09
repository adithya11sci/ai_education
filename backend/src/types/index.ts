// Type definitions for the messaging and calls system

export type MessageType = "text" | "image" | "video" | "audio" | "file";
export type MemberRole = "admin" | "member";
export type CallType = "audio" | "video";
export type CallCategory = "direct" | "group";
export type CallStatus =
  | "initiated"
  | "ongoing"
  | "ended"
  | "missed"
  | "rejected";
export type ParticipantStatus = "joined" | "left" | "rejected";

// WebSocket message types
export interface WSMessage {
  type: string;
  payload: unknown;
}

export interface ChatMessage extends WSMessage {
  type: "chat_message";
  payload: {
    id: number;
    senderId: number;
    content: string;
    messageType: MessageType;
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
}

export interface TypingIndicator extends WSMessage {
  type: "typing";
  payload: {
    userId: number;
    isTyping: boolean;
  };
}

export interface UserStatus extends WSMessage {
  type: "user_status";
  payload: {
    userId: number;
    status: "online" | "offline";
  };
}

// Call-related types
export interface CallEvent extends WSMessage {
  type: "call_event";
  payload: {
    callId: number;
    event: "participant_joined" | "participant_left" | "call_ended";
    userId?: number;
  };
}

// LiveKit types
export interface LiveKitRoomOptions {
  name: string;
  emptyTimeout?: number;
  maxParticipants?: number;
}

export interface LiveKitTokenOptions {
  roomName: string;
  participantName: string;
  participantIdentity: string;
  metadata?: string;
}

// Request/Response types
export interface CreateGroupChatRequest {
  name: string;
  description?: string;
  avatarUrl?: string;
  memberIds: number[];
}

export interface SendMessageRequest {
  content: string;
  type?: MessageType;
  metadata?: Record<string, unknown>;
  groupChatId?: number;
  recipientId?: number;
}

export interface InitiateCallRequest {
  type: CallType;
  callType: CallCategory;
  recipientId?: number;
  groupChatId?: number;
}

export interface AddMembersRequest {
  userIds: number[];
}

export interface UpdateMemberRoleRequest {
  role: MemberRole;
}

// Bindings for Cloudflare Workers
export interface Env {
  DATABASE_URL: string;
  LIVEKIT_API_KEY: string;
  LIVEKIT_API_SECRET: string;
  LIVEKIT_WS_URL: string;
  CHAT_ROOM: DurableObjectNamespace;
  CALL_ROOM: DurableObjectNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  API_URL: string;
}
