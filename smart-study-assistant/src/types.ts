export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

export interface PYQ {
  question: string;
  year: string;
  exam_type: string;
  marks: number;
  answer_guide: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface CodingProblem {
  title: string;
  problem_statement: string;
  solution_code: string;
  language: string;
  explanation: string;
}

export interface StudyScheduleItem {
  phase: string;
  duration: string;
  focus: string;
  activity: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface YouTubeRecommendation {
  channel: string;
  reason: string;
  search_query: string;
}

export interface WebsiteLink {
  site_name: string;
  url: string;
  description: string;
}

export interface StudyPackage {
  topic: string;
  simple_explanation: string;
  tamil_explanation?: string;
  short_notes: string[];
  cheat_sheet: string;
  common_mistakes: string[];
  mind_map: MindMapNode;
  previous_year_questions: PYQ[];
  interview_questions: InterviewQuestion[];
  coding_problems: CodingProblem[];
  study_schedule: StudyScheduleItem[];
  quiz_questions: QuizQuestion[];
  youtube_recommendations: YouTubeRecommendation[];
  website_links: WebsiteLink[];
}

export interface DocumentSummary {
  document_title: string;
  summary: string;
  key_takeaways: string[];
  formulas_or_key_terms: Array<{ term: string; definition: string }>;
  generated_flashcards: Array<{ front: string; back: string }>;
  generated_questions: Array<{ question: string; answer: string }>;
}

export interface HistoryItem {
  id: string;
  subject: string;
  topic: string;
  duration: string;
  examType: string;
  timestamp: string;
  data: StudyPackage;
}

export interface BookmarkItem {
  id: string;
  subject: string;
  topic: string;
  timestamp: string;
  data: StudyPackage;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
