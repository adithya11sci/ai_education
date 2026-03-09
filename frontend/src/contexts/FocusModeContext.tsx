"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface FocusTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface FocusSession {
  startTime: number;
  duration: number;
  tasksCompleted: number;
  endTime?: number;
}

interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  totalTasksCompleted: number;
  longestStreak: number;
  currentStreak: number;
  lastSessionDate: string | null;
}

interface FocusModeSettings {
  timerDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  enableNotifications: boolean;
  ambientSound: "none" | "rain" | "forest" | "coffee" | "ocean" | "white-noise";
  volume: number;
}

interface FocusModeContextType {
  isOpen: boolean;
  openFocusMode: () => void;
  closeFocusMode: () => void;
  tasks: FocusTask[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  currentSession: FocusSession | null;
  startSession: () => void;
  endSession: () => void;
  stats: FocusStats;
  settings: FocusModeSettings;
  updateSettings: (settings: Partial<FocusModeSettings>) => void;
  timerSeconds: number;
  isTimerRunning: boolean;
  timerMode: "focus" | "break" | "long-break";
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  completedPomodoros: number;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(
  undefined,
);

const DEFAULT_SETTINGS: FocusModeSettings = {
  timerDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  enableNotifications: true,
  ambientSound: "none",
  volume: 50,
};

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<FocusTask[]>([]);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(
    null,
  );
  const [stats, setStats] = useState<FocusStats>({
    totalSessions: 0,
    totalMinutes: 0,
    totalTasksCompleted: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastSessionDate: null,
  });
  const [settings, setSettings] = useState<FocusModeSettings>(DEFAULT_SETTINGS);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break" | "long-break">(
    "focus",
  );
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("focusModeTasks");
    const savedStats = localStorage.getItem("focusModeStats");
    const savedSettings = localStorage.getItem("focusModeSettings");
    const savedTimerState = localStorage.getItem("focusModeTimerState");

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }

    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to parse saved stats", e);
      }
    }

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse saved settings", e);
        setSettings(DEFAULT_SETTINGS);
      }
    }

    if (savedTimerState) {
      try {
        const state = JSON.parse(savedTimerState);
        setTimerSeconds(state.timerSeconds || 25 * 60);
        setTimerMode(state.timerMode || "focus");
        setCompletedPomodoros(state.completedPomodoros || 0);
      } catch (e) {
        console.error("Failed to parse saved timer state", e);
      }
    }
  }, []);

  // Save to localStorage when tasks change
  useEffect(() => {
    localStorage.setItem("focusModeTasks", JSON.stringify(tasks));
  }, [tasks]);

  // Save to localStorage when stats change
  useEffect(() => {
    localStorage.setItem("focusModeStats", JSON.stringify(stats));
  }, [stats]);

  // Save to localStorage when settings change
  useEffect(() => {
    localStorage.setItem("focusModeSettings", JSON.stringify(settings));
  }, [settings]);

  // Save timer state
  useEffect(() => {
    localStorage.setItem(
      "focusModeTimerState",
      JSON.stringify({
        timerSeconds,
        timerMode,
        completedPomodoros,
      }),
    );
  }, [timerSeconds, timerMode, completedPomodoros]);

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false);

    // Show notification
    if (settings.enableNotifications && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(
          timerMode === "focus"
            ? "Focus session complete!"
            : "Break time over!",
          {
            body:
              timerMode === "focus"
                ? "Great work! Time for a break."
                : "Let's get back to work!",
            icon: "/favicon.ico",
          },
        );
      }
    }

    if (timerMode === "focus") {
      const newPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newPomodoros);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + settings.timerDuration,
      }));

      // Determine next mode
      if (newPomodoros % settings.sessionsBeforeLongBreak === 0) {
        setTimerMode("long-break");
        setTimerSeconds(settings.longBreakDuration * 60);
      } else {
        setTimerMode("break");
        setTimerSeconds(settings.breakDuration * 60);
      }

      if (settings.autoStartBreaks) {
        setIsTimerRunning(true);
      }
    } else {
      setTimerMode("focus");
      setTimerSeconds(settings.timerDuration * 60);
      if (settings.autoStartPomodoros) {
        setIsTimerRunning(true);
      }
    }
  }, [
    settings.enableNotifications,
    settings.timerDuration,
    settings.breakDuration,
    settings.longBreakDuration,
    settings.sessionsBeforeLongBreak,
    settings.autoStartBreaks,
    settings.autoStartPomodoros,
    timerMode,
    completedPomodoros,
  ]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, handleTimerComplete]);

  const openFocusMode = useCallback(() => {
    setIsOpen(true);
    // Request notification permission
    if (settings.enableNotifications && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [settings.enableNotifications]);

  const closeFocusMode = useCallback(() => {
    setIsOpen(false);
  }, []);

  const addTask = useCallback((text: string) => {
    const newTask: FocusTask = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const newCompleted = !task.completed;
          if (newCompleted) {
            setStats((prevStats) => ({
              ...prevStats,
              totalTasksCompleted: prevStats.totalTasksCompleted + 1,
            }));
          } else {
            setStats((prevStats) => ({
              ...prevStats,
              totalTasksCompleted: Math.max(
                0,
                prevStats.totalTasksCompleted - 1,
              ),
            }));
          }
          return { ...task, completed: newCompleted };
        }
        return task;
      }),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (task?.completed) {
        setStats((prevStats) => ({
          ...prevStats,
          totalTasksCompleted: Math.max(0, prevStats.totalTasksCompleted - 1),
        }));
      }
      return prev.filter((task) => task.id !== id);
    });
  }, []);

  const startSession = useCallback(() => {
    setCurrentSession({
      startTime: Date.now(),
      duration: settings.timerDuration,
      tasksCompleted: 0,
    });
  }, [settings.timerDuration]);

  const endSession = useCallback(() => {
    if (currentSession) {
      const completedTasks = tasks.filter((t) => t.completed).length;
      const sessionDuration = Math.floor(
        (Date.now() - currentSession.startTime) / 1000 / 60,
      );

      setStats((prev) => ({
        ...prev,
        totalMinutes: prev.totalMinutes + sessionDuration,
        totalTasksCompleted: prev.totalTasksCompleted + completedTasks,
      }));

      setCurrentSession(null);
    }
  }, [currentSession, tasks]);

  const updateSettings = useCallback(
    (newSettings: Partial<FocusModeSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };

        // If timer duration changed and timer is not running, update timer
        if (
          newSettings.timerDuration &&
          !isTimerRunning &&
          timerMode === "focus"
        ) {
          setTimerSeconds(newSettings.timerDuration * 60);
        }
        if (
          newSettings.breakDuration &&
          !isTimerRunning &&
          timerMode === "break"
        ) {
          setTimerSeconds(newSettings.breakDuration * 60);
        }
        if (
          newSettings.longBreakDuration &&
          !isTimerRunning &&
          timerMode === "long-break"
        ) {
          setTimerSeconds(newSettings.longBreakDuration * 60);
        }

        return updated;
      });
    },
    [isTimerRunning, timerMode],
  );

  const startTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerMode("focus");
    setTimerSeconds(settings.timerDuration * 60);
    setCompletedPomodoros(0);
  }, [settings.timerDuration]);

  const skipTimer = useCallback(() => {
    handleTimerComplete();
  }, [handleTimerComplete]);

  return (
    <FocusModeContext.Provider
      value={{
        isOpen,
        openFocusMode,
        closeFocusMode,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        currentSession,
        startSession,
        endSession,
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
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error("useFocusMode must be used within a FocusModeProvider");
  }
  return context;
}
