"use client";

import { Code2, Keyboard, Plus, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function CollaboratePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 9);
    router.push(`/collaborate/${id}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId) router.push(`/collaborate/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="lg:ml-64 p-4 sm:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold">Collaborative Coding</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Code together in real-time with your team or friends. Share your
            workspace, chat, and build amazing things together.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room */}
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-8 hover:border-blue-500/30 transition-all group">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">New Session</h2>
            <p className="text-gray-400 mb-8">
              Start a new collaborative coding session and invite others to join
              via link.
            </p>
            <button
              type="button"
              onClick={createRoom}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              Start Coding
              <Code2 className="w-5 h-5" />
            </button>
          </div>

          {/* Join Room */}
          <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-8 hover:border-purple-500/30 transition-all group">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Keyboard className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Join Session</h2>
            <p className="text-gray-400 mb-8">
              Enter a Room ID to join an existing coding session with your team.
            </p>
            <form onSubmit={joinRoom} className="space-y-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID (e.g., x7y8z9)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!roomId}
                className="w-full py-4 bg-[#1a1a1e] hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-colors border border-white/10"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Powered by PartyKit
            </h3>
            <p className="text-gray-400">
              Low-latency real-time collaboration for seamless experience.
            </p>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-[#050505] bg-gray-700 flex items-center justify-center text-xs"
              >
                U{i}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#050505] bg-[#1a1a1e] flex items-center justify-center text-xs text-gray-400">
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
