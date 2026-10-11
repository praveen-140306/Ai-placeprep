import confetti from 'canvas-confetti';
import { StudentProfile } from '../types';

export function getAuthToken(): string | null {
  try {
    const saved = localStorage.getItem('placeprep_auth_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.token || null;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function triggerConfetti() {
  // Celebration pop up animations removed as requested
}

export interface ReadinessCategory {
  level: 'Placement Ready' | 'Almost Ready' | 'Needs Improvement' | 'Beginner Level';
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export function getReadinessCategory(score: number): ReadinessCategory {
  if (score >= 90) {
    return {
      level: 'Placement Ready',
      color: '#0f172a',
      badgeBg: 'bg-slate-900 text-white border-slate-900',
      badgeText: 'text-white font-extrabold',
      description: 'Exceptional readiness across all technical, aptitude, and core computer science dimensions. Ready to crack Tier-1 & Super Dream campus offers!',
    };
  }
  if (score >= 75) {
    return {
      level: 'Almost Ready',
      color: '#1e293b',
      badgeBg: 'bg-slate-800 text-white border-slate-700',
      badgeText: 'text-white font-bold',
      description: 'Solid foundation in algorithms and aptitude. A targeted 2-week focus on weak topics and mock interviews will push you into top tier.',
    };
  }
  if (score >= 50) {
    return {
      level: 'Needs Improvement',
      color: '#475569',
      badgeBg: 'bg-slate-100 border-slate-300 text-slate-800',
      badgeText: 'text-slate-800 font-semibold',
      description: 'Basic concepts understood, but consistency and time complexity optimizations require deliberate practice before placement season begins.',
    };
  }
  return {
    level: 'Beginner Level',
    color: '#64748b',
    badgeBg: 'bg-slate-50 border-slate-200 text-slate-600',
    badgeText: 'text-slate-600',
    description: 'Starting your placement preparation journey. Follow the structured step-by-step curriculum to build fundamentals from scratch.',
  };
}

export function calculateReadinessScore(profile: StudentProfile): {
  overall: number;
  dsa: number;
  aptitude: number;
  sql: number;
  coreCS: number;
  consistency: number;
  weakTopics: string[];
  strongTopics: string[];
} {
  const dsa = profile.moduleScores.dsa;
  const aptitude = profile.moduleScores.aptitude;
  const sql = profile.moduleScores.sql;
  const coreCS = profile.moduleScores.coreCS;
  const consistency = Math.min(100, Math.round((profile.streakDays / 14) * 50 + 50));

  const overall = Math.round(
    dsa * 0.30 +
    aptitude * 0.25 +
    sql * 0.20 +
    coreCS * 0.15 +
    consistency * 0.10
  );

  const topicsWithScores: { name: string; score: number }[] = [
    { name: 'DSA - Dynamic Programming', score: dsa < 70 ? dsa - 10 : dsa },
    { name: 'DSA - Arrays & Pointers', score: dsa + 10 },
    { name: 'Aptitude - Permutations & Combinations', score: aptitude < 80 ? 60 : 75 },
    { name: 'Aptitude - Time & Work', score: aptitude >= 80 ? 88 : 70 },
    { name: 'SQL - Complex Joins & Subqueries', score: sql },
    { name: 'Core CS - OS Deadlocks & Memory', score: coreCS },
    { name: 'Core CS - DBMS Indexing (B+ Trees)', score: coreCS + 5 },
  ];

  const weakTopics = topicsWithScores
    .filter((t) => t.score < 75)
    .sort((a, b) => a.score - b.score)
    .map((t) => t.name);

  const strongTopics = topicsWithScores
    .filter((t) => t.score >= 75)
    .sort((a, b) => b.score - a.score)
    .map((t) => t.name);

  return {
    overall,
    dsa,
    aptitude,
    sql,
    coreCS,
    consistency,
    weakTopics: weakTopics.length > 0 ? weakTopics : ['Advanced Dynamic Programming', 'SQL Window Functions'],
    strongTopics: strongTopics.length > 0 ? strongTopics : ['Arrays & Hash Maps', 'Logical Syllogisms', 'DBMS ACID Properties'],
  };
}

export interface AgentApiResponse {
  text: string;
  modelUsed?: string;
  provider?: 'local_llm' | 'openai' | 'gemini';
  complexity?: 'simple_syntax_logic' | 'out_of_box_complex';
  routingReason?: string;
}

export async function callAgentApi(
  agentType: string,
  payload: any,
  modelPreference?: 'auto' | 'local' | 'openai'
): Promise<AgentApiResponse> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/ai/agent', {
      method: 'POST',
      headers,
      body: JSON.stringify({ agentType, payload, modelPreference }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.text || '',
      modelUsed: data.modelUsed,
      provider: data.provider,
      complexity: data.complexity,
      routingReason: data.routingReason,
    };
  } catch (err: any) {
    console.error(`AI Agent (${agentType}) error:`, err);
    throw err;
  }
}

export async function runCodeApi(payload: {
  code: string;
  language: string;
  problemId?: string;
  testCases?: any[];
  customInput?: string;
}) {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/code/run', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function runSqlApi(query: string) {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/sql/run', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  return await res.json();
}
