"use client";

import { animate, stagger } from "animejs";
import {
  ArrowLeft,
  Box,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Share2,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface VRRoom {
  id: string;
  name: string;
  url: string;
  participants: number;
  createdAt: Date;
  userId?: number;
  creatorName?: string;
  creatorEmail?: string;
}

export default function VRClassroomPage() {
  const { user, login } = useAuth();
  const [rooms, setRooms] = useState<VRRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<VRRoom | null>(null);
  const [roomName, setRoomName] = useState("");
  const [customRoomUrl, setCustomRoomUrl] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Animate on mount
    if (mainRef.current) {
      animate(mainRef.current.querySelectorAll(".animate-in"), {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(100),
        duration: 800,
        easing: "easeOutExpo",
      });
    }

    // Load saved rooms from localStorage (user-specific)
    if (user) {
      const storageKey = `vr-rooms-${user.id}`;
      const savedRooms = localStorage.getItem(storageKey);
      if (savedRooms) {
        setRooms(
          JSON.parse(savedRooms).map((room: VRRoom) => ({
            ...room,
            createdAt: new Date(room.createdAt),
          })),
        );
      }
    }
  }, [user]);

  const createRoom = () => {
    if (!roomName.trim() || !user) return;

    // Generate a unique room ID or use custom URL
    const roomId = customRoomUrl || `room-${user.id}-${Date.now()}`;
    const framevrUrl = customRoomUrl.startsWith("http")
      ? customRoomUrl
      : `https://framevr.io/${roomId}`;

    const newRoom: VRRoom = {
      id: roomId,
      name: roomName,
      url: framevrUrl,
      participants: 0,
      createdAt: new Date(),
      userId: user.id,
      creatorName: user.name || undefined,
      creatorEmail: user.email,
    };

    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    const storageKey = `vr-rooms-${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedRooms));

    setRoomName("");
    setCustomRoomUrl("");
    setShowCreateModal(false);
  };

  const joinRoom = (room: VRRoom) => {
    setCurrentRoom(room);
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setIsFullscreen(false);
  };

  const copyRoomLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteRoom = (roomId: string) => {
    if (!user) return;
    const updatedRooms = rooms.filter((r) => r.id !== roomId);
    setRooms(updatedRooms);
    const storageKey = `vr-rooms-${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedRooms));
    if (currentRoom?.id === roomId) {
      leaveRoom();
    }
  };

  const toggleFullscreen = () => {
    if (!iframeRef.current) return;

    if (!isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Quick join with FramVR URL
  const quickJoinFramVR = () => {
    const defaultRoom: VRRoom = {
      id: "quick-join",
      name: "Quick Join Session",
      url: "https://framevr.io/optimus-demo", // Demo classroom
      participants: 0,
      createdAt: new Date(),
    };
    joinRoom(defaultRoom);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <Sidebar />
      <main ref={mainRef} className="lg:ml-64 p-4 sm:p-8 pt-16 lg:pt-8">
        {!user ? (
          /* Login Required */
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Box className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-3xl font-bold mb-3">VR Classrooms</h2>
              <p className="text-gray-400 mb-6">
                Sign in with Google to create and join immersive virtual reality
                learning spaces
              </p>
              <button
                type="button"
                onClick={login}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black rounded-xl px-8 py-3 font-semibold transition-all inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <title>Google Logo</title>
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        ) : !currentRoom ? (
          <>
            {/* Header */}
            <div className="animate-in mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                    <Box className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">VR Classrooms</h1>
                    <p className="text-gray-400">
                      Immersive virtual reality learning spaces powered by
                      FramVR
                    </p>
                  </div>
                </div>
                {/* User Profile */}
                <div className="flex items-center gap-3 bg-[#1a1a1e] border border-white/10 rounded-xl px-4 py-2">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center font-bold text-black text-sm">
                      {(user.name?.[0] || user.email[0] || "U").toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-medium">{user.name || "User"}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="animate-in grid md:grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="border-2 border-orange-500 hover:border-orange-400 rounded-xl p-6 text-left transition-all group"
              >
                <Sparkles className="w-8 h-8 mb-3 text-orange-500 group-hover:text-orange-400" />
                <h3 className="text-xl font-semibold mb-2">Create VR Room</h3>
                <p className="text-gray-400">
                  Set up a new virtual classroom for your students
                </p>
              </button>

              <button
                type="button"
                onClick={quickJoinFramVR}
                className="bg-[#1a1a1e] hover:bg-[#2a2a2e] border border-white/10 hover:border-orange-500/30 rounded-xl p-6 text-left transition-all group"
              >
                <Globe className="w-8 h-8 mb-3 text-orange-400" />
                <h3 className="text-xl font-semibold mb-2">
                  Quick Join FramVR
                </h3>
                <p className="text-gray-400">
                  Jump into a FramVR session instantly
                </p>
              </button>
            </div>

            {/* Rooms List */}
            <div className="animate-in">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Your VR Classrooms
              </h2>

              {rooms.length === 0 ? (
                <div className="bg-[#1a1a1e] border border-white/10 rounded-xl p-12 text-center">
                  <Box className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    No VR classrooms yet
                  </h3>
                  <p className="text-gray-500">
                    Create your first virtual classroom to get started
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-[#1a1a1e] border border-white/10 rounded-xl p-6 hover:border-orange-500/30 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {room.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created {room.createdAt.toLocaleDateString()}
                          </p>
                          {room.creatorName && (
                            <p className="text-xs text-orange-400 mt-1">
                              by {room.creatorName}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteRoom(room.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => joinRoom(room)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black rounded-lg py-2 px-4 font-medium transition-colors"
                        >
                          Join Room
                        </button>
                        <button
                          type="button"
                          onClick={() => copyRoomLink(room.url)}
                          className="bg-[#2a2a2e] hover:bg-[#3a3a3e] rounded-lg p-2 transition-colors"
                          title="Copy link"
                        >
                          {copied ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="animate-in mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-[#1a1a1e] border border-white/10 hover:border-orange-500/20 rounded-xl p-6 transition-all">
                <Video className="w-8 h-8 text-orange-400 mb-3" />
                <h3 className="font-semibold mb-2">Spatial Audio & Video</h3>
                <p className="text-sm text-gray-400">
                  Experience immersive 3D audio and video communication
                </p>
              </div>
              <div className="bg-[#1a1a1e] border border-white/10 hover:border-orange-500/20 rounded-xl p-6 transition-all">
                <Users className="w-8 h-8 text-yellow-400 mb-3" />
                <h3 className="font-semibold mb-2">Collaborative Spaces</h3>
                <p className="text-sm text-gray-400">
                  Work together in shared 3D environments
                </p>
              </div>
              <div className="bg-[#1a1a1e] border border-white/10 hover:border-orange-500/20 rounded-xl p-6 transition-all">
                <Share2 className="w-8 h-8 text-orange-400 mb-3" />
                <h3 className="font-semibold mb-2">Screen Sharing</h3>
                <p className="text-sm text-gray-400">
                  Share presentations and content in VR space
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* VR Room View */}
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={leaveRoom}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Leave Room
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {currentRoom.name}
                </span>
                <button
                  type="button"
                  onClick={() => copyRoomLink(currentRoom.url)}
                  className="bg-[#2a2a2e] hover:bg-[#3a3a3e] rounded-lg p-2 transition-colors"
                  title="Copy room link"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="bg-[#2a2a2e] hover:bg-[#3a3a3e] rounded-lg p-2 transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* FramVR Iframe */}
            <div className="bg-black rounded-xl overflow-hidden border border-white/10">
              <iframe
                ref={iframeRef}
                src={currentRoom.url}
                className="w-full h-[calc(100vh-200px)]"
                allow="camera; microphone; display-capture; xr-spatial-tracking; fullscreen"
                allowFullScreen
                title={`VR Classroom - ${currentRoom.name}`}
              />
            </div>

            {/* Info Box */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-blue-300">
                <strong>Tip:</strong> For the best experience, use a VR headset
                or explore using your mouse/keyboard. Click and drag to look
                around, WASD to move.
              </p>
            </div>
          </>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create VR Classroom</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="room-name"
                  className="block text-sm font-medium mb-2"
                >
                  Room Name
                </label>
                <input
                  id="room-name"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Physics 101 Lab"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="room-url"
                  className="block text-sm font-medium mb-2"
                >
                  FramVR Room URL (Optional)
                </label>
                <input
                  id="room-url"
                  type="text"
                  value={customRoomUrl}
                  onChange={(e) => setCustomRoomUrl(e.target.value)}
                  placeholder="https://framevr.io/your-room"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate a room, or paste your FramVR room
                  URL
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="text-sm text-orange-300">
                  <strong>How to get a FramVR room:</strong>
                  <br />
                  1. Visit{" "}
                  <a
                    href="https://framevr.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-orange-200"
                  >
                    framevr.io
                  </a>
                  <br />
                  2. Create a free account and design your space
                  <br />
                  3. Copy the room URL and paste it above
                </p>
              </div>

              {user && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-300">
                    <strong>✓ Signed in as:</strong> {user.name || user.email}
                    <br />
                    This room will be saved to your account
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-[#2a2a2e] hover:bg-[#3a3a3e] rounded-lg py-3 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createRoom}
                disabled={!roomName.trim()}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-semibold rounded-lg py-3 transition-colors"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
