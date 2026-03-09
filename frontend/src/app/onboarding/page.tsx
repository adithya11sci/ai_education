"use client";

import {
  ArrowRight,
  Brain,
  Briefcase,
  Check,
  Clock,
  Cloud,
  Code,
  Code2,
  Database,
  Globe,
  Layout,
  Palette,
  Rocket,
  Server,
  Star,
  Target,
  Terminal,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OptimusBot3D, { type BotReaction } from "@/components/OptimusBot3D";
import { useAuth } from "@/contexts/AuthContext";
import { completeOnboarding } from "@/lib/api";

// --- TYPES ---
interface Option {
  id: string;
  title: string;
  icon: any;
  color: string;
  desc: string;
}

interface Question {
  id: string;
  label: string;
  question: string;
  description: string;
  layout: "grid-1" | "grid-2" | "grid-3";
  options: Option[];
  condition?: (answers: Record<string, string>) => boolean;
}

// --- DATA: TRULY BEGINNER-FRIENDLY QUESTIONS ---
// Uses everyday scenarios and simple language
// Different paths based on experience level
const QUESTIONS: Question[] = [
  // Q1: GOAL - Why are you here?
  {
    id: "goal",
    label: "Your Goal",
    question: "What would you love to achieve?",
    description: "Dream big — we'll help you get there.",
    layout: "grid-2",
    options: [
      {
        id: "job",
        title: "Get a job in tech",
        icon: Briefcase,
        color: "text-purple-400",
        desc: "Start a new career in technology",
      },
      {
        id: "build",
        title: "Build something cool",
        icon: Rocket,
        color: "text-orange-500",
        desc: "Create your own app or website",
      },
      {
        id: "money",
        title: "Earn extra income",
        icon: Globe,
        color: "text-green-400",
        desc: "Make money with tech skills",
      },
      {
        id: "learn",
        title: "Just learn something new",
        icon: Star,
        color: "text-blue-400",
        desc: "Explore and grow myself",
      },
    ],
  },

  // Q2: EXPERIENCE - Have you coded before?
  {
    id: "experience",
    label: "Starting Point",
    question: "Have you ever tried coding?",
    description: "No judgment — everyone starts somewhere!",
    layout: "grid-3",
    options: [
      {
        id: "never",
        title: "Never tried",
        icon: Zap,
        color: "text-yellow-400",
        desc: "I'm completely new",
      },
      {
        id: "dabbled",
        title: "Tried a bit",
        icon: Code,
        color: "text-blue-400",
        desc: "Watched tutorials, played around",
      },
      {
        id: "know",
        title: "Yes, I can code",
        icon: Star,
        color: "text-green-400",
        desc: "Built projects before",
      },
    ],
  },

  // ========== BEGINNER PATH (never/dabbled) ==========

  // Q3a: For beginners - What excites you? (using everyday examples)
  {
    id: "interest_beginner",
    label: "What Excites You",
    question: "What sounds most fun to you?",
    description: "Think about what makes you curious.",
    layout: "grid-2",
    condition: (answers) =>
      answers.experience === "never" || answers.experience === "dabbled",
    options: [
      {
        id: "design",
        title: "Designing how things look",
        icon: Palette,
        color: "text-pink-400",
        desc: "Colors, layouts, making things pretty",
      },
      {
        id: "solve",
        title: "Solving puzzles & problems",
        icon: Target,
        color: "text-green-400",
        desc: "Logic, figuring things out",
      },
      {
        id: "smart",
        title: "Making things smart",
        icon: Brain,
        color: "text-purple-400",
        desc: "AI, automation, intelligent systems",
      },
      {
        id: "all",
        title: "A bit of everything!",
        icon: Globe,
        color: "text-blue-400",
        desc: "I want to learn it all",
      },
    ],
  },

  // Q4a: For beginners who like design
  {
    id: "design_type",
    label: "Design Interest",
    question: "What would you enjoy creating?",
    description: "Imagine your perfect project.",
    layout: "grid-2",
    condition: (answers) =>
      (answers.experience === "never" || answers.experience === "dabbled") &&
      answers.interest_beginner === "design",
    options: [
      {
        id: "websites",
        title: "A beautiful website",
        icon: Layout,
        color: "text-cyan-400",
        desc: "Like Instagram, Netflix, or Spotify",
      },
      {
        id: "apps",
        title: "A mobile app",
        icon: Code2,
        color: "text-green-400",
        desc: "Something people use on their phones",
      },
      {
        id: "games",
        title: "Games or animations",
        icon: Star,
        color: "text-orange-400",
        desc: "Fun, interactive experiences",
      },
      {
        id: "any",
        title: "Anything visual!",
        icon: Palette,
        color: "text-pink-400",
        desc: "I just love making things look good",
      },
    ],
  },

  // Q4b: For beginners who like solving problems
  {
    id: "solve_type",
    label: "Problem-Solving",
    question: "What kind of challenges interest you?",
    description: "Think about what you'd enjoy working on.",
    layout: "grid-2",
    condition: (answers) =>
      (answers.experience === "never" || answers.experience === "dabbled") &&
      answers.interest_beginner === "solve",
    options: [
      {
        id: "organize",
        title: "Organizing information",
        icon: Database,
        color: "text-blue-400",
        desc: "Making sense of data and lists",
      },
      {
        id: "automate",
        title: "Automating boring tasks",
        icon: Zap,
        color: "text-yellow-400",
        desc: "Making computers do work for you",
      },
      {
        id: "connect",
        title: "Connecting things together",
        icon: Server,
        color: "text-green-400",
        desc: "Making apps talk to each other",
      },
      {
        id: "any_logic",
        title: "Any kind of logic!",
        icon: Terminal,
        color: "text-purple-400",
        desc: "I love figuring things out",
      },
    ],
  },

  // Q4c: For beginners who like AI/smart things
  {
    id: "smart_type",
    label: "Smart Systems",
    question: "What would you love to build?",
    description: "Imagine having these superpowers.",
    layout: "grid-2",
    condition: (answers) =>
      (answers.experience === "never" || answers.experience === "dabbled") &&
      answers.interest_beginner === "smart",
    options: [
      {
        id: "chatbot",
        title: "A smart assistant",
        icon: Brain,
        color: "text-purple-400",
        desc: "Like ChatGPT or Siri",
      },
      {
        id: "recognize",
        title: "Something that sees",
        icon: Star,
        color: "text-orange-400",
        desc: "Face filters, object detection",
      },
      {
        id: "predict",
        title: "Something that predicts",
        icon: Target,
        color: "text-cyan-400",
        desc: "Stock prices, weather, trends",
      },
      {
        id: "any_ai",
        title: "All AI stuff!",
        icon: Zap,
        color: "text-yellow-400",
        desc: "I'm fascinated by it all",
      },
    ],
  },

  // ========== EXPERIENCED PATH ==========

  // Q3b: For experienced users - What's your focus?
  {
    id: "focus_exp",
    label: "Your Focus",
    question: "What do you want to master?",
    description: "Let's build on your existing skills.",
    layout: "grid-2",
    condition: (answers) => answers.experience === "know",
    options: [
      {
        id: "frontend",
        title: "Frontend Development",
        icon: Layout,
        color: "text-blue-400",
        desc: "UI, React, Modern CSS",
      },
      {
        id: "backend",
        title: "Backend Development",
        icon: Server,
        color: "text-green-400",
        desc: "APIs, Databases, Systems",
      },
      {
        id: "fullstack",
        title: "Full Stack",
        icon: Globe,
        color: "text-purple-400",
        desc: "Complete end-to-end",
      },
      {
        id: "ai",
        title: "AI & Machine Learning",
        icon: Brain,
        color: "text-orange-400",
        desc: "ML, LLMs, Data Science",
      },
    ],
  },

  // Q4d: For experienced - Frontend tech
  {
    id: "frontend_tech",
    label: "Frontend Stack",
    question: "Which framework interests you?",
    description: "Pick your weapon of choice.",
    layout: "grid-3",
    condition: (answers) =>
      answers.experience === "know" &&
      (answers.focus_exp === "frontend" || answers.focus_exp === "fullstack"),
    options: [
      {
        id: "react",
        title: "React / Next.js",
        icon: Code2,
        color: "text-cyan-400",
        desc: "Industry standard",
      },
      {
        id: "vue",
        title: "Vue / Nuxt",
        icon: Palette,
        color: "text-green-400",
        desc: "Elegant & approachable",
      },
      {
        id: "angular",
        title: "Angular",
        icon: Target,
        color: "text-red-400",
        desc: "Enterprise scale",
      },
    ],
  },

  // Q4e: For experienced - Backend tech
  {
    id: "backend_tech",
    label: "Backend Stack",
    question: "Which technology stack?",
    description: "Where do you want to build?",
    layout: "grid-3",
    condition: (answers) =>
      answers.experience === "know" &&
      (answers.focus_exp === "backend" || answers.focus_exp === "fullstack"),
    options: [
      {
        id: "node",
        title: "Node.js",
        icon: Server,
        color: "text-green-500",
        desc: "JavaScript everywhere",
      },
      {
        id: "python",
        title: "Python",
        icon: Terminal,
        color: "text-yellow-400",
        desc: "Clean & powerful",
      },
      {
        id: "go",
        title: "Go / Rust",
        icon: Zap,
        color: "text-blue-400",
        desc: "High performance",
      },
    ],
  },

  // Q4f: For experienced - AI focus
  {
    id: "ai_tech",
    label: "AI Focus",
    question: "Which AI area?",
    description: "Narrow your specialization.",
    layout: "grid-3",
    condition: (answers) =>
      answers.experience === "know" && answers.focus_exp === "ai",
    options: [
      {
        id: "llm",
        title: "LLMs & GenAI",
        icon: Brain,
        color: "text-purple-400",
        desc: "ChatGPT, Agents, RAG",
      },
      {
        id: "cv",
        title: "Computer Vision",
        icon: Star,
        color: "text-orange-400",
        desc: "Image, Video, Detection",
      },
      {
        id: "data",
        title: "Data Science",
        icon: Database,
        color: "text-blue-400",
        desc: "Analytics, ML, Predictions",
      },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, login, refetchUser } = useAuth();

  // State
  const [step, setStep] = useState(0); // 0 = Welcome, 1 = Questions
  const [qIndex, setQINDEX] = useState(0); // Current Question Index in the VISIBLE list
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation States
  const [isWalking, setIsWalking] = useState(false);
  const [reaction, setReaction] = useState<BotReaction>("none");
  const [botState, setBotState] = useState<"center" | "interview" | "hidden">(
    "center",
  );

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        login();
      } else if (user.isOnboarded) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router, login]);

  // Update Bot Position based on global step
  useEffect(() => {
    if (step === 0) setBotState("center");
    else if (step === 1) setBotState("interview");
  }, [step]);

  // Helper: Get next valid question index (Skip logic)
  const getNextValidIndex = (
    startIndex: number,
    currentAnswers: Record<string, string>,
  ) => {
    let index = startIndex;
    while (index < QUESTIONS.length) {
      const q = QUESTIONS[index];
      if (!q.condition || q.condition(currentAnswers)) {
        return index;
      }
      index++;
    }
    return -1; // End of list
  };

  // Helper: Get previous valid question index
  const getPrevValidIndex = (
    startIndex: number,
    currentAnswers: Record<string, string>,
  ) => {
    let index = startIndex;
    while (index >= 0) {
      const q = QUESTIONS[index];
      if (!q.condition || q.condition(currentAnswers)) {
        return index;
      }
      index--;
    }
    return -1; // Start of list
  };

  // Animation Helper
  const triggerReaction = (type: BotReaction | "walk") => {
    if (type === "walk") {
      setIsWalking(true);
      setTimeout(() => setIsWalking(false), 2000);
    } else {
      setReaction(type);
      setTimeout(() => setReaction("none"), 2000);
    }
  };

  const handleStart = () => {
    triggerReaction("walk");
    setStep(1);
    // Find first valid question (usually 0)
    const firstIndex = getNextValidIndex(0, {});
    setQINDEX(firstIndex);
  };

  const handleAnswer = (optionId: string) => {
    const currentQ = QUESTIONS[qIndex];
    const newAnswers = { ...answers, [currentQ.id]: optionId };

    // Save answer
    setAnswers(newAnswers);

    // Animate: VICTORY JUMP!
    // Simple reaction logic based on answer type
    let react: BotReaction = "happy";
    if (currentQ.id === "experience") react = "scan";
    if (currentQ.id === "learning_style") react = "nod";
    triggerReaction(react);

    // Needs delay for user to see selection and animation
    setTimeout(() => {
      const nextIndex = getNextValidIndex(qIndex + 1, newAnswers);
      if (nextIndex !== -1) {
        setQINDEX(nextIndex);
      } else {
        handleComplete(newAnswers);
      }
    }, 1200);
  };

  const handleBack = () => {
    const prevIndex = getPrevValidIndex(qIndex - 1, answers);
    if (prevIndex !== -1) {
      setQINDEX(prevIndex);
      triggerReaction("walk");
    } else {
      setStep(0); // Back to welcome
    }
  };

  const handleComplete = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    triggerReaction("walk"); // Final celebration walk

    console.log("Final Smart Roadmap Query:", finalAnswers);

    // Determine role based on path taken
    let role = "frontend"; // default
    let knowledge = "basics"; // default

    // EXPERIENCED PATH - they chose directly
    if (finalAnswers.experience === "know") {
      // Map focus_exp to role
      const focusToRole: Record<string, string> = {
        frontend: "frontend",
        backend: "backend",
        fullstack: "fullstack",
        ai: "ai_engineer",
      };
      role = focusToRole[finalAnswers.focus_exp] || "frontend";

      // Get specific tech choice
      knowledge =
        finalAnswers.frontend_tech ||
        finalAnswers.backend_tech ||
        finalAnswers.ai_tech ||
        "react";
    }
    // BEGINNER PATH - map their interests to a role
    else {
      const interestToRole: Record<string, string> = {
        design: "frontend",
        solve: "backend",
        smart: "ai_engineer",
        all: "fullstack",
      };
      role = interestToRole[finalAnswers.interest_beginner] || "frontend";

      // Map beginner sub-choices to knowledge
      if (finalAnswers.design_type) {
        // All design types lead to React/Frontend
        knowledge = "react";
      } else if (finalAnswers.solve_type) {
        // Map solve types to backend tech
        const solveToKnowledge: Record<string, string> = {
          organize: "python",
          automate: "python",
          connect: "node",
          any_logic: "node",
        };
        knowledge = solveToKnowledge[finalAnswers.solve_type] || "node";
      } else if (finalAnswers.smart_type) {
        // Map AI types to AI focus
        const smartToKnowledge: Record<string, string> = {
          chatbot: "llm",
          recognize: "cv",
          predict: "data",
          any_ai: "llm",
        };
        knowledge = smartToKnowledge[finalAnswers.smart_type] || "llm";
      } else {
        knowledge = "react"; // default for "all" interest
      }
    }

    // Map experience levels
    const experienceMap: Record<string, string> = {
      never: "beginner",
      dabbled: "intermediate",
      know: "advanced",
    };
    const experience = experienceMap[finalAnswers.experience] || "beginner";

    try {
      // Save preferences to localStorage for roadmap
      localStorage.setItem("selectedDomain", role);
      localStorage.setItem(`${role}_tech`, knowledge);

      await completeOnboarding({
        role: role,
        experience: experience,
        knowledge: knowledge,
        learning_style: "doing", // default to project-based learning
        goal: finalAnswers.goal,
        commitment: "moderate", // default to moderate commitment
      });
      await refetchUser();
      router.push("/roadmap");
    } catch (error) {
      console.error("Onboarding failed:", error);
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) return null;

  const currentQ = QUESTIONS[qIndex];

  // Dynamic Position based on index (visual variety)
  const getInterviewPosition = (index: number) => {
    const positions = [
      "top-[5%] right-[5%]",
      "bottom-[10%] right-[8%]",
      "top-[40%] right-[12%] scale-125",
      "top-[15%] right-[20%]",
    ];
    return positions[index % positions.length];
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-orange-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* --- 3D COMPANION LAYER --- */}
      <div
        className={`fixed transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] z-20 flex items-center justify-center pointer-events-none
          ${
            botState === "center"
              ? "inset-0 scale-110 pb-[25vh]"
              : `${getInterviewPosition(qIndex)} w-[300px] h-[400px] md:scale-110`
          }
        `}
      >
        <div
          className={`transition-opacity duration-700 ease-out ${isSubmitting ? "opacity-0" : "opacity-100"}`}
        >
          <OptimusBot3D
            size={botState === "center" ? "lg" : "md"}
            walking={isWalking}
            reaction={reaction}
          />
        </div>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pointer-events-none">
        {/* STEP 0: WELCOME */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-end pb-32 md:pb-48 text-center pointer-events-auto animate-in fade-in duration-700">
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter drop-shadow-2xl">
              I'm <span className="text-orange-500">Optimus</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
              Your AI mentor for the journey ahead.
              <br />
              Ready to build your roadmap?
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="group relative px-10 py-5 bg-white text-black font-bold rounded-2xl text-xl transition-all hover:scale-105 hover:bg-orange-400 hover:shadow-[0_0_40px_rgba(251,146,60,0.5)]"
            >
              Let's Begin{" "}
              <ArrowRight className="inline ml-2 w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* STEP 1: INTERVIEW */}
        {step === 1 && currentQ && (
          <div className="flex-1 flex flex-col md:flex-row h-screen">
            {/* Left Panel: Questions */}
            <div className="w-full md:w-3/5 h-full flex flex-col justify-center px-6 md:px-20 pointer-events-auto">
              {/* Progress Indicator */}
              <div className="mb-12 flex items-center gap-3 opacity-50">
                <span className="text-sm font-mono tracking-widest uppercase text-orange-400">
                  Question {qIndex + 1}
                </span>
                <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                    style={{
                      width: `${((qIndex + 1) / QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div
                className="animate-in slide-in-from-left-5 fade-in duration-700 ease-out"
                key={currentQ.id}
              >
                <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                  {currentQ.question}
                </h2>
                <p className="text-xl text-gray-500 mb-10">
                  {currentQ.description}
                </p>

                {/* Options Grid */}
                <div
                  className={`grid gap-4 w-full max-w-2xl
                            ${
                              currentQ.layout === "grid-3"
                                ? "grid-cols-1 md:grid-cols-3"
                                : currentQ.layout === "grid-2"
                                  ? "grid-cols-1 md:grid-cols-2"
                                  : "grid-cols-1"
                            }
                        `}
                >
                  {currentQ.options.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleAnswer(opt.id)}
                      className={`
                                        group relative p-5 rounded-2xl border text-left transition-all duration-300
                                        ${
                                          answers[currentQ.id] === opt.id
                                            ? "bg-white/10 border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.2)] scale-[1.02]"
                                            : "bg-[#0a0a0c] border-white/5 hover:border-white/20 hover:bg-white/5 hover:scale-[1.02]"
                                        }
                                    `}
                    >
                      <div
                        className={`mb-3 p-3 w-fit rounded-xl bg-white/5 ${opt.color}`}
                      >
                        <opt.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{opt.title}</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {opt.desc}
                      </p>

                      {/* Selected Check */}
                      {answers[currentQ.id] === opt.id && (
                        <div className="absolute top-4 right-4 text-orange-500 animate-in zoom-in spin-in-90 duration-300">
                          <div className="bg-orange-500 rounded-full p-1 text-black">
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Back Button */}
              <div className="mt-12">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back
                </button>
              </div>
            </div>

            <div className="hidden md:block w-2/5" />
          </div>
        )}

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-bold animate-pulse">
              Generating your Roadmap...
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
