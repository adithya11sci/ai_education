"use client";

import { animate, stagger } from "animejs";
import {
  Bot,
  Brain,
  ChevronLeft,
  ChevronRight,
  Code,
  Download,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  MoreVertical,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { notesDB } from "@/lib/indexedDB";

// Types
interface Note {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  tags: string[];
  shared?: boolean;
  fileType: "text" | "pdf";
  content?: string;
  pdfUrl?: string;
  pdfBlob?: Blob;
}

interface RAGMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface RAGStatus {
  has_document: boolean;
  pdf_name: string | null;
  chunk_count: number;
}

const RAG_API_BASE = process.env.NEXT_PUBLIC_RAG_API_BASE;

export default function NotesPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notes state
  const [selectedNote, setSelectedNote] = useState<string | null>("1");
  const [noteContent, setNoteContent] = useState(
    `# JavaScript Closures

A closure is a function that has access to its outer function's scope even after the outer function has returned.

## Example

\`\`\`javascript
function outer() {
  const message = "Hello";
  
  function inner() {
    console.log(message);
  }
  
  return inner;
}

const greet = outer();
greet(); // "Hello"
\`\`\`

## Key Points

- Closures remember the environment in which they were created
- Useful for data privacy and encapsulation
- Common in callbacks and event handlers
`,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // AI RAG state
  const [showRAGPlugin, setShowRAGPlugin] = useState(false);
  const [ragStatus, setRagStatus] = useState<RAGStatus | null>(null);
  const [ragMessages, setRagMessages] = useState<RAGMessage[]>([]);
  const [ragInput, setRagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [_showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [_newNoteTitle, _setNewNoteTitle] = useState("");
  const [uploadingNote, setUploadingNote] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [_isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load notes from IndexedDB on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        await notesDB.init();
        const storedNotes = await notesDB.getAllNotes();

        if (storedNotes.length === 0) {
          // Initialize with default notes if empty
          const defaultNotes: Note[] = [
            {
              id: "1",
              title: "JavaScript Closures",
              preview: "A closure is a function that has access to...",
              updatedAt: new Date().toISOString(),
              tags: ["JavaScript", "Functions"],
              fileType: "text",
              content: `# JavaScript Closures

A closure is a function that has access to its outer function's scope even after the outer function has returned.

## Example

\`\`\`javascript
function outer() {
  const message = "Hello";
  
  function inner() {
    console.log(message);
  }
  
  return inner;
}

const greet = outer();
greet(); // "Hello"
\`\`\`

## Key Points

- Closures remember the environment in which they were created
- Useful for data privacy and encapsulation
- Common in callbacks and event handlers`,
            },
            {
              id: "2",
              title: "React Hooks Guide",
              preview: "useState, useEffect, and custom hooks...",
              updatedAt: new Date().toISOString(),
              tags: ["React", "Hooks"],
              shared: true,
              fileType: "text",
              content: "# React Hooks\n\nComplete guide to React Hooks...",
            },
            {
              id: "3",
              title: "CSS Flexbox Cheatsheet",
              preview: "display: flex, justify-content, align-items...",
              updatedAt: new Date().toISOString(),
              tags: ["CSS", "Layout"],
              fileType: "text",
              content: "# CSS Flexbox\n\nA complete guide to flexbox...",
            },
          ];

          // Save default notes to IndexedDB
          for (const note of defaultNotes) {
            await notesDB.addNote(note);
          }
          setNotes(defaultNotes);
        } else {
          setNotes(storedNotes);
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    loadNotes();
  }, []);

  const selectedNoteData = notes.find((n) => n.id === selectedNote);

  const filteredNotes = notes.filter((note) => {
    return (
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // RAG Functions
  const fetchRAGStatus = useCallback(async () => {
    try {
      const res = await fetch(`${RAG_API_BASE}/status`);
      const data = await res.json();
      setRagStatus(data);
    } catch (error) {
      console.error("Failed to fetch RAG status:", error);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${RAG_API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setRagMessages([
          ...ragMessages,
          {
            role: "assistant",
            content: `✅ Successfully processed "${data.message}"!\n\nProcessed ${data.chunk_count} chunks with ${data.total_characters.toLocaleString()} characters.\n\nYou can now ask me questions about this document!`,
            timestamp: Date.now(),
          },
        ]);
        await fetchRAGStatus();
        setShowUploadModal(false);
      } else {
        alert(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      alert("Failed to upload file");
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragInput.trim() || isAsking) return;

    const userMessage: RAGMessage = {
      role: "user",
      content: ragInput,
      timestamp: Date.now(),
    };

    setRagMessages([...ragMessages, userMessage]);
    setRagInput("");
    setIsAsking(true);

    try {
      const res = await fetch(`${RAG_API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: ragInput }),
      });
      const data = await res.json();

      const assistantMessage: RAGMessage = {
        role: "assistant",
        content: data.success
          ? data.answer
          : `❌ ${data.answer || "Failed to get answer"}`,
        timestamp: Date.now(),
      };

      setRagMessages((prev) => [...prev, assistantMessage]);
    } catch (_error) {
      setRagMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Network error. Make sure the RAG server is running.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleClearRAG = async () => {
    if (!confirm("Clear all uploaded documents?")) return;

    try {
      await fetch(`${RAG_API_BASE}/clear`, { method: "POST" });
      setRagMessages([]);
      setRagStatus(null);
      await fetchRAGStatus();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadNote = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPDF = file.name.toLowerCase().endsWith(".pdf");
    const isTxt =
      file.name.toLowerCase().endsWith(".txt") ||
      file.name.toLowerCase().endsWith(".md");

    if (!isPDF && !isTxt) {
      alert("Please upload PDF or text files only");
      return;
    }

    setUploadingNote(true);

    try {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: file.name.replace(/\.(pdf|txt|md)$/i, ""),
        preview: isPDF ? "PDF document uploaded" : "Text document uploaded",
        updatedAt: new Date().toISOString(),
        tags: [isPDF ? "PDF" : "Document"],
        fileType: isPDF ? "pdf" : "text",
      };

      // Read file content
      if (isTxt) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          newNote.content = e.target?.result as string;

          // Save to IndexedDB
          await notesDB.addNote(newNote);

          // Update state
          setNotes((prev) => [newNote, ...prev]);
          setSelectedNote(newNote.id);
          setUploadingNote(false);
          setShowCreateNoteModal(false);
        };
        reader.readAsText(file);
      } else if (isPDF) {
        // Store PDF as blob
        newNote.pdfBlob = file;
        newNote.pdfUrl = URL.createObjectURL(file);

        // Save to IndexedDB
        await notesDB.addNote(newNote);

        // Update state
        setNotes((prev) => [newNote, ...prev]);
        setSelectedNote(newNote.id);
        setUploadingNote(false);
        setShowCreateNoteModal(false);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note");
      setUploadingNote(false);
    }
  };

  const handleLoadCurrentNoteToRAG = async () => {
    if (!selectedNoteData) return;

    setShowRAGPlugin(true);

    // Auto-upload PDF to RAG if it's a PDF note
    if (
      selectedNoteData.fileType === "pdf" &&
      selectedNoteData.pdfUrl &&
      !ragStatus?.has_document
    ) {
      // Show uploading message
      setRagMessages([
        {
          role: "assistant",
          content: `📤 Uploading "${selectedNoteData.title}" to RAG system...\n\nPlease wait while I process your document.`,
          timestamp: Date.now(),
        },
      ]);

      // Fetch the PDF file and upload it
      try {
        const response = await fetch(selectedNoteData.pdfUrl);
        const blob = await response.blob();
        const file = new File([blob], `${selectedNoteData.title}.pdf`, {
          type: "application/pdf",
        });

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${RAG_API_BASE}/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          setRagMessages([
            {
              role: "assistant",
              content: `✅ Successfully loaded "${selectedNoteData.title}"!\n\n📊 Processed ${data.chunk_count} chunks with ${data.total_characters.toLocaleString()} characters.\n\n💬 How can I help you with this document?\n\n• "Summarize the entire document"\n• "Explain page 5"\n• "What is discussed on page 3?"\n• "Summarize pages 10-15"\n• "Answer questions about specific topics"\n• "Extract key points from page 7"\n\n💡 Tip: You can ask about specific page numbers!\n\nWhat would you like to know?`,
              timestamp: Date.now(),
            },
          ]);
          await fetchRAGStatus();
        } else {
          setRagMessages([
            {
              role: "assistant",
              content: `❌ Failed to upload document: ${data.message}\n\nPlease try uploading manually using the upload button below.`,
              timestamp: Date.now(),
            },
          ]);
        }
      } catch (error) {
        console.error("Auto-upload failed:", error);
        setRagMessages([
          {
            role: "assistant",
            content: `❌ Failed to upload document.\n\nPlease try uploading manually using the upload button below.`,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsUploading(false);
      }
    } else if (
      selectedNoteData.fileType === "text" &&
      selectedNoteData.content
    ) {
      // For text notes, offer direct help (no RAG upload needed)
      setRagMessages([
        {
          role: "assistant",
          content: `📝 Analyzing "${selectedNoteData.title}"\n\n💡 For best results, RAG works with PDF documents. However, I can still help you with:\n\n• Summarize this note\n• Explain the concepts\n• Create study questions\n• Highlight key points\n\n📄 Tip: If you have a PDF version of this note, upload it for advanced AI-powered analysis!\n\nWhat would you like me to do?`,
          timestamp: Date.now(),
        },
      ]);
    } else if (ragStatus?.has_document) {
      // Document already loaded
      setRagMessages([
        {
          role: "assistant",
          content: `✅ Document ready: ${ragStatus.pdf_name}\n\nAsk me anything about this document!`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  useEffect(() => {
    if (selectedNoteData?.fileType === "text" && selectedNoteData.content) {
      setNoteContent(selectedNoteData.content);
    }
  }, [selectedNoteData]);

  useEffect(() => {
    fetchRAGStatus();
  }, [fetchRAGStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    if (mainRef.current) {
      animate(mainRef.current.querySelectorAll(".animate-in"), {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(50),
        duration: 500,
        easing: "easeOutExpo",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="lg:ml-64 flex h-screen">
        {/* Left Sidebar - Notes List */}
        <div
          className={`border-r border-white/5 flex flex-col bg-[#0a0a0c] transition-all duration-300 relative ${
            isSidebarCollapsed ? "w-0" : "w-80"
          }`}
        >
          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-20 bg-gray-700 hover:bg-gray-600 rounded-r-lg flex items-center justify-center text-white hover:w-5 transition-all shadow-lg"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>

          {/* Header */}
          <div
            className={`p-4 border-b border-white/5 overflow-hidden ${
              isSidebarCollapsed ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold flex items-center gap-2 whitespace-nowrap">
                <FileText className="w-5 h-5 text-blue-400" />
                My Notes
              </h1>
              <button
                type="button"
                onClick={() => setShowCreateNoteModal(true)}
                className="p-2 bg-blue-500 rounded-lg text-black hover:bg-blue-400"
                title="New Note"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          {/* Notes List */}
          <div
            className={`flex-1 overflow-y-auto p-2 space-y-1 ${
              isSidebarCollapsed ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
          >
            {filteredNotes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notes found</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  type="button"
                  key={note.id}
                  onClick={() => setSelectedNote(note.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all group ${
                    selectedNote === note.id
                      ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm truncate flex items-center gap-1.5">
                      {note.fileType === "pdf" ? (
                        <FileText className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <Code className="w-3.5 h-3.5 text-green-400" />
                      )}
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {note.shared && (
                        <Users className="w-3 h-3 text-blue-400" />
                      )}
                      <MoreVertical className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {note.preview}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-600">
                      {note.updatedAt}
                    </span>
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col" ref={mainRef}>
          {selectedNoteData ? (
            <>
              {/* Header */}
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold">{selectedNoteData.title}</h2>
                  <span className="text-xs text-gray-500">
                    Last edited {selectedNoteData.updatedAt}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      selectedNoteData.fileType === "pdf"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {selectedNoteData.fileType.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedNoteData.fileType === "text" && (
                    <>
                      <button
                        type="button"
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                        title="Add code snippet"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                        title="Add image"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleLoadCurrentNoteToRAG}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-black font-medium hover:opacity-90 flex items-center gap-1.5"
                    title="Use AI Assistant"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span className="text-xs">Use AI</span>
                  </button>
                  <div className="w-px h-6 bg-white/10" />
                  <button
                    type="button"
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {selectedNoteData.fileType === "text" ? (
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full h-full bg-transparent text-sm font-mono resize-none focus:outline-none p-6"
                    placeholder="Start writing..."
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-950/10 to-orange-950/10">
                    {selectedNoteData.pdfUrl ? (
                      <iframe
                        src={selectedNoteData.pdfUrl}
                        className="w-full h-full"
                        title="PDF Viewer"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>PDF Preview</p>
                        <p className="text-xs mt-2">
                          Upload a PDF to view it here
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Select a note to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RAG Plugin Sidebar */}
      {showRAGPlugin && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-[#0a0a0c] border-l border-white/5 z-50 flex flex-col shadow-2xl">
          {/* Plugin Header */}
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-gradient-to-r from-purple-950/30 to-pink-950/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Assistant</h3>
                <p className="text-[10px] text-gray-500">
                  {ragStatus?.has_document
                    ? `${ragStatus.pdf_name} • ${ragStatus.chunk_count} chunks`
                    : "No document"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRAGPlugin(false)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Section - Only show if no document and no current note context */}
          {!ragStatus?.has_document && ragMessages.length === 0 && (
            <div className="p-4 border-b border-white/5">
              <div className="mb-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-400">
                    Upload Document
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">
                  Upload a PDF to enable AI-powered analysis
                </p>
              </div>
              <button
                type="button"
                className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer w-full bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <p className="text-xs font-medium mb-1">Upload PDF</p>
                <p className="text-[10px] text-gray-500">
                  Click to select a file
                </p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              {isUploading && (
                <div className="mt-3 text-center">
                  <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Processing...</p>
                </div>
              )}
            </div>
          )}

          {ragStatus?.has_document && (
            <div className="p-3 border-b border-white/5 bg-purple-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {ragStatus.pdf_name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {ragStatus.chunk_count} chunks
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearRAG}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {ragMessages.length === 0 && !ragStatus?.has_document ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-purple-400 opacity-50" />
                  <p className="text-sm text-gray-400 mb-4">
                    Select "Use AI" on any note to get started
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
                      <Lightbulb className="w-3 h-3 text-yellow-400" />
                      <span className="text-gray-400">Summarize documents</span>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
                      <Zap className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-400">Ask questions</span>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
                      <Brain className="w-3 h-3 text-purple-400" />
                      <span className="text-gray-400">Get explanations</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {ragMessages.map((msg) => (
                  <div
                    key={msg.timestamp}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-black"
                          : "bg-white/5 border border-white/10"
                      } rounded-2xl px-3 py-2`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === "assistant" && (
                          <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="text-xs whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          <div
                            className={`text-[10px] mt-1 ${
                              msg.role === "user"
                                ? "text-black/60"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleAskQuestion}
            className="p-3 border-t border-white/5 bg-black/20"
          >
            <div className="relative">
              <input
                type="text"
                value={ragInput}
                onChange={(e) => setRagInput(e.target.value)}
                placeholder="Ask a question or request a summary..."
                disabled={isAsking}
                className="w-full pl-3 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!ragInput.trim() || isAsking}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                {isAsking ? (
                  <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3 text-black" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create/Upload Note Modal */}
      {showCreateNoteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Upload Note</h3>
              <button
                type="button"
                onClick={() => setShowCreateNoteModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer w-full bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF or Text files (.txt, .md)
              </p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleUploadNote}
              className="hidden"
            />

            {uploadingNote && (
              <div className="mt-4 text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Uploading note...</p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <FileText className="w-4 h-4 text-red-400 mb-1" />
                <div className="font-medium">PDF Files</div>
                <div className="text-gray-500">View-only</div>
              </div>
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Code className="w-4 h-4 text-green-400 mb-1" />
                <div className="font-medium">Text Files</div>
                <div className="text-gray-500">Editable</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
