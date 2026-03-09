"use client";

import {
  BarChart3,
  Check,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  SkipForward,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFocusMode } from "@/contexts/FocusModeContext";

export function FocusModeModal() {
  const {
    isOpen,
    closeFocusMode,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    stats,
    settings,
    updateSettings,
    timerSeconds,
    isTimerRunning,
    timerMode,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    completedPomodoros,
  } = useFocusMode();

  const [newTaskText, setNewTaskText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Format timer display
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timerDisplay = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Calculate progress percentage
  const totalSeconds =
    timerMode === "focus"
      ? settings.timerDuration * 60
      : timerMode === "break"
        ? settings.breakDuration * 60
        : settings.longBreakDuration * 60;
  const progress = ((totalSeconds - timerSeconds) / totalSeconds) * 100;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(newTaskText);
      setNewTaskText("");
    }
  };

  // Update document title with timer
  useEffect(() => {
    if (isOpen && isTimerRunning) {
      document.title = `${timerDisplay} - Focus Mode`;
    } else if (isOpen) {
      document.title = "Focus Mode - Optimus";
    }
    return () => {
      document.title = "Optimus";
    };
  }, [isOpen, isTimerRunning, timerDisplay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
      <div className="w-full max-w-5xl h-[90vh] bg-[#050505] border border-white/5 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-orange-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-white/90" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Focus Mode</h2>
              <p className="text-sm text-gray-500">
                Stay focused, stay productive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStats(!showStats)}
              className={`p-2 rounded-lg transition-all ${showStats ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-gray-400 hover:bg-white/5"}`}
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-all ${showSettings ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-gray-400 hover:bg-white/5"}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={closeFocusMode}
              className="p-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex bg-[#050505]">
          {/* Left Panel - Timer & Tasks */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Pomodoro Timer */}
            <div className="mb-8">
              <div className="relative mb-8">
                {/* Progress Ring */}
                <svg className="w-full max-w-sm mx-auto" viewBox="0 0 200 200">
                  <title>Focus Timer Progress</title>
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke={
                      timerMode === "focus"
                        ? "url(#gradient-focus)"
                        : timerMode === "break"
                          ? "url(#gradient-break)"
                          : "url(#gradient-long)"
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 5.34} 534`}
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient
                      id="gradient-focus"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient
                      id="gradient-break"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient
                      id="gradient-long"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Timer Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-7xl font-bold text-white mb-2 tabular-nums">
                    {timerDisplay}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">
                    {timerMode === "focus"
                      ? "Focus Session"
                      : timerMode === "break"
                        ? "Short Break"
                        : "Long Break"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="flex gap-1.5">
                      {Array.from({
                        length: settings.sessionsBeforeLongBreak,
                      }).map((_, i) => (
                        <div
                          key={`session-indicator-${settings.sessionsBeforeLongBreak}-${i}`}
                          className={`w-2 h-2 rounded-full transition-all ${i < completedPomodoros % settings.sessionsBeforeLongBreak ? "bg-orange-500" : "bg-white/10"}`}
                        />
                      ))}
                    </div>
                    <span>{completedPomodoros} pomodoros</span>
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={isTimerRunning ? pauseTimer : startTimer}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-orange-500/50"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={skipTimer}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Skip"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-[#0a0a0c] rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Focus Tasks
              </h3>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="What do you want to focus on?"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-orange-500/20 text-orange-400 rounded-xl hover:bg-orange-500/30 border border-orange-500/30 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Task List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p className="text-sm">
                      No tasks yet. Add one to get started!
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group border border-white/5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          task.completed
                            ? "bg-orange-500 border-orange-500"
                            : "border-gray-600 hover:border-orange-500"
                        }`}
                      >
                        {task.completed && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${task.completed ? "line-through text-gray-600" : "text-gray-200"}`}
                      >
                        {task.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-500/10 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Settings/Stats */}
          {(showSettings || showStats) && (
            <div className="w-96 border-l border-white/5 p-6 overflow-y-auto bg-[#0a0a0c]">
              {showStats && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                    Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl">
                      <div className="text-2xl font-bold text-white mb-1">
                        {stats.totalSessions}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Focus Sessions
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                      <div className="text-2xl font-bold text-white mb-1">
                        {Math.floor(stats.totalMinutes / 60)}h{" "}
                        {stats.totalMinutes % 60}m
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Time Focused
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                      <div className="text-2xl font-bold text-white mb-1">
                        {stats.totalTasksCompleted}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Tasks Done
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showSettings && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-400" />
                    Settings
                  </h3>

                  <div className="space-y-5">
                    {/* Timer Durations */}
                    <div>
                      <label
                        htmlFor="focus-duration"
                        className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide"
                      >
                        Focus Duration
                      </label>
                      <input
                        id="focus-duration"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.timerDuration || 25}
                        onChange={(e) =>
                          updateSettings({
                            timerDuration:
                              Number.parseInt(e.target.value, 10) || 25,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition-all"
                      />
                      <p className="text-[10px] text-gray-600 mt-1">minutes</p>
                    </div>

                    <div>
                      <label
                        htmlFor="short-break"
                        className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide"
                      >
                        Short Break
                      </label>
                      <input
                        id="short-break"
                        type="number"
                        min="1"
                        max="30"
                        value={settings.breakDuration || 5}
                        onChange={(e) =>
                          updateSettings({
                            breakDuration:
                              Number.parseInt(e.target.value, 10) || 5,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition-all"
                      />
                      <p className="text-[10px] text-gray-600 mt-1">minutes</p>
                    </div>

                    <div>
                      <label
                        htmlFor="long-break"
                        className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide"
                      >
                        Long Break
                      </label>
                      <input
                        id="long-break"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.longBreakDuration || 15}
                        onChange={(e) =>
                          updateSettings({
                            longBreakDuration:
                              Number.parseInt(e.target.value, 10) || 15,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition-all"
                      />
                      <p className="text-[10px] text-gray-600 mt-1">minutes</p>
                    </div>

                    <div>
                      <label
                        htmlFor="pomodoros-before-break"
                        className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide"
                      >
                        Pomodoros Before Long Break
                      </label>
                      <input
                        id="pomodoros-before-break"
                        type="number"
                        min="2"
                        max="10"
                        value={settings.sessionsBeforeLongBreak || 4}
                        onChange={(e) =>
                          updateSettings({
                            sessionsBeforeLongBreak:
                              Number.parseInt(e.target.value, 10) || 4,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition-all"
                      />
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/5" />

                    {/* Toggles */}
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                          Auto-start breaks
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings({
                              autoStartBreaks: !settings.autoStartBreaks,
                            })
                          }
                          className={`w-11 h-6 rounded-full transition-all ${settings.autoStartBreaks ? "bg-orange-500" : "bg-white/10"}`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-all ${settings.autoStartBreaks ? "ml-5" : "ml-0.5"}`}
                          />
                        </button>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                          Auto-start pomodoros
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings({
                              autoStartPomodoros: !settings.autoStartPomodoros,
                            })
                          }
                          className={`w-11 h-6 rounded-full transition-all ${settings.autoStartPomodoros ? "bg-orange-500" : "bg-white/10"}`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-all ${settings.autoStartPomodoros ? "ml-5" : "ml-0.5"}`}
                          />
                        </button>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                          Enable notifications
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateSettings({
                              enableNotifications:
                                !settings.enableNotifications,
                            })
                          }
                          className={`w-11 h-6 rounded-full transition-all ${settings.enableNotifications ? "bg-orange-500" : "bg-white/10"}`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-all ${settings.enableNotifications ? "ml-5" : "ml-0.5"}`}
                          />
                        </button>
                      </label>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/5" />

                    {/* Ambient Sound */}
                    <div>
                      <label
                        htmlFor="ambient-sound"
                        className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide"
                      >
                        Ambient Sound
                      </label>
                      <select
                        id="ambient-sound"
                        value={settings.ambientSound}
                        onChange={(e) =>
                          updateSettings({
                            ambientSound: e.target
                              .value as typeof settings.ambientSound,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 transition-all"
                      >
                        <option value="none">None</option>
                        <option value="rain">Rain</option>
                        <option value="forest">Forest</option>
                        <option value="coffee">Coffee Shop</option>
                        <option value="ocean">Ocean Waves</option>
                        <option value="white-noise">White Noise</option>
                      </select>
                    </div>

                    {settings.ambientSound !== "none" && (
                      <div>
                        <label
                          htmlFor="volume-control"
                          className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide flex items-center justify-between"
                        >
                          <span>Volume</span>
                          <span className="text-orange-400 font-bold">
                            {settings.volume || 50}%
                          </span>
                        </label>
                        <input
                          id="volume-control"
                          type="range"
                          min="0"
                          max="100"
                          value={settings.volume || 50}
                          onChange={(e) =>
                            updateSettings({
                              volume: Number.parseInt(e.target.value, 10) || 50,
                            })
                          }
                          className="w-full accent-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
