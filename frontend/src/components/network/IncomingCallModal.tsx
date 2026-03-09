"use client";

import { Phone, PhoneOff, Video } from "lucide-react";
import { useEffect, useState } from "react";
import type { Call } from "@/lib/api/network";
import { userAPI } from "@/lib/api/network";

interface IncomingCallModalProps {
  call: Call;
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({
  call,
  onAccept,
  onDecline,
}: IncomingCallModalProps) {
  const [callerName, setCallerName] = useState<string | null>(null);

  // Fetch caller's name
  useEffect(() => {
    const fetchCaller = async () => {
      try {
        const users = await userAPI.getAll();
        const caller = users.find((u) => u.id === call.initiatorId);
        if (caller) {
          setCallerName(caller.name || caller.email);
        }
      } catch (error) {
        console.error("Failed to fetch caller info:", error);
      }
    };
    fetchCaller();
  }, [call.initiatorId]);

  const displayName = callerName || `User ${call.initiatorId}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        {/* Caller Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4 animate-pulse">
              {displayName[0].toUpperCase()}
            </div>
            {/* Ringing animation */}
            <div className="absolute inset-0 rounded-full border-4 border-green-500/50 animate-ping" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
          <p className="text-gray-400 flex items-center gap-2">
            {call.type === "video" ? (
              <>
                <Video className="w-4 h-4" />
                Incoming video call...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Incoming voice call...
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
            Decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors animate-pulse"
          >
            <Phone className="w-5 h-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
