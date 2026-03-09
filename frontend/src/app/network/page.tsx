"use client";

import { LogIn, MessageSquare, Phone, Users, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CallsPanel } from "@/components/network/CallsPanel";
import { ChatsPanel } from "@/components/network/ChatsPanel";
import { FriendsPanel } from "@/components/network/FriendsPanel";
import { GroupsPanel } from "@/components/network/GroupsPanel";
import { IncomingCallModal } from "@/components/network/IncomingCallModal";
import { VideoCall } from "@/components/network/VideoCall";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import type { Call, User } from "@/lib/api/network";
import { callAPI } from "@/lib/api/network";

type Tab = "friends" | "groups" | "chats" | "calls";

export default function NetworkPage() {
  const { user, isLoading, login } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [isStartingCall, setIsStartingCall] = useState(false);

  // Convert auth user to the format expected by components
  const currentUser = user
    ? {
        id: user.id,
        name: user.name || "Anonymous",
        email: user.email,
      }
    : null;

  // Poll for incoming calls
  const checkForIncomingCalls = useCallback(async () => {
    if (!currentUser || activeCall || incomingCall) return;

    try {
      const { call } = await callAPI.getActive(currentUser.id);
      console.log("Checking for calls:", {
        call,
        currentUserId: currentUser.id,
      });
      if (
        call &&
        call.status === "initiated" &&
        call.initiatorId !== currentUser.id
      ) {
        console.log("Incoming call detected:", call);
        setIncomingCall(call);
      }
    } catch (error) {
      console.error("Error checking for calls:", error);
    }
  }, [currentUser, activeCall, incomingCall]);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(checkForIncomingCalls, 3000);
    checkForIncomingCalls();

    return () => clearInterval(interval);
  }, [checkForIncomingCalls, currentUser]);

  const tabs = [
    { id: "friends" as Tab, label: "Friends", icon: Users },
    { id: "groups" as Tab, label: "Groups", icon: UsersRound },
    { id: "chats" as Tab, label: "Chats", icon: MessageSquare },
    { id: "calls" as Tab, label: "Calls", icon: Phone },
  ];

  const handleStartChat = (chatUser: User) => {
    setSelectedChatUser(chatUser);
    setActiveTab("chats");
  };

  const handleStartCall = async (targetUser: User, type: "audio" | "video") => {
    if (isStartingCall || !currentUser) return;

    setIsStartingCall(true);
    try {
      const call = await callAPI.initiate({
        initiatorId: currentUser.id,
        type,
        callType: "direct",
        recipientId: targetUser.id,
      });
      setActiveCall(call);
    } catch (error) {
      console.error("Failed to start call:", error);
      alert("Failed to start call. Make sure the backend is running.");
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleStartGroupCall = async (
    groupId: number,
    type: "audio" | "video",
  ) => {
    if (isStartingCall || !currentUser) return;

    setIsStartingCall(true);
    try {
      const call = await callAPI.initiate({
        initiatorId: currentUser.id,
        type,
        callType: "group",
        groupChatId: groupId,
      });
      setActiveCall(call);
    } catch (error) {
      console.error("Failed to start group call:", error);
      alert("Failed to start call. Make sure the backend is running.");
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall || !currentUser) return;

    try {
      await callAPI.join(incomingCall.id, currentUser.id);
      setActiveCall(incomingCall);
      setIncomingCall(null);
    } catch (error) {
      console.error("Failed to accept call:", error);
      alert("Failed to accept call.");
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;

    try {
      await callAPI.end(incomingCall.id);
    } catch (error) {
      console.error("Failed to decline call:", error);
    }
    setIncomingCall(null);
  };

  const handleEndCall = async () => {
    if (activeCall) {
      try {
        await callAPI.end(activeCall.id);
      } catch (error) {
        console.error("Failed to end call:", error);
      }
    }
    setActiveCall(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!user || !currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Sidebar />
        <div className="lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <UsersRound className="w-16 h-16 text-purple-400 mx-auto mb-6 opacity-50" />
            <h1 className="text-2xl font-bold text-white mb-3">
              Sign in to Network
            </h1>
            <p className="text-gray-400 mb-6">
              Connect with friends, join video calls, and collaborate in
              real-time.
            </p>
            <button
              type="button"
              onClick={login}
              className="px-6 py-3 bg-orange-500 text-black rounded-xl font-bold hover:bg-orange-400 transition-colors flex items-center gap-2 mx-auto"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show VideoCall overlay when there's an active call
  if (activeCall) {
    return (
      <VideoCall
        call={activeCall}
        currentUser={currentUser}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-12 sm:h-16 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 pl-10 lg:pl-0">
            <UsersRound className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
            <h1 className="text-sm sm:text-xl font-bold">Network</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Online as {currentUser.name}</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-white/5 bg-[#050505]/50 backdrop-blur-sm sticky top-16 z-20">
          <div className="flex gap-1 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 flex items-center gap-2 font-medium transition-all relative ${
                    activeTab === tab.id
                      ? "text-orange-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main className="p-3 sm:p-6">
          {activeTab === "friends" && (
            <FriendsPanel
              currentUser={currentUser}
              onStartChat={handleStartChat}
              onStartCall={handleStartCall}
            />
          )}
          {activeTab === "groups" && (
            <GroupsPanel
              currentUser={currentUser}
              onStartCall={handleStartGroupCall}
            />
          )}
          {activeTab === "chats" && (
            <ChatsPanel
              currentUser={currentUser}
              initialSelectedUser={selectedChatUser}
            />
          )}
          {activeTab === "calls" && <CallsPanel currentUser={currentUser} />}
        </main>
      </div>

      {/* Loading overlay for starting call */}
      {isStartingCall && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Starting call...</p>
          </div>
        </div>
      )}

      {/* Incoming call modal */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
    </div>
  );
}
