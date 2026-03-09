"use client";

import { animate, createTimeline, stagger } from "animejs";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Code,
  Database,
  Eye,
  Layout,
  Mic,
  Milestone,
  MousePointer2,
  Shield,
  Terminal,
  Trophy,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const codeWindowRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const classroomRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    if (!user) {
      login();
      return;
    }

    if (user.isOnboarded) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  useEffect(() => {
    animate(heroRef.current?.querySelectorAll(".hero-anim") || [], {
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1200,
      delay: stagger(100),
      easing: "easeOutExpo",
    });

    if (codeWindowRef.current) {
      animate(codeWindowRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0,
      });
    }

    const codeText = document.querySelector(".typing-code");
    const cursor1 = document.querySelector(".cursor-1");
    const cursor2 = document.querySelector(".cursor-2");

    if (codeText) {
      const text = codeText.textContent || "";
      codeText.textContent = "";
      const chars = text.split("");
      chars.forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.opacity = "0";
        codeText.appendChild(span);
      });

      const timeline = createTimeline();

      timeline.add(codeText.querySelectorAll("span"), {
        opacity: [0, 1],
        duration: 30,
        delay: stagger(20),
        easing: "linear",
        complete: () => {
          if (codeWindowRef.current) {
            animate(codeWindowRef.current, {
              translateY: [-10, 10],
              rotateX: [2, -2],
              rotateY: [-2, 2],
              duration: 6000,
              direction: "alternate",
              loop: true,
              easing: "easeInOutSine",
            });
          }
        },
      });

      if (cursor1) {
        timeline.add(
          cursor1,
          {
            opacity: [0, 1],
            duration: 500,
            easing: "linear",
          },
          "-=1000",
        );
      }

      if (cursor2) {
        timeline.add(
          cursor2,
          {
            opacity: [0, 1],
            duration: 500,
            easing: "linear",
          },
          "-=800",
        );
      }
    }

    // Start cursor movement loops independently
    if (cursor1 && cursor2) {
      animate(cursor1, {
        left: ["10%", "40%", "20%", "60%"],
        top: ["20%", "30%", "50%", "20%"],
        duration: 8000,
        loop: true,
        direction: "alternate",
        easing: "easeInOutQuad",
        delay: 2000,
      });

      animate(cursor2, {
        left: ["80%", "50%", "70%", "90%"],
        top: ["60%", "80%", "40%", "70%"],
        duration: 10000,
        loop: true,
        direction: "alternate",
        easing: "easeInOutQuad",
        delay: 2500,
      });
    }

    // Scroll Animations Setup (General)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    const scrollElements = document.querySelectorAll(".scroll-anim");
    for (const el of scrollElements) {
      observer.observe(el);
    }

    const roadmapObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && roadmapRef.current) {
          const path = roadmapRef.current.querySelector(
            ".roadmap-path",
          ) as SVGPathElement;
          if (path) {
            const len = path.getTotalLength();
            path.style.strokeDasharray = `${len}`;
            path.style.strokeDashoffset = `${len}`;

            animate(path, {
              strokeDashoffset: [len, 0],
              easing: "easeInOutSine",
              duration: 2500,
              delay: 200,
            });
          }

          animate(roadmapRef.current.querySelectorAll(".roadmap-node"), {
            opacity: [0, 1],
            scale: [0.5, 1],
            delay: stagger(500, { start: 500 }),
            easing: "easeOutBack",
          });

          animate(roadmapRef.current.querySelectorAll(".roadmap-text"), {
            opacity: [0, 1],
            translateX: [-10, 0],
            delay: stagger(500, { start: 700 }),
            easing: "easeOutQuad",
          });

          roadmapObserver.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (roadmapRef.current) {
      roadmapObserver.observe(roadmapRef.current);
    }

    const classroomObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && classroomRef.current) {
          animate(classroomRef.current.querySelectorAll(".audio-bar"), {
            height: [
              { value: "8px", duration: 100 },
              { value: "24px", duration: 150 },
              { value: "12px", duration: 100 },
            ],
            loop: true,
            direction: "alternate",
            easing: "easeInOutSine",
            delay: stagger(50),
          });

          // Screen Share Code Lines Animation
          animate(classroomRef.current.querySelectorAll(".code-line"), {
            width: ["0%", "100%"],
            opacity: [0, 1],
            duration: 1500,
            loop: true,
            delay: stagger(300),
            easing: "easeInOutQuad",
          });

          // Whiteboard Animation
          const wbPath = classroomRef.current.querySelector(
            ".whiteboard-path",
          ) as SVGPathElement;
          if (wbPath) {
            const len = wbPath.getTotalLength();
            wbPath.style.strokeDasharray = `${len}`;
            wbPath.style.strokeDashoffset = `${len}`;

            animate(wbPath, {
              strokeDashoffset: [len, 0],
              duration: 3000,
              easing: "easeInOutSine",
              loop: true,
              direction: "alternate",
              delay: 1000,
            });
          }

          classroomObserver.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (classroomRef.current) {
      classroomObserver.observe(classroomRef.current);
    }

    // Leaderboard Animation
    const leaderboardObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && leaderboardRef.current) {
          const items =
            leaderboardRef.current.querySelectorAll(".leaderboard-item");
          const xpValues = leaderboardRef.current.querySelectorAll(".xp-value");

          // Proxy object for scores
          const scores = { p1: 2490, p2: 2100 };

          const timeline = createTimeline({ loop: true });

          timeline
            .add(scores, {
              p2: 2600,
              round: 1,
              duration: 1500,
              easing: "linear",
              update: () => {
                if (xpValues[1])
                  xpValues[1].textContent = `${Math.round(scores.p2).toLocaleString()} XP`;
              },
            })
            // Visual Swap: Anon (#2) moves UP, Kodliebe (#1) moves DOWN
            .add(
              items[1],
              {
                // Anon
                translateY: [0, -78], // Move up to Pos 1
                zIndex: 20, // Bring to front
                duration: 800,
                easing: "spring(1, 80, 10, 0)",
              },
              "-=800",
            )
            .add(
              items[0],
              {
                // Kodliebe
                translateY: [0, 78], // Move down to Pos 2
                duration: 800,
                easing: "spring(1, 80, 10, 0)",
              },
              "-=800",
            )

            // Phase 2: Kodliebe (p1) grinds back to reclaim top spot
            .add(scores, {
              p1: 2800,
              round: 1,
              duration: 1500,
              easing: "linear",
              update: () => {
                if (xpValues[0])
                  xpValues[0].textContent = `${Math.round(scores.p1).toLocaleString()} XP`;
              },
              delay: 500,
            })
            // Visual Swap Back
            .add(
              items[1],
              {
                // Anon moves back down
                translateY: [-78, 0],
                zIndex: 0,
                duration: 800,
                easing: "spring(1, 80, 10, 0)",
              },
              "-=600",
            )
            .add(
              items[0],
              {
                // Kodliebe moves back up
                translateY: [78, 0],
                duration: 800,
                easing: "spring(1, 80, 10, 0)",
              },
              "-=800",
            );

          leaderboardObserver.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (leaderboardRef.current) {
      leaderboardObserver.observe(leaderboardRef.current);
    }

    return () => {
      observer.disconnect();
      roadmapObserver.disconnect();
      classroomObserver.disconnect();
      leaderboardObserver.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 selection:text-orange-100 overflow-x-hidden font-sans">
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Radial Gradient Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-[#050505] to-[#050505]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl tracking-tight cursor-pointer group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-transform group-hover:scale-105">
              <Terminal className="text-black w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>Optimus</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative pt-28 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto z-10"
        ref={heroRef}
      >
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
          <div className="lg:w-1/2 space-y-6 sm:space-y-8 text-center lg:text-left">
            <h1 className="hero-anim text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              LEARN. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
                BUILD.
              </span>{" "}
              <br />
              GROW.
            </h1>

            <p className="hero-anim text-base sm:text-lg md:text-xl text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              The first <strong>Project-Based Platform</strong> that treats
              education like a job. AI Managers, Live Code Sync, and Gamified
              Quests.
            </p>

            <div className="hero-anim flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2 sm:pt-4">
              <button
                type="button"
                onClick={handleStart}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl text-base sm:text-lg flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(249,115,22,0.4)]"
              >
                Start Learning
              </button>
              <button
                type="button"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-white rounded-xl font-medium transition-colors text-base sm:text-lg"
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* 3D Code Editor */}
          <div className="hero-anim lg:w-1/2 w-full perspective-1000 group">
            {/* Background Glow */}
            <div className="absolute -inset-10 bg-gradient-to-r from-orange-600/20 to-purple-600/20 rounded-[3rem] blur-3xl opacity-30 group-hover:opacity-50 transition duration-1000" />

            {/* 3D Tilted Card */}
            <div
              ref={codeWindowRef}
              className="code-window relative transform-style-3d transition-transform duration-500 ease-out"
            >
              <div className="bg-[#0a0a0b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl relative">
                {/* Cursors Overlay */}
                <div className="cursor-1 absolute z-20 opacity-0 pointer-events-none transition-all duration-75">
                  <div className="relative">
                    <MousePointer2 className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <div className="absolute top-4 left-3 bg-orange-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                      You
                    </div>
                  </div>
                </div>
                <div className="cursor-2 absolute z-20 opacity-0 pointer-events-none transition-all duration-75">
                  <div className="relative">
                    <MousePointer2 className="w-5 h-5 text-purple-500 fill-purple-500" />
                    <div className="absolute top-4 left-3 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                      Teammate
                    </div>
                  </div>
                </div>

                {/* Window Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121214]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    quest_solver.ts
                  </div>
                </div>

                {/* Code Content */}
                <div className="p-8 font-mono text-sm md:text-base leading-relaxed overflow-x-auto min-h-[300px] relative">
                  <div className="typing-code text-gray-300 whitespace-pre">
                    {`async function solveQuest() {
  // ⚡ Optimus AI generating path...
  const roadmap = await ai.generate({
    topic: "FullStack",
    mode: "Hardcore"
  });

  if (roadmap.isReady) {
    await user.startBuild();
    return "Career_Launched 🚀";
  }
}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Roadmap Generator Section */}
      <section
        className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-12 lg:gap-16 relative overflow-hidden"
        ref={roadmapRef}
      >
        {/* Hide the complex SVG roadmap on mobile, show simpler version */}
        <div className="w-full md:w-1/2 relative min-h-[500px] md:min-h-[800px] hidden md:flex justify-center">
          {/* Animated SVG Path */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 400 800"
            fill="none"
            preserveAspectRatio="none"
          >
            <title>Smart Roadmap Visualization</title>
            <defs>
              <linearGradient
                id="roadmapGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            {/* Background Track */}
            <path
              d="M 50 50 C 50 150 100 150 150 150 C 250 150 300 150 300 250 C 300 350 250 350 150 350 C 50 350 50 450 50 550 C 50 650 100 650 150 650"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
              fill="none"
            />

            {/* Animated Progress Line */}
            <path
              className="roadmap-path"
              d="M 50 50 C 50 150 100 150 150 150 C 250 150 300 150 300 250 C 300 350 250 350 150 350 C 50 350 50 450 50 550 C 50 650 100 650 150 650"
              stroke="url(#roadmapGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="2000"
              strokeDashoffset="2000"
            />
          </svg>

          <div className="w-full h-full relative z-10">
            {/* Node 1 */}
            <div className="roadmap-node absolute top-[20px] left-[20px] flex items-center gap-6 opacity-0">
              <div className="w-16 h-16 rounded-2xl bg-[#121214] border border-orange-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] z-20 relative">
                <div className="absolute -inset-1 bg-orange-500/20 blur-lg rounded-full"></div>
                <Milestone className="w-8 h-8 text-orange-400 relative z-10" />
              </div>
              <div className="roadmap-text w-64 p-4 bg-[#121214]/80 backdrop-blur border border-white/10 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-1">
                  Goal: Full Stack
                </h3>
                <p className="text-xs text-gray-400">
                  AI analyzes market trends & your skills.
                </p>
              </div>
            </div>

            {/* Node 2 */}
            <div className="roadmap-node absolute top-[220px] right-[20px] flex flex-row-reverse items-center gap-6 opacity-0 text-right">
              <div className="w-16 h-16 rounded-2xl bg-[#121214] border border-blue-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] z-20">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <div className="roadmap-text w-64 p-4 bg-[#121214]/80 backdrop-blur border border-white/10 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-1">
                  Adaptive Learning
                </h3>
                <p className="text-xs text-gray-400">
                  Curated videos, docs, and interactive tasks.
                </p>
              </div>
            </div>

            {/* Node 3 */}
            <div className="roadmap-node absolute top-[420px] left-[20px] flex items-center gap-6 opacity-0">
              <div className="w-16 h-16 rounded-2xl bg-[#121214] border border-purple-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] z-20">
                <Code className="w-8 h-8 text-purple-400" />
              </div>
              <div className="roadmap-text w-64 p-4 bg-[#121214]/80 backdrop-blur border border-white/10 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-1">
                  Build Projects
                </h3>
                <p className="text-xs text-gray-400">
                  Real-world labs to prove your competency.
                </p>
              </div>
            </div>

            {/* Node 4 (Target) */}
            <div className="roadmap-node absolute top-[620px] left-[120px] flex flex-col items-center gap-4 opacity-0 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] z-20 scale-110">
                <Check className="w-10 h-10 text-white" />
              </div>
              <div className="roadmap-text p-2">
                <h3 className="text-xl font-bold text-white">Career Ready</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified mobile roadmap nodes */}
        <div className="w-full md:hidden space-y-4 px-2">
          {[
            {
              icon: "🎯",
              title: "Goal: Full Stack",
              desc: "AI analyzes market trends & your skills.",
              color: "border-orange-500/50",
            },
            {
              icon: "📚",
              title: "Adaptive Learning",
              desc: "Curated videos, docs, and interactive tasks.",
              color: "border-blue-500/50",
            },
            {
              icon: "💻",
              title: "Build Projects",
              desc: "Real-world labs to prove your competency.",
              color: "border-purple-500/50",
            },
            {
              icon: "✅",
              title: "Career Ready",
              desc: "Launch your dream career.",
              color: "border-green-500/50",
            },
          ].map((node, i) => (
            <div
              key={node.title}
              className={`p-4 bg-[#121214]/80 backdrop-blur border ${node.color} rounded-xl flex items-center gap-4`}
            >
              <div className="text-2xl">{node.icon}</div>
              <div>
                <h3 className="font-bold text-white">{node.title}</h3>
                <p className="text-xs text-gray-400">{node.desc}</p>
              </div>
              {i < 3 && <div className="ml-auto text-gray-600">→</div>}
            </div>
          ))}
        </div>

        <div className="w-full md:w-1/2 space-y-6 sm:space-y-8 text-center md:text-left z-20">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Brain className="w-3 h-3 fill-current" />
            AI Powered
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter loading-[0.9]">
            Your Journey, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">
              Automated.
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
            No static PDFs. Our <strong>Smart Roadmap</strong> creates a living,
            breathing curriculum that adapts as you learn.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
            <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <Video className="w-6 h-6 text-orange-400 mb-2" />
              <h4 className="font-bold">Aggregated Content</h4>
              <p className="text-sm text-gray-400">
                YouTube, Documentation, & Articles.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <Layout className="w-6 h-6 text-blue-400 mb-2" />
              <h4 className="font-bold">Project Labs</h4>
              <p className="text-sm text-gray-400">
                Verify skills with code, not quizzes.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <Database className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="font-bold">Progress Database</h4>
              <p className="text-sm text-gray-400">
                Track every line of code & milestone.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <Users className="w-6 h-6 text-green-400 mb-2" />
              <h4 className="font-bold">Peer Review</h4>
              <p className="text-sm text-gray-400">
                Get feedback from the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Classroom Feature */}
      <section
        className="py-16 sm:py-24 px-4 sm:px-6 relative border-t border-white/5 bg-gradient-to-b from-[#050505] to-[#0a0a0c] overflow-hidden"
        ref={classroomRef}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-anim opacity-0 translate-y-8">
            <span className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-2 block">
              Live Collaboration
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The <span className="text-blue-500">Virtual Classroom</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A distraction-free environment for live classes, mentorship, and
              peer programming.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Classroom Preview */}
            <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-white/10 bg-[#0f0f11] scroll-anim opacity-0 translate-y-8 delay-100 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              {/* Create a CSS-only UI Mockup */}
              <div className="h-[400px] w-full bg-[#121214] relative p-6 flex flex-col">
                {/* Header Mockup */}
                <div className="flex items-center justify-between mb-4 opacity-50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  </div>
                  <div className="h-2 w-32 bg-gray-700 rounded-full"></div>
                </div>
                {/* Grid of Users */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {/* Instructor Block with Audio Viz */}
                  <div className="bg-[#1a1a1e] rounded-xl flex flex-col items-center justify-center relative overflow-hidden group-hover:border-blue-500/30 transition-all border border-transparent">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Users className="w-12 h-12 text-gray-700 relative z-10" />

                    {/* Audio Visualizer */}
                    <div className="flex gap-1 items-end h-8 absolute bottom-12 z-10">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="audio-bar w-1 bg-blue-500 rounded-full h-2"
                        ></div>
                      ))}
                    </div>

                    <div className="absolute bottom-3 left-3 text-xs text-white bg-black/50 px-2 py-1 rounded backdrop-blur z-20 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Instructor
                    </div>
                  </div>

                  {/* Whiteboard Block */}
                  <div className="bg-[#1a1a1e] rounded-xl relative overflow-hidden p-4 border border-transparent group-hover:border-purple-500/30 transition-all flex items-center justify-center">
                    <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-mono">
                      whiteboard-session-1
                    </div>

                    <svg
                      className="w-full h-full opacity-50 absolute inset-0 text-purple-400"
                      viewBox="0 0 100 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <title>Interactive Whiteboard</title>
                      <path
                        className="whiteboard-path"
                        d="M10,90 Q50,10 90,90"
                      />
                    </svg>

                    <div className="absolute bottom-3 left-3 text-xs text-white bg-black/50 px-2 py-1 rounded backdrop-blur z-20">
                      Interactive Whiteboard
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 z-20">
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  Real-time Interaction
                </h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Low-latency video, crystal clear audio, and instant whiteboard
                  sharing.
                </p>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {[
                {
                  icon: Video,
                  color: "text-blue-400",
                  title: "HD Video & Audio",
                  desc: "Crystal clear communication.",
                },
                {
                  icon: Layout,
                  color: "text-purple-400",
                  title: "Interactive Whiteboard",
                  desc: "Draw, plan, and explain concepts.",
                },
                {
                  icon: Zap,
                  color: "text-yellow-400",
                  title: "Focus Mode",
                  desc: "Block distractions & notifications.",
                },
                {
                  icon: Terminal,
                  color: "text-green-400",
                  title: "Live Code Execution",
                  desc: "Run code together in real-time.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="scroll-anim opacity-0 translate-y-8 p-6 rounded-2xl bg-[#0f0f11] border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg bg-white/5 ${feature.color} group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Differentiator 1: AI Competitive Arena */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto relative overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[500px] bg-red-600/5 blur-[100px] -z-10 rounded-full pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="lg:w-1/2 scroll-anim opacity-0 translate-y-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-8">
              <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              E-Sports for Devs
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 leading-tight">
              Ranked Leagues. <br />
              <span className="text-red-500">Zero Cheating.</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              Most leaderboards are fake. Ours aren't. Our{" "}
              <strong>AI Proctor</strong> analyzes your coding patterns, eye
              movement (optional), and tab switches during ranked matches.
            </p>

            <div className="space-y-3 sm:space-y-6">
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-white/5 bg-[#0f0f11] hover:border-red-500/30 transition-colors">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">
                    Anti-Cheat Engine
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Detects LLM copy-pasting and suspicious focus loss.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-white/5 bg-[#0f0f11] hover:border-red-500/30 transition-colors">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Activity className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">
                    Skill-Based Matchmaking
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Compete against devs with your exact Elo rating.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual: Leaderboard/Proctor UI */}
          <div
            className="lg:w-1/2 w-full relative perspective-1000 scroll-anim opacity-0 translate-y-8"
            ref={leaderboardRef}
          >
            <div className="relative z-10 bg-[#0a0a0b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl rotate-y-[-5deg] transform transition-transform hover:rotate-y-0 duration-500 h-[320px]">
              <div className="bg-[#121214] px-4 py-3 border-b border-white/5 flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-red-500 tracking-wider">
                    PROCTORED SESSION ACTIVE
                  </span>
                </div>
                <Eye className="w-4 h-4 text-gray-600" />
              </div>

              <div className="relative p-6 h-[320px]">
                {/* Leaderboard Item 1 (Kodliebe) */}
                <div className="leaderboard-item absolute top-6 left-6 right-6 flex items-center justify-between p-3 rounded-lg bg-white/5 border border-yellow-500/30 z-10">
                  <div className="flex items-center gap-3">
                    <div className="text-yellow-500 font-black text-lg">#1</div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-500">
                      K
                    </div>
                    <div>
                      <div className="text-sm font-bold">Kodliebe</div>
                      <div className="text-[10px] text-green-500">
                        Verified Human
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-white xp-value">2,490 XP</div>
                </div>

                {/* Leaderboard Item 2 (AnonUser) */}
                <div className="leaderboard-item absolute top-[104px] left-6 right-6 flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 opacity-80 z-0">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 font-bold text-lg">#2</div>
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-bold">AnonUser</div>
                      <div className="text-[10px] text-red-500">
                        Flagged by AI
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-gray-500 xp-value">
                    2,100 XP
                  </div>
                </div>

                {/* Leaderboard Item 3 (Threx) */}
                <div className="leaderboard-item absolute top-[184px] left-6 right-6 flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 opacity-30 z-0">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 font-bold text-lg">#3</div>
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500">
                      T
                    </div>
                    <div>
                      <div className="text-sm font-bold">Threx</div>
                      <div className="text-[10px] text-gray-500">
                        Rising Star
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-gray-500 xp-value">
                    1,850 XP
                  </div>
                </div>
              </div>

              {/* Overlay Scan Effect */}
              <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none z-30"></div>
              <div className="absolute top-0 w-full h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-[scan_2s_ease-in-out_infinite] z-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Differentiator 2: Voice Command / Deep Focus */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5 bg-[#08080a] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
          <div className="w-full md:w-1/2 scroll-anim opacity-0 translate-y-8 text-left md:text-right">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-8">
              <Mic className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              Neural Interface
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 leading-tight">
              "Hey Optimus, <br />
              <span className="text-blue-500">Focus Mode."</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              Ditch the mouse. Navigate your roadmap, control playback, and
              enter deep work sessions entirely with{" "}
              <strong>Voice Commands</strong>.
            </p>
            <ul className="inline-block text-left space-y-2 sm:space-y-4">
              <li className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" />
                </div>
                <span className="text-sm sm:text-base">
                  "Start next lesson"
                </span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" />
                </div>
                <span className="text-sm sm:text-base">
                  "Take a screenshot"
                </span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" />
                </div>
                <span className="text-sm sm:text-base">
                  "Explain this code block"
                </span>
              </li>
            </ul>
          </div>

          <div className="w-full md:w-1/2 flex justify-center scroll-anim opacity-0 translate-y-8">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-4 bg-blue-500/10 rounded-full animate-ping delay-75"></div>
              <div className="absolute inset-12 bg-blue-500/5 rounded-full animate-ping delay-150"></div>
              <div className="relative z-10 w-32 h-32 bg-[#121214] border border-blue-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                <Mic className="w-12 h-12 text-white" />
              </div>
              {/* Sound Wave Visualization */}
              <div className="absolute w-full h-12 bottom-0 left-0 flex items-end justify-center gap-1 opacity-50">
                {[
                  { id: "w1", n: 1, delay: 0 },
                  { id: "w2", n: 2, delay: 0.1 },
                  { id: "w3", n: 3, delay: 0.2 },
                  { id: "w4", n: 4, delay: 0.3 },
                  { id: "w5", n: 5, delay: 0.4 },
                  { id: "w6", n: 4, delay: 0.5 },
                  { id: "w7", n: 3, delay: 0.6 },
                  { id: "w8", n: 2, delay: 0.7 },
                  { id: "w9", n: 1, delay: 0.8 },
                ].map((bar) => (
                  <div
                    key={bar.id}
                    className="w-2 bg-blue-500 rounded-full animate-[bounce_1s_infinite]"
                    style={{
                      height: `${bar.n * 10}%`,
                      animationDelay: `${bar.delay}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 text-center text-gray-600 text-sm">
        <p>&copy; 2026 Optimus. All systems operational.</p>
      </footer>
    </main>
  );
}
