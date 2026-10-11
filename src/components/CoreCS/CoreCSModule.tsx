import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  RotateCw, 
  HelpCircle,
  Brain,
  Bot
} from 'lucide-react';
import { StudentProfile, CoreCSSubject, CoreCSMaterial, Flashcard } from '../../types';
import { sampleCoreCSMaterials, sampleFlashcards } from '../../data/mockData';
import { triggerConfetti } from '../../utils/readiness';

interface CoreCSModuleProps {
  profile: StudentProfile;
  onFlashcardMastered: (flashcardId: string) => void;
  flashcardsList?: Flashcard[];
}

export const CoreCSModule: React.FC<CoreCSModuleProps> = ({ profile, onFlashcardMastered, flashcardsList }) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'flashcards'>('flashcards');
  const [selectedSubject, setSelectedSubject] = useState<'All' | CoreCSSubject>('All');
  
  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const allFlashcards = flashcardsList && flashcardsList.length > 0 ? flashcardsList : sampleFlashcards;

  const filteredFlashcards = allFlashcards.filter(f => {
    if (selectedSubject === 'All') return true;
    return f.subject === selectedSubject;
  });

  const currentCard: Flashcard | undefined = filteredFlashcards[currentCardIndex] || filteredFlashcards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < filteredFlashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleMarkMastered = () => {
    if (currentCard) {
      triggerConfetti();
      onFlashcardMastered(currentCard.id);
      handleNextCard();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-slate-900" />
            Core CS Subjects & Interactive Flashcards
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operating Systems, DBMS, Networks & OOP flashcard revision for campus interviews.
          </p>
        </div>

        {/* View Switcher & Subject Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-1 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'flashcards' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Flashcards
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'syllabus' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subject Summaries
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs">
            {(['All', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'Object-Oriented Programming'] as const).map(subj => (
              <button
                key={subj}
                onClick={() => {
                  setSelectedSubject(subj as any);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  selectedSubject === subj ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {subj === 'All' ? 'All' : subj.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'flashcards' ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Card {currentCardIndex + 1} of {filteredFlashcards.length}</span>
            <span>Subject: {currentCard?.subject}</span>
          </div>

          {currentCard ? (
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[280px] rounded-3xl bg-white border border-slate-200 p-8 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition text-center relative overflow-hidden"
            >
              <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Click Card to {isFlipped ? 'Show Question' : 'Flip Answer'} 🔄
              </div>

              <div className="my-auto space-y-3">
                {!isFlipped ? (
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-2">Question / Definition</span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{currentCard.front}</h3>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider block mb-2">Answer & Concept Breakdown</span>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">{currentCard.back}</p>
                    {currentCard.codeSnippet && (
                      <pre className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs text-left overflow-x-auto">
                        {currentCard.codeSnippet}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 font-semibold">
                Topic: {currentCard.topic}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No flashcards found for this subject.
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Flip Card
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNextCard}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold transition cursor-pointer"
              >
                Skip Card
              </button>

              <button
                onClick={handleMarkMastered}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Mastered (+20 XP)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleCoreCSMaterials.map((mat) => (
            <div key={mat.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold">{mat.subject}</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {mat.importance} Priority
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{mat.topic}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{mat.summary}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block">Frequent Interview Q&A:</span>
                {mat.frequentInterviewQuestions.map((q, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                    <div className="font-bold text-slate-900">Q: {q.question}</div>
                    <div className="mt-1 text-slate-600">A: {q.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
