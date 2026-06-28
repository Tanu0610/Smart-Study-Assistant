import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initializeDatabase, registerUser, verifyUser } from "./db";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies up to 50MB for handling pasted PDF/document content
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI helper to support client-supplied API key
function getGenAI(req: express.Request) {
  const key = (req.headers["x-gemini-api-key"] as string) || process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    throw new Error("GEMINI_API_KEY is missing. Please configure your API key in the application settings.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Auth Endpoint 1: Register a new user in the database
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    await registerUser(username, password);
    res.json({ success: true, message: "User registered successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to register user" });
  }
});

// Auth Endpoint 2: Log in and verify user in the database
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const isValid = await verifyUser(username, password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    res.json({ success: true, username: username });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Authentication error" });
  }
});

// Endpoint 1: Generate Complete Study Package (Topic-based + optional RAG document grounding)
app.post("/api/generate", async (req, res) => {
  try {
    const { subject, topic, duration, examType, uploadedContent, userNotes } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    let ai;
    try {
      ai = getGenAI(req);
    } catch (e: any) {
      return res.status(401).json({ error: e.message });
    }

    let ragPromptText = "";
    if (uploadedContent && uploadedContent.trim().length > 0) {
      ragPromptText = `
CRITICAL RAG DATABASE GROUNDING:
The user has uploaded real university reference materials / previous exam papers.
Use this text as the primary source of truth for the 'previous_year_questions' and notes structure. 
Extract real patterns, definitions, and exact problems from this text:
--- START UPLOADED REFERENCE TEXT ---
${uploadedContent.substring(0, 45000)}
--- END UPLOADED REFERENCE TEXT ---
`;
    }

    const systemInstruction = `You are an elite, world-class university Professor and AI Study Tutor specializing in college-level curriculum preparation.
Your job is to generate a comprehensive, structured study package for college students to master any topic.
Be precise, complete, academic, and highly accurate. Avoid fluff. Always provide actual coding snippets, examples, and formulas for technical/mathematical subjects.`;

    const userPrompt = `
Generate a structured learning resource for the following topic:
Subject: ${subject || "Computer Science / General Education"}
Topic: ${topic}
Study Duration Available: ${duration || "4 hours"}
Target Exam Type: ${examType || "Semester University Exam"}
${userNotes ? `Student notes/custom context: ${userNotes}` : ""}

${ragPromptText}

Strictly generate a single, valid JSON response.
The response must follow this exact typescript schema:
{
  "topic": string,
  "simple_explanation": string (markdown formatting, simple step-by-step concepts, clear metaphors),
  "tamil_explanation": string (A bilingual section: Translate the core concepts into friendly, conversational Tamil/Tamil-English (Tanglish) or pure Tamil, helping vernacular medium students understand easily),
  "short_notes": string[] (bullet points of critical exam-ready notes, definitions, formulas),
  "cheat_sheet": string (markdown format summary sheet, cheat-sheet, or quick reference),
  "common_mistakes": string[] (common conceptual mistakes made by students on exams for this topic, and how to avoid them),
  "mind_map": {
    "name": string,
    "children": Array<{ name: string, children?: Array<{ name: string }> }>
  } (a beautiful hierarchical mind map structure, depth 3, clean taxonomy),
  "previous_year_questions": Array<{
    "question": string,
    "year": string,
    "exam_type": string,
    "marks": number,
    "answer_guide": string (step-by-step key hints/solutions to get full marks)
  }> (Generate 5 realistic previous university exam questions or extract them directly from the RAG grounding above if provided),
  "interview_questions": Array<{
    "question": string,
    "answer": string
  }> (Top 3 crucial technical interview questions for this topic),
  "coding_problems": Array<{
    "title": string,
    "problem_statement": string,
    "solution_code": string (clean implementation inside a code block),
    "language": string,
    "explanation": string
  }> (If the subject is computer science, include 1-2 coding problems. Otherwise, leave empty array []),
  "study_schedule": Array<{
    "phase": string (e.g. "Hour 1" or "Day 1"),
    "duration": string,
    "focus": string,
    "activity": string
  }> (Personalized revision breakdown tailored exactly to the available duration: ${duration}),
  "quiz_questions": Array<{
    "question": string,
    "options": string[] (exactly 4 options),
    "correct_answer_index": number (0-3),
    "explanation": string,
    "difficulty": string ("easy" | "medium" | "hard")
  }> (Exactly 5 diverse multiple-choice questions for checking progress, covering easy, medium, and hard levels),
  "youtube_recommendations": Array<{
    "channel": string,
    "reason": string,
    "search_query": string
  }> (At least 2 highly recommended YouTube channels / search queries for this topic),
  "website_links": Array<{
    "site_name": string,
    "url": string,
    "description": string
  }> (Highly reputable learning sites: e.g. GeeksforGeeks, MDN, Khan Academy, Coursera)
}

DO NOT wrap your JSON in backticks like \`\`\`json. Return RAW JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating study package:", error);
    res.status(500).json({ error: error.message || "Failed to generate study resource" });
  }
});

// Endpoint 2: Doubt-Solving Chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { topic, messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    let ai;
    try {
      ai = getGenAI(req);
    } catch (e: any) {
      return res.status(401).json({ error: e.message });
    }

    const systemInstruction = `You are the AI doubt-solving assistant for college students. 
You are helping the student study the topic: "${topic || "General Subject"}".
Reference Context for the Topic:
---
${JSON.stringify(context || {})}
---
Provide helpful, conversational explanations, solve equations step-by-step, explain code, and clear doubts. Keep your answers easy to read with beautiful markdown formatting and color metaphors where applicable. If the student asks in Tamil, reply in Tamil or Tanglish!`;

    // Convert messages to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to chat" });
  }
});

// Endpoint 3: Document Upload Summary & Flashcard Generator
app.post("/api/summarize-document", async (req, res) => {
  try {
    const { fileContent, fileName } = req.body;

    if (!fileContent) {
      return res.status(400).json({ error: "Document content is required" });
    }

    let ai;
    try {
      ai = getGenAI(req);
    } catch (e: any) {
      return res.status(401).json({ error: e.message });
    }

    const systemInstruction = `You are an expert academic text summarizer. 
Given a student's uploaded document text, generate a beautifully organized summary, key takeaways, and study aids.`;

    const userPrompt = `
Analyze this uploaded document: "${fileName || "Uploaded Material"}"
Content:
---
${fileContent.substring(0, 45000)}
---

Strictly generate a single, valid JSON response following this exact schema:
{
  "document_title": string,
  "summary": string (formatted in beautiful markdown, summarizing key ideas, theories, or math),
  "key_takeaways": string[] (critical bullet points),
  "formulas_or_key_terms": Array<{ "term": string, "definition": string }>,
  "generated_flashcards": Array<{ "front": string, "back": string }>,
  "generated_questions": Array<{ "question": string, "answer": string }>
}

DO NOT wrap your JSON in backticks. Return RAW JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Document Summary Error:", error);
    res.status(500).json({ error: error.message || "Failed to summarize document" });
  }
});

// Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Initialize Database before starting the HTTP listener
  try {
    await initializeDatabase();
  } catch (err: any) {
    console.error("Database initialization failed:", err.message);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
