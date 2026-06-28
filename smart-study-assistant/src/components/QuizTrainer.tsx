import React, { useState, useEffect } from "react";
import { QuizQuestion } from "../types";
import { CheckCircle2, XCircle, Award, RefreshCw, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";

interface QuizTrainerProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export default function QuizTrainer({ questions, onComplete }: QuizTrainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [difficultyHistory, setDifficultyHistory] = useState<string[]>(["medium"]);

  // Reset quiz if questions change
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizScore(0);
    setQuizCompleted(false);
    setCurrentDifficulty("medium");
    setDifficultyHistory(["medium"]);
  }, [questions]);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        No quiz questions available for this topic. Try generating a new package.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswered) return;
    setIsAnswered(true);

    const isCorrect = selectedAnswer === currentQuestion.correct_answer_index;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    // Adaptive difficulty simulation for next question
    let nextDifficulty: "easy" | "medium" | "hard" = currentDifficulty;
    if (isCorrect) {
      if (currentDifficulty === "easy") nextDifficulty = "medium";
      else if (currentDifficulty === "medium") nextDifficulty = "hard";
    } else {
      if (currentDifficulty === "hard") nextDifficulty = "medium";
      else if (currentDifficulty === "medium") nextDifficulty = "easy";
    }
    setCurrentDifficulty(nextDifficulty);
  };

  const handleNext = () => {
    setDifficultyHistory((prev) => [...prev, currentDifficulty]);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      if (onComplete) {
        onComplete(quizScore, questions.length);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizScore(0);
    setQuizCompleted(false);
    setCurrentDifficulty("medium");
    setDifficultyHistory(["medium"]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Quiz Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interactive Study Quiz</span>
          <h4 className="text-lg font-bold text-slate-900">Test Your Knowledge</h4>
        </div>
        {!quizCompleted && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              <TrendingUp className="w-3.5 h-3.5" />
              Adaptive Difficulty: 
              <span className="capitalize font-bold ml-0.5">{currentDifficulty}</span>
            </div>
            <span className="text-sm text-slate-500 font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        )}
      </div>

      {!quizCompleted ? (
        <div className="p-6">
          {/* Question Text */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                currentQuestion.difficulty === "easy" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : currentQuestion.difficulty === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }`}>
                {currentQuestion.difficulty || "medium"}
              </span>
              <span className="text-xs text-slate-400">Adaptive calibration active</span>
            </div>
            <h3 className="text-base font-semibold text-slate-800 leading-snug">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              let btnStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";
              let statusIcon = null;

              if (selectedAnswer === index) {
                btnStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-900";
              }

              if (isAnswered) {
                if (index === currentQuestion.correct_answer_index) {
                  btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
                  statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
                } else if (selectedAnswer === index) {
                  btnStyle = "border-rose-300 bg-rose-50 text-rose-950";
                  statusIcon = <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
                } else {
                  btnStyle = "border-slate-200 bg-slate-50/50 text-slate-400 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={index}
                  disabled={isAnswered}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all outline-none ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-semibold text-xs shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {statusIcon}
                </button>
              );
            })}
          </div>

          {/* Explanation / Footer Actions */}
          {isAnswered && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6 animate-fadeIn">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                {selectedAnswer === currentQuestion.correct_answer_index ? (
                  <span className="text-emerald-700">Correct!</span>
                ) : (
                  <span className="text-rose-700">Incorrect Answer</span>
                )}
                — Explanation
              </h5>
              <p className="text-sm text-slate-600 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className={`py-2 px-5 rounded-lg font-medium text-sm transition-all ${
                  selectedAnswer !== null
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5"
              >
                {currentIndex + 1 === questions.length ? "Finish Quiz" : "Next Question"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-xs">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">Quiz Completed!</h3>
          <p className="text-sm text-slate-500 mb-6">
            You scored <span className="font-bold text-slate-800">{quizScore}</span> out of{" "}
            <span className="font-bold text-slate-800">{questions.length}</span> questions.
          </p>

          {/* Performance Calibration Report */}
          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              Adaptive Performance Calibration
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                <span>Final Difficulty Achieved:</span>
                <span className="font-bold capitalize text-slate-800">{currentDifficulty}</span>
              </div>
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                <span>Accuracy Rate:</span>
                <span className="font-bold text-slate-800">{Math.round((quizScore / questions.length) * 100)}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Adaptive Path:</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  {difficultyHistory.map((diff, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span>→</span>}
                      <span className={`capitalize px-1.5 py-0.5 rounded ${
                        diff === "easy" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : diff === "medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>{diff}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            {quizScore < questions.length ? (
              <div className="mt-4 p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Use the Professor Doubt Chat on the side to review questions you missed or ask for step-by-step math breakdowns!
                </span>
              </div>
            ) : (
              <div className="mt-4 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  <strong>Excellent job!</strong> You managed to climb the adaptive system and master the highest difficulty questions!
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
