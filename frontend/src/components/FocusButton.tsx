"use client";

import { Clock, Focus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useFocusMode } from "@/contexts/FocusModeContext";

export function FocusButton() {
  const pathname = usePathname();
  const { openFocusMode, timerSeconds, isTimerRunning, timerMode } =
    useFocusMode();

  // Hide on onboarding page
  if (pathname === "/onboarding") {
    return null;
  }

  // Format timer display
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timerDisplay = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isActive =
    isTimerRunning || timerSeconds < (timerMode === "focus" ? 25 * 60 : 5 * 60);

  if (isActive) {
    return (
      <div className="fixed bottom-4 right-6 z-40 group">
        {/* Compact Clock Icon - fades out on hover */}
        <button
          type="button"
          onClick={openFocusMode}
          className={`relative p-2.5 rounded-full border transition-all duration-300 cursor-pointer group-hover:opacity-0 group-hover:scale-95 ${
            timerMode === "focus"
              ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/30"
              : timerMode === "break"
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
                : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
          }`}
          title="Focus Mode Timer"
        >
          <Clock
            className={`w-5 h-5 transition-all ${
              timerMode === "focus"
                ? "text-orange-400"
                : timerMode === "break"
                  ? "text-green-400"
                  : "text-yellow-400"
            }`}
          />
        </button>

        {/* Expanded Timer Display - slides in on hover */}
        <div className="absolute bottom-0 right-0 opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={openFocusMode}
            className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer backdrop-blur-sm ${
              timerMode === "focus"
                ? "bg-gradient-to-r from-orange-500/30 to-yellow-500/30 border-orange-500/40 hover:from-orange-500/40 hover:to-yellow-500/40 shadow-lg shadow-orange-500/20"
                : timerMode === "break"
                  ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-500/40 hover:from-green-500/40 hover:to-emerald-500/40 shadow-lg shadow-green-500/20"
                  : "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-500/40 hover:from-yellow-500/40 hover:to-orange-500/40 shadow-lg shadow-yellow-500/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock
                className={`w-5 h-5 ${
                  timerMode === "focus"
                    ? "text-orange-400"
                    : timerMode === "break"
                      ? "text-green-400"
                      : "text-yellow-400"
                }`}
              />
              <div className="flex flex-col items-start">
                <div
                  className={`text-xl font-bold tabular-nums ${
                    timerMode === "focus"
                      ? "text-orange-300"
                      : timerMode === "break"
                        ? "text-green-300"
                        : "text-yellow-300"
                  }`}
                >
                  {timerDisplay}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  {timerMode === "focus"
                    ? "Focus"
                    : timerMode === "break"
                      ? "Break"
                      : "Long Break"}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openFocusMode}
      className="fixed bottom-4 right-6 z-40 p-2.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-full hover:from-orange-500/30 hover:to-yellow-500/30 transition-all group"
      title="Focus Mode"
    >
      <Focus className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
    </button>
  );
}
