"use client";

import {
  createLocalAudioTrack,
  createLocalTracks,
  createLocalVideoTrack,
  type LocalParticipant,
  type RemoteParticipant,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import { useCallback, useEffect, useState } from "react";

interface UseLiveKitOptions {
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onTrackSubscribed?: (track: Track) => void;
  onTrackUnsubscribed?: (track: Track) => void;
}

export function useLiveKit(options: UseLiveKitOptions = {}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(
    async (wsUrl: string, token: string) => {
      try {
        setIsConnecting(true);
        setError(null);

        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        // Set up event listeners
        newRoom.on(
          RoomEvent.ParticipantConnected,
          (participant: RemoteParticipant) => {
            console.log("Participant connected:", participant.identity);
            setParticipants((prev) => [...prev, participant]);
            options.onParticipantConnected?.(participant);
          },
        );

        newRoom.on(
          RoomEvent.ParticipantDisconnected,
          (participant: RemoteParticipant) => {
            console.log("Participant disconnected:", participant.identity);
            setParticipants((prev) =>
              prev.filter((p) => p.sid !== participant.sid),
            );
            options.onParticipantDisconnected?.(participant);
          },
        );

        newRoom.on(RoomEvent.TrackSubscribed, (track: Track) => {
          console.log("Track subscribed:", track.kind);
          options.onTrackSubscribed?.(track);
        });

        newRoom.on(RoomEvent.TrackUnsubscribed, (track: Track) => {
          console.log("Track unsubscribed:", track.kind);
          options.onTrackUnsubscribed?.(track);
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          console.log("Disconnected from room");
          setIsConnected(false);
          setParticipants([]);
        });

        // Connect to room
        await newRoom.connect(wsUrl, token);

        setRoom(newRoom);
        setLocalParticipant(newRoom.localParticipant);
        setParticipants(Array.from(newRoom.remoteParticipants.values()));
        setIsConnected(true);
        setIsConnecting(false);

        console.log("Connected to LiveKit room");
      } catch (err) {
        console.error("Error connecting to LiveKit:", err);
        setError(err as Error);
        setIsConnecting(false);
      }
    },
    [options],
  );

  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setLocalParticipant(null);
      setParticipants([]);
      setIsConnected(false);
    }
  }, [room]);

  const toggleMute = useCallback(async () => {
    if (!localParticipant) return;

    const audioTrack = localParticipant.getTrackPublication(
      Track.Source.Microphone,
    );
    if (audioTrack) {
      if (isMuted) {
        await audioTrack.unmute();
      } else {
        await audioTrack.mute();
      }
      setIsMuted(!isMuted);
    }
  }, [localParticipant, isMuted]);

  const toggleVideo = useCallback(async () => {
    if (!localParticipant) return;

    if (isVideoOff) {
      // Enable video
      try {
        const videoTrack = await createLocalVideoTrack();
        await localParticipant.publishTrack(videoTrack);
        setIsVideoOff(false);
      } catch (err) {
        console.error("Error enabling video:", err);
        setError(err as Error);
      }
    } else {
      // Disable video
      const videoTrack = localParticipant.getTrackPublication(
        Track.Source.Camera,
      );
      if (videoTrack?.track) {
        await localParticipant.unpublishTrack(videoTrack.track);
        setIsVideoOff(true);
      }
    }
  }, [localParticipant, isVideoOff]);

  const enableAudio = useCallback(async () => {
    if (!localParticipant) return;

    try {
      const audioTrack = await createLocalAudioTrack();
      await localParticipant.publishTrack(audioTrack);
      setIsMuted(false);
    } catch (err) {
      console.error("Error enabling audio:", err);
      setError(err as Error);
    }
  }, [localParticipant]);

  const enableVideo = useCallback(async () => {
    if (!localParticipant) return;

    try {
      const videoTrack = await createLocalVideoTrack();
      await localParticipant.publishTrack(videoTrack);
      setIsVideoOff(false);
    } catch (err) {
      console.error("Error enabling video:", err);
      setError(err as Error);
    }
  }, [localParticipant]);

  const shareScreen = useCallback(async () => {
    if (!localParticipant) return;

    try {
      const screenTrack = await createLocalTracks({
        audio: false,
        video: {
          // @ts-expect-error - displaySurface is valid for screen sharing
          displaySurface: "monitor",
        },
      });

      if (screenTrack.length > 0) {
        await localParticipant.publishTrack(screenTrack[0]);
      }
    } catch (err) {
      console.error("Error sharing screen:", err);
      setError(err as Error);
    }
  }, [localParticipant]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return {
    room,
    isConnected,
    isConnecting,
    participants,
    localParticipant,
    isMuted,
    isVideoOff,
    error,
    connect,
    disconnect,
    toggleMute,
    toggleVideo,
    enableAudio,
    enableVideo,
    shareScreen,
  };
}
