"use client";

import {
  BookOpen,
  Box,
  FileText,
  Focus,
  Gamepad2,
  GraduationCap,
  Home,
  LogOut,
  Map as MapIcon,
  Menu,
  Mic,
  Settings,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusMode } from "@/contexts/FocusModeContext";

const navItems = [
  { id: "dashboard", icon: Home, label: "Dashboard", href: "/dashboard" },
  { id: "roadmap", icon: MapIcon, label: "My Roadmap", href: "/roadmap" },
  { id: "learn", icon: BookOpen, label: "Learn", href: "/learn" },
  {
    id: "vr-classroom",
    icon: Box,
    label: "VR Classroom",
    href: "/vr-classroom",
  },
  { id: "collab", icon: Users, label: "Collaborate", href: "/collaborate" },
  { id: "arena", icon: Gamepad2, label: "Arena", href: "/arena" },
  { id: "notes", icon: FileText, label: "Notes", href: "/notes" },
  { id: "career", icon: GraduationCap, label: "Career Hub", href: "/career" },
  { id: "interview", icon: Mic, label: "AI Interview", href: "/interview" },
  { id: "network", icon: UsersRound, label: "Network", href: "/network" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { openFocusMode } = useFocusMode();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes on mobile
  // biome-ignore lint/correctness/useExhaustiveDependencies: Trigger effect on pathname change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-2.5 left-3 z-50 p-2 bg-[#0a0a0c] border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4 text-white" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 w-full h-full cursor-default"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-56 lg:w-64 bg-[#0a0a0c] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-50
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo & Close Button */}
        <div className="p-3 lg:p-4 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 lg:gap-2">
            <div className="w-7 h-7 lg:w-9 lg:h-9 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-md lg:rounded-lg flex items-center justify-center font-black text-black text-xs lg:text-sm">
              {">"}_
            </div>
            <span className="font-bold text-base lg:text-lg">Optimus</span>
          </Link>

          {/* Close button - mobile only */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 lg:p-3 space-y-0.5 lg:space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 lg:p-3 border-t border-white/5 space-y-1 lg:space-y-2">
          <button
            type="button"
            onClick={openFocusMode}
            className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30 hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
          >
            <Focus className="w-4 h-4 lg:w-5 lg:h-5" />
            Focus Mode
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm text-gray-500 hover:bg-white/5"
          >
            <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            Settings
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
