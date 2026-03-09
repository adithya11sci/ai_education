"use client";

import {
  Loader2,
  Mic,
  MicOff,
  Send,
  Video,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInterviewChat } from "@/hooks/useInterviewChat";

// Wake word phrases that trigger the AI
const WAKE_PHRASES = ["hey sona", "hi sona", "hello sona", "okay sona", "sona"];

interface InterviewUIProps {
  hidden?: boolean;
}

export function InterviewUI({ hidden = false }: InterviewUIProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { chat, loading, cameraZoomed, setCameraZoomed, message } =
    useInterviewChat();

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordMode, setIsWakeWordMode] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [_statusText, setStatusText] = useState("");
  // biome-ignore lint/suspicious/noExplicitAny: SpeechRecognition types vary across browsers
  const recognitionRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);

  // Refs to avoid stale closures in speech recognition callbacks
  const chatRef = useRef(chat);
  const loadingRef = useRef(loading);
  const messageRef = useRef(message);
  const isWakeWordModeRef = useRef(isWakeWordMode);

  useEffect(() => {
    chatRef.current = chat;
    loadingRef.current = loading;
    messageRef.current = message;
    isWakeWordModeRef.current = isWakeWordMode;
  }, [chat, loading, message, isWakeWordMode]);

  // Initialize speech recognition
  useEffect(() => {
    // Helper functions defined inside useEffect to avoid dependency issues
    const containsWakePhrase = (text: string): boolean => {
      const lowerText = text.toLowerCase().trim();
      return WAKE_PHRASES.some((phrase) => lowerText.includes(phrase));
    };

    const extractMessageAfterWake = (text: string): string => {
      const lowerText = text.toLowerCase();
      for (const phrase of WAKE_PHRASES) {
        const index = lowerText.indexOf(phrase);
        if (index !== -1) {
          return text.substring(index + phrase.length).trim();
        }
      }
      return text;
    };

    // biome-ignore lint/suspicious/noExplicitAny: Browser SpeechRecognition API types
    const WindowWithSpeech = window as any;
    const SpeechRecognitionAPI =
      WindowWithSpeech.SpeechRecognition ||
      WindowWithSpeech.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true; // Keep listening
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // biome-ignore lint/suspicious/noExplicitAny: Browser SpeechRecognition event types
      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;

        if (inputRef.current) {
          inputRef.current.value = transcript;
        }

        // If this is a final result
        if (lastResult.isFinal) {
          const text = transcript.trim();
          console.log("Heard:", text);

          if (!text || loadingRef.current || messageRef.current) {
            // Skip if empty, loading, or message playing
            return;
          }

          if (isWakeWordModeRef.current) {
            // Wake word mode: send any speech
            // Check if wake phrase was used - extract just the message part
            if (containsWakePhrase(text)) {
              const messageText = extractMessageAfterWake(text);
              setStatusText("Wake word detected!");

              if (messageText) {
                // User said "Hey Sona [question]"
                console.log("Sending message with wake word:", messageText);
                chatRef.current(messageText);
              } else {
                // User just said "Hey Sona" - trigger greeting/interview start
                console.log("Wake word only - starting interview");
                chatRef.current(
                  "Start the interview. Ask me an interview question.",
                );
              }
            } else {
              // No wake phrase, but in wake mode - send the speech directly
              console.log("Wake mode - sending speech:", text);
              chatRef.current(text);
            }

            if (inputRef.current) {
              inputRef.current.value = "";
            }
          } else {
            // Normal push-to-talk mode: send any speech directly
            console.log("Sending voice message:", text);
            chatRef.current(text);
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }
        }
      };

      // biome-ignore lint/suspicious/noExplicitAny: Browser SpeechRecognitionError
      recognition.onerror = (event: any) => {
        // no-speech is expected when there's silence - just log it normally
        if (event.error === "no-speech") {
          console.log("No speech detected, continuing to listen...");
        } else {
          console.error("Speech recognition error:", event.error);
        }
        if (event.error !== "no-speech" && event.error !== "aborted") {
          setIsListening(false);
          setIsWakeWordMode(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if in wake word mode
        if (shouldRestartRef.current && isWakeWordModeRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (_e) {
              console.log("Could not restart recognition");
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Toggle regular listening (push-to-talk)
  const toggleListening = useCallback(() => {
    if (!speechSupported) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      );
      return;
    }

    if (isListening) {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsWakeWordMode(false);
    } else {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setIsWakeWordMode(false); // Normal mode
      shouldRestartRef.current = false;
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [speechSupported, isListening]);

  // Toggle wake word mode (always listening for "Hey Sona")
  const toggleWakeWordMode = useCallback(() => {
    if (!speechSupported) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      );
      return;
    }

    if (isWakeWordMode) {
      // Turn off wake word mode
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsWakeWordMode(false);
      setStatusText("");
    } else {
      // Turn on wake word mode
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setIsWakeWordMode(true);
      shouldRestartRef.current = true;
      recognitionRef.current?.start();
      setIsListening(true);
      setStatusText("Listening for 'Hey Sona'...");
    }
  }, [speechSupported, isWakeWordMode]);

  const sendMessage = useCallback(() => {
    const text = inputRef.current?.value;
    if (!loading && !message && text?.trim()) {
      chat(text);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [loading, message, chat]);

  const toggleGreenScreen = useCallback(() => {
    document.body.classList.toggle("interview-greenscreen");
  }, []);

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col justify-end p-4 pointer-events-none ml-64">
      {/* Wake word status indicator */}
      {isWakeWordMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-violet-500/20 backdrop-blur-xl text-violet-300 px-4 py-2 rounded-xl border border-violet-500/30 flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </div>
            <span className="text-sm font-medium">
              Say "Hey Sona" to start...
            </span>
          </div>
        </div>
      )}

      {/* Side controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {/* Hey Sona mode toggle */}
        <button
          type="button"
          onClick={toggleWakeWordMode}
          className={`pointer-events-auto p-3 rounded-xl border transition-all duration-200 hover:scale-105 ${
            isWakeWordMode
              ? "bg-violet-500/30 text-violet-300 border-violet-500/50 animate-pulse"
              : "bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-white/10"
          }`}
          title={
            isWakeWordMode ? "Stop 'Hey Sona' mode" : "Enable 'Hey Sona' mode"
          }
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Zoom toggle */}
        <button
          type="button"
          onClick={() => setCameraZoomed(!cameraZoomed)}
          className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 transition-all duration-200 hover:scale-105"
          title={cameraZoomed ? "Zoom out" : "Zoom in"}
        >
          {cameraZoomed ? (
            <ZoomOut className="w-5 h-5" />
          ) : (
            <ZoomIn className="w-5 h-5" />
          )}
        </button>

        {/* Green screen toggle */}
        <button
          type="button"
          onClick={toggleGreenScreen}
          className="pointer-events-auto bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md text-emerald-400 p-3 rounded-xl border border-emerald-500/30 transition-all duration-200 hover:scale-105"
          title="Toggle green screen"
        >
          <Video className="w-5 h-5" />
        </button>
      </div>

      {/* Chat input area */}
      <div className="flex items-center gap-3 pointer-events-auto max-w-2xl w-full mx-auto mb-4">
        {/* Microphone Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={loading || !!message}
          className={`relative p-4 rounded-xl transition-all duration-300 ${
            isListening
              ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
              : "bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30"
          } ${loading || message ? "cursor-not-allowed opacity-40" : ""}`}
          title={isListening ? "Stop listening" : "Click to speak"}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          className={`flex-1 px-4 py-3 rounded-xl bg-[#0a0a0c] border transition-all duration-300 placeholder:text-gray-500 text-white text-sm focus:outline-none ${
            isListening
              ? "border-red-500/50"
              : "border-white/10 focus:border-orange-500/50"
          }`}
          placeholder={
            isListening
              ? "Listening... speak now 🎤"
              : "Type a message or click 🎤 to speak..."
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        {/* Send button */}
        <button
          type="button"
          disabled={loading || !!message}
          onClick={sendMessage}
          className={`bg-orange-500 hover:bg-orange-400 text-black px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
            loading || message
              ? "cursor-not-allowed opacity-40"
              : "hover:scale-105"
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Send</span>
        </button>
      </div>

      {/* Listening indicator overlay - only show in normal mode, not wake word mode */}
      {isListening && !isWakeWordMode && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-red-500/20 backdrop-blur-xl text-red-400 px-6 py-3 rounded-2xl border border-red-500/30 animate-pulse flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </div>
            <span className="font-medium">Listening...</span>
          </div>
        </div>
      )}

      {/* Subtitle display */}
      {message && (
        <div className="fixed bottom-24 left-64 right-0 z-10 px-8 pointer-events-none">
          <div className="max-w-2xl mx-auto p-4 backdrop-blur-xl bg-[#0a0a0c]/80 rounded-xl text-center border border-white/10">
            <p className="text-white text-sm">{message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
