"use client";

import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { InterviewExperience, InterviewUI } from "@/components/interview";
import { Sidebar } from "@/components/Sidebar";
import { InterviewChatProvider } from "@/hooks/useInterviewChat";

export default function InterviewPage() {
  return (
    <InterviewChatProvider>
      <div className="min-h-screen bg-[#050505]">
        <Sidebar />

        {/* Main content area - offset by sidebar width */}
        <div className="lg:ml-64 h-screen relative overflow-hidden interview-container">
          {/* 3D Loader */}
          <Loader />

          {/* Hide Leva debug panel in production */}
          <Leva hidden />

          {/* UI Overlay */}
          <InterviewUI />

          {/* 3D Canvas */}
          <Canvas
            shadows
            camera={{ position: [0, 0, 1], fov: 30 }}
            className="absolute inset-0"
          >
            <InterviewExperience />
          </Canvas>
        </div>
      </div>

      {/* Styles for interview page */}
      <style jsx global>{`
        .interview-container {
          background: linear-gradient(
            135deg,
            #1a0a2e 0%,
            #2d1b4e 30%,
            #462255 60%,
            #8b3a62 100%
          );
        }

        .interview-greenscreen .interview-container {
          background: #00ff00 !important;
        }

        /* Loader customization */
        .loader {
          background-color: rgba(0, 0, 0, 0.9) !important;
        }
      `}</style>
    </InterviewChatProvider>
  );
}
