"use client";

import {
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  Box,
  ChevronRight,
  Clock,
  Code,
  FileText,
  Flame,
  Lightbulb,
  MapIcon,
  Play,
  Plus,
  Search,
  Sparkles,
  Target,
  Trophy,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Types
interface ContentItem {
  id: string;
  title: string;
  source: string;
  duration?: string;
  thumbnail: string;
  url: string;
}

interface WeakArea {
  id: string;
  topic: string;
  accuracy: number;
  lastAttempt: string;
  score: number;
  suggestion: string;
}

interface RoadmapNode {
  id: string;
  title: string;
  status: "completed" | "current" | "locked";
  progress?: number;
}

import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

// Top Header
function _Header({ userStats }: { userStats: { xp: number; streak: number } }) {
  const { user, login, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search content, topics..."
            className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm w-80 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-bold">
              {userStats.xp.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold">{userStats.streak} days</span>
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 relative"
        >
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center font-bold text-black overflow-hidden hover:opacity-90 transition-opacity"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.name?.[0] || user.email[0] || "U").toUpperCase()
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1a1e] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="font-medium truncate text-white text-sm">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-red-400 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={login}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-black text-sm hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}

// Today's Learning Plan Card
function _TodaysPlan({
  currentTopic,
  timeLeft,
}: {
  currentTopic: { title: string; module: string; progress: number };
  timeLeft: string;
}) {
  return (
    <div className="bg-gradient-to-br from-orange-500/10 via-purple-500/5 to-transparent rounded-2xl p-6 border border-white/5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Today's Learning Plan</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{currentTopic.title}</h2>
          <p className="text-gray-400 text-sm">{currentTopic.module}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{currentTopic.progress}%</p>
          <p className="text-xs text-gray-500">completed</p>
        </div>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
          style={{ width: `${currentTopic.progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{timeLeft} estimated to complete</span>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 bg-orange-500 text-black rounded-xl font-bold flex items-center gap-2 hover:bg-orange-400 transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Weak Areas Card
function _WeakAreasCard({ weakAreas }: { weakAreas: WeakArea[] }) {
  return (
    <div className="bg-[#0a0a0c] rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-red-400" />
          Areas to Improve
        </h3>
        <button
          type="button"
          className="text-xs text-orange-400 hover:underline"
        >
          View all
        </button>
      </div>

      <div className="space-y-3">
        {weakAreas.map((area) => (
          <div
            key={area.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-orange-500/10 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-red-400">
                {area.score}%
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium group-hover:text-orange-400">
                {area.topic}
              </p>
              <p className="text-xs text-gray-500">{area.suggestion}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick Stats Card
// Quick Stats Card
function _QuickStats({
  stats,
}: {
  stats: {
    lessonsToday: number;
    totalLessons: number;
    quizScore: number;
    timeSpent: number;
  };
}) {
  const statItems = [
    {
      label: "Lessons Today",
      value: `${stats.lessonsToday}/${stats.totalLessons}`,
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      label: "Practice Done",
      value: "12", // TODO: Add to API
      icon: Code,
      color: "text-green-400",
    },
    {
      label: "Quiz Score",
      value: `${stats.quizScore}%`,
      icon: Target,
      color: "text-purple-400",
    },
    {
      label: "Time Spent",
      value: `${(stats.timeSpent / 60).toFixed(1)}h`,
      icon: Clock,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#0a0a0c] rounded-xl p-4 border border-white/5"
        >
          <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// VR Classroom Quick Access Card
function VRClassroomCard() {
  return (
    <Link
      href="/vr-classroom"
      className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 hover:from-purple-600/30 hover:to-pink-600/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Box className="w-6 h-6" />
        </div>
        <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
      </div>
      <h3 className="font-bold text-lg mb-2">VR Classrooms</h3>
      <p className="text-sm text-gray-400 mb-4">
        Join immersive virtual reality learning spaces powered by FramVR
      </p>
      <div className="flex items-center gap-2 text-sm text-purple-400">
        <Sparkles className="w-4 h-4" />
        <span>Experience 3D collaborative learning</span>
      </div>
    </Link>
  );
}

// Roadmap Preview
function _RoadmapPreview({ nodes }: { nodes: RoadmapNode[] }) {
  return (
    <div className="bg-[#0a0a0c] rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-purple-400" />
          Your Roadmap
        </h3>
        <button
          type="button"
          className="text-xs text-orange-400 hover:underline"
        >
          Full view
        </button>
      </div>

      <div className="space-y-2">
        {nodes.map((node, i) => {
          const isCurrent = node.status === "current";
          return (
            <div
              key={node.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent
                  ? "bg-orange-500/10 border border-orange-500/30"
                  : node.status === "completed"
                    ? "opacity-60"
                    : "opacity-40"
              }`}
            >
              <div className="relative">
                {node.status === "completed" ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 border-2 border-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-600 rounded-full" />
                )}
                {i < nodes.length - 1 && (
                  <div className="absolute top-7 left-1/2 w-px h-4 bg-white/10 -translate-x-1/2" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{node.title}</p>
              </div>
              {isCurrent && node.progress !== undefined && (
                <span className="text-xs text-orange-400">
                  {node.progress}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Recommended Content
function RecommendedContent() {
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [_currentQuery, setCurrentQuery] = useState("");
  const [playingVideo, setPlayingVideo] = useState<ContentItem | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setCurrentQuery(searchQuery);

    try {
      const res = await fetch(
        `https://rujam-api.vercel.app/search?q=${encodeURIComponent(searchQuery)}`,
      );
      const videos = await res.json();
      setResults(
        videos
          .slice(0, 4)
          .map(
            (v: {
              id: string;
              title: string;
              channel: string;
              duration: string;
            }) => ({
              id: v.id,
              title: v.title,
              source: v.channel,
              duration: v.duration,
              thumbnail: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
              url: `https://www.youtube.com/embed/${v.id}?autoplay=1`,
            }),
          ),
      );
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Video Player Modal */}
      {playingVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
          onClick={() => setPlayingVideo(null)}
          onKeyDown={(e) => e.key === "Escape" && setPlayingVideo(null)}
        >
          <div role="document" className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white line-clamp-1">
                {playingVideo.title}
              </h3>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={playingVideo.url}
                title={playingVideo.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-sm text-gray-400 mt-3">{playingVideo.source}</p>
          </div>
        </div>
      )}

      <div className="bg-[#0a0a0c] rounded-2xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Learn Something New
          </h3>
        </div>

        {/* Quick Search Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["React", "Python", "TypeScript", "Machine Learning", "Node.js"].map(
            (tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => handleSearch(`${tag} tutorial`)}
                className="px-3 py-1.5 bg-white/5 rounded-full text-xs hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
              >
                {tag}
              </button>
            ),
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {results.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setPlayingVideo(item)}
                className="group rounded-xl overflow-hidden bg-white/5 hover:bg-orange-500/10 transition-all text-left"
              >
                <div className="relative aspect-video">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  {item.duration && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px]">
                      {item.duration}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-medium line-clamp-2 group-hover:text-orange-400">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {item.source}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Click a topic to find tutorials</p>
          </div>
        )}
      </div>
    </>
  );
}

// AI Help Chatbox (Fixed Position)
function _AIHelpChat() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50"
      >
        <Bot className="w-6 h-6 text-black" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-orange-400" />
          <span className="font-bold text-sm">AI Help</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/10 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-gray-400">
        <Bot className="w-12 h-12 mb-3 text-orange-400 opacity-50" />
        <p className="text-sm font-medium text-white">How can I help?</p>
        <p className="text-xs mt-1">
          Ask about features, navigation, or learning tips
        </p>
      </div>
      <div className="p-3 border-t border-white/5">
        <input
          type="text"
          placeholder="Ask anything..."
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500/50"
        />
      </div>
    </div>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />

      {/* Main content - responsive margin for sidebar */}
      <div className="lg:ml-64 min-h-screen">
        {/* Responsive Header */}
        <header className="h-12 sm:h-14 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-30">
          {/* Left side - add padding for mobile menu button */}
          <div className="flex items-center gap-1.5 sm:gap-3 pl-9 lg:pl-0">
            <span className="text-gray-400 text-xs sm:text-base">
              {greeting},
            </span>
            <span className="font-semibold text-xs sm:text-base truncate max-w-[100px] sm:max-w-none">
              {user?.name || "Learner"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded-md sm:rounded-lg text-[10px] sm:text-sm">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
              <span className="font-bold text-orange-400">
                <span className="sm:hidden">5d</span>
                <span className="hidden sm:inline">5 day streak</span>
              </span>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-6 max-w-5xl mx-auto">
          {/* Quick Actions - Responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
            <Link
              href="/roadmap"
              className="group p-3 sm:p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-lg sm:rounded-xl hover:border-orange-500/40 transition-all"
            >
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 mb-2 sm:mb-3" />
              <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
                Roadmap
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                Continue learning
              </p>
            </Link>

            <Link
              href="/learn"
              className="group p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg sm:rounded-xl hover:border-blue-500/40 transition-all"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mb-2 sm:mb-3" />
              <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
                Courses
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                Find new topics
              </p>
            </Link>

            <Link
              href="/arena"
              className="group p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg sm:rounded-xl hover:border-green-500/40 transition-all"
            >
              <Code className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mb-2 sm:mb-3" />
              <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
                Practice
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                Solve problems
              </p>
            </Link>

            <Link
              href="/network"
              className="group p-3 sm:p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-lg sm:rounded-xl hover:border-purple-500/40 transition-all"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mb-2 sm:mb-3" />
              <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">
                Study
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                Connect with friends
              </p>
            </Link>
          </div>

          {/* Current Learning */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              Continue Learning
            </h2>

            <div className="space-y-2 sm:space-y-3">
              <CurrentCourse
                title="JavaScript Fundamentals"
                lesson="Closures & Scope"
                progress={65}
                timeLeft="20 min"
              />
              <CurrentCourse
                title="React Basics"
                lesson="useState & useEffect"
                progress={30}
                timeLeft="45 min"
              />
            </div>
          </section>

          {/* Today's Goals */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              Today's Goals
            </h2>

            {/* Responsive grid - 1 column on mobile, 3 on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <GoalCard
                icon={BookOpen}
                title="Complete 2 lessons"
                current={1}
                total={2}
                color="blue"
              />
              <GoalCard
                icon={Code}
                title="Solve 3 problems"
                current={0}
                total={3}
                color="green"
              />
              <GoalCard
                icon={Clock}
                title="Study for 1 hour"
                current={25}
                total={60}
                color="orange"
                unit="min"
              />
            </div>
          </section>

          {/* Two Column Layout - Responsive: stacks on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Study Sessions */}
            <section>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  Upcoming Sessions
                </h2>
                <Link
                  href="/network"
                  className="text-xs text-orange-400 hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <SessionCard
                  title="DSA Study Group"
                  time="Today, 6:00 PM"
                  participants={4}
                />
                <SessionCard
                  title="React Project Review"
                  time="Tomorrow, 3:00 PM"
                  participants={2}
                />

                <Link
                  href="/network?tab=groups"
                  className="flex items-center justify-center gap-2 p-2.5 sm:p-3 border border-dashed border-white/10 rounded-xl text-gray-500 hover:border-orange-500/50 hover:text-orange-400 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create study session
                </Link>
              </div>
            </section>

            {/* Quick Resources */}
            <section>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                Quick Resources
              </h2>

              <div className="space-y-2">
                <ResourceLink title="JavaScript Cheat Sheet" type="PDF" />
                <ResourceLink title="React Hooks Guide" type="Article" />
                <ResourceLink title="DSA Patterns" type="Notes" />
                <ResourceLink title="Interview Questions" type="Collection" />
              </div>
            </section>
          </div>

          {/* Focus Mode Banner */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Focus Mode
                </h3>
                <p className="text-xs text-gray-400">
                  Block distractions and study with a timer
                </p>
              </div>
            </div>
            <Link
              href="/focus"
              className="px-4 py-2 bg-violet-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-violet-400 transition-colors w-full sm:w-auto text-center"
            >
              Start Session
            </Link>
          </div>

          {/* Extra Cards Section - Responsive */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="animate-in opacity-0">
              <VRClassroomCard />
            </div>
            <div className="animate-in opacity-0">
              <RecommendedContent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Current Course Card
function CurrentCourse({
  title,
  lesson,
  progress,
  timeLeft,
}: {
  title: string;
  lesson: string;
  progress: number;
  timeLeft: string;
}) {
  return (
    <Link
      href="/learn"
      className="flex items-center gap-4 p-4 bg-[#0a0a0c] border border-white/5 rounded-xl hover:border-orange-500/30 transition-all group"
    >
      <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium group-hover:text-orange-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500">{lesson}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-orange-400">{progress}%</p>
        <p className="text-xs text-gray-500">{timeLeft} left</p>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" />
    </Link>
  );
}

// Goal Card
function GoalCard({
  icon: Icon,
  title,
  current,
  total,
  color,
  unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  current: number;
  total: number;
  color: string;
  unit?: string;
}) {
  const progress = (current / total) * 100;
  const colorClasses: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/20",
    green: "text-green-400 bg-green-500/20",
    orange: "text-orange-400 bg-orange-500/20",
  };

  return (
    <div className="p-3 sm:p-4 bg-[#0a0a0c] border border-white/5 rounded-lg sm:rounded-xl">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <div
          className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg ${colorClasses[color]}`}
        >
          <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
        <span className="text-xs sm:text-sm text-gray-400 truncate">
          {title}
        </span>
      </div>
      <div className="flex items-end justify-between mb-1.5 sm:mb-2">
        <span className="text-lg sm:text-2xl font-bold">
          {current}
          {unit && (
            <span className="text-[10px] sm:text-sm text-gray-500 ml-0.5 sm:ml-1">
              {unit}
            </span>
          )}
        </span>
        <span className="text-xs sm:text-sm text-gray-500">/ {total}</span>
      </div>
      <div className="h-1 sm:h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            color === "blue"
              ? "bg-blue-500"
              : color === "green"
                ? "bg-green-500"
                : "bg-orange-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Session Card
function SessionCard({
  title,
  time,
  participants,
}: {
  title: string;
  time: string;
  participants: number;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#0a0a0c] border border-white/5 rounded-lg sm:rounded-xl hover:border-purple-500/30 transition-all cursor-pointer">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-md sm:rounded-lg flex items-center justify-center shrink-0">
        <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-xs sm:text-sm truncate">{title}</h4>
        <p className="text-[10px] sm:text-xs text-gray-500">{time}</p>
      </div>
      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 shrink-0">
        <Users className="w-3 h-3" />
        {participants}
      </div>
    </div>
  );
}

// Resource Link
function ResourceLink({ title, type }: { title: string; type: string }) {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#0a0a0c] border border-white/5 rounded-lg sm:rounded-xl hover:border-cyan-500/30 transition-all text-left"
    >
      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
      <span className="flex-1 text-xs sm:text-sm truncate">{title}</span>
      <span className="px-1.5 sm:px-2 py-0.5 bg-white/5 rounded text-[10px] sm:text-xs text-gray-500 shrink-0">
        {type}
      </span>
    </button>
  );
}
