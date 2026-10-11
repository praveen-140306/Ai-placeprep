import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  TrendingUp, 
  Plus, 
  Trash2, 
  BookOpen, 
  Code2, 
  Award, 
  Database, 
  Layers, 
  CheckCircle2, 
  BarChart3,
  Search,
  UploadCloud,
  FileText,
  Sparkles,
  FileType,
  FileCheck,
  ArrowRight,
  Eye,
  Check,
  AlertCircle,
  Bot,
  Edit3,
  X,
  Save
} from 'lucide-react';
import { AptitudeQuestion, DSAProblem, SQLChallenge, Flashcard } from '../../types';
import { sampleAptitudeQuestions, sampleDsaProblems, sampleSqlChallenges, sampleFlashcards } from '../../data/mockData';
import { getAuthToken } from '../../utils/readiness';

interface AdminDashboardProps {
  onAddAptitudeQuestion?: (q: AptitudeQuestion) => void;
  onAddDsaProblem?: (p: DSAProblem) => void;
  onAddSqlChallenge?: (s: SQLChallenge) => void;
  onBatchUpdateStudentPortal?: (items: { 
    aptitude?: AptitudeQuestion[]; 
    dsa?: DSAProblem[];
    sql?: SQLChallenge[];
    flashcard?: Flashcard[];
  }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onAddAptitudeQuestion,
  onAddDsaProblem,
  onAddSqlChallenge,
  onBatchUpdateStudentPortal,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'doc-upload' | 'aptitude' | 'dsa' | 'sql' | 'flashcards'>('doc-upload');
  
  // Content states loaded from local storage or defaults
  const [aptitudeList, setAptitudeList] = useState<AptitudeQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('placeprep_aptitude_questions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return sampleAptitudeQuestions;
  });

  const [dsaList, setDsaList] = useState<DSAProblem[]>(() => {
    try {
      const saved = localStorage.getItem('placeprep_dsa_problems');
      if (saved) return JSON.parse(saved);
    } catch {}
    return sampleDsaProblems;
  });

  const [sqlList, setSqlList] = useState<SQLChallenge[]>(() => {
    try {
      const saved = localStorage.getItem('placeprep_sql_challenges');
      if (saved) return JSON.parse(saved);
    } catch {}
    return sampleSqlChallenges;
  });

  const [flashcardList, setFlashcardList] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('placeprep_flashcards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return sampleFlashcards;
  });

  // Edit & Add Modal State
  const [editingItem, setEditingItem] = useState<{
    category: 'aptitude' | 'dsa' | 'sql' | 'flashcard';
    item: any;
    isNew?: boolean;
  } | null>(null);

  // Document Upload & AI Extraction State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [extractedDocQuestions, setExtractedDocQuestions] = useState<any[]>([]);
  const [selectedQuestionIndices, setSelectedQuestionIndices] = useState<number[]>([]);
  const [docUploadSuccessMessage, setDocUploadSuccessMessage] = useState<string | null>(null);
  const [targetCategoryHint, setTargetCategoryHint] = useState<string>('auto-detect');

  // Search/Filter state for lists
  const [searchQuery, setSearchQuery] = useState('');

  // Handle local drive file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setDocUploadSuccessMessage(null);
    setExtractedDocQuestions([]);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || result;
      setFileBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Preload sample placement test paper featuring Aptitude, DSA, and SQL
  const handleLoadSamplePaper = () => {
    const sampleText = `CAMPUS RECRUITMENT ASSESSMENT 2026 - TIER-1 TEST PAPER
Subject: Quantitative Aptitude, Data Structures & SQL Database

Q1: Two pipes A and B can fill a cistern in 20 and 30 minutes respectively. If both pipes are opened together, the time taken to fill the cistern is:
A) 12 minutes
B) 15 minutes
C) 25 minutes
D) 50 minutes
Answer: A
Explanation: Part filled by A in 1 min = 1/20. Part filled by B in 1 min = 1/30. Together in 1 min = (1/20 + 1/30) = 5/60 = 1/12. Hence the cistern fills in 12 minutes.
Formula: Total time = (A * B) / (A + B)

Q2: [DSA] Find Two Sum in an Array: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
Code: function twoSum(nums, target) { const map = new Map(); for(let i=0; i<nums.length; i++) { if(map.has(target - nums[i])) return [map.get(target - nums[i]), i]; map.set(nums[i], i); } }
Explanation: Hash Map lookup takes O(1) time per element, reducing overall time complexity from O(N^2) to O(N).

Q3: [SQL] Top Salaries by Department: Write a SQL query to find all employees who earn more than the average salary of their respective departments.
Query: SELECT e.first_name, e.salary, e.dept_id FROM employees e WHERE e.salary > (SELECT AVG(salary) FROM employees WHERE dept_id = e.dept_id);
Explanation: Correlated subquery compares each employee's salary against the average salary calculated for their specific department.`;

    const base64 = btoa(unescape(encodeURIComponent(sampleText)));
    setUploadedFile(new File([sampleText], 'Placement_Comprehensive_Drive_2026.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    setFileBase64(base64);
    setDocUploadSuccessMessage(null);
    setExtractedDocQuestions([]);
  };

  // Submit file to backend extraction endpoint
  const handleAnalyzeAndExtractQuestions = async () => {
    if (!fileBase64 || !uploadedFile) return;
    setIsAnalyzingDoc(true);
    setDocUploadSuccessMessage(null);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/parse-questions-doc', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileBase64,
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
          targetCategory: targetCategoryHint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract questions');
      }

      const questions = data.questions || [];
      setExtractedDocQuestions(questions);
      setSelectedQuestionIndices(questions.map((_: any, i: number) => i));
    } catch (err: any) {
      alert(`Error extracting document: ${err.message}`);
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const toggleSelectQuestion = (idx: number) => {
    setSelectedQuestionIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handlePublishToStudentPortal = () => {
    const selected = extractedDocQuestions.filter((_, idx) => selectedQuestionIndices.includes(idx));
    if (selected.length === 0) return;

    const newAptitude: AptitudeQuestion[] = [];
    const newDsa: DSAProblem[] = [];
    const newSql: SQLChallenge[] = [];

    selected.forEach((q, idx) => {
      const qType = q.type || 'aptitude';
      if (qType === 'dsa') {
        newDsa.push({
          id: q.id || `dsa-doc-${Date.now()}-${idx}`,
          title: q.title || q.question.split('\n')[0].substring(0, 45) || 'Coding Problem',
          difficulty: q.difficulty || 'Medium',
          category: q.topic || 'Arrays',
          companies: ['Placement Assessment'],
          acceptance: '75%',
          description: q.question,
          examples: [{ input: 'Standard Input', output: 'Expected Output' }],
          constraints: ['N <= 10^5'],
          starterCodes: {
            javascript: q.starterCode || `function solution(input) {\n  // Solved algorithm\n  return true;\n}`,
            python: `def solution(input):\n    return True`,
            cpp: `int solution(int n) {\n    return n;\n}`,
            java: `public class Solution {\n    public static void main(String[] args) {}\n}`
          },
          testCases: [{ input: "test", expected: "test" }],
          hints: [q.explanation || 'Analyze constraints and data structures'],
          optimalSolution: {
            language: 'javascript',
            code: q.starterCode || 'function solve() {}',
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1)',
            explanation: q.explanation || 'Optimal approach'
          }
        });
      } else if (qType === 'sql') {
        newSql.push({
          id: q.id || `sql-doc-${Date.now()}-${idx}`,
          title: q.title || q.question.split('\n')[0].substring(0, 45) || 'SQL Query Challenge',
          difficulty: q.difficulty || 'Medium',
          topic: q.topic || 'Joins',
          description: q.question,
          relevantTables: ['employees', 'departments'],
          starterQuery: q.starterQuery || 'SELECT * FROM employees;',
          expectedQuery: q.starterQuery || 'SELECT * FROM employees;',
          hints: [q.explanation || 'Use standard ANSI SQL syntax']
        });
      } else {
        newAptitude.push({
          id: q.id || `apt-doc-${Date.now()}-${idx}`,
          section: (q.section as any) || 'Quantitative',
          topic: q.topic || 'Campus Aptitude',
          difficulty: (q.difficulty as any) || 'Intermediate',
          question: q.question,
          options: q.options && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0,
          explanation: q.explanation || 'Step-by-step logic',
          formula: q.formula,
          companyTags: ['Tier-1 Campus Drive']
        });
      }
    });

    if (newAptitude.length > 0) {
      setAptitudeList(prev => [...newAptitude, ...prev]);
      try { localStorage.setItem('placeprep_aptitude_questions', JSON.stringify([...newAptitude, ...aptitudeList])); } catch {}
    }

    if (newDsa.length > 0) {
      setDsaList(prev => [...newDsa, ...prev]);
      try { localStorage.setItem('placeprep_dsa_problems', JSON.stringify([...newDsa, ...dsaList])); } catch {}
    }

    if (newSql.length > 0) {
      setSqlList(prev => [...newSql, ...prev]);
      try { localStorage.setItem('placeprep_sql_challenges', JSON.stringify([...newSql, ...sqlList])); } catch {}
    }

    if (onBatchUpdateStudentPortal) {
      onBatchUpdateStudentPortal({ aptitude: newAptitude, dsa: newDsa, sql: newSql });
    }

    setDocUploadSuccessMessage(`Successfully published ${selected.length} questions directly to the Student Portal!`);
    setExtractedDocQuestions([]);
  };

  // Handlers for Save and Delete in Admin lists
  const handleSaveEdit = () => {
    if (!editingItem) return;
    const { category, item, isNew } = editingItem;

    if (category === 'aptitude') {
      const updated = isNew 
        ? [item, ...aptitudeList] 
        : aptitudeList.map(q => q.id === item.id ? item : q);
      setAptitudeList(updated);
      try { localStorage.setItem('placeprep_aptitude_questions', JSON.stringify(updated)); } catch {}
      if (onBatchUpdateStudentPortal) onBatchUpdateStudentPortal({ aptitude: updated });
    } else if (category === 'dsa') {
      const updated = isNew 
        ? [item, ...dsaList] 
        : dsaList.map(p => p.id === item.id ? item : p);
      setDsaList(updated);
      try { localStorage.setItem('placeprep_dsa_problems', JSON.stringify(updated)); } catch {}
      if (onBatchUpdateStudentPortal) onBatchUpdateStudentPortal({ dsa: updated });
    } else if (category === 'sql') {
      const updated = isNew 
        ? [item, ...sqlList] 
        : sqlList.map(s => s.id === item.id ? item : s);
      setSqlList(updated);
      try { localStorage.setItem('placeprep_sql_challenges', JSON.stringify(updated)); } catch {}
      if (onBatchUpdateStudentPortal) onBatchUpdateStudentPortal({ sql: updated });
    } else if (category === 'flashcard') {
      const updated = isNew 
        ? [item, ...flashcardList] 
        : flashcardList.map(f => f.id === item.id ? item : f);
      setFlashcardList(updated);
      try { localStorage.setItem('placeprep_flashcards', JSON.stringify(updated)); } catch {}
      if (onBatchUpdateStudentPortal) onBatchUpdateStudentPortal({ flashcard: updated });
    }

    setEditingItem(null);
  };

  const handleDeleteItem = (category: 'aptitude' | 'dsa' | 'sql' | 'flashcard', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    if (category === 'aptitude') {
      const updated = aptitudeList.filter(q => q.id !== id);
      setAptitudeList(updated);
      try { localStorage.setItem('placeprep_aptitude_questions', JSON.stringify(updated)); } catch {}
    } else if (category === 'dsa') {
      const updated = dsaList.filter(p => p.id !== id);
      setDsaList(updated);
      try { localStorage.setItem('placeprep_dsa_problems', JSON.stringify(updated)); } catch {}
    } else if (category === 'sql') {
      const updated = sqlList.filter(s => s.id !== id);
      setSqlList(updated);
      try { localStorage.setItem('placeprep_sql_challenges', JSON.stringify(updated)); } catch {}
    } else if (category === 'flashcard') {
      const updated = flashcardList.filter(f => f.id !== id);
      setFlashcardList(updated);
      try { localStorage.setItem('placeprep_flashcards', JSON.stringify(updated)); } catch {}
    }
  };

  // Create empty templates for new items
  const handleAddNewItem = (category: 'aptitude' | 'dsa' | 'sql' | 'flashcard') => {
    const timestamp = Date.now();
    if (category === 'aptitude') {
      const newItem: AptitudeQuestion = {
        id: `apt-${timestamp}`,
        section: 'Quantitative',
        topic: 'New Topic',
        difficulty: 'Intermediate',
        question: 'Enter question text here...',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        explanation: 'Enter step-by-step logic here...',
        formula: '',
        companyTags: ['Campus Drive']
      };
      setEditingItem({ category: 'aptitude', item: newItem, isNew: true });
    } else if (category === 'dsa') {
      const newItem: DSAProblem = {
        id: `dsa-${timestamp}`,
        title: 'New DSA Problem',
        difficulty: 'Medium',
        category: 'Arrays',
        companies: ['Tech Drive'],
        acceptance: '70%',
        description: 'Enter problem description here...',
        examples: [{ input: 'nums = [1, 2, 3]', output: '6' }],
        constraints: ['1 <= nums.length <= 10^5'],
        starterCodes: {
          javascript: 'function solution(nums) {\n  // Write solution\n}',
          python: 'def solution(nums):\n    pass',
          cpp: 'int solution(vector<int>& nums) {\n    return 0;\n}',
          java: 'public class Solution {\n    public int solution(int[] nums) {\n        return 0;\n    }\n}'
        },
        testCases: [{ input: '[1, 2, 3]', expected: '6' }],
        hints: ['Hint 1'],
        optimalSolution: {
          language: 'javascript',
          code: 'function solution() {}',
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)',
          explanation: 'Explanation of optimal approach'
        }
      };
      setEditingItem({ category: 'dsa', item: newItem, isNew: true });
    } else if (category === 'sql') {
      const newItem: SQLChallenge = {
        id: `sql-${timestamp}`,
        title: 'New SQL Challenge',
        difficulty: 'Medium',
        topic: 'Joins',
        description: 'Enter SQL problem statement here...',
        relevantTables: ['employees', 'departments'],
        starterQuery: 'SELECT * FROM employees;',
        expectedQuery: 'SELECT * FROM employees WHERE salary > 50000;',
        hints: ['Consider using INNER JOIN']
      };
      setEditingItem({ category: 'sql', item: newItem, isNew: true });
    } else if (category === 'flashcard') {
      const newItem: Flashcard = {
        id: `fc-${timestamp}`,
        subject: 'Operating Systems',
        topic: 'Process & Memory',
        front: 'What is a deadlock?',
        back: 'A state where a set of processes are blocked because each process holds a resource and waits for another resource held by another process.',
        codeSnippet: ''
      };
      setEditingItem({ category: 'flashcard', item: newItem, isNew: true });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Admin Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-amber-50 border border-amber-200 p-6 rounded-3xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>Placement Officer & Curriculum Admin Portal</span>
          </div>
          <h2 className="text-2xl font-extrabold text-amber-950 tracking-tight">
            Curriculum Ingestion & Repository Manager
          </h2>
          <p className="text-xs text-amber-800 mt-1">
            Upload papers to parse questions, view/edit all existing Aptitude, DSA, and SQL questions, and publish to student portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('doc-upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'doc-upload'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-300'
            }`}
          >
            📄 Ingest Test Document
          </button>
          <button
            onClick={() => setActiveAdminTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeAdminTab === 'analytics'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-300'
            }`}
          >
            📊 Candidate Analytics
          </button>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-2 text-xs font-bold">
        {[
          { id: 'doc-upload', label: 'PDF/Word Question Parser', icon: UploadCloud },
          { id: 'aptitude', label: `Aptitude Bank (${aptitudeList.length})`, icon: Award },
          { id: 'dsa', label: `DSA Problems (${dsaList.length})`, icon: Code2 },
          { id: 'sql', label: `SQL Repository (${sqlList.length})`, icon: Database },
          { id: 'flashcards', label: `Core Flashcards (${flashcardList.length})`, icon: BookOpen },
          { id: 'analytics', label: 'Candidate Analytics', icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                isActive ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DOCUMENT UPLOAD & PARSER TAB */}
      {activeAdminTab === 'doc-upload' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-slate-900" />
                Word (.docx) & PDF Placement Paper Extractor
              </h3>
              <button
                onClick={handleLoadSamplePaper}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold border border-slate-200 transition cursor-pointer"
              >
                ⚡ Load Sample Tier-1 Test Paper (Aptitude, DSA & SQL)
              </button>
            </div>

            {docUploadSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {docUploadSuccessMessage}
              </div>
            )}

            {/* Drag & Drop File Zone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl p-8 text-center space-y-4 transition bg-slate-50">
              <input
                type="file"
                id="docFileInput"
                accept=".docx,.doc,.pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="docFileInput" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-900 shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {uploadedFile ? uploadedFile.name : 'Click to upload Word (.docx) or PDF Test Paper'}
                </div>
                <p className="text-xs text-slate-500">
                  Supports question papers with Aptitude MCQs, DSA algorithms, and SQL database queries.
                </p>
              </label>

              {uploadedFile && (
                <button
                  onClick={handleAnalyzeAndExtractQuestions}
                  disabled={isAnalyzingDoc}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {isAnalyzingDoc ? 'Parsing Document Questions...' : 'Extract & Structure Questions'}
                </button>
              )}
            </div>

            {/* Extracted Preview List */}
            {extractedDocQuestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Detected {extractedDocQuestions.length} Extracted Items ({selectedQuestionIndices.length} Selected for Publishing)
                  </span>

                  <button
                    onClick={handlePublishToStudentPortal}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Publish Selected to Student Portal ✓
                  </button>
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {extractedDocQuestions.map((q, idx) => {
                    const isSelected = selectedQuestionIndices.includes(idx);
                    const qType = q.type || 'aptitude';
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-white border-slate-900 ring-2 ring-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectQuestion(idx)}
                              className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
                            />
                            <span>Q{idx + 1}. {q.topic || (qType === 'dsa' ? 'DSA Problem' : qType === 'sql' ? 'SQL Challenge' : 'Aptitude Question')}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                              qType === 'dsa' ? 'bg-purple-100 text-purple-900' :
                              qType === 'sql' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {qType === 'dsa' ? '💻 DSA Code' : qType === 'sql' ? '🗄️ SQL Query' : '✏️ Aptitude MCQ'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem({ category: qType as any, item: { ...q }, isNew: false });
                              }}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" /> Edit Item
                            </button>
                          </div>
                        </div>

                        <p className="font-semibold text-slate-900 mb-2 leading-relaxed">{q.question}</p>

                        {/* Aptitude MCQ Options */}
                        {qType === 'aptitude' && q.options && (
                          <div className="grid grid-cols-2 gap-1.5 text-slate-700 font-mono text-[11px] mb-2">
                            {q.options.map((opt: string, i: number) => (
                              <div key={i} className={`p-1.5 rounded ${i === q.correctIndex ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'bg-slate-100'}`}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* DSA Problem Preview */}
                        {qType === 'dsa' && (
                          <div className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] mb-2 space-y-1">
                            <span className="text-purple-400 font-bold block">// Starter Code Preview</span>
                            <pre className="whitespace-pre-wrap max-h-24 overflow-y-auto">{q.starterCode || `function solution(input) {\n  // Code algorithm\n}`}</pre>
                          </div>
                        )}

                        {/* SQL Challenge Preview */}
                        {qType === 'sql' && (
                          <div className="p-2.5 rounded bg-slate-900 text-emerald-400 font-mono text-[11px] mb-2 space-y-1">
                            <span className="text-blue-400 font-bold block">-- Target SQL Query</span>
                            <pre className="whitespace-pre-wrap max-h-24 overflow-y-auto">{q.starterQuery || 'SELECT * FROM table;'}</pre>
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-[11px] text-slate-600 bg-slate-100 p-2 rounded italic">
                            💡 Explanation: {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. APTITUDE BANK TAB */}
      {activeAdminTab === 'aptitude' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Aptitude Question Repository</h3>
              <p className="text-xs text-slate-500">View, create, and edit aptitude questions.</p>
            </div>
            <button
              onClick={() => handleAddNewItem('aptitude')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Aptitude Question
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {aptitudeList.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:bg-slate-100/60 transition">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white text-[10px]">{q.section}</span>
                    <span>{q.topic}</span>
                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">{q.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem({ category: 'aptitude', item: { ...q }, isNew: false })}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem('aptitude', q.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-slate-900 leading-relaxed">{q.question}</p>

                {q.options && (
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`p-1.5 rounded ${i === q.correctIndex ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'bg-white border border-slate-200'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                )}

                {q.explanation && (
                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                    💡 Logic: {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DSA PROBLEMS TAB */}
      {activeAdminTab === 'dsa' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">DSA Problem Repository</h3>
              <p className="text-xs text-slate-500">View, create, and edit Data Structures & Algorithms coding challenges.</p>
            </div>
            <button
              onClick={() => handleAddNewItem('dsa')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add DSA Problem
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {dsaList.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:bg-slate-100/60 transition">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-purple-900 text-white text-[10px]">{p.category}</span>
                    <span className="text-sm font-extrabold">{p.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      p.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                      p.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem({ category: 'dsa', item: { ...p }, isNew: false })}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem('dsa', p.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">{p.description}</p>

                {p.starterCodes?.javascript && (
                  <div className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1">
                    <span className="text-purple-400 font-bold block">// JavaScript Starter Code</span>
                    <pre className="whitespace-pre-wrap max-h-24 overflow-y-auto">{p.starterCodes.javascript}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SQL REPOSITORY TAB */}
      {activeAdminTab === 'sql' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">SQL Challenge Repository</h3>
              <p className="text-xs text-slate-500">View, create, and edit SQL query challenges.</p>
            </div>
            <button
              onClick={() => handleAddNewItem('sql')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add SQL Challenge
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {sqlList.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:bg-slate-100/60 transition">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-900 text-white text-[10px]">{s.topic}</span>
                    <span className="text-sm font-extrabold">{s.title}</span>
                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">{s.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem({ category: 'sql', item: { ...s }, isNew: false })}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem('sql', s.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">{s.description}</p>

                {s.starterQuery && (
                  <div className="p-2.5 rounded bg-slate-900 text-emerald-400 font-mono text-[11px] space-y-1">
                    <span className="text-blue-400 font-bold block">-- Starter SQL Query</span>
                    <pre className="whitespace-pre-wrap max-h-24 overflow-y-auto">{s.starterQuery}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CORE FLASHCARDS TAB */}
      {activeAdminTab === 'flashcards' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Core CS Flashcards Repository</h3>
              <p className="text-xs text-slate-500">View, create, and edit OS, DBMS, Networks & OOP flashcards.</p>
            </div>
            <button
              onClick={() => handleAddNewItem('flashcard')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Flashcard
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {flashcardList.map((f) => (
              <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:bg-slate-100/60 transition">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-900 text-white text-[10px]">{f.subject}</span>
                    <span className="text-xs font-extrabold">{f.topic}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem({ category: 'flashcard', item: { ...f }, isNew: false })}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem('flashcard', f.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">❓ Front (Question):</span>
                    <p className="text-slate-900">{f.front}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">💡 Back (Answer):</span>
                    <p className="text-slate-900">{f.back}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CANDIDATE ANALYTICS TAB */}
      {activeAdminTab === 'analytics' && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Student Placement Cohort Readiness</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">DSA Score</th>
                  <th className="p-3">Aptitude Score</th>
                  <th className="p-3">SQL Score</th>
                  <th className="p-3">Readiness</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Devika Sharma</td>
                  <td className="p-3">Computer Science</td>
                  <td className="p-3">82%</td>
                  <td className="p-3">88%</td>
                  <td className="p-3">75%</td>
                  <td className="p-3 font-bold text-slate-900">83%</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Placement Ready</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Aarav Gupta</td>
                  <td className="p-3">Information Tech</td>
                  <td className="p-3">94%</td>
                  <td className="p-3">90%</td>
                  <td className="p-3">92%</td>
                  <td className="p-3 font-bold text-slate-900">92%</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Super Dream Tier</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= EDIT / CREATE ITEM MODAL ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-slate-900" />
                {editingItem.isNew ? 'Create New' : 'Edit Existing'} {editingItem.category.toUpperCase()} Item
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* APTITUDE EDIT FORM */}
            {editingItem.category === 'aptitude' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Section</label>
                    <select
                      value={editingItem.item.section || 'Quantitative'}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, section: e.target.value } })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    >
                      <option value="Quantitative">Quantitative</option>
                      <option value="Logical">Logical</option>
                      <option value="Verbal">Verbal</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Difficulty</label>
                    <select
                      value={editingItem.item.difficulty || 'Intermediate'}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, difficulty: e.target.value } })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Topic</label>
                  <input
                    type="text"
                    value={editingItem.item.topic || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, topic: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                    placeholder="e.g. Time & Work"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Question Statement</label>
                  <textarea
                    rows={3}
                    value={editingItem.item.question || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, question: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    placeholder="Enter question statement..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Multiple Choice Options (4)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(editingItem.item.options || ['A', 'B', 'C', 'D']).map((opt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-500">{String.fromCharCode(65 + idx)}:</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(editingItem.item.options || [])];
                            newOpts[idx] = e.target.value;
                            setEditingItem({ ...editingItem, item: { ...editingItem.item, options: newOpts } });
                          }}
                          className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Correct Answer Option</label>
                  <select
                    value={editingItem.item.correctIndex ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, correctIndex: parseInt(e.target.value, 10) } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-emerald-800"
                  >
                    {(editingItem.item.options || []).map((opt: string, idx: number) => (
                      <option key={idx} value={idx}>
                        Option {String.fromCharCode(65 + idx)}: {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Step-by-Step Logic Explanation</label>
                  <textarea
                    rows={2}
                    value={editingItem.item.explanation || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, explanation: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>
            )}

            {/* DSA EDIT FORM */}
            {editingItem.category === 'dsa' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Problem Title</label>
                    <input
                      type="text"
                      value={editingItem.item.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, title: e.target.value } })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Difficulty</label>
                    <select
                      value={editingItem.item.difficulty || 'Medium'}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, difficulty: e.target.value } })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingItem.item.category || 'Arrays'}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, category: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Problem Description</label>
                  <textarea
                    rows={3}
                    value={editingItem.item.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, description: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">JavaScript Starter Code</label>
                  <textarea
                    rows={3}
                    value={editingItem.item.starterCodes?.javascript || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      item: {
                        ...editingItem.item,
                        starterCodes: { ...editingItem.item.starterCodes, javascript: e.target.value }
                      }
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono bg-slate-900 text-slate-100 text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* SQL EDIT FORM */}
            {editingItem.category === 'sql' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Challenge Title</label>
                    <input
                      type="text"
                      value={editingItem.item.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, title: e.target.value } })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Difficulty</label>
                    <select
                      value={editingItem.item.difficulty || 'Medium'}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, difficulty: e.target.value } })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">SQL Topic</label>
                  <input
                    type="text"
                    value={editingItem.item.topic || 'Joins'}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, topic: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Challenge Description</label>
                  <textarea
                    rows={3}
                    value={editingItem.item.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, description: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Starter SQL Query</label>
                  <textarea
                    rows={3}
                    value={editingItem.item.starterQuery || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, starterQuery: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono bg-slate-900 text-emerald-400 text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* FLASHCARD EDIT FORM */}
            {editingItem.category === 'flashcard' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Subject</label>
                    <select
                      value={editingItem.item.subject || 'Operating Systems'}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, subject: e.target.value } })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                    >
                      <option value="Operating Systems">Operating Systems</option>
                      <option value="Computer Networks">Computer Networks</option>
                      <option value="Database Management Systems">Database Management Systems</option>
                      <option value="Object-Oriented Programming">Object-Oriented Programming</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Topic</label>
                    <input
                      type="text"
                      value={editingItem.item.topic || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, topic: e.target.value } })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Front (Question / Prompt)</label>
                  <textarea
                    rows={2}
                    value={editingItem.item.front || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, front: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Back (Answer / Explanation)</label>
                  <textarea
                    rows={3}
                    value={editingItem.item.back || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, back: e.target.value } })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
