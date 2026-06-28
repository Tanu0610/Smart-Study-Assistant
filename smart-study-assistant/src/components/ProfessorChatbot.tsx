import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, StudyPackage } from "../types";
import { Send, GraduationCap, RefreshCw, X, MessageSquare, AlertCircle } from "lucide-react";

interface ProfessorChatbotProps {
  topic: string;
  context: StudyPackage | null;
  onClose?: () => void;
}

export default function ProfessorChatbot({ topic, context, onClose }: ProfessorChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        id: "greet",
        role: "assistant",
        content: `Greetings! I am your AI Study Professor. I have analyzed your study material for **"${topic || "your selected topic"}"**. 

How can I assist you today? Feel free to:
- Ask me to explain a specific subsection in more detail.
- Request more coding examples (e.g. "Show me C++ solution for this Dijkstra problem").
- Quiz you further on this topic or generate more MCQs.
- Solve an equation or break down exam scoring step-by-step.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [topic]);

  // Scroll to bottom when message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);
    setError(null);

    try {
      const customApiKey = localStorage.getItem("gemini_api_key");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(customApiKey ? { "x-gemini-api-key": customApiKey } : {})
        },
        body: JSON.stringify({
          topic: topic,
          context: context,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I apologize, but I could not formulate an answer. Could you rephrase your doubt?",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError("Doubt resolution connection timed out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "greet-clear",
        role: "assistant",
        content: `Chat history cleared. How else can I help you master **"${topic || "this topic"}"**?`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-[600px] md:max-h-[700px]">
      {/* Sidebar Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="text-sm font-bold">Ask Prof. Doubt-Solver</h4>
            <span className="text-[10px] text-indigo-300">College AI Tutor Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div
              className={`px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs"
              }`}
            >
              {/* Render paragraph spaces properly */}
              <div className="whitespace-pre-line text-xs md:text-sm">{m.content}</div>
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="mr-auto flex items-center gap-2 bg-white border border-slate-200 p-3 rounded-xl rounded-bl-none shadow-xs max-w-[85%]">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
            <span className="text-xs text-slate-500 font-medium">Professor is thinking...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Form Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading}
          placeholder="Ask about normalization, complexity, code details..."
          className="flex-1 text-xs md:text-sm bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg p-2 transition-colors shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
