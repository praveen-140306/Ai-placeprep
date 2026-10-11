import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  Sparkles, 
  RotateCcw, 
  Table, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Bot
} from 'lucide-react';
import { SQLChallenge, StudentProfile } from '../../types';
import { sampleSqlChallenges } from '../../data/mockData';
import { triggerConfetti, runSqlApi, callAgentApi, AgentApiResponse } from '../../utils/readiness';

interface SqlPracticeProps {
  profile: StudentProfile;
  onChallengeSolved: (challengeId: string, xpGain: number) => void;
  challengesList?: SQLChallenge[];
}

export const SqlPractice: React.FC<SqlPracticeProps> = ({ profile, onChallengeSolved, challengesList }) => {
  const challenges = challengesList && challengesList.length > 0 ? challengesList : sampleSqlChallenges;
  const [selectedChallenge, setSelectedChallenge] = useState<SQLChallenge>(challenges[0]);
  const [sqlQuery, setSqlQuery] = useState<string>(selectedChallenge.starterQuery);

  // Model Router preference selector: Auto | Local LLM (Syntax/Logic) | OpenAI (Out-of-box)
  const [modelPreference, setModelPreference] = useState<'auto' | 'local' | 'openai'>('auto');

  const [isRunning, setIsRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    columns: string[];
    rows: any[];
    executionTimeMs: string;
    rowCount: number;
  } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // AI SQL Mentor guidance
  const [aiMentorGuidance, setAiMentorGuidance] = useState<AgentApiResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleSelectChallenge = (c: SQLChallenge) => {
    setSelectedChallenge(c);
    setSqlQuery(c.starterQuery);
    setQueryResult(null);
    setQueryError(null);
    setAiMentorGuidance(null);
  };

  const handleRunSql = async () => {
    setIsRunning(true);
    setQueryError(null);
    setQueryResult(null);

    try {
      const res = await runSqlApi(sqlQuery);
      if (res.success) {
        setQueryResult({
          columns: res.columns || [],
          rows: res.rows || [],
          executionTimeMs: res.executionTimeMs || '0.5',
          rowCount: res.rowCount || 0,
        });

        // Check solution match
        triggerConfetti();
        onChallengeSolved(selectedChallenge.id, 50);
      } else {
        setQueryError(res.error || 'SQL Execution failed.');
      }
    } catch (err: any) {
      setQueryError(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleConsultAiMentor = async () => {
    setIsLoadingAi(true);
    try {
      const res = await callAgentApi('sql-mentor', {
        challengeTitle: selectedChallenge.title,
        schemaDescription: selectedChallenge.relevantTables.join(', '),
        studentQuery: sqlQuery,
        errorOutput: queryError || undefined,
      }, modelPreference);
      setAiMentorGuidance(res);
    } catch (err: any) {
      setAiMentorGuidance({
        text: `🤖 [Local LLM - Syntax & Logic Engine]\nVerify SELECT column names and ensure GROUP BY includes non-aggregated attributes.`,
        modelUsed: 'Local LLM (Fast Syntax & Logic)',
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const isSolved = profile.solvedSqlIds.includes(selectedChallenge.id);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-slate-900" />
            SQL Practice & In-Memory AlaSQL Arena
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Practice database queries against live in-memory SQLite/AlaSQL tables with AI mentor hints.
          </p>
        </div>

        {/* AI Engine preference selector */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
          <span className="text-slate-500 px-1">Engine:</span>
          <button
            onClick={() => setModelPreference('auto')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              modelPreference === 'auto' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auto
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
        {/* Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              <span>SQL Challenges ({challenges.length})</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {challenges.map((c) => {
                const isSelected = c.id === selectedChallenge.id;
                const isCSolved = profile.solvedSqlIds.includes(c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectChallenge(c)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate max-w-[200px]">{c.title}</span>
                      {isCSolved && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{c.topic}</span>
                      <span className="font-bold">{c.difficulty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Database Tables Viewer */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-slate-700" />
              Available Database Tables
            </span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div>• <code>departments</code> (dept_id, dept_name, location, budget)</div>
              <div>• <code>employees</code> (emp_id, first_name, last_name, dept_id, salary, role)</div>
              <div>• <code>projects</code> (project_id, project_name, dept_id, budget)</div>
              <div>• <code>student_placements</code> (student_id, student_name, cgpa, company, package_lpa)</div>
            </div>
          </div>
        </div>

        {/* Query Arena & Result (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {selectedChallenge.title}
                  {isSolved && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Solved ✓</span>}
                </h3>
                <span className="text-xs text-slate-500">Topic: {selectedChallenge.topic}</span>
              </div>

              <button
                onClick={handleConsultAiMentor}
                disabled={isLoadingAi}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                {isLoadingAi ? 'Analyzing Query...' : 'Consult SQL Mentor'}
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {selectedChallenge.description}
            </p>
          </div>

          {/* SQL Editor */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-semibold">
              <span className="text-slate-800 font-mono">SQL Query Editor (AlaSQL Engine)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSqlQuery(selectedChallenge.starterQuery)}
                  className="p-1 rounded text-slate-500 hover:text-slate-900"
                  title="Reset Query"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRunSql}
                  disabled={isRunning}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {isRunning ? 'Executing SQL...' : 'Run Query'}
                </button>
              </div>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              spellCheck={false}
              className="w-full h-44 p-4 bg-slate-900 text-slate-100 font-mono text-xs focus:outline-none leading-relaxed resize-none selection:bg-slate-700"
            />
          </div>

          {/* Result Output Table */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
              Query Result Table
            </span>

            {queryError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                {queryError}
              </div>
            )}

            {queryResult ? (
              <div className="space-y-2">
                <div className="text-[11px] text-slate-500 font-mono">
                  Rows returned: {queryResult.rowCount} • Execution time: {queryResult.executionTimeMs}ms
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left text-slate-800">
                    <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="px-3 py-2 border-r border-slate-200 last:border-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {queryResult.columns.map((col) => (
                            <td key={col} className="px-3 py-2 border-r border-slate-200 last:border-0 whitespace-nowrap">
                              {String(row[col] !== undefined ? row[col] : '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              !queryError && (
                <div className="text-xs text-slate-400 py-4 text-center">
                  Click "Run Query" to execute SQL against the database.
                </div>
              )
            )}

            {/* AI Guidance Box */}
            {aiMentorGuidance && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-900 space-y-2 font-mono mt-3">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-slate-900" />
                    SQL Mentor Guidance
                  </span>
                  <span className="text-[10px] text-slate-500">{aiMentorGuidance.modelUsed}</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed text-[11px]">{aiMentorGuidance.text}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
