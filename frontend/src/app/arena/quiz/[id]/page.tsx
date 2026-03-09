"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Sample quiz data
const quizzesData: Record<
  string,
  {
    id: string;
    title: string;
    category: string;
    duration: string;
    questions: Question[];
  }
> = {
  q1: {
    id: "q1",
    title: "JavaScript Basics",
    category: "JavaScript",
    duration: "10 min",
    questions: [
      {
        id: "1",
        question: "What is the output of `typeof null` in JavaScript?",
        options: ["null", "undefined", "object", "number"],
        correctAnswer: 2,
        explanation:
          "This is a well-known JavaScript quirk. typeof null returns 'object' due to a legacy bug in JavaScript.",
      },
      {
        id: "2",
        question:
          "Which method is used to add an element to the end of an array?",
        options: ["unshift()", "push()", "pop()", "shift()"],
        correctAnswer: 1,
        explanation:
          "push() adds elements to the end of an array. unshift() adds to the beginning.",
      },
      {
        id: "3",
        question: "What does 'use strict' do in JavaScript?",
        options: [
          "Makes code run faster",
          "Enables strict type checking",
          "Enables strict mode with error checking",
          "Disables console.log",
        ],
        correctAnswer: 2,
        explanation:
          "'use strict' enables strict mode which catches common coding mistakes and unsafe actions.",
      },
      {
        id: "4",
        question: "What is the difference between == and ===?",
        options: [
          "No difference",
          "=== checks type, == does not",
          "== is for numbers only",
          "=== is faster",
        ],
        correctAnswer: 1,
        explanation:
          "=== (strict equality) checks both value and type, while == (loose equality) performs type coercion.",
      },
      {
        id: "5",
        question: "What does Array.prototype.map() return?",
        options: ["undefined", "The same array", "A new array", "A boolean"],
        correctAnswer: 2,
        explanation:
          "map() creates a new array with the results of calling a function on every element.",
      },
    ],
  },
  q2: {
    id: "q2",
    title: "React Hooks",
    category: "React",
    duration: "8 min",
    questions: [
      {
        id: "1",
        question:
          "Which hook is used to manage state in a functional component?",
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctAnswer: 1,
        explanation:
          "useState is the primary hook for adding state to functional components.",
      },
      {
        id: "2",
        question: "When does useEffect run by default?",
        options: [
          "Only on mount",
          "Only on unmount",
          "After every render",
          "Never",
        ],
        correctAnswer: 2,
        explanation:
          "By default, useEffect runs after every render. Use dependency array to control when it runs.",
      },
      {
        id: "3",
        question: "What is the purpose of the dependency array in useEffect?",
        options: [
          "To list all variables used",
          "To control when the effect runs",
          "To improve performance",
          "It's required by React",
        ],
        correctAnswer: 1,
        explanation:
          "The dependency array controls when the effect re-runs based on which values have changed.",
      },
    ],
  },
};

export default function QuizPage() {
  const params = useParams();
  const quizId = params.id as string;
  const quiz = quizzesData[quizId];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [_isSubmitted, setIsSubmitted] = useState(false);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
          <p className="text-gray-400 mb-4">
            This quiz doesn't exist or is not available.
          </p>
          <Link
            href="/arena?tab=quizzes"
            className="px-4 py-2 bg-orange-500 text-black rounded-lg font-medium"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setSelectedAnswer(answers[currentQuestion + 1] ?? null);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setSelectedAnswer(answers[currentQuestion - 1] ?? null);
    setCurrentQuestion(currentQuestion - 1);
  };

  const handleSubmit = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setIsSubmitted(true);
    setShowResult(true);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Sidebar />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen pt-16 lg:pt-0">
          <div className="max-w-md w-full p-8 bg-[#0a0a0c] border border-white/5 rounded-2xl text-center">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
                percentage >= 70 ? "bg-green-500/20" : "bg-orange-500/20"
              }`}
            >
              <Trophy
                className={`w-10 h-10 ${
                  percentage >= 70 ? "text-green-400" : "text-orange-400"
                }`}
              />
            </div>

            <h1 className="text-2xl font-bold mb-2">Quiz Completed!</h1>
            <p className="text-gray-400 mb-6">{quiz.title}</p>

            <div className="text-5xl font-bold mb-2">{percentage}%</div>
            <p className="text-gray-400 mb-8">
              {score} out of {totalQuestions} correct
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedAnswer(null);
                  setAnswers([]);
                  setShowResult(false);
                  setIsSubmitted(false);
                }}
                className="w-full py-3 bg-orange-500 text-black rounded-lg font-medium hover:bg-orange-400 transition-colors"
              >
                Retry Quiz
              </button>
              <Link
                href="/arena"
                className="block w-full py-3 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Back to Arena
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-12 sm:h-14 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-[#0a0a0c] sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 pl-10 lg:pl-0">
            <Link
              href="/arena"
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </Link>
            <span className="font-medium">{quiz.title}</span>
            <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400">
              {quiz.category}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {quiz.duration}
            </span>
            <span>
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <main className="max-w-3xl mx-auto p-4 sm:p-8">
          {/* Question Number */}
          <div className="flex items-center gap-3 mb-6">
            {quiz.questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = selectedAnswer;
                  setAnswers(newAnswers);
                  setSelectedAnswer(answers[i] ?? null);
                  setCurrentQuestion(i);
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  i === currentQuestion
                    ? "bg-orange-500 text-black"
                    : answers[i] !== undefined && answers[i] !== null
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-semibold mb-8">{question.question}</h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, i) => (
              <button
                key={`option-${option}`}
                type="button"
                onClick={() => setSelectedAnswer(i)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedAnswer === i
                    ? "bg-orange-500/10 border-orange-500/50 text-white"
                    : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === i
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-500"
                    }`}
                  >
                    {selectedAnswer === i && (
                      <div className="w-2 h-2 bg-black rounded-full" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentQuestion === totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-black rounded-lg text-sm font-medium hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
                <CheckCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-black rounded-lg text-sm font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
