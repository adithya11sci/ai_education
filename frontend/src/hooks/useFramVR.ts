import { useCallback, useEffect, useState } from "react";
import type { FramVRRoom } from "@/lib/framevr";
import {
  addVRRoom,
  loadVRRooms,
  updateVRRoom as modifyVRRoom,
  deleteVRRoom as removeVRRoom,
} from "@/lib/framevr";

/**
 * Hook for managing FramVR rooms
 */
export function useFramVR() {
  const [rooms, setRooms] = useState<FramVRRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<FramVRRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load rooms on mount
  useEffect(() => {
    const loadedRooms = loadVRRooms();
    setRooms(loadedRooms);
    setIsLoading(false);
  }, []);

  // Create a new room
  const createRoom = useCallback(
    (roomData: Omit<FramVRRoom, "id" | "createdAt">) => {
      const newRoom = addVRRoom(roomData);
      setRooms((prev) => [...prev, newRoom]);
      return newRoom;
    },
    [],
  );

  // Delete a room
  const deleteRoom = useCallback(
    (roomId: string) => {
      removeVRRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));

      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
      }
    },
    [currentRoom],
  );

  // Update a room
  const updateRoom = useCallback(
    (roomId: string, updates: Partial<FramVRRoom>) => {
      const updated = modifyVRRoom(roomId, updates);
      if (updated) {
        setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));

        if (currentRoom?.id === roomId) {
          setCurrentRoom(updated);
        }
      }
      return updated;
    },
    [currentRoom],
  );

  // Join a room
  const joinRoom = useCallback((room: FramVRRoom) => {
    setCurrentRoom(room);
  }, []);

  // Leave current room
  const leaveRoom = useCallback(() => {
    setCurrentRoom(null);
  }, []);

  return {
    rooms,
    currentRoom,
    isLoading,
    createRoom,
    deleteRoom,
    updateRoom,
    joinRoom,
    leaveRoom,
  };
}

/**
 * Hook for fullscreen functionality
 */
export function useFullscreen(elementRef: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!elementRef.current) return;

    if (!isFullscreen) {
      elementRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen, elementRef]);

  return { isFullscreen, toggleFullscreen };
}
