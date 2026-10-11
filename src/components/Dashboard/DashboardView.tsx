import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  Award, 
  Code2, 
  Database, 
  BookOpen, 
  Video, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Target,
  GraduationCap,
  Bot,
  ZapOff,
  Cpu
} from 'lucide-react';
import { StudentProfile, ModuleTab } from '../../types';
import { getReadinessCategory, callAgentApi, AgentApiResponse } from '../../utils/readiness';

interface DashboardViewProps {
  profile: StudentProfile;
  onNavigateTab: (tab: ModuleTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ profile, onNavigateTab }) => {
  const readiness = getReadinessCategory(profile.readinessScore);
  const [aiSprintPlan, setAiSprintPlan] = useState<AgentApiResponse | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [modelPreference, setModelPreference] = useState<'auto' | 'local' | 'openai'>('auto');

  const handleGenerateAiSprint = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await callAgentApi('learning-recommendation', {
        stats: profile.moduleScores,
        weakTopics: ['Dynamic Programming', 'SQL Window Functions', 'Quant Permutations'],
        placementGoal: profile.targetRole,
      }, modelPreference);
      setAiSprintPlan(res);
    } catch (err: any) {
      setAiSprintPlan({
        text: `### 7-Day High-Impact Placement Sprint\n- **Day 1-2**: Master DSA HashMaps & 2-Pointer patterns (10 solved problems target).\n- **Day 3-4**: Quant Aptitude: Time & Work, Speed Distance shortcuts.\n- **Day 5**: SQL Joins & Subqueries practice on alaSQL sandbox.\n- **Day 6**: Core CS Revision: Operating Systems Memory Management.\n- **Day 7**: Full Mock Technical Interview Simulation.`,
        modelUsed: 'Local LLM (Fast Syntax & Logic)',
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Hero Placement Readiness Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
              <GraduationCap className="w-3.5 h-3.5 text-slate-900" />
              <span>Campus Batch 2026 Target: {profile.targetRole}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back, {profile.name}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your overall placement readiness score is <strong className="text-slate-900">{profile.readinessScore}%</strong>. Track practice sessions across DSA, Aptitude, SQL & Core CS.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('dsa')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Code2 className="w-4 h-4" />
                Start DSA Arena
              </button>

              <button
                onClick={() => onNavigateTab('aptitude')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-2 border border-slate-200 transition cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-700" />
                Practice Aptitude & Logic
              </button>

              <button
                onClick={() => onNavigateTab('sql')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-2 border border-slate-200 transition cursor-pointer"
              >
                <Database className="w-4 h-4 text-slate-700" />
                SQL Practice
              </button>
            </div>
          </div>

          {/* Readiness Dial Card */}
          <div className="w-full lg:w-auto flex flex-col items-center bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-3">
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-slate-900 bg-white shadow-xs">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-slate-900">{profile.readinessScore}%</span>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Readiness</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-extrabold ${readiness.badgeBg}`}>
              {readiness.level}
            </div>
          </div>
        </div>
      </div>

      {/* Module Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DSA */}
        <div 
          onClick={() => onNavigateTab('dsa')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">{profile.moduleScores.dsa}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">DSA Arena</h3>
            <p className="text-xs text-slate-500">{profile.solvedDSAIds.length} Problems Solved</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${profile.moduleScores.dsa}%` }} />
          </div>
        </div>

        {/* Aptitude */}
        <div 
          onClick={() => onNavigateTab('aptitude')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">{profile.moduleScores.aptitude}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Aptitude & Logic</h3>
            <p className="text-xs text-slate-500">{profile.solvedAptitudeIds.length} Questions Answered</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${profile.moduleScores.aptitude}%` }} />
          </div>
        </div>

        {/* SQL */}
        <div 
          onClick={() => onNavigateTab('sql')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">{profile.moduleScores.sql}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">SQL Practice</h3>
            <p className="text-xs text-slate-500">{profile.solvedSqlIds.length} Challenges Solved</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${profile.moduleScores.sql}%` }} />
          </div>
        </div>

        {/* Core CS */}
        <div 
          onClick={() => onNavigateTab('core-cs')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">{profile.moduleScores.coreCS}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Core CS Subjects</h3>
            <p className="text-xs text-slate-500">{profile.masteredFlashcardIds.length} Flashcards Mastered</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${profile.moduleScores.coreCS}%` }} />
          </div>
        </div>
      </div>

      {/* AI Strategy Advisor & Dual Model Control */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-slate-900" />
              <h2 className="text-lg font-bold text-slate-900">AI Placement Strategy Sprint</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate a personalized 7-day preparation sprint plan using our local & OpenAI routing engine.
            </p>
          </div>

          {/* Model Preference selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-600 px-1">Engine:</span>
            <button
              onClick={() => setModelPreference('auto')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                modelPreference === 'auto' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Auto-Route
            </button>
            <button
              onClick={() => setModelPreference('local')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                modelPreference === 'local' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🤖 Local LLM
            </button>
            <button
              onClick={() => setModelPreference('openai')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                modelPreference === 'openai' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ OpenAI
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerateAiSprint}
          disabled={isGeneratingPlan}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <Bot className="w-4 h-4" />
          {isGeneratingPlan ? 'Routing AI Engine...' : 'Generate 7-Day Sprint Plan'}
        </button>

        {aiSprintPlan && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-800" />
                Model Used: {aiSprintPlan.modelUsed || 'AI Engine'}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {aiSprintPlan.complexity || 'Placement Reasoning'}
              </span>
            </div>
            <div className="whitespace-pre-line leading-relaxed font-mono text-slate-900">
              {aiSprintPlan.text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
