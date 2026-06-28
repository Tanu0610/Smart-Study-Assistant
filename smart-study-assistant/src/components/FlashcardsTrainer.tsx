import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, ArrowRight, ArrowLeft, RefreshCw, Eye, BookOpen } from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsTrainerProps {
  flashcards: Flashcard[];
}

export default function FlashcardsTrainer({ flashcards }: FlashcardsTrainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState<Record<number, "again" | "easy" | "unseen">>({});
  const [studySessionCompleted, setStudySessionCompleted] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardStatus({});
    setStudySessionCompleted(false);
  }, [flashcards]);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm">No flashcards available. Try uploading a reference document to generate custom flashcards automatically!</p>
      </div>
    );
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex + 1 < flashcards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setStudySessionCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const markCard = (status: "again" | "easy") => {
    setCardStatus((prev) => ({
      ...prev,
      [currentIndex]: status,
    }));
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardStatus({});
    setStudySessionCompleted(false);
  };

  const easyCount = Object.values(cardStatus).filter((s) => s === "easy").length;
  const againCount = Object.values(cardStatus).filter((s) => s === "again").length;

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-bold text-slate-800">Spaced Repetition Cards</h4>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {studySessionCompleted ? "Session Ended" : `Card ${currentIndex + 1} of ${flashcards.length}`}
          </span>
        </div>

        {!studySessionCompleted ? (
          <div className="p-6">
            {/* 3D Flip Card Container */}
            <div className="perspective-1000 w-full h-72 mb-6 cursor-pointer group" onClick={handleFlip}>
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full bg-slate-900 text-white rounded-xl border border-slate-800 p-6 flex flex-col justify-between backface-hidden shadow-md">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">CONCEPT QUESTION</span>
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="text-center py-4">
                    <p className="text-lg font-medium text-slate-100 leading-relaxed leading-snug">
                      {flashcards[currentIndex].front}
                    </p>
                  </div>
                  <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 group-hover:text-indigo-300 transition-colors">
                    <Eye className="w-4 h-4" />
                    Click Card to Flip / Show Answer
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full bg-indigo-900 text-white rounded-xl border border-indigo-950 p-6 flex flex-col justify-between backface-hidden rotate-y-180 shadow-md">
                  <div className="flex justify-between items-center text-indigo-300">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">AI MODEL SOLUTION</span>
                    <BookOpen className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-center py-4 overflow-y-auto max-h-40 custom-scrollbar">
                    <p className="text-sm text-slate-100 leading-relaxed">
                      {flashcards[currentIndex].back}
                    </p>
                  </div>
                  <div className="text-center text-xs text-indigo-300 font-medium">
                    Click Card to Flip back to front
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between gap-4 mt-6">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="py-2 px-3 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => markCard("again")}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold py-2 px-4 rounded-xl shadow-xs"
                >
                  Again (Forgot) ❌
                </button>
                <button
                  onClick={() => markCard("easy")}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2 px-4 rounded-xl shadow-xs"
                >
                  Nailed It! (Easy) ✅
                </button>
              </div>

              <button
                onClick={handleNext}
                className="py-2 px-3 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
              >
                Skip <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Study session completed!</h4>
            <p className="text-xs text-slate-500 mb-6">You've gone through all the flashcards in this deck.</p>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                <span className="block text-2xl font-bold text-emerald-700">{easyCount}</span>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Mastered</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                <span className="block text-2xl font-bold text-rose-700">{againCount}</span>
                <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Review Needed</span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg text-xs transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Start Again
            </button>
          </div>
        )}
      </div>

      {/* Add Custom Flip Card CSS styles directly via JSX head helper or inline styles */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
