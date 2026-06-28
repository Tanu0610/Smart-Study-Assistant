import React, { useState } from "react";
import { GraduationCap, Sparkles, Key, Lock, User, CheckCircle2 } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (username: string, apiKey?: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all standard credentials.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      if (isLogin) {
        setSuccess("Authenticating...");
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Authentication failed");
        }

        const data = await response.json();
        setSuccess("Login successful!");
        
        setTimeout(() => {
          localStorage.setItem("user_logged_in", "true");
          localStorage.setItem("username", data.username);
          if (customKey.trim()) {
            localStorage.setItem("gemini_api_key", customKey.trim());
          }
          onLoginSuccess(data.username, customKey.trim() || undefined);
        }, 800);
      } else {
        setSuccess("Creating identity...");
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Registration failed");
        }

        setSuccess("Account created successfully! Switching to login...");
        setTimeout(() => {
          setIsLogin(true);
          setPassword("");
          setSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "Connection error. Please try again.");
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 selection:bg-blue-900/30 selection:text-blue-300">
      
      {/* SHARP NEON DECORATIVE BORDERS */}
      <div className="w-full max-w-md bg-slate-800 border-2 border-blue-500 rounded-none shadow-[0_0_15px_rgba(0,207,255,0.2)] overflow-hidden">
        
        {/* LOGO AREA */}
        <div className="p-6 bg-slate-950 border-b border-slate-700 flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-none flex items-center justify-center border-2 border-blue-300 shadow-[0_0_10px_rgba(0,207,255,0.4)]">
            <GraduationCap className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-display font-extrabold tracking-wider text-white uppercase">Smart Study Assistant</h1>
            <p className="text-[10px] text-blue-500 font-mono tracking-widest uppercase font-bold mt-1">College Prep App Shell</p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-700 font-mono">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-none ${
              isLogin 
                ? "bg-slate-800 text-blue-500 border-b-2 border-blue-500" 
                : "bg-slate-950/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-none ${
              !isLogin 
                ? "bg-slate-800 text-blue-500 border-b-2 border-blue-500" 
                : "bg-slate-950/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* FORM PANEL */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
          
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500 text-red-400 text-xs font-mono flex items-center gap-2 rounded-none">
              <span className="font-bold">🚨 ERROR:</span> {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-blue-950/40 border border-blue-500 text-blue-300 text-xs font-mono flex items-center gap-2 rounded-none">
              <CheckCircle2 className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>{success}</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Username or Email</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="enter username"
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:outline-none p-2.5 pl-10 text-sm rounded-none text-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:outline-none p-2.5 pl-10 text-sm rounded-none text-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Optional API Key Input (Shows only for Login tab) */}
          {isLogin && (
            <div className="space-y-1 pt-2 border-t border-slate-700/60">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block">Custom Gemini API Key</label>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-normal">Optional</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-blue-500/70" />
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:outline-none p-2.5 pl-10 text-xs rounded-none text-white transition-all font-mono placeholder:text-slate-700"
                />
              </div>
              <p className="text-[9px] text-slate-500 leading-tight">
                Used to request explanations. Saves securely in your local browser cache.
              </p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-slate-950 font-mono font-bold text-sm tracking-widest uppercase transition-all rounded-none border border-blue-400 shadow-[0_4px_10px_rgba(0,207,255,0.15)] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            {isLogin ? "PROCEED TO CONSOLE" : "GENERATE IDENTITY"}
          </button>

          {/* CREDENTIAL HELPER FOR EASY TESTING */}
          <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
            <span>Test Account: <b>admin</b> / <b>password</b></span>
          </div>

        </form>

      </div>

    </div>
  );
}
