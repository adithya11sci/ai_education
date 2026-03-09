"use client";

import { animate, stagger } from "animejs";
import {
  Atom,
  BarChart3,
  BookOpen,
  Bot,
  Code,
  FileCode2,
  FileText,
  Filter,
  Globe,
  Loader2,
  Play,
  Search,
  Server,
  Terminal,
  Video,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

// Types
interface ContentItem {
  id: string;
  type: "video" | "article" | "project";
  title: string;
  source: string;
  duration?: string;
  thumbnail: string;
  url: string;
}

// Background Effect Component
function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
    </div>
  );
}

// Content Card - now takes onClick handler
function ContentCard({
  item,
  onPlay,
}: {
  item: ContentItem;
  onPlay: (item: ContentItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay(item)}
      className="group relative bg-[#0a0a0c]/80 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] text-left w-full"
    >
      <div className="relative aspect-video bg-[#1a1a1e] overflow-hidden">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-300">
            <Play className="w-5 h-5 text-black ml-1" />
          </div>
        </div>
        {item.duration && (
          <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded text-xs">
            {item.duration}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 bg-white/5 rounded-lg">
            {item.type === "video" ? (
              <Video className="w-4 h-4 text-red-400" />
            ) : item.type === "article" ? (
              <FileText className="w-4 h-4 text-blue-400" />
            ) : (
              <Code className="w-4 h-4 text-green-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-orange-400 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{item.source}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

// Video Player Modal
function VideoPlayerModal({
  video,
  onClose,
}: {
  video: ContentItem;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div role="document" className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white line-clamp-1 flex-1 mr-4">
            {video.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={video.url}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-sm text-gray-400 mt-3">{video.source}</p>
      </div>
    </div>
  );
}

function LearnPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<ContentItem | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      id: "web",
      label: "Web Development",
      icon: Globe,
      color: "text-blue-400",
    },
    { id: "python", label: "Python", icon: Terminal, color: "text-yellow-400" },
    {
      id: "js",
      label: "JavaScript",
      icon: FileCode2,
      color: "text-yellow-300",
    },
    { id: "react", label: "React", icon: Atom, color: "text-cyan-400" },
    { id: "node", label: "Node.js", icon: Server, color: "text-green-500" },
    {
      id: "ml",
      label: "Machine Learning",
      icon: Bot,
      color: "text-purple-400",
    },
    {
      id: "data",
      label: "Data Science",
      icon: BarChart3,
      color: "text-pink-400",
    },
    { id: "devops", label: "DevOps", icon: Wrench, color: "text-gray-400" },
  ];

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setQuery(searchQuery);

    try {
      const res = await fetch(
        `https://rujam-api.vercel.app/search?q=${encodeURIComponent(`${searchQuery} tutorial`)}`,
      );
      const videos = await res.json();
      setResults(
        videos.map(
          (v: {
            id: string;
            title: string;
            channel: string;
            duration: string;
          }) => ({
            id: v.id,
            type: "video" as const,
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
  }, []);

  // Initial Auto-Search from URL
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  useEffect(() => {
    if (mainRef.current) {
      // specific animation for results when they appear
      animate(mainRef.current.querySelectorAll(".animate-in"), {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(50),
        duration: 500,
        easing: "easeOutExpo",
      });
    }
  }, []); // Re-run when results change

  return (
    <>
      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayerModal
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      <div className="lg:ml-64 relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 pl-10 lg:pl-0">
              <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-blue-500/10 border border-blue-500/20">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <h1 className="text-sm sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Learn
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-sm flex items-center gap-2 hover:bg-white/10 hover:border-white/10 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 sm:px-6 pb-3 sm:pb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(query);
              }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors z-10" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for tutorials, courses, or any topic..."
                className="w-full pl-12 pr-4 py-3 bg-[#0a0a0c] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500/50 relative z-10 transition-all placeholder:text-gray-600"
              />
            </form>
          </div>
        </header>

        <main className="p-3 sm:p-6 max-w-6xl mx-auto" ref={mainRef}>
          {/* Categories */}
          <div className="animate-in opacity-0 mb-8">
            <h2 className="text-sm text-gray-500 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleSearch(cat.label)}
                  className="p-4 bg-[#0a0a0c] border border-white/5 rounded-xl hover:border-orange-500/30 hover:bg-white/5 transition-all group text-left hover:-translate-y-0.5"
                >
                  <cat.icon
                    className={`w-8 h-8 mb-3 ${cat.color} group-hover:scale-110 transition-transform`}
                  />
                  <span className="text-sm font-medium group-hover:text-white transition-colors">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-sm text-gray-500 animate-pulse">
                Finding the best resources...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="animate-[fadeIn_0.5s_ease-out_forwards]">
              <style jsx>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2">
                  Results for "{query}"
                  <span className="text-xs font-normal text-gray-500 ml-2 px-2 py-0.5 bg-white/5 rounded-full">
                    {results.length} found
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {results.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onPlay={setPlayingVideo}
                  />
                ))}
              </div>
            </div>
          ) : query ? (
            <div className="text-center py-20 text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="animate-in opacity-0 text-center py-16 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <BookOpen className="w-8 h-8 opacity-30" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Start Learning Something New
              </h3>
              <p className="text-sm max-w-sm mx-auto">
                Search for any topic or select a category above to begin your
                journey.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-hidden relative">
      <Sidebar />
      <BackgroundOrbs />
      <Suspense fallback={<div>Loading...</div>}>
        <LearnPageContent />
      </Suspense>
    </div>
  );
}
