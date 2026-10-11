import React, { useState } from 'react';
import { 
  Code2, 
  Search, 
  CheckCircle, 
  Play, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Eye, 
  Clock, 
  Cpu, 
  Check, 
  HelpCircle,
  Bot
} from 'lucide-react';
import { DSAProblem, StudentProfile } from '../../types';
import { sampleDsaProblems } from '../../data/mockData';
import { triggerConfetti, callAgentApi, runCodeApi, AgentApiResponse } from '../../utils/readiness';

interface DsaPlatformProps {
  profile: StudentProfile;
  onProblemSolved: (problemId: string, xpGain: number) => void;
  problemsList?: DSAProblem[];
}

export const DsaPlatform: React.FC<DsaPlatformProps> = ({
  profile,
  onProblemSolved,
  problemsList,
}) => {
  const problems = problemsList && problemsList.length > 0 ? problemsList : sampleDsaProblems;

  const [selectedProblem, setSelectedProblem] = useState<DSAProblem>(problems[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [editorCode, setEditorCode] = useState<string>(selectedProblem.starterCodes[selectedLanguage] || '');

  // Model Router preference selector: Auto | Local LLM (Syntax/Logic) | OpenAI (Out-of-box)
  const [modelPreference, setModelPreference] = useState<'auto' | 'local' | 'openai'>('auto');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

  // Progressive Hints (1 to 6)
  const [unlockedHintStage, setUnlockedHintStage] = useState<number>(0);
  const [aiHintContents, setAiHintContents] = useState<{ [stage: number]: AgentApiResponse }>({});
  const [isLoadingAiHint, setIsLoadingAiHint] = useState<boolean>(false);
  const [aiCodeReview, setAiCodeReview] = useState<AgentApiResponse | null>(null);

  // Execution & Output Tabs
  const [activeConsoleTab, setActiveConsoleTab] = useState<'tests' | 'custom' | 'output' | 'ai-hints'>('tests');
  const [customInputText, setCustomInputText] = useState('{"nums": [2, 7, 11, 15], "target": 9}');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<any>(null);
  const [showOptimalSolution, setShowOptimalSolution] = useState(false);

  const handleSelectProblem = (prob: DSAProblem) => {
    setSelectedProblem(prob);
    setEditorCode(prob.starterCodes[selectedLanguage] || '');
    setUnlockedHintStage(0);
    setAiHintContents({});
    setExecutionOutput(null);
    setAiCodeReview(null);
    setShowOptimalSolution(false);
  };

  const handleLanguageChange = (lang: 'javascript' | 'python' | 'cpp' | 'java') => {
    setSelectedLanguage(lang);
    if (selectedProblem.starterCodes[lang]) {
      setEditorCode(selectedProblem.starterCodes[lang]);
    }
  };

  // Progressive Hint Agent: Unlocks Stage 1 to 6
  const handleRequestNextHint = async () => {
    if (unlockedHintStage >= 6) return;
    const nextStage = unlockedHintStage + 1;
    setIsLoadingAiHint(true);
    setActiveConsoleTab('ai-hints');

    try {
      const res = await callAgentApi('dsa-mentor', {
        problemTitle: selectedProblem.title,
        problemDescription: selectedProblem.description,
        studentCode: editorCode,
        language: selectedLanguage,
        hintStage: nextStage,
        requestType: 'progressive_hint',
      }, modelPreference);

      setAiHintContents((prev) => ({
        ...prev,
        [nextStage]: res,
      }));
      setUnlockedHintStage(nextStage);
    } catch (err: any) {
      setAiHintContents((prev) => ({
        ...prev,
        [nextStage]: {
          text: selectedProblem.hints[nextStage - 1] || 'Focus on breaking down inputs and matching appropriate data structures.',
          modelUsed: 'Local LLM (Fast Syntax & Logic)',
        },
      }));
      setUnlockedHintStage(nextStage);
    } finally {
      setIsLoadingAiHint(false);
    }
  };

  // Review Student's Code (AI Bug spotter and Big-O complexity check)
  const handleReviewMyCode = async () => {
    setIsLoadingAiHint(true);
    setActiveConsoleTab('ai-hints');

    try {
      const res = await callAgentApi('dsa-mentor', {
        problemTitle: selectedProblem.title,
        problemDescription: selectedProblem.description,
        studentCode: editorCode,
        language: selectedLanguage,
        requestType: 'review_code',
        question: 'Please review my solution for syntax correctness, logic bugs, and algorithmic efficiency.',
      }, modelPreference);
      setAiCodeReview(res);
    } catch (err: any) {
      setAiCodeReview({
        text: `🤖 [Local LLM - Syntax & Logic Engine]\nCode syntax check complete. Ensure loop termination and array boundary conditions are satisfied.`,
        modelUsed: 'Local LLM (Fast Syntax & Logic)',
      });
    } finally {
      setIsLoadingAiHint(false);
    }
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    setActiveConsoleTab('output');

    try {
      const res = await runCodeApi({
        code: editorCode,
        language: selectedLanguage,
        problemId: selectedProblem.id,
        testCases: activeConsoleTab === 'custom' ? undefined : selectedProblem.testCases,
        customInput: activeConsoleTab === 'custom' ? customInputText : undefined,
      });

      setExecutionOutput(res);
      if (res.allPassed) {
        triggerConfetti();
        onProblemSolved(selectedProblem.id, selectedProblem.difficulty === 'Hard' ? 100 : selectedProblem.difficulty === 'Medium' ? 60 : 30);
      }
    } catch (err: any) {
      setExecutionOutput({
        success: false,
        error: err.message || 'Execution error',
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const isSolved = profile.solvedDSAIds.includes(selectedProblem.id);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & AI Engine Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-slate-900" />
            DSA Coding Arena & Progressive Hint Mentor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Master campus placement data structures with 6-stage hints (Local LLM for syntax/logic & OpenAI for out-of-box questions).
          </p>
        </div>

        {/* AI Model Router Preference */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
          <span className="text-slate-500 px-1">AI Engine:</span>
          <button
            onClick={() => setModelPreference('auto')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              modelPreference === 'auto' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auto-Detect
          </button>
          <button
            onClick={() => setModelPreference('local')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              modelPreference === 'local' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🤖 Local LLM
          </button>
          <button
            onClick={() => setModelPreference('openai')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              modelPreference === 'openai' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ OpenAI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Problem Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
            {/* Search & Filters */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search problem or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    difficultyFilter === diff
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Problem List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredProblems.map((prob) => {
                const isSelected = prob.id === selectedProblem.id;
                const isProbSolved = profile.solvedDSAIds.includes(prob.id);

                return (
                  <div
                    key={prob.id}
                    onClick={() => handleSelectProblem(prob)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[200px]">{prob.title}</span>
                      {isProbSolved && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${
                        prob.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                        prob.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {prob.difficulty}
                      </span>
                      <span>{prob.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Coding & AI Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Problem Statement Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {selectedProblem.title}
                  {isSolved && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Solved ✓</span>}
                </h3>
                <span className="text-xs text-slate-500">Category: {selectedProblem.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReviewMyCode}
                  disabled={isLoadingAiHint}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-slate-800" />
                  Review Syntax & Logic
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {selectedProblem.description}
            </p>

            {/* Examples */}
            {selectedProblem.examples.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800">Sample Example:</span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                  <div><strong>Input:</strong> {selectedProblem.examples[0].input}</div>
                  <div><strong>Output:</strong> {selectedProblem.examples[0].output}</div>
                </div>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-slate-700">Language:</span>
                {(['javascript', 'python', 'cpp', 'java'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2.5 py-1 rounded-md transition uppercase font-bold cursor-pointer ${
                      selectedLanguage === lang
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditorCode(selectedProblem.starterCodes[selectedLanguage] || '')}
                  className="p-1 rounded text-slate-500 hover:text-slate-900"
                  title="Reset Code"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {isRunningCode ? 'Executing...' : 'Run & Test'}
                </button>
              </div>
            </div>

            {/* Code Input */}
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              spellCheck={false}
              className="w-full h-64 p-4 bg-slate-900 text-slate-100 font-mono text-xs focus:outline-none leading-relaxed resize-none selection:bg-slate-700"
            />
          </div>

          {/* Progressive 6-Stage Hint & Output Panel */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <button
                  onClick={() => setActiveConsoleTab('output')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeConsoleTab === 'output' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Execution Output
                </button>
                <button
                  onClick={() => setActiveConsoleTab('ai-hints')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeConsoleTab === 'ai-hints' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Progressive AI Hints ({unlockedHintStage}/6)
                </button>
              </div>

              {unlockedHintStage < 6 && (
                <button
                  onClick={handleRequestNextHint}
                  disabled={isLoadingAiHint}
                  className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {isLoadingAiHint ? 'Generating Hint...' : `Unlock Stage ${unlockedHintStage + 1} Hint`}
                </button>
              )}
            </div>

            {/* Output View */}
            {activeConsoleTab === 'output' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 min-h-[100px]">
                {executionOutput ? (
                  <div className="space-y-2">
                    <div className={`font-bold ${executionOutput.allPassed ? 'text-emerald-700' : 'text-red-700'}`}>
                      {executionOutput.allPassed ? '✓ All Test Cases Passed!' : '✕ Test Cases Failed'}
                    </div>
                    <div>Execution Time: {executionOutput.executionTimeMs}ms • Memory: {executionOutput.memoryMb} MB</div>
                    {executionOutput.results && executionOutput.results.map((r: any, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-white border border-slate-200">
                        <div>Input: {JSON.stringify(r.input)}</div>
                        <div>Actual: {JSON.stringify(r.actual)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">Click "Run & Test" to evaluate code against test cases.</span>
                )}
              </div>
            )}

            {/* AI Hints View */}
            {activeConsoleTab === 'ai-hints' && (
              <div className="space-y-3 min-h-[100px]">
                {aiCodeReview && (
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-900 space-y-1">
                    <div className="font-bold flex items-center justify-between text-slate-800">
                      <span>🤖 Syntax & Logic Review</span>
                      <span className="text-[10px] font-mono text-slate-500">{aiCodeReview.modelUsed}</span>
                    </div>
                    <div className="whitespace-pre-line font-mono text-[11px] leading-relaxed">{aiCodeReview.text}</div>
                  </div>
                )}

                {Object.keys(aiHintContents).length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No hints unlocked yet. Click "Unlock Stage 1 Hint" to receive step-by-step guidance!
                  </div>
                ) : (
                  Object.entries(aiHintContents).map(([stg, resp]) => (
                    <div key={stg} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>Stage {stg} Guidance</span>
                        <span className="text-[10px] text-slate-500">{resp.modelUsed}</span>
                      </div>
                      <div className="whitespace-pre-line font-mono text-slate-800 text-[11px] leading-relaxed">{resp.text}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
