"use client";

import Editor from "@monaco-editor/react";
import usePartySocket from "partysocket/react";
import { useState } from "react";

interface PartyCodeEditorProps {
  roomId: string;
  className?: string;
}

const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ||
  process.env.NEXT_PUBLIC_PARTY_HOST ||
  "optimus-party.ajaybalajiprasad.partykit.dev";

export function PartyCodeEditor({
  roomId,
  className = "",
}: PartyCodeEditorProps) {
  const [code, setCode] = useState("// Start coding...");
  const [isTyping, setIsTyping] = useState(false);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomId,
    onMessage(event) {
      const data = JSON.parse(event.data);
      if (data.type === "code-change") {
        // Only update if we are not currently typing to avoid conflicts
        // In a real app, use Yjs for conflict resolution
        if (!isTyping) {
          setCode(data.code);
        }
      } else if (data.type === "code-sync") {
        setCode(data.code);
      }
    },
  });

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;

    setCode(value);
    setIsTyping(true);

    // Broadcast changes
    socket.send(JSON.stringify({ type: "code-change", code: value }));

    // Reset typing status after delay to allow incoming changes
    setTimeout(() => setIsTyping(false), 1000);
  };

  return (
    <div className={`h-full flex flex-col bg-[#1e1e1e] ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
        <span className="text-gray-300 text-sm font-medium">Shared Editor</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
