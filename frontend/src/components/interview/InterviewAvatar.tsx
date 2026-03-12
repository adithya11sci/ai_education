"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useInterviewChat } from "@/hooks/useInterviewChat";

interface AvatarProps {
  // biome-ignore lint/suspicious/noExplicitAny: GLTF types are complex
  [key: string]: any;
}

export function InterviewAvatar(props: AvatarProps) {
  // Load the high-quality Renderpeople model
  // biome-ignore lint/suspicious/noExplicitAny: GLTF types are complex
  const { scene } = useGLTF("/models/mei_avatar.glb") as any;

  // Load textures
  const diffuseMap = useLoader(
    THREE.TextureLoader,
    "/models/mei_diffuse.jpg",
  );
  const normalMap = useLoader(
    THREE.TextureLoader,
    "/models/mei_normal.jpg",
  );

  const { message, onMessagePlayed } = useInterviewChat();
  const group = useRef<THREE.Group>(null);
  const onMessagePlayedRef = useRef(onMessagePlayed);
  onMessagePlayedRef.current = onMessagePlayed;

  // Speech & animation state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingStartTime = useRef(0);

  // Apply textures to the model
  useEffect(() => {
    if (!scene) return;

    diffuseMap.flipY = false;
    normalMap.flipY = false;
    diffuseMap.colorSpace = THREE.SRGBColorSpace;

    scene.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.material = new THREE.MeshStandardMaterial({
          map: diffuseMap,
          normalMap: normalMap,
          normalScale: new THREE.Vector2(1, 1),
          roughness: 0.6,
          metalness: 0.05,
          envMapIntensity: 0.8,
        });
      }
    });
  }, [scene, diffuseMap, normalMap]);

  // Handle incoming messages — speak via TTS
  useEffect(() => {
    if (!message) {
      setIsSpeaking(false);
      return;
    }

    const text = message.text;
    if (!text) {
      onMessagePlayedRef.current();
      return;
    }

    // Cancel any ongoing speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Use browser TTS to speak the AI response
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechRef.current = utterance;

      // Try to pick a good female voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes("Samantha") ||
          v.name.includes("Google UK English Female") ||
          v.name.includes("Microsoft Zira") ||
          v.name.includes("Female") ||
          v.name.includes("female"),
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        speakingStartTime.current = performance.now();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        speechRef.current = null;
        onMessagePlayedRef.current();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        speechRef.current = null;
        onMessagePlayedRef.current();
      };

      // Small delay before speaking for natural feel
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 300);
    } else {
      // Fallback: no TTS available, mark as played after delay
      const words = text.split(" ").length;
      const delay = Math.max(3000, (words / 120) * 60 * 1000);
      const timer = setTimeout(() => {
        onMessagePlayedRef.current();
      }, delay);
      return () => clearTimeout(timer);
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [message]);

  // Preload voices (needed on some browsers)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Animated frame loop — breathing + speech-synced movement
  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();

    if (isSpeaking) {
      // Speaking animation — more energetic head and body movement
      const speechTime = (performance.now() - speakingStartTime.current) / 1000;

      // Head nods while talking (simulates conversational movement)
      group.current.rotation.x = Math.sin(speechTime * 3.5) * 0.02;

      // More pronounced lateral movement when speaking
      group.current.rotation.y = Math.sin(speechTime * 1.8) * 0.04;

      // Subtle forward lean when speaking (engaged posture)
      group.current.rotation.z = Math.sin(speechTime * 2.2) * 0.008;

      // Slight upward/downward emphasis while talking
      group.current.position.y = -0.5 + Math.sin(speechTime * 3) * 0.006;
    } else {
      // Idle animation — gentle breathing
      group.current.rotation.x = 0;
      group.current.rotation.z = 0;
      group.current.position.y = -0.5 + Math.sin(t * 1.5) * 0.003;
      group.current.rotation.y = Math.sin(t * 0.5) * 0.015;
    }
  });

  return (
    <group
      {...props}
      ref={group}
      dispose={null}
      scale={[0.009, 0.009, 0.009]}
      position={[0, -0.5, 0]}
      rotation={[0, 0, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

// Preload model for performance
useGLTF.preload("/models/mei_avatar.glb");
