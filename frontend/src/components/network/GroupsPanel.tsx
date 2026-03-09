"use client";

import { Plus, Settings, Users, Video } from "lucide-react";
import { useState } from "react";
import { callAPI, type Group, groupAPI } from "@/lib/api/network";
import { CreateGroupModal } from "./CreateGroupModal";

interface GroupsPanelProps {
  currentUser: { id: number; name: string; email: string };
  onStartCall?: (groupId: number, type: "audio" | "video") => void;
}

export function GroupsPanel({ currentUser, onStartCall }: GroupsPanelProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [callingGroupId, setCallingGroupId] = useState<number | null>(null);

  const handleCreateGroup = async (data: {
    name: string;
    description: string;
    memberIds: number[];
  }) => {
    try {
      const newGroup = await groupAPI.create({
        createdBy: currentUser.id,
        ...data,
      });
      setGroups((prev) => [newGroup, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  const handleStartGroupCall = async (group: Group) => {
    if (callingGroupId) return;
    setCallingGroupId(group.id);

    try {
      if (onStartCall) {
        onStartCall(group.id, "video");
      } else {
        await callAPI.initiate({
          initiatorId: currentUser.id,
          type: "video",
          callType: "group",
          groupChatId: group.id,
        });
      }
    } catch (error) {
      console.error("Failed to start call:", error);
    } finally {
      setCallingGroupId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-300">Your Groups</h2>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-500 text-black rounded-lg font-medium flex items-center gap-2 hover:bg-orange-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No groups yet</p>
          <p className="text-sm text-gray-600 mb-6">
            Create a group to start collaborating
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-orange-500 text-black rounded-lg font-medium hover:bg-orange-400 transition-colors"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-4 p-4 bg-[#1a1a1c] rounded-lg hover:bg-[#222224] transition-colors group"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {group.name[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium">{group.name}</p>
                {group.description ? (
                  <p className="text-sm text-gray-500 truncate">
                    {group.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">No description</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartGroupCall(group)}
                  disabled={callingGroupId === group.id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {callingGroupId === group.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  Call
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreateGroupModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}
