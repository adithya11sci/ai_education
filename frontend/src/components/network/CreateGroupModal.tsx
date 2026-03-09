"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type User, userAPI } from "@/lib/api/network";

interface CreateGroupModalProps {
  currentUser: { id: number; name: string; email: string };
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    memberIds: number[];
  }) => void;
}

export function CreateGroupModal({
  currentUser,
  onClose,
  onCreate,
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const allUsers = await userAPI.getAll();
      setUsers(allUsers.filter((u) => u.id !== currentUser.id));
    } catch (_error) {
      console.error("Failed to load users:", _error);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    onCreate({
      name: name.trim(),
      description: description.trim(),
      memberIds: selectedUserIds,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Group</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Group Name */}
          <div className="mb-4">
            <label
              htmlFor="group-name"
              className="block text-sm font-medium mb-2"
            >
              Group Name *
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="group-description"
              className="block text-sm font-medium mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
            />
          </div>

          {/* Members */}
          <div>
            <div className="block text-sm font-medium mb-3">
              Add Members ({selectedUserIds.length} selected)
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                  />
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.[0]?.toUpperCase() ||
                      user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.name || "Anonymous"}
                    </div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="flex-1 py-3 bg-orange-500 text-black rounded-xl font-bold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
