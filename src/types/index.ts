export type ModuleTab = 
  | 'dashboard' 
  | 'aptitude' 
  | 'dsa' 
  | 'sql' 
  | 'core-cs' 
  | 'mock-interview' 
  | 'resume' 
  | 'leaderboard' 
  | 'admin';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college: string;
  batch: string;
  targetRole: string;
  token?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  batch: string;
  targetRole: string;
  targetCompany: string;
  streakDays: number;
  lastActiveDate: string;
  xpPoints: number;
  level: string;
  readinessScore: number; // 0-100
  moduleScores: {
    dsa: number; // 0-100
    aptitude: number; // 0-100
    sql: number; // 0-100
    coreCS: number; // 0-100
    consistency: number; // 0-100
  };
  solvedDSAIds: string[];
  solvedAptitudeIds: string[];
  solvedSqlIds: string[];
  masteredFlashcardIds: string[];
  completedMaterials: string[];
  badges: AchievementBadge[];
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type DsaDifficulty = 'Easy' | 'Medium' | 'Hard';
export type DsaCategory = 
  | 'Arrays' 
  | 'Strings' 
  | 'Searching' 
  | 'Sorting' 
  | 'Hashing' 
  | 'Recursion' 
  | 'Stack' 
  | 'Queue' 
  | 'Linked List' 
  | 'Trees' 
  | 'Binary Search Tree' 
  | 'Heap' 
  | 'Graph' 
  | 'Greedy Algorithms' 
  | 'Dynamic Programming';

export interface DsaTestCase {
  input: any;
  expected: any;
  isHidden?: boolean;
}

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: DsaDifficulty;
  category: DsaCategory;
  companies: string[];
  acceptance: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCodes: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  testCases: DsaTestCase[];
  hints: string[]; // 6-stage progressive hints
  optimalSolution: {
    language: string;
    code: string;
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
  };
}

export type AptitudeSection = 'Quantitative' | 'Logical' | 'Verbal';
export type AptitudeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface AptitudeQuestion {
  id: string;
  section: AptitudeSection;
  topic: string;
  difficulty: AptitudeDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formula?: string;
  companyTags?: string[];
}

export type SqlTopic = 
  | 'Basic Queries' 
  | 'Filtering' 
  | 'Sorting' 
  | 'Aggregate Functions' 
  | 'GROUP BY' 
  | 'HAVING' 
  | 'Joins' 
  | 'Subqueries' 
  | 'Window Functions' 
  | 'Advanced SQL';

export interface SQLChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: SqlTopic;
  description: string;
  relevantTables: string[];
  starterQuery: string;
  expectedQuery: string;
  hints: string[];
}

export type CoreCSSubject = 
  | 'Operating Systems' 
  | 'Computer Networks' 
  | 'Database Management Systems' 
  | 'Object-Oriented Programming';

export interface CoreCSMaterial {
  id: string;
  subject: CoreCSSubject;
  topic: string;
  importance: 'High' | 'Very High' | 'Critical';
  summary: string;
  keyConcepts: { title: string; points: string[] }[];
  frequentInterviewQuestions: { question: string; answer: string }[];
}

export interface Flashcard {
  id: string;
  subject: CoreCSSubject;
  topic: string;
  front: string;
  back: string;
  codeSnippet?: string;
}

export interface MockInterviewSlot {
  id: string;
  role: string;
  company: string;
  date: string;
  timeSlot: string;
  type: 'Technical DSA' | 'Core CS & System Design' | 'HR & Behavioral' | 'Full Placement Simulation';
  interviewerName: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  feedbackReport?: {
    technicalScore: number;
    communicationScore: number;
    problemSolvingScore: number;
    overallRecommendation: string;
    strengths: string[];
    improvements: string[];
    detailedNotes: string;
  };
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
    portfolio: string;
    summary: string;
  };
  targetRole: string;
  template: 'sde-modern' | 'data-analyst' | 'core-placement';
  education: {
    degree: string;
    institution: string;
    period: string;
    score: string;
  }[];
  skills: {
    category: string;
    items: string;
  }[];
  experience: {
    role: string;
    company: string;
    location: string;
    duration: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    techStack: string;
    link?: string;
    bullets: string[];
  }[];
  certifications: string[];
  achievements: string[];
  atsScore?: number;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  college: string;
  avatar: string;
  xpPoints: number;
  streakDays: number;
  readinessScore: number;
  badgeCount: number;
}
