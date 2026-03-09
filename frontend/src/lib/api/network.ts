// API client for network features
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  createdBy: number;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  recipientId?: number;
  groupChatId?: number;
  content: string;
  type: "text" | "image" | "video" | "audio" | "file";
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Call {
  id: number;
  type: "audio" | "video";
  callType: "direct" | "group";
  initiatorId: number;
  groupChatId?: number;
  recipientId?: number;
  livekitRoomName: string;
  status: "initiated" | "ongoing" | "ended" | "missed" | "rejected";
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  createdAt: string;
}

// User API
export const userAPI = {
  async getAll(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create user");
    return res.json();
  },
};

// Group API
export const groupAPI = {
  async create(data: {
    createdBy: number;
    name: string;
    description?: string;
    memberIds: number[];
  }): Promise<Group> {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create group");
    return res.json();
  },

  async get(groupId: number): Promise<Group> {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}`);
    if (!res.ok) throw new Error("Failed to fetch group");
    return res.json();
  },

  async update(
    groupId: number,
    data: { name?: string; description?: string },
  ): Promise<Group> {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update group");
    return res.json();
  },

  async addMembers(groupId: number, userIds: number[]): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds }),
    });
    if (!res.ok) throw new Error("Failed to add members");
  },

  async removeMember(groupId: number, userId: number): Promise<void> {
    const res = await fetch(
      `${API_BASE_URL}/groups/${groupId}/members/${userId}`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok) throw new Error("Failed to remove member");
  },

  async getMembers(groupId: number): Promise<unknown[]> {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/members`);
    if (!res.ok) throw new Error("Failed to fetch members");
    return res.json();
  },

  async leave(groupId: number, userId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to leave group");
  },

  async getByUser(userId: number): Promise<Group[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/groups/user/${userId}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },
};

// Message API
export const messageAPI = {
  async sendDirect(data: {
    senderId: number;
    recipientId: number;
    content: string;
    type?: "text" | "image" | "video" | "audio" | "file";
  }): Promise<Message> {
    const res = await fetch(`${API_BASE_URL}/messages/direct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },

  async sendGroup(data: {
    senderId: number;
    groupChatId: number;
    content: string;
    type?: "text" | "image" | "video" | "audio" | "file";
  }): Promise<Message> {
    const res = await fetch(`${API_BASE_URL}/messages/group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },

  async getDirectMessages(
    userId: number,
    currentUserId: number,
  ): Promise<Message[]> {
    const res = await fetch(
      `${API_BASE_URL}/messages/direct/${userId}?currentUserId=${currentUserId}`,
    );
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },

  async getGroupMessages(groupId: number): Promise<Message[]> {
    const res = await fetch(`${API_BASE_URL}/messages/group/${groupId}`);
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },

  async getConversations(userId: number): Promise<Message[]> {
    const res = await fetch(
      `${API_BASE_URL}/messages/conversations?userId=${userId}`,
    );
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },

  async delete(messageId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete message");
  },
};

// Call API
export const callAPI = {
  async initiate(data: {
    initiatorId: number;
    type: "audio" | "video";
    callType: "direct" | "group";
    recipientId?: number;
    groupChatId?: number;
  }): Promise<Call> {
    const res = await fetch(`${API_BASE_URL}/calls/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to initiate call");
    return res.json();
  },

  async join(callId: number, userId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/calls/${callId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to join call");
  },

  async end(callId: number): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/calls/${callId}/end`, {
        method: "POST",
      });
      // 404 means call already ended - that's fine
      if (!res.ok && res.status !== 404) {
        console.warn(`Failed to end call ${callId}: ${res.status}`);
      }
    } catch (error) {
      // Network error - log but don't throw
      console.warn("Network error ending call:", error);
    }
  },

  async getToken(
    callId: number,
    userId: number,
    userName: string,
  ): Promise<{
    token: string;
    wsUrl: string;
    roomName: string;
  }> {
    const res = await fetch(
      `${API_BASE_URL}/calls/${callId}/token?userId=${userId}&userName=${encodeURIComponent(userName)}`,
    );
    if (!res.ok) throw new Error("Failed to get call token");
    return res.json();
  },

  async getHistory(userId: number): Promise<Call[]> {
    const res = await fetch(`${API_BASE_URL}/calls/history?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch call history");
    return res.json();
  },

  async getActive(userId: number): Promise<{ call: Call | null }> {
    const res = await fetch(`${API_BASE_URL}/calls/active?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch active call");
    return res.json();
  },
};
