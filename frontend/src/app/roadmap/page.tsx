"use client";

import { animate, stagger } from "animejs";
import {
  ArrowRight,
  Book,
  Brain,
  Check,
  Code,
  ExternalLink,
  Globe,
  Layout,
  Loader,
  Lock,
  Map as MapIcon,
  PlayCircle,
  Server,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRoadmapForUser,
  ROADMAP_DATA,
  type RoadmapNodeData,
} from "@/lib/roadmap-data";

// Custom Icon Mapper
const _IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  default: Sparkles,
  "fe-basics": Layout,
  "js-core": Code,
  "react-start": AtomIcon,
  node: ServerIcon,
};

function AtomIcon(props: { className?: string }) {
  return <Globe {...props} />;
} // Placeholder
function ServerIcon(props: { className?: string }) {
  return <Zap {...props} />;
} // Placeholder

// Domain Icons
const DOMAIN_ICONS = {
  frontend: Layout,
  backend: Server,
  ai_engineer: Brain,
};

const DOMAIN_COLORS = {
  frontend: "from-blue-500 to-cyan-500",
  backend: "from-green-500 to-emerald-500",
  ai_engineer: "from-orange-500 to-yellow-500",
};

const DOMAIN_NAMES = {
  frontend: "Frontend Development",
  backend: "Backend Development",
  ai_engineer: "AI Engineering",
};

export default function RoadmapPage() {
  const { user } = useAuth();
  const mainRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State - Initialize from user profile or localStorage
  const [activeRole, setActiveRole] = useState<string>("");
  const [activeTech, setActiveTech] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const [_hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(
    null,
  );

  // Initialize domain and tech from user profile or localStorage
  useEffect(() => {
    const initializePreferences = () => {
      let role = "";
      let tech = "";

      // First, try to get from user profile
      if (user && "role" in user && typeof user.role === "string") {
        role = user.role;
        // Check if user has knowledge field (tech stack)
        if ("knowledge" in user && typeof user.knowledge === "string") {
          tech = user.knowledge;
        }
      } else {
        // Fallback to localStorage
        const savedRole = localStorage.getItem("selectedDomain");
        role = savedRole || "frontend";
      }

      // Get available techs for the role
      const availableTechs = Object.keys(ROADMAP_DATA[role] || {});

      // If tech is not set, try to get from localStorage or use first available
      if (!tech) {
        const savedTech = localStorage.getItem(`${role}_tech`);
        if (savedTech && availableTechs.includes(savedTech)) {
          tech = savedTech;
        } else {
          // Use first available tech
          tech = availableTechs[0] || "";
        }
      }

      setActiveRole(role);
      setActiveTech(tech);
      setIsLoading(false);
    };

    initializePreferences();
  }, [user]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (activeRole && activeTech) {
      localStorage.setItem("selectedDomain", activeRole);
      localStorage.setItem(`${activeRole}_tech`, activeTech);
    }
  }, [activeRole, activeTech]);

  // Get Dynamic Data
  const roadmapNodes = getRoadmapForUser(activeRole, activeTech);

  // Handle domain change
  const handleDomainChange = (newDomain: string) => {
    setActiveRole(newDomain);
    const availableTechs = Object.keys(ROADMAP_DATA[newDomain] || {});
    setActiveTech(availableTechs[0] || "");

    // Trigger animation
    if (containerRef.current) {
      animate(containerRef.current.querySelectorAll(".animate-node"), {
        scale: [0.8, 1],
        opacity: [0, 1],
        translateY: [30, 0],
        delay: stagger(80),
        duration: 600,
        easing: "easeOutCubic",
      });
    }
  };

  // Animation on mount and path change
  useEffect(() => {
    if (containerRef.current && roadmapNodes.length > 0) {
      const nodes = containerRef.current.querySelectorAll(".animate-node");

      // Animate nodes with stagger
      animate(nodes, {
        scale: [0.8, 1],
        opacity: [0, 1],
        translateY: [40, 0],
        delay: stagger(100, { start: 200 }),
        duration: 800,
        easing: "easeOutExpo",
      });
    }
  }, [roadmapNodes]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden flex">
      <Sidebar />

      <div className="lg:ml-64 relative min-h-screen flex-1 transition-all duration-300">
        {/* Header */}
        <header className="h-14 sm:h-20 border-b border-white/5 flex items-center justify-between px-3 sm:px-8 bg-[#050505]/90 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-4 pl-10 lg:pl-0">
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-lg sm:rounded-xl border border-orange-500/20">
              <MapIcon className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-sm sm:text-xl font-bold">Learning Roadmap</h1>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-mono mt-0.5">
                <span className="text-orange-400 font-bold uppercase">
                  {DOMAIN_NAMES[activeRole as keyof typeof DOMAIN_NAMES]}
                </span>
                <span>/</span>
                <span className="text-white font-bold uppercase">
                  {activeTech}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-lg flex items-center gap-2">
              <Trophy className="w-3 h-3" />
              LEVEL 4
            </div>
          </div>
        </header>

        {/* Domain Switcher - Visual Cards */}
        <div className="border-b border-white/5 bg-[#0a0a0c] py-4 sm:py-6 px-3 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 font-medium">
              Switch Learning Domain
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              {Object.keys(ROADMAP_DATA).map((domain) => {
                const Icon = DOMAIN_ICONS[domain as keyof typeof DOMAIN_ICONS];
                const isActive = activeRole === domain;

                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => handleDomainChange(domain)}
                    className={`
                      group relative p-3 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300
                      ${
                        isActive
                          ? "bg-gradient-to-br from-white/10 to-transparent border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)] scale-[1.02]"
                          : "bg-[#050505] border-white/5 hover:border-white/20 hover:bg-white/5"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div
                        className={`
                        p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300
                        ${
                          isActive
                            ? `bg-gradient-to-br ${DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS]}`
                            : "bg-white/5 group-hover:bg-white/10"
                        }
                      `}
                      >
                        <Icon
                          className={`w-4 h-4 sm:w-6 sm:h-6 ${isActive ? "text-white" : "text-gray-400"}`}
                        />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3
                          className={`font-bold text-xs sm:text-sm truncate ${isActive ? "text-white" : "text-gray-300"}`}
                        >
                          {DOMAIN_NAMES[domain as keyof typeof DOMAIN_NAMES]}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 hidden sm:block">
                          {Object.keys(ROADMAP_DATA[domain]).length} paths
                          available
                        </p>
                      </div>
                      {isActive && (
                        <div className="text-orange-500">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-2xl pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tech Stack Switcher */}
        <div className="border-b border-white/5 bg-[#050505] py-3 sm:py-4 px-3 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xs sm:text-sm text-gray-400 font-medium">
                Tech:
              </span>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {Object.keys(ROADMAP_DATA[activeRole] || {}).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setActiveTech(tech)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200
                      ${
                        activeTech === tech
                          ? "bg-orange-500 text-black"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <main
          className="p-3 sm:p-8 pb-16 sm:pb-32 max-w-5xl mx-auto relative"
          ref={mainRef}
        >
          {/* Ambient Background */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
          <div className="absolute left-[50%] top-20 bottom-0 w-1 bg-gradient-to-b from-green-500 via-orange-500 to-gray-800 -translate-x-1/2 rounded-full opacity-30 z-0" />

          <div className="relative z-10 space-y-24 mt-12" ref={containerRef}>
            {roadmapNodes.map((node, index) => {
              const isLeft = index % 2 === 0;
              // Mock Status Logic: First 2 done, 3rd current, rest locked
              // In real app, check against user.completedNodes
              const status =
                index < 1 ? "completed" : index === 1 ? "current" : "locked";

              const isActive = status === "current";
              const isCompleted = status === "completed";

              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: Complex layout requires div wrapper
                <div
                  key={`${node.id}-${index}`}
                  className={`flex items-center justify-between w-full relative animate-node ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode({ ...node })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedNode({ ...node });
                    }
                  }}
                >
                  {/* Content Card */}
                  <div
                    className={`w-[45%] group relative ${isLeft ? "text-right" : "text-left"} cursor-pointer`}
                  >
                    <div
                      className={`
                                    p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group-hover:scale-[1.02]
                                    ${
                                      isActive
                                        ? "bg-gradient-to-br from-[#0a0a0c] to-[#121214] border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)]"
                                        : isCompleted
                                          ? "bg-[#0a0a0c] border-green-500/30 opacity-80 hover:opacity-100"
                                          : "bg-[#0a0a0c] border-white/5 opacity-40 grayscale hover:grayscale-0 hover:opacity-80"
                                    }
                                `}
                    >
                      <div
                        className={`flex flex-col gap-3 ${isLeft ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-3">
                          <h3
                            className={`text-xl font-bold ${isActive ? "text-white" : "text-gray-300"}`}
                          >
                            {node.title}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
                          {node.description}
                        </p>

                        <div
                          className={`flex gap-2 flex-wrap mt-2 ${isLeft ? "justify-end" : "justify-start"}`}
                        >
                          {node.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] uppercase tracking-wider text-gray-400"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Click Hint */}
                      <div
                        className={`absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] rounded-2xl`}
                      >
                        <div className="flex items-center gap-2 text-white font-bold bg-white/10 px-4 py-2 rounded-full border border-white/10">
                          <span>View Content</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Connector Dot */}
                    <div
                      className={`
                                    absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-[#050505] z-20 shadow-lg
                                    ${isLeft ? "-right-2" : "-left-2"}
                                    ${isActive ? "bg-orange-500" : isCompleted ? "bg-green-500" : "bg-gray-700"}
                                `}
                    />
                  </div>

                  {/* Center Marker */}
                  <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div
                      className={`
                                    w-14 h-14 rounded-full flex items-center justify-center border-[6px] border-[#050505] shadow-xl transition-all duration-500
                                    ${
                                      isActive
                                        ? "bg-orange-500 scale-110"
                                        : isCompleted
                                          ? "bg-green-500"
                                          : "bg-[#1a1a1e] border-white/10"
                                    }
                                `}
                    >
                      {isActive ? (
                        <Zap className="w-6 h-6 text-black fill-black" />
                      ) : isCompleted ? (
                        <Check className="w-6 h-6 text-black stroke-[3]" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  <div className="w-[45%]" />
                </div>
              );
            })}
          </div>

          {/* Call to Action at Bottom */}
          <div className="relative z-10 mt-32 text-center">
            <div className="p-8 bg-gradient-to-br from-orange-500/10 to-transparent rounded-2xl border border-orange-500/20">
              <h3 className="text-2xl font-bold mb-3">
                Ready to continue learning?
              </h3>
              <p className="text-gray-400 mb-6">
                Explore resources, take quizzes, and track your progress
              </p>
              <button
                type="button"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl transition-all inline-flex items-center gap-2"
              >
                Start Next Module
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* --- CONTENT DRAWER --- */}
        <div
          className={`fixed inset-y-0 right-0 w-full sm:w-[400px] lg:w-[500px] bg-[#0c0c0e] border-l border-white/10 z-[100] text-white transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${selectedNode ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedNode && (
            <>
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 bg-[#050505]">
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-4 text-orange-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Module {selectedNode.xp} XP
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {selectedNode.title}
                </h2>
                <p className="text-gray-400">{selectedNode.description}</p>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Sub Topics List */}
                <div>
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Key Concepts
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.topics.map((t) => (
                      <a
                        key={t}
                        href={`/learn?q=${encodeURIComponent(t)}`}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-500/30 transition-colors cursor-pointer"
                      >
                        {t}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Book className="w-4 h-4 text-blue-500" />
                    Learning Material
                  </h3>
                  <div className="space-y-3">
                    {selectedNode.resources.length > 0 ? (
                      selectedNode.resources.map((res, i) => (
                        <a
                          key={`${res.title}-${i}`}
                          href={`/learn?q=${encodeURIComponent(res.title)}`}
                          className="block p-4 bg-[#151518] border border-white/5 rounded-xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                                {res.type === "video" ? (
                                  <PlayCircle className="w-5 h-5" />
                                ) : (
                                  <Book className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm">
                                  {res.title}
                                </h4>
                                <p className="text-xs text-gray-500 capitalize">
                                  {res.type} • 15 mins
                                </p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-orange-500" />
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-gray-500 text-sm">
                        Resources coming soon...
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Area */}
                <div className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent rounded-2xl border border-orange-500/20">
                  <h3 className="font-bold text-lg mb-2 text-white">
                    Ready to practice?
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Start the interactive quiz for this module to earn XP.
                  </p>
                  <button
                    type="button"
                    className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl transition-colors"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
