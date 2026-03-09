"use client";

import {
  ArrowLeft,
  BookOpen,
  Code,
  Copy,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Terminal,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

// Dynamic import for Monaco Editor
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Sample problems data
const problemsData: Record<
  string,
  {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: string;
    description: string;
    examples: { input: string; output: string; explanation?: string }[];
    constraints: string[];
    hints: string[];
    starterCode: string;
  }
> = {
  "1": {
    id: "1",
    title: "Two Sum",
    difficulty: "easy",
    category: "Arrays",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    hints: [
      "A brute force approach would be O(n²). Can you do better?",
      "Try using a hash map to store the values you've seen.",
    ],
    starterCode: `function twoSum(nums: number[], target: number): number[] {
  // Your code here
  
}`,
  },
  "2": {
    id: "2",
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Stack",
    description:
      "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    hints: [
      "Use a stack to keep track of opening brackets.",
      "When you see a closing bracket, check if it matches the top of the stack.",
    ],
    starterCode: `function isValid(s: string): boolean {
  // Your code here
  
}`,
  },
  "3": {
    id: "3",
    title: "Longest Substring Without Repeating",
    difficulty: "medium",
    category: "Strings",
    description:
      "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation:
          'The answer is "wke", with the length of 3. Note that "pwke" is a subsequence, not a substring.',
      },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    hints: [
      "Use the sliding window technique.",
      "Keep track of characters in the current window using a Set or Map.",
    ],
    starterCode: `function lengthOfLongestSubstring(s: string): number {
  // Your code here
  
}`,
  },
};

export default function ProblemPage() {
  const params = useParams();
  const problemId = params.id as string;
  const problem = problemsData[problemId];

  const [code, setCode] = useState(problem?.starterCode || "// Loading...");
  const [activeTab, setActiveTab] = useState<"description" | "solutions">(
    "description",
  );
  const [showHints, setShowHints] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Problem Not Found</h1>
          <p className="text-gray-400 mb-4">
            This problem doesn't exist or is not available.
          </p>
          <Link
            href="/arena"
            className="px-4 py-2 bg-orange-500 text-black rounded-lg font-medium"
          >
            Back to Arena
          </Link>
        </div>
      </div>
    );
  }

  const runCode = () => {
    setIsRunning(true);
    setOutput("Running tests...\n");

    setTimeout(() => {
      setOutput(
        "✓ Test 1 passed\n✓ Test 2 passed\n✓ Test 3 passed\n\nAll tests passed!",
      );
      setIsRunning(false);
    }, 1500);
  };

  const difficultyColors = {
    easy: "text-green-400 bg-green-500/20",
    medium: "text-yellow-400 bg-yellow-500/20",
    hard: "text-red-400 bg-red-500/20",
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="lg:ml-64 h-screen flex flex-col">
        {/* Header */}
        <header className="h-12 border-b border-white/5 flex items-center justify-between px-3 sm:px-4 bg-[#0a0a0c] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 pl-10 lg:pl-0">
            <Link
              href="/arena"
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </Link>
            <span className="text-sm font-medium">{problem.title}</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[problem.difficulty]}`}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-black rounded-lg text-sm font-medium hover:bg-green-400 transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Problem Description */}
          <div className="w-[45%] border-r border-white/5 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "description"
                    ? "text-white border-b-2 border-orange-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Description
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("solutions")}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "solutions"
                    ? "text-white border-b-2 border-orange-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Solutions
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "description" && (
                <div className="space-y-6">
                  {/* Category */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    {problem.category}
                  </div>

                  {/* Description */}
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {problem.description}
                    </p>
                  </div>

                  {/* Examples */}
                  <div>
                    <h3 className="font-semibold mb-3">Examples</h3>
                    <div className="space-y-4">
                      {problem.examples.map((example, i) => (
                        <div
                          key={`example-${example.input}`}
                          className="bg-white/5 rounded-lg p-3 text-sm font-mono"
                        >
                          <div className="text-gray-400 mb-1">
                            Example {i + 1}:
                          </div>
                          <div className="mb-1">
                            <span className="text-gray-400">Input: </span>
                            {example.input}
                          </div>
                          <div>
                            <span className="text-gray-400">Output: </span>
                            <span className="text-green-400">
                              {example.output}
                            </span>
                          </div>
                          {example.explanation && (
                            <div className="mt-2 text-gray-400 text-xs">
                              {example.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Constraints */}
                  <div>
                    <h3 className="font-semibold mb-3">Constraints</h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {problem.constraints.map((c) => (
                        <li
                          key={`constraint-${c}`}
                          className="flex items-center gap-2 font-mono text-xs"
                        >
                          <span className="text-gray-500">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hints */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHints ? "Hide Hints" : "Show Hints"}
                    </button>
                    {showHints && (
                      <div className="mt-3 space-y-2">
                        {problem.hints.map((hint, i) => (
                          <div
                            key={`hint-${i + 1}`}
                            className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm"
                          >
                            <span className="text-orange-400 font-medium">
                              Hint {i + 1}:{" "}
                            </span>
                            {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "solutions" && (
                <div className="text-center py-12 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Submit your solution first to see other solutions!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor Header */}
            <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#1e1e1e] shrink-0">
              <span className="text-sm text-gray-400">TypeScript</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCode(problem.starterCode)}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Reset Code"
                >
                  <RotateCcw className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Copy Code"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Output Panel */}
            <div className="h-32 border-t border-white/5 bg-[#0a0a0c] shrink-0">
              <div className="h-8 border-b border-white/5 flex items-center px-4">
                <span className="text-xs text-gray-400 flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  Output
                </span>
              </div>
              <div className="p-3 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-y-auto h-[calc(100%-32px)]">
                {output || "Run your code to see output..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
