import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Calculator, 
  ChevronRight, 
  ShieldCheck,
  Bot,
  Brain,
  Cpu
} from 'lucide-react';
import { AptitudeQuestion, StudentProfile, AptitudeSection } from '../../types';
import { sampleAptitudeQuestions } from '../../data/mockData';
import { triggerConfetti, callAgentApi, AgentApiResponse } from '../../utils/readiness';

interface AptitudeModuleProps {
  profile: StudentProfile;
  onQuestionCompleted: (questionId: string, isCorrect: boolean, xpGain: number) => void;
  questionsList?: AptitudeQuestion[];
}

export const AptitudeModule: React.FC<AptitudeModuleProps> = ({
  profile,
  onQuestionCompleted,
  questionsList,
}) => {
  const allQuestions = questionsList && questionsList.length > 0 ? questionsList : sampleAptitudeQuestions;

  const [activeSection, setActiveSection] = useState<'All' | AptitudeSection>('All');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Model Router preference selector: Auto | Local LLM (Syntax/Logic) | OpenAI (Out-of-box)
  const [modelPreference, setModelPreference] = useState<'auto' | 'local' | 'openai'>('auto');

  // Socratic AI Tutor states
  const [aiTutorHintLevel, setAiTutorHintLevel] = useState<number>(0);
  const [aiTutorResponse, setAiTutorResponse] = useState<AgentApiResponse | null>(null);
  const [isLoadingAiTutor, setIsLoadingAiTutor] = useState(false);

  const filteredQuestions = allQuestions.filter((q) => {
    if (activeSection === 'All') return true;
    return q.section === activeSection;
  });

  const currentQuestion: AptitudeQuestion | undefined = filteredQuestions[selectedQuestionIndex] || filteredQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const xpGain = isCorrect ? 50 : 10;

    if (isCorrect) {
      triggerConfetti();
    }

    onQuestionCompleted(currentQuestion.id, isCorrect, xpGain);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowFormula(false);
    setAiTutorResponse(null);
    setAiTutorHintLevel(0);
    if (selectedQuestionIndex < filteredQuestions.length - 1) {
      setSelectedQuestionIndex((prev) => prev + 1);
    } else {
      setSelectedQuestionIndex(0);
    }
  };

  // Socratic AI Tutor progressive hints
  const handleRequestAiTutorHint = async () => {
    if (!currentQuestion) return;
    const nextHintLevel = aiTutorHintLevel + 1;
    setIsLoadingAiTutor(true);

    try {
      const res = await callAgentApi('aptitude-tutor', {
        questionText: currentQuestion.question,
        topic: currentQuestion.topic,
        section: currentQuestion.section,
        options: currentQuestion.options,
        hintLevel: nextHintLevel,
        studentSelectedOption: selectedOption !== null ? currentQuestion.options[selectedOption] : null,
      }, modelPreference);

      setAiTutorResponse(res);
      setAiTutorHintLevel(nextHintLevel);
    } catch (err: any) {
      setAiTutorResponse({
        text: `🤖 [Local LLM - Syntax & Logic Engine]\nFocus on breaking down the prompt into basic equations before substituting options.`,
        modelUsed: 'Local LLM (Fast Syntax & Logic)',
      });
      setAiTutorHintLevel(nextHintLevel);
    } finally {
      setIsLoadingAiTutor(false);
    }
  };

  const isSolved = currentQuestion ? profile.solvedAptitudeIds.includes(currentQuestion.id) : false;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-slate-900" />
            Aptitude & Logical Reasoning Master
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quantitative Aptitude, Logical Reasoning & Verbal Ability with Socratic AI Mentor.
          </p>
        </div>

        {/* AI Model Preference & Section Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
            <span className="text-slate-500 px-1">Engine:</span>
            <button
              onClick={() => setModelPreference('auto')}
              className={`px-2 rounded ${modelPreference === 'auto' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
            >
              Auto
            </button>
            <button
              onClick={() => setModelPreference('local')}
              className={`px-2 rounded ${modelPreference === 'local' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
            >
              🤖 Local LLM
            </button>
            <button
              onClick={() => setModelPreference('openai')}
              className={`px-2 rounded ${modelPreference === 'openai' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
            >
              ⚡ OpenAI
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            {(['All', 'Quantitative', 'Logical', 'Verbal'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setActiveSection(sec);
                  setSelectedQuestionIndex(0);
                  setSelectedOption(null);
                  setIsAnswerSubmitted(false);
                  setAiTutorResponse(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeSection === sec
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Question & Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              <span>Question Bank ({filteredQuestions.length})</span>
              <span>Section: {activeSection}</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredQuestions.map((q, idx) => {
                const isSelected = idx === selectedQuestionIndex;
                const isQSolved = profile.solvedAptitudeIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestionIndex(idx);
                      setSelectedOption(null);
                      setIsAnswerSubmitted(false);
                      setAiTutorResponse(null);
                      setAiTutorHintLevel(0);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate max-w-[200px]">Q{idx + 1}. {q.topic}</span>
                      {isQSolved && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{q.section}</span>
                      <span className="font-bold">{q.difficulty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question & Solver Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentQuestion ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-extrabold">
                    {currentQuestion.section}
                  </span>
                  <span className="text-xs font-bold text-slate-600">Topic: {currentQuestion.topic}</span>
                </div>

                <button
                  onClick={handleRequestAiTutorHint}
                  disabled={isLoadingAiTutor}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  {isLoadingAiTutor ? 'Consulting Mentor...' : `Socratic Hint (L${aiTutorHintLevel + 1})`}
                </button>
              </div>

              {/* Question Body */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    let optionStyle = 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100';

                    if (isAnswerSubmitted) {
                      if (idx === currentQuestion.correctIndex) {
                        optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      } else if (isSelected) {
                        optionStyle = 'bg-red-50 border-red-500 text-red-900 font-bold';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`p-3.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${optionStyle}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[11px]">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </span>
                        {isAnswerSubmitted && idx === currentQuestion.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        {isAnswerSubmitted && isSelected && idx !== currentQuestion.correctIndex && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submission Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {currentQuestion.formula && (
                  <button
                    onClick={() => setShowFormula(!showFormula)}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    {showFormula ? 'Hide Formula' : 'Reveal Core Formula'}
                  </button>
                )}

                <div className="flex items-center gap-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      Next Question
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Revealed Formula Card */}
              {showFormula && currentQuestion.formula && (
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-900 space-y-1 font-mono">
                  <span className="font-bold block text-slate-800">📐 Core Formula / Shortcut:</span>
                  <div>{currentQuestion.formula}</div>
                </div>
              )}

              {/* Explanation Card */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 space-y-2">
                  <span className="font-bold text-slate-900 block">💡 Step-by-Step Logic Explanation:</span>
                  <p className="leading-relaxed font-sans">{currentQuestion.explanation}</p>
                </div>
              )}

              {/* AI Socratic Tutor Response */}
              {aiTutorResponse && (
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-900 space-y-2 font-mono">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-slate-900" />
                      Socratic AI Tutor Guidance
                    </span>
                    <span className="text-[10px] text-slate-500">{aiTutorResponse.modelUsed}</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-[11px]">{aiTutorResponse.text}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No questions found for this section.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
