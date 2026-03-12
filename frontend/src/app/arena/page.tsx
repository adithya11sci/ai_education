"use client";

import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Code,
  FileQuestion,
  Filter,
  Flame,
  Medal,
  Play,
  Search,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { getChallenges, getLeaderboard } from "@/lib/api";

// Types
interface Problem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  solved: boolean;
  acceptance: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
  duration: string;
  category: string;
  completed: boolean;
  score?: number;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  solved: number;
  streak: number;
  level: number;
  badge?: string;
  trend?: "up" | "down" | "same";
}

export default function ArenaPage() {
  const [activeTab, setActiveTab] = useState<
    "problems" | "quizzes" | "leaderboard"
  >("problems");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [apiChallenges, setApiChallenges] = useState<any[] | null>(null);
  const [apiLeaderboard, setApiLeaderboard] = useState<any[] | null>(null);

  // Fetch challenges and leaderboard from API with fallback to mock data
  useEffect(() => {
    getChallenges()
      .then((data) => {
        if (data.challenges && data.challenges.length > 0) {
          setApiChallenges(data.challenges);
        }
      })
      .catch(() => {
        // Silently fallback to mock data
      });

    getLeaderboard()
      .then((data) => {
        if (data.leaderboard && data.leaderboard.length > 0) {
          setApiLeaderboard(data.leaderboard);
        }
      })
      .catch(() => {
        // Silently fallback to mock data
      });
  }, []);

  // Sample problems data - in real app, fetch from API
  const problems: Problem[] = [
    {
      id: "1",
      title: "Two Sum",
      difficulty: "easy",
      category: "Arrays",
      solved: true,
      acceptance: 78,
    },
    {
      id: "2",
      title: "Valid Parentheses",
      difficulty: "easy",
      category: "Stack",
      solved: true,
      acceptance: 65,
    },
    {
      id: "3",
      title: "Longest Substring Without Repeating",
      difficulty: "medium",
      category: "Strings",
      solved: false,
      acceptance: 45,
    },
    {
      id: "4",
      title: "Container With Most Water",
      difficulty: "medium",
      category: "Arrays",
      solved: false,
      acceptance: 52,
    },
    {
      id: "5",
      title: "Merge Two Sorted Lists",
      difficulty: "easy",
      category: "Linked List",
      solved: true,
      acceptance: 71,
    },
    {
      id: "6",
      title: "Binary Tree Level Order",
      difficulty: "medium",
      category: "Trees",
      solved: false,
      acceptance: 48,
    },
    {
      id: "7",
      title: "Trapping Rain Water",
      difficulty: "hard",
      category: "Arrays",
      solved: false,
      acceptance: 35,
    },
    {
      id: "8",
      title: "Word Ladder",
      difficulty: "hard",
      category: "Graphs",
      solved: false,
      acceptance: 28,
    },
  ];

  const quizzes: Quiz[] = [
    {
      id: "q1",
      title: "JavaScript Basics",
      questions: 15,
      duration: "10 min",
      category: "JavaScript",
      completed: true,
      score: 87,
    },
    {
      id: "q2",
      title: "React Hooks",
      questions: 12,
      duration: "8 min",
      category: "React",
      completed: true,
      score: 92,
    },
    {
      id: "q3",
      title: "Data Structures",
      questions: 20,
      duration: "15 min",
      category: "DSA",
      completed: false,
    },
    {
      id: "q4",
      title: "System Design Basics",
      questions: 10,
      duration: "12 min",
      category: "System Design",
      completed: false,
    },
    {
      id: "q5",
      title: "TypeScript Fundamentals",
      questions: 15,
      duration: "10 min",
      category: "TypeScript",
      completed: false,
    },
  ];

  // Leaderboard data
  const leaderboard: LeaderboardUser[] = [
    {
      rank: 1,
      name: "Alex Chen",
      avatar: "AC",
      points: 15840,
      solved: 284,
      streak: 47,
      level: 12,
      badge: "🏆",
      trend: "same",
    },
    {
      rank: 2,
      name: "Sarah Martinez",
      avatar: "SM",
      points: 14920,
      solved: 267,
      streak: 35,
      level: 11,
      badge: "🥈",
      trend: "up",
    },
    {
      rank: 3,
      name: "Raj Kumar",
      avatar: "RK",
      points: 14105,
      solved: 251,
      streak: 28,
      level: 11,
      badge: "🥉",
      trend: "down",
    },
    {
      rank: 4,
      name: "Emily Watson",
      avatar: "EW",
      points: 12890,
      solved: 235,
      streak: 22,
      level: 10,
      trend: "up",
    },
    {
      rank: 5,
      name: "David Kim",
      avatar: "DK",
      points: 11750,
      solved: 219,
      streak: 31,
      level: 10,
      trend: "same",
    },
    {
      rank: 6,
      name: "Maria Garcia",
      avatar: "MG",
      points: 10980,
      solved: 203,
      streak: 18,
      level: 9,
      trend: "up",
    },
    {
      rank: 7,
      name: "James Wilson",
      avatar: "JW",
      points: 10230,
      solved: 194,
      streak: 15,
      level: 9,
      trend: "down",
    },
    {
      rank: 8,
      name: "Lisa Anderson",
      avatar: "LA",
      points: 9540,
      solved: 186,
      streak: 25,
      level: 8,
      trend: "up",
    },
    {
      rank: 9,
      name: "Kevin Patel",
      avatar: "KP",
      points: 8920,
      solved: 172,
      streak: 12,
      level: 8,
      trend: "same",
    },
    {
      rank: 10,
      name: "Sophie Taylor",
      avatar: "ST",
      points: 8340,
      solved: 165,
      streak: 20,
      level: 8,
      trend: "up",
    },
  ];

  const categories = [
    "all",
    "Arrays",
    "Strings",
    "Stack",
    "Linked List",
    "Trees",
    "Graphs",
  ];

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "all" || p.difficulty === selectedDifficulty;
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const stats = {
    solved: problems.filter((p) => p.solved).length,
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === "easy" && p.solved).length,
    easyTotal: problems.filter((p) => p.difficulty === "easy").length,
    medium: problems.filter((p) => p.difficulty === "medium" && p.solved)
      .length,
    mediumTotal: problems.filter((p) => p.difficulty === "medium").length,
    hard: problems.filter((p) => p.difficulty === "hard" && p.solved).length,
    hardTotal: problems.filter((p) => p.difficulty === "hard").length,
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-12 sm:h-14 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 pl-10 lg:pl-0">
            <Code className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <h1 className="text-sm sm:text-lg font-semibold">Arena</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("problems")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === "problems"
                  ? "bg-green-500 text-black"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Problems</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quizzes")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === "quizzes"
                  ? "bg-green-500 text-black"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              <FileQuestion className="w-4 h-4" />
              <span className="hidden sm:inline">Quizzes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === "leaderboard"
                  ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-black"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>
          </div>
        </header>

        <main className="p-3 sm:p-6 max-w-6xl mx-auto">
          {activeTab === "problems" && (
            <>
              {/* Progress Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-4 bg-[#0a0a0c] border border-white/5 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Total Solved</p>
                  <p className="text-2xl font-bold">
                    {stats.solved}
                    <span className="text-sm text-gray-500">
                      /{stats.total}
                    </span>
                  </p>
                </div>
                <div className="p-4 bg-[#0a0a0c] border border-green-500/20 rounded-xl">
                  <p className="text-xs text-green-400 mb-1">Easy</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.easy}
                    <span className="text-sm text-gray-500">
                      /{stats.easyTotal}
                    </span>
                  </p>
                </div>
                <div className="p-4 bg-[#0a0a0c] border border-yellow-500/20 rounded-xl">
                  <p className="text-xs text-yellow-400 mb-1">Medium</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.medium}
                    <span className="text-sm text-gray-500">
                      /{stats.mediumTotal}
                    </span>
                  </p>
                </div>
                <div className="p-4 bg-[#0a0a0c] border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-400 mb-1">Hard</p>
                  <p className="text-2xl font-bold text-red-400">
                    {stats.hard}
                    <span className="text-sm text-gray-500">
                      /{stats.hardTotal}
                    </span>
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Problems List */}
              <div className="bg-[#0a0a0c] border border-white/5 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">Status</div>
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Difficulty</div>
                  <div className="col-span-2">Acceptance</div>
                </div>

                {/* Rows */}
                {filteredProblems.map((problem) => (
                  <Link
                    key={problem.id}
                    href={`/arena/problem/${problem.id}`}
                    className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
                  >
                    <div className="col-span-1">
                      {problem.solved ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border border-gray-600 rounded-full" />
                      )}
                    </div>
                    <div className="col-span-5 font-medium hover:text-green-400 transition-colors">
                      {problem.title}
                    </div>
                    <div className="col-span-2 text-sm text-gray-400">
                      {problem.category}
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${problem.difficulty === "easy"
                            ? "bg-green-500/20 text-green-400"
                            : problem.difficulty === "medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-400">
                      {problem.acceptance}%
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              {/* Quiz Stats */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    <span className="text-sm text-gray-400">Average Score</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-400">89%</p>
                </div>
                <div className="flex-1 p-4 bg-[#0a0a0c] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Completed</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {quizzes.filter((q) => q.completed).length}
                    <span className="text-sm text-gray-500">
                      /{quizzes.length}
                    </span>
                  </p>
                </div>
                <div className="flex-1 p-4 bg-[#0a0a0c] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-sm text-gray-400">
                      Daily Challenge
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Complete 1 quiz today</p>
                </div>
              </div>

              {/* Quiz Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/arena/quiz/${quiz.id}`}
                    className={`p-4 rounded-xl border transition-all ${quiz.completed
                        ? "bg-[#0a0a0c] border-green-500/20 hover:border-green-500/40"
                        : "bg-[#0a0a0c] border-white/5 hover:border-orange-500/30"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${quiz.completed
                              ? "bg-green-500/20"
                              : "bg-orange-500/20"
                            }`}
                        >
                          <FileQuestion
                            className={`w-5 h-5 ${quiz.completed
                                ? "text-green-400"
                                : "text-orange-400"
                              }`}
                          />
                        </div>
                        <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                          {quiz.category}
                        </span>
                      </div>
                      {quiz.completed && quiz.score && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm font-bold">
                          {quiz.score}%
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold mb-2">{quiz.title}</h3>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {quiz.questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.duration}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {quiz.completed ? (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Not started
                        </span>
                      )}
                      <span className="text-orange-400 flex items-center gap-1 text-sm font-medium">
                        {quiz.completed ? "Retry" : "Start"}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {activeTab === "leaderboard" && (
            <>
              {/* Leaderboard Header Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-5 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl">
                      <Trophy className="w-5 h-5 text-orange-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Your Rank</p>
                  <p className="text-3xl font-bold text-orange-400">#42</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ↑ 3 from last week
                  </p>
                </div>

                <div className="p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                      <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <Award className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Total Points</p>
                  <p className="text-3xl font-bold">6,240</p>
                  <p className="text-xs text-gray-500 mt-1">+180 this week</p>
                </div>

                <div className="p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-green-500/10 rounded-xl">
                      <Flame className="w-5 h-5 text-green-400" />
                    </div>
                    <Medal className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-green-400">14</p>
                  <p className="text-xs text-gray-500 mt-1">days in a row</p>
                </div>
              </div>

              {/* Top 3 Podium */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-orange-400" />
                  Top Performers
                </h2>
                <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                  {/* Rank 2 */}
                  <div className="flex flex-col items-center pt-8">
                    <div className="relative mb-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-gray-500/30 shadow-lg shadow-gray-500/20">
                        {leaderboard[1].avatar}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-lg border-2 border-[#050505]">
                        2
                      </div>
                    </div>
                    <h3 className="font-bold text-sm mb-1">
                      {leaderboard[1].name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      Level {leaderboard[1].level}
                    </p>
                    <div className="px-3 py-1.5 bg-gray-500/20 rounded-lg border border-gray-500/30">
                      <p className="text-sm font-bold text-gray-300">
                        {leaderboard[1].points.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>

                  {/* Rank 1 */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-orange-500/50 shadow-2xl shadow-orange-500/30 text-black">
                        {leaderboard[0].avatar}
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-xl font-bold border-2 border-[#050505] text-black shadow-lg">
                        1
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <Trophy className="w-8 h-8 text-orange-400 drop-shadow-glow" />
                      </div>
                    </div>
                    <h3 className="font-bold text-base mb-1">
                      {leaderboard[0].name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      Level {leaderboard[0].level}
                    </p>
                    <div className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg border border-orange-500/30">
                      <p className="text-base font-bold text-orange-400">
                        {leaderboard[0].points.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                  </div>

                  {/* Rank 3 */}
                  <div className="flex flex-col items-center pt-8">
                    <div className="relative mb-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-700 to-orange-900 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-orange-800/30 shadow-lg shadow-orange-800/20">
                        {leaderboard[2].avatar}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-700 to-orange-900 rounded-full flex items-center justify-center text-lg border-2 border-[#050505]">
                        3
                      </div>
                    </div>
                    <h3 className="font-bold text-sm mb-1">
                      {leaderboard[2].name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      Level {leaderboard[2].level}
                    </p>
                    <div className="px-3 py-1.5 bg-orange-800/20 rounded-lg border border-orange-800/30">
                      <p className="text-sm font-bold text-orange-600">
                        {leaderboard[2].points.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Leaderboard Table */}
              <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5">
                  <h3 className="font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-400" />
                    Global Rankings
                  </h3>
                </div>

                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2">Points</div>
                  <div className="col-span-2">Solved</div>
                  <div className="col-span-2">Streak</div>
                  <div className="col-span-1">Trend</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-white/5">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.rank}
                      className={`grid grid-cols-12 gap-4 px-4 sm:px-6 py-4 transition-colors ${user.rank <= 3
                          ? "bg-gradient-to-r from-orange-500/5 to-transparent hover:from-orange-500/10"
                          : "hover:bg-white/5"
                        }`}
                    >
                      {/* Rank */}
                      <div className="col-span-2 sm:col-span-1 flex items-center">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${user.rank === 1
                              ? "bg-gradient-to-br from-orange-500 to-yellow-500 text-black"
                              : user.rank === 2
                                ? "bg-gradient-to-br from-gray-400 to-gray-600 text-white"
                                : user.rank === 3
                                  ? "bg-gradient-to-br from-orange-700 to-orange-900 text-white"
                                  : "bg-white/5 text-gray-400"
                            }`}
                        >
                          {user.badge || user.rank}
                        </div>
                      </div>

                      {/* Player */}
                      <div className="col-span-10 sm:col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center font-bold text-black text-sm flex-shrink-0">
                          {user.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-gray-500">
                            Level {user.level}
                          </p>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="col-span-4 sm:col-span-2 flex items-center">
                        <div>
                          <p className="font-bold text-orange-400">
                            {user.points.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 sm:hidden">
                            points
                          </p>
                        </div>
                      </div>

                      {/* Solved */}
                      <div className="col-span-4 sm:col-span-2 flex items-center">
                        <div>
                          <p className="font-semibold">{user.solved}</p>
                          <p className="text-xs text-gray-500">problems</p>
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="col-span-3 sm:col-span-2 flex items-center">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="font-semibold">{user.streak}</span>
                        </div>
                      </div>

                      {/* Trend */}
                      <div className="col-span-1 flex items-center justify-end sm:justify-start">
                        {user.trend === "up" && (
                          <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          </div>
                        )}
                        {user.trend === "down" && (
                          <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                          </div>
                        )}
                        {user.trend === "same" && (
                          <div className="w-6 h-6 bg-gray-500/20 rounded flex items-center justify-center">
                            <div className="w-2 h-0.5 bg-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-400" />
                  Recent Achievements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl text-center">
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="text-xs font-semibold mb-1">Champion</p>
                    <p className="text-xs text-gray-500">Top 10 finish</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl text-center">
                    <div className="text-3xl mb-2">🔥</div>
                    <p className="text-xs font-semibold mb-1">Hot Streak</p>
                    <p className="text-xs text-gray-500">30 day streak</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl text-center">
                    <div className="text-3xl mb-2">💯</div>
                    <p className="text-xs font-semibold mb-1">Perfectionist</p>
                    <p className="text-xs text-gray-500">100% accuracy</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <p className="text-xs font-semibold mb-1">Speed Demon</p>
                    <p className="text-xs text-gray-500">Fast solver</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
