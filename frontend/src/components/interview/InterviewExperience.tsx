"use client";

import { CameraControls, ContactShadows, Text } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useInterviewChat } from "@/hooks/useInterviewChat";
import { InterviewAvatar } from "./InterviewAvatar";

// Loading indicator component with animated dots
function LoadingDots(props: { position?: [number, number, number] }) {
  const { loading } = useInterviewChat();
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length > 2 ? "." : `${prev}.`));
      }, 800);
      return () => clearInterval(interval);
    }
    setDots("");
  }, [loading]);

  if (!loading) return null;

  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX="left" anchorY="bottom">
        {dots}
        <meshBasicMaterial attach="material" color="white" />
      </Text>
    </group>
  );
}

export function InterviewExperience() {
  const cameraControls = useRef<CameraControls>(null);
  const { cameraZoomed } = useInterviewChat();

  // Initial camera setup
  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.setLookAt(0, 1.2, 5, 0, 0.8, 0);
    }
  }, []);

  // Camera zoom effect
  useEffect(() => {
    if (!cameraControls.current) return;

    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.2, 2, 0, 1.0, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 1.2, 5, 0, 0.8, 0, true);
    }
  }, [cameraZoomed]);

  return (
    <>
      <CameraControls ref={cameraControls} />

      {/* Lighting setup instead of HDR environment */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.3}
        color="#ffd4a3"
      />
      <hemisphereLight args={["#ffeeb1", "#080820", 0.5]} />

      {/* Loading indicator */}
      <Suspense>
        <LoadingDots position={[-0.02, 1.75, 0]} />
      </Suspense>

      {/* Avatar */}
      <InterviewAvatar />

      {/* Ground shadow */}
      <ContactShadows opacity={0.7} />
    </>
  );
}
