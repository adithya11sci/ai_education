"use client";

import { ArrowDownLeft, ArrowUpRight, Clock, Phone, Video } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type Call, callAPI } from "@/lib/api/network";
import { VideoCall } from "./VideoCall";

interface CallsPanelProps {
  currentUser: { id: number; name: string; email: string };
}

export function CallsPanel({ currentUser }: CallsPanelProps) {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCallHistory = useCallback(async () => {
    try {
      const history = await callAPI.getHistory(currentUser.id);
      setCallHistory(history);
    } catch (_error) {
      console.error("Failed to load call history:", _error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  const checkActiveCall = useCallback(async () => {
    try {
      const { call } = await callAPI.getActive(currentUser.id);
      if (call) setActiveCall(call);
    } catch (_error) {
      console.error("Failed to check active call:", _error);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadCallHistory();
    checkActiveCall();
  }, [loadCallHistory, checkActiveCall]);

  const handleEndCall = async () => {
    if (activeCall) {
      await callAPI.end(activeCall.id);
      setActiveCall(null);
      loadCallHistory();
    }
  };

  if (activeCall) {
    return (
      <VideoCall
        call={activeCall}
        currentUser={currentUser}
        onEndCall={handleEndCall}
      />
    );
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-300 mb-6">Recent Calls</h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-[#1a1a1c] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : callHistory.length === 0 ? (
        <div className="text-center py-16">
          <Phone className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No calls yet</p>
          <p className="text-sm text-gray-600 mt-1">
            Start a call from the Friends tab
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {callHistory.map((call) => {
            const isOutgoing = call.initiatorId === currentUser.id;
            const isMissed = call.status === "missed";

            return (
              <div
                key={call.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1c] transition-colors group"
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    call.type === "video"
                      ? "bg-purple-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  {call.type === "video" ? (
                    <Video
                      className={`w-5 h-5 ${isMissed ? "text-red-400" : "text-purple-400"}`}
                    />
                  ) : (
                    <Phone
                      className={`w-5 h-5 ${isMissed ? "text-red-400" : "text-blue-400"}`}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${isMissed ? "text-red-400" : ""}`}
                    >
                      {call.callType === "group" ? "Group Call" : "Direct Call"}
                    </span>
                    {isOutgoing ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownLeft
                        className={`w-4 h-4 ${isMissed ? "text-red-400" : "text-blue-400"}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{formatTime(call.createdAt)}</span>
                    {call.duration && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(call.duration)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Call Back */}
                <button
                  type="button"
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
