import React, { useState, useEffect } from "react";
import { 
  BookOpen, Search, GraduationCap, Sparkles, Flame, Calendar, Mic, MicOff, 
  Upload, FileText, Bookmark, History, Award, CheckSquare, Printer, 
  BrainCircuit, ExternalLink, HelpCircle, ChevronRight, CheckCircle2, Clock, 
  Trash2, AlertCircle, RefreshCw, Layers, Copy, Check, Languages, MessageSquare,
  Globe, Download, LogOut, Settings, Key
} from "lucide-react";
import { StudyPackage, DocumentSummary, HistoryItem, BookmarkItem } from "./types";
import MindMapVisualizer from "./components/MindMapVisualizer";
import QuizTrainer from "./components/QuizTrainer";
import FlashcardsTrainer from "./components/FlashcardsTrainer";
import ProfessorChatbot from "./components/ProfessorChatbot";
import LoginPage from "./components/LoginPage";
import { PYQ_PAPERS_DATABASE } from "./data/pyqPapers";

export default function App() {
  // Input States
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("4 hours");
  const [examType, setExamType] = useState("Semester Exam");
  const [userNotes, setUserNotes] = useState("");

  // Authentication & API Key States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("Student");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsApiKeyInput, setSettingsApiKeyInput] = useState("");
  
  // RAG / File Upload States
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedContent, setUploadedContent] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Active Workspace / Tab States
  const [activeTab, setActiveTab] = useState<"dashboard" | "study-hub" | "pdf-summarizer" | "bookmarks-history" | "pyq-hub">("dashboard");
  const [studyTab, setStudyTab] = useState<"concept" | "notes" | "mindmap" | "schedule" | "examprep" | "quiz" | "flashcards" | "websites">("concept");
  const [tamilMode, setTamilMode] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // PYQ Hub States
  const [selectedPyqPaperId, setSelectedPyqPaperId] = useState<string>("dbms-gate-2024");
  const [customPyqQuestions, setCustomPyqQuestions] = useState("");
  const [solverLoading, setSolverLoading] = useState(false);
  const [solvedPyqResult, setSolvedPyqResult] = useState<any | null>(null);
  const [pyqSearchQuery, setPyqSearchQuery] = useState("");

  // Generated Data States
  const [studyPackage, setStudyPackage] = useState<StudyPackage | null>(null);
  const [summaryData, setSummaryData] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Doubt Chatbot Sidebar Visibility
  const [showChatbot, setShowChatbot] = useState(false);

  // Gamification & Persistent States (Stored in localStorage)
  const [streakCount, setStreakCount] = useState(3);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [bookmarksList, setBookmarksList] = useState<BookmarkItem[]>([]);
  const [completedScheduleTasks, setCompletedScheduleTasks] = useState<Record<string, boolean>>({});

  // Voice Search / Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [voiceSearchTarget, setVoiceSearchTarget] = useState<"subject" | "topic">("topic");

  // Document summarizer raw paste state
  const [summarizerText, setSummarizerText] = useState("");
  const [summarizerFileName, setSummarizerFileName] = useState("Pasted Textbook Content");

  // Speech Recognition Setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        if (voiceSearchTarget === "subject") {
          setSubject(result);
        } else {
          setTopic(result);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [voiceSearchTarget]);

  // Load persistence on mount
  useEffect(() => {
    const savedStreak = localStorage.getItem("study_streak");
    if (savedStreak) setStreakCount(parseInt(savedStreak, 10));
    else {
      localStorage.setItem("study_streak", "3");
    }

    const savedHistory = localStorage.getItem("study_history");
    if (savedHistory) setHistoryList(JSON.parse(savedHistory));

    const savedBookmarks = localStorage.getItem("study_bookmarks");
    if (savedBookmarks) setBookmarksList(JSON.parse(savedBookmarks));

    const loggedIn = localStorage.getItem("user_logged_in") === "true";
    if (loggedIn) {
      setIsLoggedIn(true);
      const user = localStorage.getItem("username") || "Student";
      setCurrentUser(user);
      const key = localStorage.getItem("gemini_api_key") || "";
      setGeminiApiKey(key);
      setSettingsApiKeyInput(key);
    }
  }, []);

  // Voice recognition toggle
  const toggleListening = (target: "subject" | "topic") => {
    if (!SpeechRecognition) {
      alert("Voice search (Web Speech API) is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    setVoiceSearchTarget(target);

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Handle local file reading for RAG
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "rag" | "summary") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (target === "rag") {
        setUploadedFileName(file.name);
        setUploadedContent(content);
      } else {
        setSummarizerFileName(file.name);
        setSummarizerText(content);
      }
      setUploadLoading(false);
    };
    reader.onerror = () => {
      alert("Error reading file");
      setUploadLoading(false);
    };
    reader.readAsText(file);
  };

  // Quick sample prompts
  const loadSuggestion = (s: string, t: string) => {
    setSubject(s);
    setTopic(t);
  };

  // Call the core generate API
  const handleGenerateStudyPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please specify a topic name to generate resources.");
      return;
    }

    setLoading(true);
    setError(null);
    setCompletedScheduleTasks({});

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(geminiApiKey ? { "x-gemini-api-key": geminiApiKey } : {})
        },
        body: JSON.stringify({
          subject: subject || "General Study",
          topic,
          duration,
          examType,
          uploadedContent: uploadedContent || undefined,
          userNotes: userNotes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to contact university study server");
      }

      const data: StudyPackage = await response.json();
      setStudyPackage(data);
      setStudyTab("concept");
      setActiveTab("study-hub");

      // Update history in state & localStorage
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        subject: subject || "General",
        topic,
        duration,
        examType,
        timestamp: new Date().toLocaleDateString(),
        data: data,
      };

      const updatedHistory = [newHistoryItem, ...historyList.slice(0, 19)];
      setHistoryList(updatedHistory);
      localStorage.setItem("study_history", JSON.stringify(updatedHistory));

      // Increase Streak Count!
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem("study_streak", newStreak.toString());
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection timed out. Please verify your GEMINI_API_KEY.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    if (!studyPackage) return;

    const isBookmarked = bookmarksList.some((b) => b.data.topic.toLowerCase() === studyPackage.topic.toLowerCase());

    let updatedBookmarks: BookmarkItem[] = [];
    if (isBookmarked) {
      updatedBookmarks = bookmarksList.filter((b) => b.data.topic.toLowerCase() !== studyPackage.topic.toLowerCase());
    } else {
      const newBookmark: BookmarkItem = {
        id: Date.now().toString(),
        subject: subject || "General",
        topic: studyPackage.topic,
        timestamp: new Date().toLocaleDateString(),
        data: studyPackage,
      };
      updatedBookmarks = [newBookmark, ...bookmarksList];
    }

    setBookmarksList(updatedBookmarks);
    localStorage.setItem("study_bookmarks", JSON.stringify(updatedBookmarks));
  };

  // Load a saved item from history or bookmarks
  const loadSavedItem = (savedData: StudyPackage) => {
    setStudyPackage(savedData);
    setSubject("");
    setTopic(savedData.topic);
    setStudyTab("concept");
    setActiveTab("study-hub");
  };

  // Remove individual item from history or bookmarks
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = historyList.filter((item) => item.id !== id);
    setHistoryList(filtered);
    localStorage.setItem("study_history", JSON.stringify(filtered));
  };

  const deleteBookmarkItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = bookmarksList.filter((item) => item.id !== id);
    setBookmarksList(filtered);
    localStorage.setItem("study_bookmarks", JSON.stringify(filtered));
  };

  // Submit textbook summarizer document
  const handleSummarizeDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summarizerText.trim()) {
      alert("Please upload a file or paste textbook content first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/summarize-document", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(geminiApiKey ? { "x-gemini-api-key": geminiApiKey } : {})
        },
        body: JSON.stringify({
          fileContent: summarizerText,
          fileName: summarizerFileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize textbook document.");
      }

      const data: DocumentSummary = await response.json();
      setSummaryData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate textbook summary.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Print to save as beautiful formatted PDF
  const triggerPdfPrint = () => {
    window.print();
  };

  // Toggle checklist for schedule timeline
  const toggleScheduleTask = (phase: string) => {
    setCompletedScheduleTasks((prev) => ({
      ...prev,
      [phase]: !prev[phase],
    }));
  };

  // Simulate copying code block
  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleLoginSuccess = (username: string, apiKey?: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    if (apiKey) {
      setGeminiApiKey(apiKey);
      setSettingsApiKeyInput(apiKey);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_logged_in");
    localStorage.removeItem("username");
    localStorage.removeItem("gemini_api_key");
    setIsLoggedIn(false);
    setCurrentUser("Student");
    setGeminiApiKey("");
    setSettingsApiKeyInput("");
    setStudyPackage(null);
    setSummaryData(null);
    setActiveTab("dashboard");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(settingsApiKeyInput.trim());
    if (settingsApiKeyInput.trim()) {
      localStorage.setItem("gemini_api_key", settingsApiKeyInput.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
    }
    setShowSettingsModal(false);
  };

  // Render a clean printable header for window.print()
  const currentYear = new Date().getFullYear();

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col selection:bg-slate-700/50">
      
      {/* GLOBAL NAVBAR / HEADER */}
      <header className="bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 px-6 mt-4 mx-4 md:mx-6 no-print shrink-0 sticky top-4 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold tracking-tight text-white">Smart Study Assistant</h1>
              <p className="text-[10px] text-blue-400 font-medium">College Exam Prep Workspace</p>
            </div>
          </div>

          {/* Core Analytics Tracker */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Study Streak */}
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              {streakCount} Day Streak
            </div>

            {/* Exam Countdown */}
            <div className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/40 py-1.5 px-3 rounded-full text-slate-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">Exam Mode Active</span>
            </div>

            {/* User Session & Settings Actions */}
            <div className="flex items-center gap-2 bg-slate-900/85 p-1 rounded-xl border border-slate-700/50">
              <span className="px-2 py-1 text-slate-400 font-mono text-[10px] uppercase font-bold border-r border-slate-850">
                User: <span className="text-white font-sans text-xs lowercase font-normal">{currentUser}</span>
              </span>
              <button
                onClick={() => setShowSettingsModal(true)}
                title="API Settings"
                className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-blue-400 transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Navigation Toggles */}
            <nav className="flex flex-wrap items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/50">
              <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`py-1.5 px-3 rounded-lg font-medium transition-all ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                Topic Generator
              </button>
              <button 
                onClick={() => {
                  if (studyPackage) setActiveTab("study-hub");
                  else alert("Generate a study package first using the Topic Generator!");
                }} 
                className={`py-1.5 px-3 rounded-lg font-medium transition-all ${activeTab === "study-hub" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"} ${!studyPackage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Study Workspace
              </button>
              <button 
                onClick={() => setActiveTab("pdf-summarizer")} 
                className={`py-1.5 px-3 rounded-lg font-medium transition-all ${activeTab === "pdf-summarizer" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                Textbook Summarizer
              </button>
              <button 
                onClick={() => setActiveTab("bookmarks-history")} 
                className={`py-1.5 px-3 rounded-lg font-medium transition-all ${activeTab === "bookmarks-history" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                Saved Resources ({bookmarksList.length})
              </button>
              <button 
                onClick={() => setActiveTab("pyq-hub")} 
                className={`py-1.5 px-3 rounded-lg font-medium transition-all ${activeTab === "pyq-hub" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                PYQ Hub & Resources
              </button>
            </nav>
          </div>

        </div>
      </header>

      {/* DETAILED PRINTABLE HEADER (Only visible during PDF printing) */}
      <div className="hidden print:block p-6 border-b-2 border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-slate-900">Academic Revision Notes</h1>
            <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString()} via Smart Study Assistant</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">Topic: {studyPackage?.topic || topic}</p>
            <p className="text-xs text-slate-500">Target: {examType} ({duration} revision)</p>
          </div>
        </div>
      </div>

      {/* MAIN APPLICATION WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 print:p-0">
        
        {/* TAB 1: GENERATOR DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Input Form Column */}
            <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 rounded-3xl p-6 backdrop-blur-xs">
              <div className="flex items-center gap-2.5 mb-5">
                <BrainCircuit className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Generate Structured Study Resource</h3>
                  <p className="text-xs text-slate-400">Input subject & topic. The AI Professor compiles notes, calendars, PYQs, and interactive quizzes.</p>
                </div>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <div>
                    <span className="font-bold">Generation Error:</span>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleGenerateStudyPackage} className="space-y-4">
                
                {/* Subject Name with Voice Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Subject / Course Name</span>
                    <span className="text-[10px] text-slate-500 capitalize normal-case font-medium">e.g. Data Structures & Algorithms</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Database Management Systems (DBMS)"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-950/85 border border-slate-700 text-slate-200 placeholder:text-slate-500 hover:border-slate-600 focus:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-xl py-3 pl-4 pr-11 text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleListening("subject")}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                        isListening && voiceSearchTarget === "subject" 
                          ? "bg-rose-500 text-white animate-bounce" 
                          : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                      }`}
                    >
                      {isListening && voiceSearchTarget === "subject" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Topic Name with Voice Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Specific Topic Name *</span>
                    <span className="text-[10px] text-slate-500 capitalize normal-case font-medium">e.g. Normalization (1NF to BCNF)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. B-Trees and B+ Trees indexing"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-slate-950/85 border border-slate-700 text-white placeholder:text-slate-500 hover:border-slate-600 focus:bg-slate-950 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 rounded-xl py-3 pl-4 pr-11 text-sm outline-none transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => toggleListening("topic")}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                        isListening && voiceSearchTarget === "topic" 
                          ? "bg-rose-500 text-white animate-bounce" 
                          : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                      }`}
                    >
                      {isListening && voiceSearchTarget === "topic" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                  {isListening && (
                    <p className="mt-1 text-xs text-rose-400 font-medium animate-pulse">
                      Listening... Dictate your study topic now into your microphone.
                    </p>
                  )}
                </div>

                {/* Duration and Exam Type row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Revision Time Available
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-950/85 border border-slate-700 text-slate-200 focus:bg-slate-950 focus:border-blue-500 rounded-xl py-3 px-4 text-sm outline-none transition-all cursor-pointer"
                    >
                      <option value="2 hours" className="bg-slate-950">2 Hours (Super Fast Sprint)</option>
                      <option value="4 hours" className="bg-slate-950">4 Hours (Standard Review)</option>
                      <option value="1 day" className="bg-slate-950">1 Day (Deep Intensive Prep)</option>
                      <option value="3 days" className="bg-slate-950">3 Days (Full Exam Masterclass)</option>
                      <option value="1 week" className="bg-slate-950">1 Week (Term Syllabus Coverage)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Exam Target Type
                    </label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full bg-slate-950/85 border border-slate-700 text-slate-200 focus:bg-slate-950 focus:border-blue-500 rounded-xl py-3 px-4 text-sm outline-none transition-all cursor-pointer"
                    >
                      <option value="Semester Final Exam" className="bg-slate-950">University Semester End Exam</option>
                      <option value="Midterm Class Assessment" className="bg-slate-950">Midterm / In-Semester Test</option>
                      <option value="Technical Job Interview" className="bg-slate-950">Tech Interview & Coding Round</option>
                      <option value="Competitive Exam (GATE / UPSC)" className="bg-slate-950">Competitive Exams (GATE, etc.)</option>
                      <option value="Practical Viva Voce" className="bg-slate-950">Practical Lab Viva-Voce</option>
                    </select>
                  </div>

                </div>

                {/* Student Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Personal Notes / Weak Areas (Optional)</span>
                    <span className="text-[10px] text-slate-500 font-medium">Add questions or emphasis areas</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., 'Focus more on 3NF vs BCNF and decomposition rules, as I failed this in my internals.'"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="w-full bg-slate-950/85 border border-slate-700 text-slate-200 hover:border-slate-600 focus:bg-slate-950 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm outline-none transition-all resize-none font-medium"
                  />
                </div>

                {/* RAG GROUNDING ATTACHMENT */}
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic RAG Context alignment</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        Upload custom university syllabus, past papers, or class notes (TXT/Markdown/Raw PDF dumps) to ground the generated questions and timeline in your exact college's curriculums!
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-200 transition-colors inline-flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          Choose Reference Document
                          <input
                            type="file"
                            accept=".txt,.md,.json,.csv"
                            onChange={(e) => handleFileUpload(e, "rag")}
                            className="hidden"
                          />
                        </label>
                        {uploadLoading ? (
                          <span className="text-xs text-slate-400 animate-pulse">Reading file data...</span>
                        ) : uploadedFileName ? (
                          <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 py-1 px-2.5 border border-emerald-500/20 rounded-lg font-medium">
                            <span className="font-semibold truncate max-w-xs">{uploadedFileName}</span>
                            <button 
                              type="button" 
                              onClick={() => { setUploadedFileName(""); setUploadedContent(""); }}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">No document attached (Will use global professor models)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-blue-500/30"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Professor is compiling study resources. Please wait (15-20s)...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      Compile structured study package
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Quick Suggestions and Stats Column */}
            <div className="space-y-6">
              
              {/* Quick suggestions */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 backdrop-blur-xs">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 font-display">Topic Cheat Prompts</h4>
                <div className="space-y-2.5">
                  {[
                    { sub: "Computer Science", topic: "DBMS Normalization (1NF to BCNF)", icon: "💾" },
                    { sub: "Data Structures", topic: "Dijkstra's Shortest Path Algorithm", icon: "🌐" },
                    { sub: "Operating Systems", topic: "Process Synchronization & Semaphores", icon: "⚙️" },
                    { sub: "Object Oriented Programming", topic: "Polymorphism & Abstract Interfaces", icon: "💎" },
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadSuggestion(sug.sub, sug.topic)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl border border-slate-700/50 bg-slate-900/40 hover:border-blue-500/50 hover:bg-slate-800/50 text-left transition-all group"
                    >
                      <span className="text-lg">{sug.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">{sug.sub}</span>
                        <span className="block text-xs font-semibold text-slate-200 truncate group-hover:text-blue-400">{sug.topic}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 mt-1.5 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Instructions / Viva Voce Tips */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 backdrop-blur-xs relative overflow-hidden text-slate-200">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                <GraduationCap className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="text-sm font-bold mb-2 text-white font-display">Major Viva-Voce tip!</h4>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Instead of generating mock previous questions, use the <strong>RAG Alignment</strong> tool. Upload past university midterm or end-semester papers. 
                  This proves to the external viva reviewers that your system leverages genuine local college data for targeted exam retrieval!
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ACTIVE STUDY WORKSPACE (BENTO COLLAGE) */}
        {activeTab === "study-hub" && studyPackage && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-4 no-print">
              <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-4 backdrop-blur-xs">
                
                {/* Active topic detail card */}
                <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-2xl mb-4 text-center">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Currently Studying</span>
                  <h3 className="text-sm font-bold text-white leading-tight mt-1 truncate">{studyPackage.topic}</h3>
                  <div className="flex justify-center items-center gap-2 mt-3">
                    <button
                      onClick={handleToggleBookmark}
                      className={`flex items-center gap-1 py-1 px-2.5 rounded-lg border text-[10px] font-bold transition-all ${
                        bookmarksList.some((b) => b.data.topic.toLowerCase() === studyPackage.topic.toLowerCase())
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300"
                      }`}
                    >
                      <Bookmark className="w-3 h-3 fill-current" />
                      {bookmarksList.some((b) => b.data.topic.toLowerCase() === studyPackage.topic.toLowerCase()) ? "Bookmarked" : "Bookmark"}
                    </button>
                    <button
                      onClick={triggerPdfPrint}
                      className="flex items-center gap-1 py-1 px-2.5 rounded-lg border border-slate-700 hover:bg-slate-750 bg-slate-800 text-slate-300 text-[10px] font-bold transition-all"
                    >
                      <Printer className="w-3 h-3" />
                      Export notes
                    </button>
                  </div>
                </div>

                {/* Resource List Items */}
                <div className="space-y-1">
                  {[
                    { id: "concept", label: "Concept Master", icon: BookOpen, desc: "Bilingual Metaphoric Guide" },
                    { id: "notes", label: "Exam notes", icon: FileText, desc: "Bullets & Common Mistakes" },
                    { id: "mindmap", label: "Interactive Mind Map", icon: BrainCircuit, desc: "Collapsible taxonomy tree" },
                    { id: "schedule", label: "Revision schedule", icon: Clock, desc: "Hourly step timeline plan" },
                    { id: "examprep", label: "Exam Prep & PYQs", icon: Award, desc: "Grades, keys & solution snippets" },
                    { id: "quiz", label: "Adaptive Quiz", icon: HelpCircle, desc: "Self assessment test" },
                    { id: "flashcards", label: "Flashcards Trainer", icon: Layers, desc: "Spaced repetition deck" },
                    { id: "websites", label: "Lectures & references", icon: ExternalLink, desc: "Syllabus, videos & Web" },
                  ].map((subtab) => {
                    const Icon = subtab.icon;
                    return (
                      <button
                        key={subtab.id}
                        onClick={() => setStudyTab(subtab.id as any)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                          studyTab === subtab.id 
                            ? "bg-slate-900 border border-slate-700 text-white shadow-sm" 
                            : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${studyTab === subtab.id ? "bg-blue-600 text-white" : "bg-slate-800 border border-slate-700 text-slate-400"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold leading-tight">{subtab.label}</span>
                          <span className={`block text-[9px] leading-none mt-0.5 ${studyTab === subtab.id ? "text-slate-300" : "text-slate-500"}`}>{subtab.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Toggle chatbot trigger */}
                <button
                  onClick={() => setShowChatbot(!showChatbot)}
                  className="w-full mt-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {showChatbot ? "Hide Prof. Chatbot" : "Ask Prof. Doubt-Solver"}
                </button>

              </div>
            </div>

            {/* Workspace Center Content */}
            <div className={`lg:col-span-3 ${showChatbot ? "xl:col-span-2" : "xl:col-span-3"} print:col-span-4 space-y-6`}>
              
              {/* TAB SUBSECTIONS */}
              {studyTab === "concept" && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card animate-fadeIn text-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base font-bold text-white font-display">Concept Master — Simple Explanation</h3>
                    </div>

                    {/* Bilingual English / Tamil Language Toggle */}
                    <button
                      onClick={() => setTamilMode(!tamilMode)}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-xs font-bold transition-all no-print ${
                        tamilMode 
                          ? "bg-blue-600 border-blue-700 text-white shadow-sm" 
                          : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      {tamilMode ? "Tamil bilingual on" : "Show Tamil Translation"}
                    </button>
                  </div>

                  {/* English Concept Text */}
                  <div className="prose prose-sm max-w-none text-slate-300 leading-relaxed text-xs md:text-sm whitespace-pre-line">
                    {studyPackage.simple_explanation}
                  </div>

                  {/* Tamil Bilingual Box (revealed when tamilMode is true) */}
                  {tamilMode && studyPackage.tamil_explanation && (
                    <div className="mt-6 p-5 bg-slate-900/60 border border-slate-700/50 rounded-2xl animate-fadeIn">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                        <Languages className="w-4 h-4" /> bilingual Tamil Explanation (தமிழ் விளக்கம்)
                      </h4>
                      <p className="text-xs md:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                        {studyPackage.tamil_explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {studyTab === "notes" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Exam-Ready bullet notes */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card text-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base font-bold text-white font-display">Exam-Ready Short Notes</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {studyPackage.short_notes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cheat sheet text */}
                  {studyPackage.cheat_sheet && (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card text-slate-200">
                      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                        <h3 className="text-base font-bold text-white font-display">Syllabus Formulas & Cheat Sheet</h3>
                      </div>
                      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 overflow-x-auto">
                        <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {studyPackage.cheat_sheet}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Common Student Mistakes */}
                  {studyPackage.common_mistakes && studyPackage.common_mistakes.length > 0 && (
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 shadow-sm print-card text-slate-200">
                      <div className="flex items-center gap-2 border-b border-rose-500/10 pb-3 mb-4">
                        <AlertCircle className="w-5 h-5 text-rose-400 animate-bounce" />
                        <h3 className="text-base font-bold text-rose-400 font-display">Common Academic Mistakes & How to Avoid</h3>
                      </div>
                      <ul className="space-y-3">
                        {studyPackage.common_mistakes.map((mistake, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300">
                            <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500/30 mt-1 shrink-0 flex items-center justify-center font-bold text-[8px] text-rose-300">{i+1}</span>
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}

              {studyTab === "mindmap" && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card animate-fadeIn text-slate-200">
                  <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                    <BrainCircuit className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-bold text-white font-display">Visual Taxonomy Taxonomy Mind Map</h3>
                  </div>
                  <MindMapVisualizer node={studyPackage.mind_map} />
                </div>
              )}

              {studyTab === "schedule" && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card animate-fadeIn text-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base font-bold text-white font-display">Revision schedule timeline ({duration} available)</h3>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 py-1 px-2.5 border border-emerald-500/20 rounded-xl flex items-center gap-1.5 animate-fadeIn">
                      <CheckSquare className="w-3.5 h-3.5" />
                      {Object.values(completedScheduleTasks).filter(Boolean).length} / {studyPackage.study_schedule.length} Completed
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-6">
                    We calibrated this study route exactly for {duration}. Tick the checkboxes as you complete each study block to build momentum.
                  </p>

                  <div className="relative pl-6 space-y-6">
                    {/* Continuous vertical timeline connector line */}
                    <div className="absolute left-3 top-2 bottom-5 w-[1px] bg-slate-700" />

                    {studyPackage.study_schedule.map((task, i) => {
                      const isDone = completedScheduleTasks[task.phase];
                      return (
                        <div key={i} className={`relative flex gap-4 ${isDone ? "opacity-60" : ""} transition-opacity`}>
                          
                          {/* Circle indicators */}
                          <div 
                            onClick={() => toggleScheduleTask(task.phase)}
                            className={`absolute -left-5 top-1 w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center transition-all ${
                              isDone ? "bg-emerald-500 border-emerald-600 text-white" : "bg-slate-900 border-slate-700 text-transparent"
                            }`}
                          >
                            {isDone && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                          </div>

                          <div className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-display">{task.phase} — {task.duration}</span>
                              <span className="text-xs font-semibold text-slate-300">{task.focus}</span>
                            </div>
                            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                              {task.activity}
                            </p>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {studyTab === "examprep" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Previous year questions */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card text-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                      <Award className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base font-bold text-white font-display">College Previous Year Questions (PYQs)</h3>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      Below are simulated/retrieved questions from previous university test patterns matching this specific syllabus structure:
                    </p>

                    <div className="space-y-4">
                      {studyPackage.previous_year_questions.map((pyq, idx) => (
                        <div key={idx} className="border border-slate-700 rounded-2xl p-4 bg-slate-900/60">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              University Exam {pyq.year} — {pyq.exam_type || "Semester Exam"}
                            </span>
                            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                              {pyq.marks} Marks
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white leading-snug mb-3">
                            Q{idx + 1}: {pyq.question}
                          </h4>
                          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mb-1 font-display">
                              Professor's Answer Guide & key Steps:
                            </span>
                            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-medium">
                              {pyq.answer_guide}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interview questions */}
                  {studyPackage.interview_questions && studyPackage.interview_questions.length > 0 && (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card text-slate-200">
                      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                        <h3 className="text-base font-bold text-white font-display">Syllabus technical Interview Questions</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {studyPackage.interview_questions.map((item, idx) => (
                          <div key={idx} className="space-y-1.5 text-xs md:text-sm">
                            <h4 className="font-semibold text-white font-display">Q: {item.question}</h4>
                            <p className="text-slate-350 leading-relaxed font-medium">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coding problem with execution box */}
                  {studyPackage.coding_problems && studyPackage.coding_problems.length > 0 && (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card text-slate-200">
                      <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <h3 className="text-base font-bold font-display text-white">Coding Playground Snippets</h3>
                      </div>

                      <div className="space-y-6">
                        {studyPackage.coding_problems.map((problem, i) => (
                          <div key={i} className="border-t border-slate-750 pt-4 first:border-none first:pt-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <h4 className="text-sm font-bold text-blue-400 font-display">
                                {problem.title}
                              </h4>
                              <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-900 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                                {problem.language || "code"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed mb-3">
                              {problem.problem_statement}
                            </p>

                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto relative mb-3 group">
                              {/* Copy button */}
                              <button
                                onClick={() => handleCopyCode(problem.solution_code, i)}
                                className="absolute right-3 top-3 bg-slate-800 hover:bg-blue-600 p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-all no-print"
                                title="Copy Code"
                              >
                                {copiedCodeIndex === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              
                              <pre className="text-xs font-mono text-slate-200">
                                {problem.solution_code}
                              </pre>
                            </div>

                            <div className="bg-slate-900/80 border border-slate-850 p-3 rounded-xl text-xs">
                              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mb-1 font-display">Code Explanation:</span>
                              <p className="text-slate-300 leading-relaxed font-medium">
                                {problem.explanation}
                              </p>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {studyTab === "quiz" && (
                <div className="quiz-section animate-fadeIn">
                  <QuizTrainer questions={studyPackage.quiz_questions} />
                </div>
              )}

              {studyTab === "flashcards" && (
                <div className="animate-fadeIn">
                  {/* Map generated quiz questions or short notes into flashcards if studyPackage lacks dedicated flashcards */}
                  <FlashcardsTrainer 
                    flashcards={studyPackage.quiz_questions.map((q) => ({
                      front: q.question,
                      back: `Correct answer: ${q.options[q.correct_answer_index]}. Explanation: ${q.explanation}`
                    }))} 
                  />
                </div>
              )}

              {studyTab === "websites" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* YouTube channels */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card text-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                      <ExternalLink className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base font-bold text-white font-display">Recommended YouTube Video Lectures</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studyPackage.youtube_recommendations.map((video, i) => (
                        <div key={i} className="border border-slate-700 rounded-2xl p-4 bg-slate-900/60 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mb-1 font-display">REPUTABLE CHANNEL</span>
                            <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">{video.channel}</h4>
                            <p className="text-xs text-slate-350 mb-4 leading-relaxed font-medium">{video.reason}</p>
                          </div>
                          
                          <a 
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.search_query)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors inline-block text-center no-print"
                          >
                            Search lectures on YouTube
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Web platforms references */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm print-card text-slate-200">
                    <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                      <ExternalLink className="w-5 h-5 text-blue-400" />
                      <h3 className="text-base font-bold text-white font-display">Academic Web References</h3>
                    </div>

                    <div className="space-y-3">
                      {studyPackage.website_links.map((link, idx) => (
                        <div key={idx} className="p-3 border border-slate-750 rounded-xl bg-slate-900/60 flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-white font-display">{link.site_name}</h4>
                            <p className="text-xs text-slate-350 mt-0.5 leading-relaxed font-medium">{link.description}</p>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold shrink-0 inline-flex items-center gap-1 hover:underline"
                          >
                            Open site <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* FLOATING SIDEBAR: PROFESSOR CHATBOT */}
            {showChatbot && (
              <div className="lg:col-span-4 xl:col-span-1 professor-chat no-print animate-fadeIn">
                <ProfessorChatbot 
                  topic={studyPackage.topic} 
                  context={studyPackage} 
                  onClose={() => setShowChatbot(false)} 
                />
              </div>
            )}

          </div>
        )}

        {/* TAB 3: TEXTBOOK SUMMARIZER */}
        {activeTab === "pdf-summarizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Input Form Column */}
            <div className="lg:col-span-1 bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm h-fit text-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white font-display">Textbook Summarizer</h3>
              </div>
              
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Paste long chapters, transcripts, or notes, or upload a reference file to generate instant summaries, key takeaways, and flashcard recall aids.
              </p>

              <form onSubmit={handleSummarizeDocument} className="space-y-4">
                
                {/* File Upload Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Upload Note File
                  </label>
                  <label className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 border-2 border-dashed border-slate-700 p-4 rounded-2xl text-center transition-colors block">
                    <Upload className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <span className="block text-xs font-bold text-slate-200">Choose file (.txt, .md, .csv)</span>
                    <span className="block text-[10px] text-slate-500 mt-1">Direct text reader</span>
                    <input
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      onChange={(e) => handleFileUpload(e, "summary")}
                      className="hidden"
                    />
                  </label>
                  {uploadLoading && (
                    <span className="text-xs text-slate-400 mt-1 animate-pulse block">Reading file content...</span>
                  )}
                </div>

                {/* Document Name input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Document Title / Label
                  </label>
                  <input
                    type="text"
                    required
                    value={summarizerFileName}
                    onChange={(e) => setSummarizerFileName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 text-slate-200 focus:bg-slate-950 focus:border-blue-500 rounded-xl py-2.5 px-3 text-xs outline-none transition-all font-medium"
                  />
                </div>

                {/* Raw Paste Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Paste Textbook Text (Up to 45,000 characters)
                  </label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Paste the raw text of the chapter or lecture notes here..."
                    value={summarizerText}
                    onChange={(e) => setSummarizerText(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 text-slate-200 hover:border-slate-650 focus:bg-slate-950 focus:border-blue-500 rounded-xl py-2.5 px-3 text-xs outline-none transition-all resize-none font-medium"
                  />
                  <span className="text-[10px] text-slate-500 text-right block mt-1">
                    {summarizerText.length} characters loaded
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !summarizerText.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/30"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analyzing and generating study aids...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Summarize & Generate Study Aids
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Summary Output Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {summaryData ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Detailed Summary */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm text-slate-200">
                    <h3 className="text-base font-bold text-white border-b border-slate-700/50 pb-3 mb-4 font-display">
                      Document analysis: {summaryData.document_title}
                    </h3>
                    <div className="prose prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-xs md:text-sm">
                      {summaryData.summary}
                    </div>
                  </div>

                  {/* Bullet points & Key terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm text-slate-200">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 font-display">Key Takeaways</h4>
                      <ul className="space-y-2.5">
                        {summaryData.key_takeaways.map((takeaway, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm text-slate-200">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 font-display">Formulas & Key Terms</h4>
                      <div className="space-y-3">
                        {summaryData.formulas_or_key_terms.map((item, i) => (
                          <div key={i} className="text-xs">
                            <strong className="text-blue-400 font-bold block">{item.term}</strong>
                            <span className="text-slate-300 font-medium">{item.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Document Flashcards */}
                  {summaryData.generated_flashcards && summaryData.generated_flashcards.length > 0 && (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm text-slate-200">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 text-center font-display">Generated Lecture Flashcards</h4>
                      <FlashcardsTrainer flashcards={summaryData.generated_flashcards} />
                    </div>
                  )}

                  {/* Sample Mock Exam Questions */}
                  <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm text-slate-200">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 font-display">AI Generated Textbook Questions</h4>
                    <div className="space-y-4">
                      {summaryData.generated_questions.map((item, i) => (
                        <div key={i} className="border-t border-slate-750 pt-3 first:border-none first:pt-0 text-xs">
                          <strong className="text-white block mb-1">Q: {item.question}</strong>
                          <p className="text-slate-300 leading-relaxed font-medium">A: {item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <FileText className="w-16 h-16 text-slate-650 mb-4" />
                  <h3 className="text-lg font-bold text-white font-display">No textbook analyzed yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Upload notes or paste reading content in the left panel to trigger summaries and flashcard decks immediately.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 4: BOOKMARKS & SEARCH HISTORY */}
        {activeTab === "bookmarks-history" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            
            {/* Saved Bookmarks */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm text-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                <Bookmark className="w-5 h-5 text-blue-400 fill-blue-400" />
                <h3 className="text-base font-bold text-white font-display">Bookmarked Revision Guides</h3>
              </div>

              {bookmarksList.length > 0 ? (
                <div className="space-y-3">
                  {bookmarksList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadSavedItem(item.data)}
                      className="p-4 border border-slate-700 rounded-2xl bg-slate-900/60 hover:border-blue-500/50 hover:bg-slate-850 cursor-pointer flex items-center justify-between transition-all group animate-fadeIn"
                    >
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.subject}</span>
                        <h4 className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 truncate">{item.topic}</h4>
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono font-medium">Saved on {item.timestamp}</span>
                      </div>
                      <button
                        onClick={(e) => deleteBookmarkItem(item.id, e)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs">No bookmarks saved yet. Use the Bookmark option in Study Workspace tabs!</p>
                </div>
              )}
            </div>

            {/* Recently searched history */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 shadow-sm text-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                <History className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white font-display">Search & Compilation History</h3>
              </div>

              {historyList.length > 0 ? (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadSavedItem(item.data)}
                      className="p-4 border border-slate-700 rounded-2xl bg-slate-900/60 hover:border-blue-500/50 hover:bg-slate-850 cursor-pointer flex items-center justify-between transition-all group animate-fadeIn"
                    >
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.subject}</span>
                        <h4 className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 truncate">{item.topic}</h4>
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono font-medium">Duration: {item.duration} | Target: {item.examType}</span>
                      </div>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <History className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs">Your search history is empty. Compiled topics will show up here.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: PYQ HUB & RESOURCES */}
        {activeTab === "pyq-hub" && (
          <div className="space-y-6 animate-fadeIn text-slate-200">
            {/* Intro Header */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 backdrop-blur-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white font-display">Official PYQ Portals & Curated Papers Library</h2>
              </div>
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                We have collected and organized standard Previous Year Questions (PYQs) from elite national examinations, IITs, and prestigious university portals. 
                Use these curated, highly valuable papers directly inside the Smart Study Assistant to align your study packages with exact collegiate requirements.
              </p>
            </div>

            {/* Split layout: Portals and Integrated Paper Reader */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Official Portals Directory */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 backdrop-blur-xs">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-display flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    Valuable PYQ Portals
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                    Direct access to official academic repositories hosting past years' question papers:
                  </p>
                  
                  <div className="space-y-3">
                    {[
                      {
                        name: "GATE CSE Official",
                        host: "IISc & IIT Joint Committee",
                        desc: "The gold standard of CS concepts. Download official papers & keys for DBMS, Algorithms, OS, Networks, and Math.",
                        url: "https://gate2024.iisc.ac.in/",
                        badge: "Elite National"
                      },
                      {
                        name: "NPTEL Exams Library",
                        host: "IIT Madras Portal",
                        desc: "Massive archive of assignments, midterms, and finals set by top Indian Institute of Technology professors.",
                        url: "https://nptel.ac.in/",
                        badge: "Advanced Coursework"
                      },
                      {
                        name: "CBSE Academic Portal",
                        host: "Central Board of Secondary Ed.",
                        desc: "Official question papers for senior secondary K-12 boards. Excellent for foundational math and computer science.",
                        url: "https://cbseacademic.nic.in/",
                        badge: "School Boards"
                      },
                      {
                        name: "UGC NET Paper Bank",
                        host: "National Testing Agency",
                        desc: "Comprehensive previous year papers for National Eligibility Tests. High theoretical depth in Computer Applications.",
                        url: "https://ugcnet.nta.ac.in/",
                        badge: "University Eligibility"
                      },
                      {
                        name: "AWS Certified Cloud Practice",
                        host: "AWS Training & Certs",
                        desc: "Scenario-based previous exam papers and practice guides for foundational, associate, and professional cloud certs.",
                        url: "https://aws.amazon.com/certification/",
                        badge: "Tech Certification"
                      }
                    ].map((portal, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 border border-slate-700 rounded-2xl bg-slate-900/40 hover:border-blue-500/30 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">{portal.badge}</span>
                            <a 
                              href={portal.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-slate-500 hover:text-blue-400 transition-colors"
                              title="Visit official portal"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <h4 className="text-xs font-bold text-white mb-0.5 leading-tight">{portal.name}</h4>
                          <span className="text-[9px] text-slate-500 font-medium block mb-2">{portal.host}</span>
                          <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{portal.desc}</p>
                        </div>
                        <a 
                          href={portal.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 py-1 rounded-lg text-[10px] font-bold transition-all block"
                        >
                          Visit Official Site
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Integrated Paper Reader */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Paper Selector Card */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 backdrop-blur-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white font-display">Featured Papers Library</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Explore gathered real-world academic exams and solve them step-by-step.</p>
                    </div>
                    
                    {/* Select Dropdown */}
                    <select
                      value={selectedPyqPaperId}
                      onChange={(e) => {
                        setSelectedPyqPaperId(e.target.value);
                        setSolvedPyqResult(null);
                      }}
                      className="bg-slate-950/90 border border-slate-700 text-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-xs outline-none transition-all cursor-pointer font-semibold"
                    >
                      {PYQ_PAPERS_DATABASE.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-950">
                          [{p.year}] {p.subject} ({p.sourceName.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Paper Display */}
                  {(() => {
                    const paper = PYQ_PAPERS_DATABASE.find((p) => p.id === selectedPyqPaperId);
                    if (!paper) return null;

                    return (
                      <div className="space-y-5 animate-fadeIn">
                        
                        {/* Paper Meta Card */}
                        <div className="p-5 border border-slate-750 rounded-2xl bg-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Exam Source</span>
                            <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{paper.sourceName} - {paper.year}</h4>
                            <p className="text-xs text-slate-450 mt-1.5 leading-relaxed max-w-xl">{paper.description}</p>
                            
                            {/* Syllabus badges */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {paper.syllabusHighlights.map((high, i) => (
                                <span key={i} className="text-[9px] bg-slate-800 text-slate-350 py-0.5 px-2 rounded-full border border-slate-700 font-medium">
                                  {high}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                            <a 
                              href={paper.sourceUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-center py-2 px-3.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                              Official Site
                            </a>
                            <button
                              onClick={() => {
                                setSubject(paper.subject);
                                setTopic(paper.topic);
                                setExamType("Competitive Exam (GATE / UPSC)");
                                setActiveTab("dashboard");
                              }}
                              className="text-center py-2 px-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/30"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                              Generate Study Package
                            </button>
                            <button
                              onClick={() => {
                                // Prepopulate textbook summarizer with these questions
                                const fullContent = `SUBJECT: ${paper.subject}\nTOPIC: ${paper.topic}\nSOURCE: ${paper.sourceName} (${paper.year})\n\n` + 
                                  paper.questions.map((q, idx) => `QUESTION ${idx+1} (${q.marks} Marks):\n${q.question}\n\nANSWER GUIDE:\n${q.answer_guide}\n---`).join("\n\n");
                                setSummarizerFileName(`${paper.subject.split(' ')[0]} ${paper.year} Past Questions`);
                                setSummarizerText(fullContent);
                                setActiveTab("pdf-summarizer");
                              }}
                              className="text-center py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/30"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Load in Summarizer
                            </button>
                          </div>
                        </div>

                        {/* Questions list */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected Real Exam Questions ({paper.questions.length})</h4>
                          
                          {paper.questions.map((q, idx) => (
                            <div key={idx} className="p-5 border border-slate-750 rounded-2xl bg-slate-900/30 space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-5 h-5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs flex items-center justify-center rounded-md font-bold shrink-0 mt-0.5">
                                    Q{idx + 1}
                                  </span>
                                  <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>
                                </div>
                                <span className="text-[10px] font-bold bg-slate-850 border border-slate-700 text-slate-400 py-1 px-2.5 rounded-full shrink-0 font-mono">
                                  {q.marks} Marks
                                </span>
                              </div>

                              {/* Answer Guide Block */}
                              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block font-display">Professor's Step-by-Step Scoring Guide</span>
                                <div className="text-xs text-slate-350 whitespace-pre-line leading-relaxed font-medium">
                                  {q.answer_guide}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    );
                  })()}

                </div>

                {/* AI PYQ Solver and Guide Compiler */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 backdrop-blur-xs text-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                    <h3 className="text-base font-bold text-white font-display">AI Custom PYQ Solver & Guide Compiler</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Found questions on a college library website or online portal? Paste them below. 
                    The AI Professor will compile a detailed scoring key with marks distribution, key concepts, formulas, and step-by-step model solutions.
                  </p>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!customPyqQuestions.trim()) return;
                      setSolverLoading(true);
                      setSolvedPyqResult(null);

                      try {
                        const response = await fetch("/api/summarize-document", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            fileContent: `COMPILATION OF PAST YEARS EXAM QUESTIONS TO MASTER & SOLVE:\n\n${customPyqQuestions}`,
                            fileName: "Custom Past Year Question Solved Guide",
                          }),
                        });

                        if (!response.ok) throw new Error("Failed to compile answer keys.");
                        const data = await response.json();
                        setSolvedPyqResult(data);
                      } catch (err: any) {
                        alert(err.message || "Failed to compile custom question guide.");
                      } finally {
                        setSolverLoading(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Paste Raw Exam Questions (Include marks if known)
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="e.g., '1. (10 Marks) State and prove the pumping lemma for regular languages.&#10;2. (5 Marks) Show that the language L = {a^n b^n | n >= 0} is not regular.'"
                        value={customPyqQuestions}
                        onChange={(e) => setCustomPyqQuestions(e.target.value)}
                        className="w-full bg-slate-950/85 border border-slate-700 text-slate-200 hover:border-slate-650 focus:bg-slate-950 focus:border-blue-500 rounded-xl py-3 px-4 text-xs outline-none transition-all resize-none font-medium placeholder:text-slate-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={solverLoading || !customPyqQuestions.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-750 disabled:text-slate-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/30"
                    >
                      {solverLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Analyzing and solving past questions... Please wait (10-15s)
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 text-amber-300 animate-pulse" />
                          Solve Questions & Compile Model Answers
                        </>
                      )}
                    </button>
                  </form>

                  {/* Solved Results */}
                  {solvedPyqResult && (
                    <div className="mt-6 border-t border-slate-700/50 pt-5 space-y-5 animate-fadeIn text-slate-200">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <h4 className="text-sm font-bold text-white font-display">Completed Custom Model Solution Manual</h4>
                      </div>

                      {/* Summary Analysis */}
                      <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-slate-300 text-xs leading-relaxed space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Conceptual Exam Summary</span>
                        <p className="whitespace-pre-line">{solvedPyqResult.summary}</p>
                      </div>

                      {/* Term/Formula Guides */}
                      {solvedPyqResult.formulas_or_key_terms && solvedPyqResult.formulas_or_key_terms.length > 0 && (
                        <div className="p-4 border border-slate-750 rounded-2xl bg-slate-900/60 space-y-3">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Critical Concepts & Scoring Formulas</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {solvedPyqResult.formulas_or_key_terms.map((item: any, idx: number) => (
                              <div key={idx} className="text-xs">
                                <strong className="text-blue-300 font-semibold block">{item.term}</strong>
                                <span className="text-slate-400">{item.definition}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Answers Compilation */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Step-By-Step Answer Schemes</span>
                        {solvedPyqResult.generated_questions && solvedPyqResult.generated_questions.map((item: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-750 rounded-2xl bg-slate-900/40 text-xs space-y-2">
                            <strong className="text-white block leading-relaxed font-display">Question {idx + 1}: {item.question}</strong>
                            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl leading-relaxed text-slate-300 whitespace-pre-line font-medium">
                              {item.answer}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Save to reference guide button */}
                      <button
                        onClick={() => {
                          const mockStudyPackage: StudyPackage = {
                            topic: "Custom Solved Exam Guide",
                            simple_explanation: solvedPyqResult.summary,
                            short_notes: solvedPyqResult.key_takeaways || [],
                            cheat_sheet: solvedPyqResult.summary,
                            common_mistakes: ["Misreading question weights", "Omitting proofs/steps"],
                            mind_map: { name: "Custom Paper", children: [{ name: "Questions Solved" }] },
                            previous_year_questions: solvedPyqResult.generated_questions.map((q: any) => ({
                              question: q.question,
                              year: "Custom Past Paper",
                              exam_type: "Custom Collected Exam",
                              marks: 5,
                              answer_guide: q.answer
                            })),
                            interview_questions: [],
                            coding_problems: [],
                            study_schedule: [{ phase: "Hour 1", duration: "1 Hour", focus: "Review Solutions", activity: "Go over compiled guide" }],
                            quiz_questions: [],
                            youtube_recommendations: [],
                            website_links: []
                          };
                          setStudyPackage(mockStudyPackage);
                          setStudyTab("examprep");
                          setActiveTab("study-hub");
                        }}
                        className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/30"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Load as Active Study Workspace Package
                      </button>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER NO-PRINT */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 text-center no-print mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-6 text-xs text-slate-500">
          <p>© {currentYear} Smart Study Assistant. All university assets are locally persistent.</p>
          <p className="mt-1 text-[10px]">Academic LLM & retrieval workflows align standard curriculum prep goals.</p>
        </div>
      </footer>

      {/* SETTINGS CONFIGURATION MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-800 border-2 border-blue-500 rounded-none shadow-[0_0_15px_rgba(0,207,255,0.3)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">Console Configurations</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono font-bold uppercase cursor-pointer"
              >
                [Close]
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Custom Gemini API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-blue-500/70" />
                  <input
                    type="password"
                    value={settingsApiKeyInput}
                    onChange={(e) => setSettingsApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:outline-none p-2.5 pl-10 text-xs rounded-none text-white transition-all font-mono placeholder:text-slate-800"
                  />
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed pt-1">
                  The API key is saved locally in your browser cache and is sent inside headers for study package compilation.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-slate-950 font-mono font-bold text-xs tracking-widest uppercase transition-all rounded-none border border-blue-400 shadow-[0_4px_10px_rgba(0,207,255,0.15)] flex items-center justify-center gap-2 cursor-pointer"
              >
                Apply Settings
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
