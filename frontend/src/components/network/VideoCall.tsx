"use client";

import "@livekit/components-styles";
import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  Check,
  Code,
  Copy,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Call, callAPI } from "@/lib/api/network";
import { PartyChat } from "./PartyChat";
import { PartyCodeEditor } from "./PartyCodeEditor";

interface VideoCallProps {
  call: Call;
  currentUser: { id: number; name: string; email: string };
  onEndCall: () => void;
}

export function VideoCall({ call, currentUser, onEndCall }: VideoCallProps) {
  const [token, setToken] = useState("");
  const [sidePanel, setSidePanel] = useState<"chat" | "code" | "people" | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { token: roomToken } = await callAPI.getToken(
          call.id,
          currentUser.id,
          currentUser.name,
        );
        setToken(roomToken);
      } catch (e) {
        console.error("Failed to get token", e);
      }
    };
    init();
  }, [call.id, currentUser.id, currentUser.name]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${call.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [call.id]);

  if (!token) {
    return (
      <div className="fixed inset-0 bg-[#1a1a1c] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      className="fixed inset-0 z-50 bg-[#1a1a1c]"
      onDisconnected={onEndCall}
    >
      <div className="h-full flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            <VideoGrid />
          </div>

          {/* Simple Control Bar */}
          <SimpleControlBar
            onEndCall={onEndCall}
            sidePanel={sidePanel}
            setSidePanel={setSidePanel}
          />
        </div>

        {/* Side Panel */}
        {sidePanel && (
          <div className="w-80 bg-[#202022] border-l border-white/10 flex flex-col">
            <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-medium text-white">
                {sidePanel === "chat" && "Chat"}
                {sidePanel === "code" && "Code Editor"}
                {sidePanel === "people" && "Participants"}
              </span>
              <button
                type="button"
                onClick={() => setSidePanel(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {sidePanel === "chat" && (
                <PartyChat
                  roomId={`call-${call.id}`}
                  currentUser={currentUser}
                  className="h-full"
                />
              )}
              {sidePanel === "code" && (
                <PartyCodeEditor
                  roomId={`call-${call.id}`}
                  className="h-full"
                />
              )}
              {sidePanel === "people" && (
                <PeoplePanel
                  callId={call.id}
                  onCopyLink={copyLink}
                  copied={copied}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

// Simple control bar without LiveKit's complex menus
function SimpleControlBar({
  onEndCall,
  sidePanel,
  setSidePanel,
}: {
  onEndCall: () => void;
  sidePanel: "chat" | "code" | "people" | null;
  setSidePanel: (panel: "chat" | "code" | "people" | null) => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);

  const toggleMic = async () => {
    await localParticipant.setMicrophoneEnabled(!micEnabled);
    setMicEnabled(!micEnabled);
  };

  const toggleCam = async () => {
    await localParticipant.setCameraEnabled(!camEnabled);
    setCamEnabled(!camEnabled);
  };

  const toggleScreen = async () => {
    await localParticipant.setScreenShareEnabled(!screenEnabled);
    setScreenEnabled(!screenEnabled);
  };

  return (
    <div className="h-20 flex items-center justify-center gap-3 bg-[#202022]">
      {/* Mic */}
      <button
        type="button"
        onClick={toggleMic}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          micEnabled
            ? "bg-[#3c3c3f] hover:bg-[#4a4a4d]"
            : "bg-red-600 hover:bg-red-500"
        }`}
      >
        {micEnabled ? (
          <Mic className="w-5 h-5 text-white" />
        ) : (
          <MicOff className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Camera */}
      <button
        type="button"
        onClick={toggleCam}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          camEnabled
            ? "bg-[#3c3c3f] hover:bg-[#4a4a4d]"
            : "bg-red-600 hover:bg-red-500"
        }`}
      >
        {camEnabled ? (
          <Video className="w-5 h-5 text-white" />
        ) : (
          <VideoOff className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Screen Share */}
      <button
        type="button"
        onClick={toggleScreen}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          screenEnabled
            ? "bg-green-600 hover:bg-green-500"
            : "bg-[#3c3c3f] hover:bg-[#4a4a4d]"
        }`}
      >
        <MonitorUp className="w-5 h-5 text-white" />
      </button>

      <div className="w-px h-8 bg-white/10 mx-2" />

      {/* People */}
      <button
        type="button"
        onClick={() => setSidePanel(sidePanel === "people" ? null : "people")}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          sidePanel === "people"
            ? "bg-blue-600"
            : "bg-[#3c3c3f] hover:bg-[#4a4a4d]"
        }`}
      >
        <Users className="w-5 h-5 text-white" />
      </button>

      {/* Chat */}
      <button
        type="button"
        onClick={() => setSidePanel(sidePanel === "chat" ? null : "chat")}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          sidePanel === "chat"
            ? "bg-blue-600"
            : "bg-[#3c3c3f] hover:bg-[#4a4a4d]"
        }`}
      >
        <MessageSquare className="w-5 h-5 text-white" />
      </button>

      {/* Code */}
      <button
        type="button"
        onClick={() => setSidePanel(sidePanel === "code" ? null : "code")}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          sidePanel === "code"
            ? "bg-blue-600"
            : "bg-[#3c3c3f] hover:bg-[#4a4a4d]"
        }`}
      >
        <Code className="w-5 h-5 text-white" />
      </button>

      <div className="w-px h-8 bg-white/10 mx-2" />

      {/* Leave */}
      <button
        type="button"
        onClick={onEndCall}
        className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-medium flex items-center gap-2 transition-colors"
      >
        <PhoneOff className="w-5 h-5" />
        Leave
      </button>
    </div>
  );
}

function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const participants = useParticipants();

  const gridCols = useMemo(() => {
    const count = participants.length;
    if (count <= 1) return "grid-cols-1";
    if (count <= 4) return "grid-cols-2";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  }, [participants.length]);

  if (tracks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Waiting for video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full grid ${gridCols} gap-3`}>
      {tracks.map((track) => (
        <div
          key={track.participant.sid + track.source}
          className="relative bg-[#2a2a2c] rounded-xl overflow-hidden"
        >
          <ParticipantTile trackRef={track} className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}

function PeoplePanel({
  callId,
  onCopyLink,
  copied,
}: {
  callId: number;
  onCopyLink: () => void;
  copied: boolean;
}) {
  const participants = useParticipants();

  return (
    <div className="h-full flex flex-col p-4">
      <button
        type="button"
        onClick={onCopyLink}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 mb-4 transition-colors"
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        {copied ? "Copied!" : "Copy Invite Link"}
      </button>

      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
        In call ({participants.length})
      </p>

      <div className="flex-1 overflow-y-auto space-y-2">
        {participants.map((p) => (
          <div
            key={p.sid}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
              {(p.name?.[0] || p.identity[0]).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                {p.name || p.identity}
                {p.isLocal && <span className="text-gray-500 ml-1">(You)</span>}
              </p>
            </div>
            {p.isSpeaking && (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
