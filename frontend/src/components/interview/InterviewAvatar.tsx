"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useInterviewChat } from "@/hooks/useInterviewChat";

// Facial expression morph targets configuration
const facialExpressions: Record<string, Record<string, number>> = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.17,
    noseSneerRight: 0.14,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 0.9999,
    mouthDimpleLeft: 0.41,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35,
    mouthSmileRight: 0.35,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78,
    browInnerUp: 0.45,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.35,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.57,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39,
    eyeLookUpRight: 0.4,
    eyeLookInLeft: 0.96,
    eyeLookInRight: 0.96,
    jawOpen: 0.96,
    mouthDimpleLeft: 0.96,
    mouthDimpleRight: 0.96,
    mouthStretchLeft: 0.27,
    mouthStretchRight: 0.28,
    mouthSmileLeft: 0.55,
    mouthSmileRight: 0.38,
    tongueOut: 0.96,
  },
};

// Viseme mapping for lip-sync (Rhubarb lip-sync format)
const visemeMapping: Record<string, string> = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

interface AvatarProps {
  // biome-ignore lint/suspicious/noExplicitAny: GLTF types are complex
  [key: string]: any;
}

export function InterviewAvatar(props: AvatarProps) {
  // biome-ignore lint/suspicious/noExplicitAny: GLTF types are complex
  const { nodes, materials, scene } = useGLTF(
    "/models/66b60cdfcb3a4f2e99ccb082.glb",
  ) as any;
  const { animations } = useGLTF("/models/animations.glb");

  const { message, onMessagePlayed } = useInterviewChat();

  const group = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, group);

  // Stable ref for callback to avoid stale closure in audio.onended
  const onMessagePlayedRef = useRef(onMessagePlayed);
  onMessagePlayedRef.current = onMessagePlayed;

  const [animation, setAnimation] = useState(
    animations.find((a) => a.name === "Idle")
      ? "Idle"
      : animations[0]?.name || "Idle",
  );
  const [facialExpression, setFacialExpression] = useState("default");
  // biome-ignore lint/suspicious/noExplicitAny: LipSync data structure
  const [lipsync, setLipsync] = useState<any>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [blink, setBlink] = useState(false);

  // Handle incoming messages
  useEffect(() => {
    if (!message) {
      setAnimation("Idle");
      setAudio(null);
      return;
    }

    setAnimation(message.animation || "Idle");
    setFacialExpression(message.facialExpression || "default");
    setLipsync(message.lipsync);

    if (!message.audio) {
      console.warn("No audio in message, skipping playback.");
      onMessagePlayedRef.current();
      return;
    }

    const audioToPlay = new Audio(`data:audio/mp3;base64,${message.audio}`);
    audioToPlay.play().catch((e) => {
      console.warn("Audio playback failed:", e);
      onMessagePlayedRef.current();
    });
    setAudio(audioToPlay);
    audioToPlay.onended = () => {
      onMessagePlayedRef.current();
    };

    // Cleanup: stop audio if message changes before it finishes
    return () => {
      audioToPlay.pause();
      audioToPlay.onended = null;
    };
  }, [message]);

  // Animation controller
  useEffect(() => {
    const action = actions[animation];
    if (!action) {
      console.warn(`Animation ${animation} not found. Falling back to Idle.`);
      if (actions.Idle) {
        setAnimation("Idle");
      }
      return;
    }
    action
      .reset()
      .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
      .play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [animation, actions, mixer.stats.actions.inUse]);

  // Smooth morph target transitions
  const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
    scene.traverse((child: THREE.Object3D) => {
      const skinnedMesh = child as THREE.SkinnedMesh;
      if (skinnedMesh.isSkinnedMesh && skinnedMesh.morphTargetDictionary) {
        const index = skinnedMesh.morphTargetDictionary[target];
        if (
          index === undefined ||
          !skinnedMesh.morphTargetInfluences ||
          skinnedMesh.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        skinnedMesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          skinnedMesh.morphTargetInfluences[index],
          value,
          speed,
        );
      }
    });
  };

  // Frame update for expressions, blinking, and lip-sync
  useFrame(() => {
    // Apply facial expressions
    if (nodes.EyeLeft?.morphTargetDictionary) {
      const keys = Object.keys(nodes.EyeLeft.morphTargetDictionary);
      for (const key of keys) {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          continue; // Handle separately
        }
        const mapping = facialExpressions[facialExpression];
        if (mapping?.[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      }
    }

    // Blinking
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

    // Lip-sync
    const appliedMorphTargets: string[] = [];
    if (message && lipsync?.mouthCues && audio) {
      const currentAudioTime = audio.currentTime;
      for (const mouthCue of lipsync.mouthCues) {
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          const viseme = visemeMapping[mouthCue.value];
          if (viseme) {
            appliedMorphTargets.push(viseme);
            lerpMorphTarget(viseme, 1, 0.2);
          }
          break;
        }
      }
    }

    // Reset unused visemes
    for (const viseme of Object.values(visemeMapping)) {
      if (!appliedMorphTargets.includes(viseme)) {
        lerpMorphTarget(viseme, 0, 0.1);
      }
    }
  });

  // Random blinking effect
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => {
            setBlink(false);
            nextBlink();
          }, 200);
        },
        THREE.MathUtils.randInt(1000, 5000),
      );
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

// Preload models for performance
useGLTF.preload("/models/66b60cdfcb3a4f2e99ccb082.glb");
useGLTF.preload("/models/animations.glb");
