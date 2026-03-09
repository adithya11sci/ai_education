"use client";

import { MessageSquare, Phone, Search, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { type User, userAPI } from "@/lib/api/network";

interface FriendsPanelProps {
  currentUser: { id: number; name: string; email: string };
  onStartChat?: (user: User) => void;
  onStartCall?: (user: User, type: "audio" | "video") => void;
}

export function FriendsPanel({
  currentUser,
  onStartChat,
  onStartCall,
}: FriendsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await userAPI.getAll();
        setAllUsers(users.filter((u) => u.id !== currentUser.id));
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [currentUser.id]);

  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allUsers;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {/* User List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-[#1a1a1c] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{searchQuery ? "No users found" : "No users available"}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1c] transition-colors group"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {(user.name?.[0] || user.email[0]).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#050505] rounded-full" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onStartChat?.(user)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Message"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => onStartCall?.(user, "audio")}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Voice call"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => onStartCall?.(user, "video")}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Video call"
                >
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
