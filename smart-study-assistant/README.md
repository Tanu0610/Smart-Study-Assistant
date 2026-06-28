# Smart Study Assistant 🎓💻

### 🌐 Live Demo: [https://smart-study-assistant-9qwd.onrender.com](https://smart-study-assistant-9qwd.onrender.com)

An AI-powered, full-stack academic prep dashboard designed for college students to master any topic. Powered by the Gemini 3.5 API and built with a calm, high-contrast **Sage Green & Ivory** theme, this platform integrates comprehensive study resources, previous year question analysis, interactive quizzes, and a doubt-solving tutor.

---

## 🚀 Key Features

* **Topic-Based Study Package Generator:** Compiles short notes, cheat sheets, common exam mistakes, bilingual explanations (English & Tamil/Tanglish), and custom revision schedules.
* **Smart Textbook Summarizer:** Upload university reference documents or paste raw text to extract core formulas, flashcards, key takeaways, and question banks.
* **Doubt-Solving Tutor (Prof. Doubt-Solver):** Live chatbot grounded in the active study workspace to explain code, solve equations, and answer conceptual doubts.
* **RAG-Aligned Previous Year Questions (PYQs):** Solve past university papers or generate sample questions with detailed step-by-step marking answers.
* **Interactive Trainers:** 
  * **Adaptive Quiz Trainer:** Evaluates your understanding through multiple-choice questions across different difficulty levels.
  * **3D Flashcards:** Flip cards to check definitions and test retention.
* **SQL User Authentication:** Connects to a secure MySQL database (falling back to a local SQLite database) for user logins and registrations.
* **Custom API Key Support:** Input and save your Google AI Studio keys directly inside the console settings for query execution.
* **Mobile Companion Client:** Includes a fully configured companion mobile app scaffolded in **Flutter**.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite, TypeScript, TailwindCSS v4, Lucide Icons)
* **Backend:** Node.js, Express, tsx
* **Database:** MySQL (local fallback to SQLite3 via raw SQL queries)
* **AI Engine:** `@google/genai` (Gemini 3.5 Models)
* **Mobile Client:** Flutter, Dart, `shared_preferences`

---

## ⚙️ Running Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v20+ recommended)
* Git

### Step 1: Install Dependencies
Open your terminal in the `smart-study-assistant` folder and install packages:
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env` or `.env.local` and define your variables:
```env
# Optional: Set server-side Gemini key
GEMINI_API_KEY="your-gemini-key"

# Optional: Set MySQL credentials (falls back to local SQLite if left empty)
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="your-password"
DB_NAME="smart_study_db"
DB_PORT=3306
```

### Step 3: Run the Development Server
Launch the full-stack server:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**.

---

## 📱 Running the Flutter Mobile App

### Prerequisites
* [Flutter SDK](https://docs.flutter.dev/get-started/install)

### Setup
1. Navigate to the `smart_study_assistant_flutter` directory:
   ```bash
   cd ../smart_study_assistant_flutter
   ```
2. Fetch dependencies:
   ```bash
   flutter pub get
   ```
3. Run on a connected emulator or device:
   ```bash
   flutter run
   ```
*(Note: Ensure your backend server is running. The app queries `10.0.2.2:3000` to connect to loopback inside Android emulators; adjust `baseUrl` in `api_service.dart` if testing on other devices.)*
