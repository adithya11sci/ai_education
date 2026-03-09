"use client";

import { Outlines, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { type MouseState, mouse } from "@/lib/mouse";

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================
const MOUSE_SENSITIVITY = 0.5;
const UNIFORM_SCALE = 0.8;

// Define Reaction Types
export type BotReaction = "none" | "happy" | "nod" | "wiggle" | "scan";

function FullBodyRobot({
  thinking,
  walking,
  reaction,
}: {
  thinking: boolean;
  walking: boolean;
  reaction: BotReaction;
}) {
  // Group Refs
  const rootRef = useRef<THREE.Group>(null);
  const hipRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);

  // Track props
  const walkingRef = useRef(walking);
  const thinkingRef = useRef(thinking);
  const reactionRef = useRef(reaction);
  const animTime = useRef(0);

  useEffect(() => {
    walkingRef.current = walking;
  }, [walking]);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    if (reaction !== "none") {
      animTime.current = 0;
    }
    reactionRef.current = reaction;
  }, [reaction]);

  // State Refs
  const mouseState = useRef<MouseState>(mouse.getState());
  const currentLook = useRef({ x: 0, y: 0 });
  const smoothPosition = useRef({ x: 0, y: -0.6 });
  const smoothRotation = useRef({ x: 0, y: 0, z: 0 });

  // Materials - with glowing hands/feet
  const materials = useRef({
    body: new THREE.MeshStandardMaterial({
      color: "#2a2a30",
      roughness: 0.2,
      metalness: 0.7,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 0.5,
      metalness: 0.5,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: "#00ffff",
      emissive: "#00ffff",
      emissiveIntensity: 2.0,
      toneMapped: false,
    }),
    joint: new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.7 }),
    eye: new THREE.MeshStandardMaterial({
      color: "#00ffff",
      emissive: "#00ffff",
      emissiveIntensity: 4.0,
      toneMapped: false,
    }),
    // NEW: Glowing material for hands and feet
    glow: new THREE.MeshStandardMaterial({
      color: "#00ffff",
      emissive: "#00ffff",
      emissiveIntensity: 1.5,
      toneMapped: false,
    }),
  }).current;

  // Subscribe to Mouse
  useEffect(() => {
    return mouse.subscribe((state) => {
      mouseState.current = state;
    });
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { nx, ny } = mouseState.current;
    const isWalking = walkingRef.current;
    const isThinking = thinkingRef.current;
    const currentReaction = reactionRef.current;

    // Smooth lerp factor for graceful movement
    const smoothFactor = delta * 3;

    // --- 1. ANIMATION LOGIC ---
    let targetX = 0;
    let targetY = -0.6;
    let targetRotY = 0;
    let targetRotX = 0;
    let targetRotZ = 0;

    animTime.current += delta;
    const progress = animTime.current;

    if (currentReaction === "happy") {
      // --- GENTLE HEAD NOD + SOFT ARM WAVE (replaces backflip) ---
      const nodSpeed = 8;
      const damp = Math.max(0, 1 - progress * 0.8);

      // Gentle nod
      if (headRef.current) {
        const nodAmount = Math.sin(progress * nodSpeed) * 0.15 * damp;
        headRef.current.rotation.x = nodAmount;
      }

      // Soft arm wave (right arm)
      if (rightArmRef.current) {
        const waveAmount = Math.sin(progress * 6) * 0.4 * damp;
        rightArmRef.current.rotation.z = -0.2 - waveAmount;
        rightArmRef.current.rotation.x = -0.3 * damp;
      }

      // Slight happy bounce
      targetY = -0.6 + Math.sin(progress * 4) * 0.03 * damp;
    } else if (currentReaction === "nod") {
      // --- SMOOTH NOD ---
      const nodSpeed = 10;
      const damp = Math.max(0, 1 - progress * 1.2);

      if (headRef.current) {
        const nodAmount = Math.sin(progress * nodSpeed) * 0.18 * damp;
        headRef.current.rotation.x = nodAmount;
      }

      targetY = -0.6 + Math.abs(Math.sin(progress * 8)) * 0.02 * damp;
    } else if (currentReaction === "wiggle") {
      // --- GENTLE WIGGLE ---
      const wiggleSpeed = 12;
      const damp = Math.max(0, 1 - progress * 0.5);
      targetRotY = Math.sin(progress * wiggleSpeed) * 0.15 * damp;
      targetRotZ = Math.cos(progress * wiggleSpeed) * 0.05 * damp;
    } else if (currentReaction === "scan") {
      // --- SMOOTH SCAN ---
      const scanSpeed = 1.5;
      targetRotY = Math.sin(progress * scanSpeed) * 0.3;
    } else {
      // --- STANDARD GRACEFUL IDLE/WALK ---

      // Gentle breathing bob
      const bobSpeed = isWalking ? 5.0 : 3.0;
      const bobAmp = isWalking ? 0.04 : 0.025;
      const bobY = Math.sin(t * bobSpeed) * bobAmp;

      // Subtle floating drift
      const driftX = Math.sin(t * 0.8) * 0.02;

      // Mouse parallax (reduced for smoother feel)
      const mouseXOffset = nx * 0.15;
      const mouseYOffset = ny * 0.2;

      targetX = driftX + mouseXOffset;
      targetY = bobY - 0.6 + mouseYOffset;

      // Graceful leg/arm swing
      const legSpeed = isWalking ? 3.5 : 2.0;
      const legAmp = isWalking ? 0.25 : 0.1;
      const legSwing = Math.sin(t * legSpeed) * legAmp;

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegRef.current.rotation.x,
          legSwing,
          smoothFactor * 2,
        );
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegRef.current.rotation.x,
          -legSwing,
          smoothFactor * 2,
        );
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          -legSwing * 0.7,
          smoothFactor * 2,
        );
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          legSwing * 0.7,
          smoothFactor * 2,
        );
        // Reset wave rotation
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          -0.2,
          smoothFactor,
        );
      }

      // Very subtle forward lean when walking
      targetRotX = isWalking ? 0.08 : 0.03;
    }

    // APPLY SMOOTH TRANSFORMS (no distortion - uniform scale)
    if (rootRef.current) {
      // Smooth position interpolation
      smoothPosition.current.x = THREE.MathUtils.lerp(
        smoothPosition.current.x,
        targetX,
        smoothFactor,
      );
      smoothPosition.current.y = THREE.MathUtils.lerp(
        smoothPosition.current.y,
        targetY,
        smoothFactor,
      );

      rootRef.current.position.x = smoothPosition.current.x;
      rootRef.current.position.y = smoothPosition.current.y;

      // Smooth rotation interpolation
      smoothRotation.current.x = THREE.MathUtils.lerp(
        smoothRotation.current.x,
        targetRotX,
        smoothFactor,
      );
      smoothRotation.current.y = THREE.MathUtils.lerp(
        smoothRotation.current.y,
        targetRotY,
        smoothFactor,
      );
      smoothRotation.current.z = THREE.MathUtils.lerp(
        smoothRotation.current.z,
        targetRotZ,
        smoothFactor,
      );

      rootRef.current.rotation.x = smoothRotation.current.x;
      rootRef.current.rotation.y = smoothRotation.current.y;
      rootRef.current.rotation.z = smoothRotation.current.z;

      // UNIFORM SCALE - no distortion
      rootRef.current.scale.set(UNIFORM_SCALE, UNIFORM_SCALE, UNIFORM_SCALE);
    }

    // --- 2. SMOOTH MOUSE TRACKING ---
    const isReacting = currentReaction !== "none";
    const trackFactor = isReacting || isWalking ? 0.3 : 1.0;

    const DEADZONE = 0.03;
    const targetX_Mouse = Math.abs(nx) < DEADZONE ? 0 : nx;
    const targetY_Mouse = Math.abs(ny) < DEADZONE ? 0 : ny;

    // Smoother damping
    const lookDamping = delta * 4;
    currentLook.current.x +=
      (targetX_Mouse - currentLook.current.x) * lookDamping;
    currentLook.current.y +=
      (targetY_Mouse - currentLook.current.y) * lookDamping;

    const lookX = currentLook.current.x * MOUSE_SENSITIVITY * trackFactor;
    const lookY = currentLook.current.y * MOUSE_SENSITIVITY * trackFactor;

    if (
      headRef.current &&
      currentReaction !== "happy" &&
      currentReaction !== "nod"
    ) {
      if (isThinking && !isReacting) {
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          0,
          0.05,
        );
        headRef.current.rotation.z = THREE.MathUtils.lerp(
          headRef.current.rotation.z,
          0.2,
          0.05,
        );
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          -0.25,
          0.05,
        );
      } else {
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          lookX,
          smoothFactor * 2,
        );
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          -lookY * 0.6,
          smoothFactor * 2,
        );
      }
    }

    if (torsoRef.current) {
      torsoRef.current.rotation.y = THREE.MathUtils.lerp(
        torsoRef.current.rotation.y,
        lookX * 0.15,
        smoothFactor,
      );
    }

    // --- EYES ---
    const eyeMax = 0.12;
    if (currentReaction === "happy" || currentReaction === "wiggle") {
      if (leftEyeRef.current) {
        leftEyeRef.current.position.x = THREE.MathUtils.lerp(
          leftEyeRef.current.position.x,
          -0.45,
          smoothFactor,
        );
        leftEyeRef.current.position.y = THREE.MathUtils.lerp(
          leftEyeRef.current.position.y,
          0.12,
          smoothFactor,
        );
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.position.x = THREE.MathUtils.lerp(
          rightEyeRef.current.position.x,
          0.45,
          smoothFactor,
        );
        rightEyeRef.current.position.y = THREE.MathUtils.lerp(
          rightEyeRef.current.position.y,
          0.12,
          smoothFactor,
        );
      }
    } else if (isThinking || currentReaction === "scan") {
      if (leftEyeRef.current) {
        leftEyeRef.current.position.x = THREE.MathUtils.lerp(
          leftEyeRef.current.position.x,
          -0.35,
          smoothFactor,
        );
        leftEyeRef.current.position.y = THREE.MathUtils.lerp(
          leftEyeRef.current.position.y,
          0.1,
          smoothFactor,
        );
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.position.x = THREE.MathUtils.lerp(
          rightEyeRef.current.position.x,
          0.55,
          smoothFactor,
        );
        rightEyeRef.current.position.y = THREE.MathUtils.lerp(
          rightEyeRef.current.position.y,
          0.1,
          smoothFactor,
        );
      }
    } else {
      if (leftEyeRef.current) {
        const targetEyeX = -0.45 + lookX * eyeMax;
        const targetEyeY = 0.05 + lookY * 0.08;
        leftEyeRef.current.position.x = THREE.MathUtils.lerp(
          leftEyeRef.current.position.x,
          targetEyeX,
          smoothFactor,
        );
        leftEyeRef.current.position.y = THREE.MathUtils.lerp(
          leftEyeRef.current.position.y,
          targetEyeY,
          smoothFactor,
        );
      }
      if (rightEyeRef.current) {
        const targetEyeX = 0.45 + lookX * eyeMax;
        const targetEyeY = 0.05 + lookY * 0.08;
        rightEyeRef.current.position.x = THREE.MathUtils.lerp(
          rightEyeRef.current.position.x,
          targetEyeX,
          smoothFactor,
        );
        rightEyeRef.current.position.y = THREE.MathUtils.lerp(
          rightEyeRef.current.position.y,
          targetEyeY,
          smoothFactor,
        );
      }
    }
  });

  return (
    <group ref={rootRef} scale={UNIFORM_SCALE} position={[0, -0.6, 0]}>
      {/* BODY */}
      <group ref={hipRef} position={[0, -0.4, 0]}>
        <RoundedBox args={[0.7, 0.4, 0.5]} radius={0.15} smoothness={4}>
          <primitive object={materials.body} attach="material" />
        </RoundedBox>

        {/* LEFT LEG with GLOWING FOOT */}
        <group ref={leftLegRef} position={[-0.2, -0.2, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.12, 0.1, 0.5, 16]} />
            <primitive object={materials.body} attach="material" />
          </mesh>
          {/* Glowing foot */}
          <RoundedBox
            position={[0, -0.6, 0.1]}
            args={[0.22, 0.15, 0.4]}
            radius={0.08}
          >
            <primitive object={materials.glow} attach="material" />
          </RoundedBox>
          {/* Foot glow light */}
          <pointLight
            position={[0, -0.6, 0.1]}
            intensity={0.5}
            color="#00ffff"
            distance={0.8}
            decay={2}
          />
        </group>

        {/* RIGHT LEG with GLOWING FOOT */}
        <group ref={rightLegRef} position={[0.2, -0.2, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.12, 0.1, 0.5, 16]} />
            <primitive object={materials.body} attach="material" />
          </mesh>
          {/* Glowing foot */}
          <RoundedBox
            position={[0, -0.6, 0.1]}
            args={[0.22, 0.15, 0.4]}
            radius={0.08}
          >
            <primitive object={materials.glow} attach="material" />
          </RoundedBox>
          {/* Foot glow light */}
          <pointLight
            position={[0, -0.6, 0.1]}
            intensity={0.5}
            color="#00ffff"
            distance={0.8}
            decay={2}
          />
        </group>
      </group>

      {/* TORSO */}
      <group ref={torsoRef} position={[0, -0.1, 0]}>
        <RoundedBox
          position={[0, 0.4, 0]}
          args={[0.85, 0.7, 0.55]}
          radius={0.2}
        >
          <primitive object={materials.body} attach="material" />
        </RoundedBox>
        <mesh position={[0, 0.4, 0.28]}>
          <planeGeometry args={[0.3, 0.3]} />
          <primitive object={materials.accent} attach="material" />
        </mesh>

        {/* LEFT ARM with GLOWING HAND */}
        <group
          ref={leftArmRef}
          position={[-0.55, 0.5, 0]}
          rotation={[0, 0, 0.2]}
        >
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.6]} />
            <primitive object={materials.body} attach="material" />
          </mesh>
          {/* Glowing hand */}
          <mesh position={[0, -0.6, 0]}>
            <sphereGeometry args={[0.12]} />
            <primitive object={materials.glow} attach="material" />
          </mesh>
          {/* Hand glow light */}
          <pointLight
            position={[0, -0.6, 0]}
            intensity={0.4}
            color="#00ffff"
            distance={0.6}
            decay={2}
          />
        </group>

        {/* RIGHT ARM with GLOWING HAND */}
        <group
          ref={rightArmRef}
          position={[0.55, 0.5, 0]}
          rotation={[0, 0, -0.2]}
        >
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.6]} />
            <primitive object={materials.body} attach="material" />
          </mesh>
          {/* Glowing hand */}
          <mesh position={[0, -0.6, 0]}>
            <sphereGeometry args={[0.12]} />
            <primitive object={materials.glow} attach="material" />
          </mesh>
          {/* Hand glow light */}
          <pointLight
            position={[0, -0.6, 0]}
            intensity={0.4}
            color="#00ffff"
            distance={0.6}
            decay={2}
          />
        </group>

        {/* JETPACK */}
        <group position={[0, 0.5, -0.35]}>
          <RoundedBox args={[0.6, 0.5, 0.2]} radius={0.1}>
            <primitive object={materials.dark} attach="material" />
          </RoundedBox>
          <group position={[-0.2, -0.25, 0]}>
            <mesh rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.08, 0.2, 16]} />
              <primitive object={materials.accent} attach="material" />
            </mesh>
          </group>
          <group position={[0.2, -0.25, 0]}>
            <mesh rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.08, 0.2, 16]} />
              <primitive object={materials.accent} attach="material" />
            </mesh>
          </group>
        </group>

        {/* HEAD */}
        <group ref={headRef} position={[0, 0.9, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.2]} />
            <primitive object={materials.joint} attach="material" />
          </mesh>
          <group position={[0, 0.6, 0]}>
            <RoundedBox args={[2.0, 1.4, 1.1]} radius={0.4} smoothness={8}>
              <primitive object={materials.body} attach="material" />
              <Outlines thickness={0.05} color="white" />
            </RoundedBox>
            <RoundedBox
              args={[1.7, 1.0, 0.05]}
              radius={0.25}
              position={[0, 0, 0.56]}
            >
              <meshStandardMaterial
                color="#0a0a0c"
                roughness={0.1}
                metalness={0.8}
              />
            </RoundedBox>

            {/* Ears */}
            <group position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.3, 0.3, 0.1]} />
                <primitive object={materials.dark} attach="material" />
              </mesh>
              <mesh position={[0, 0.06, 0]}>
                <torusGeometry args={[0.2, 0.02, 16, 32]} />
                <primitive object={materials.accent} attach="material" />
              </mesh>
            </group>
            <group position={[1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.3, 0.3, 0.1]} />
                <primitive object={materials.dark} attach="material" />
              </mesh>
              <mesh position={[0, 0.06, 0]}>
                <torusGeometry args={[0.2, 0.02, 16, 32]} />
                <primitive object={materials.accent} attach="material" />
              </mesh>
            </group>

            {/* Eyes */}
            <group ref={leftEyeRef} position={[-0.45, 0.05, 0.6]}>
              <RoundedBox args={[0.35, 0.45, 0.05]} radius={0.12}>
                <primitive object={materials.eye} attach="material" />
              </RoundedBox>
              <mesh position={[-0.1, 0.12, 0.03]}>
                <circleGeometry args={[0.06]} />
                <meshBasicMaterial color="white" transparent opacity={0.7} />
              </mesh>
            </group>
            <group ref={rightEyeRef} position={[0.45, 0.05, 0.6]}>
              <RoundedBox args={[0.35, 0.45, 0.05]} radius={0.12}>
                <primitive object={materials.eye} attach="material" />
              </RoundedBox>
              <mesh position={[-0.1, 0.12, 0.03]}>
                <circleGeometry args={[0.06]} />
                <meshBasicMaterial color="white" transparent opacity={0.7} />
              </mesh>
            </group>

            {/* Mouth */}
            <group position={[0, -0.3, 0.6]} rotation={[0, 0, Math.PI]}>
              <mesh>
                <torusGeometry args={[0.18, 0.035, 8, 24, Math.PI]} />
                <primitive object={materials.eye} attach="material" />
              </mesh>
            </group>

            {/* Thinking indicator */}
            {thinking && (
              <group position={[0, 0.8, 0]}>
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.3]} />
                  <primitive object={materials.joint} attach="material" />
                </mesh>
                <mesh position={[0, 0.35, 0]}>
                  <sphereGeometry args={[0.12]} />
                  <meshBasicMaterial color="#ff9500" toneMapped={false} />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

interface Props {
  speaking?: boolean;
  thinking?: boolean;
  walking?: boolean;
  reaction?: BotReaction;
  happy?: boolean;
  size?: "sm" | "md" | "lg";
}

export function OptimusBot3D({
  speaking = false,
  thinking = false,
  walking = false,
  reaction = "none",
  happy = false,
  size = "md",
}: Props) {
  const sizes = {
    sm: "150px",
    md: "250px",
    lg: "350px",
  };

  // Backward compatibility
  const effectiveReaction = happy ? "happy" : reaction;

  return (
    <div
      className="relative mx-auto pointer-events-auto"
      style={{ height: sizes[size], width: sizes[size] }}
    >
      <Canvas camera={{ position: [0, 0.5, 5], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 8, 5]} intensity={2.0} />
        <pointLight
          position={[0, 0, 3]}
          intensity={3.0}
          color="#00ffff"
          distance={10}
          decay={2}
        />

        <FullBodyRobot
          thinking={thinking}
          walking={walking}
          reaction={effectiveReaction}
        />
      </Canvas>
    </div>
  );
}

export default OptimusBot3D;
