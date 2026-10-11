/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ModuleTab, UserRole, StudentProfile, AuthUser, AptitudeQuestion, DSAProblem, SQLChallenge, Flashcard } from './types';
import { initialStudentProfile, sampleAptitudeQuestions, sampleDsaProblems, sampleSqlChallenges, sampleFlashcards } from './data/mockData';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { DsaPlatform } from './components/DSA/DsaPlatform';
import { AptitudeModule } from './components/Aptitude/AptitudeModule';
import { SqlPractice } from './components/SQL/SqlPractice';
import { CoreCSModule } from './components/CoreCS/CoreCSModule';
import { MockInterviewModule } from './components/MockInterview/MockInterviewModule';
import { ResumeBuilder } from './components/Resume/ResumeBuilder';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AuthPage } from './components/Auth/AuthPage';
import { AuthModal } from './components/Auth/AuthModal';
import { calculateReadinessScore } from './utils/readiness';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  // Auth state: null by default so Login / Register screen shows first
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('placeprep_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    return authUser?.role || 'student';
  });

  const [currentTab, setCurrentTab] = useState<ModuleTab>(() => {
    return authUser?.role === 'admin' ? 'admin' : 'dashboard';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Student Profile State
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('placeprep_student_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialStudentProfile;
  });

  // Dynamic Question Repositories (Syncs questions uploaded by admin via Word/PDF)
  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('placeprep_aptitude_questions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return sampleAptitudeQuestions;
  });

  const [dsaProblems, setDsaProblems] = useState<DSAProblem[]>(() => {
    try {
      const saved = localStorage.getItem('placeprep_dsa_problems');
      if (saved) return JSON.parse(saved);
    } catch {}
    return sampleDsaProblems;
  });

  const [sqlChallenges, setSqlChallenges] = useState<SQLChallenge[]>(() => {
    try {
      const saved = localStorage.getItem('placeprep_sql_challenges');
      if (saved) return JSON.parse(saved);
    } catch {}
    return sampleSqlChallenges;
  });

  const [flashcardsList, setFlashcardsList] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('placeprep_flashcards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return sampleFlashcards;
  });

  // Strict Route Guard: If a student tries to access admin tab, force redirect to dashboard
  useEffect(() => {
    if (authUser && authUser.role !== 'admin' && currentTab === 'admin') {
      setCurrentTab('dashboard');
      setUserRole('student');
    }
  }, [authUser, currentTab]);

  // Sync profile to local storage
  useEffect(() => {
    try {
      localStorage.setItem('placeprep_student_profile', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Sync auth user to local storage
  useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem('placeprep_auth_user', JSON.stringify(authUser));
      } else {
        localStorage.removeItem('placeprep_auth_user');
      }
    } catch {}
  }, [authUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setUserRole(user.role);

    if (user.role === 'admin' || user.email.toLowerCase().includes('admin')) {
      setCurrentTab('admin');
      setUserRole('admin');
    } else {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        college: user.college,
        targetRole: user.targetRole,
      }));
      setCurrentTab('dashboard');
      setUserRole('student');
    }
  };

  const handleSignOut = () => {
    setAuthUser(null);
    setUserRole('student');
    setCurrentTab('dashboard');
    try {
      localStorage.removeItem('placeprep_auth_user');
    } catch {}
  };

  // Batch Update from Admin (PDF/Word Document Upload & Questions Ingestion)
  const handleBatchUpdateStudentPortal = ({
    aptitude,
    dsa,
    sql,
    flashcard,
  }: {
    aptitude?: AptitudeQuestion[];
    dsa?: DSAProblem[];
    sql?: SQLChallenge[];
    flashcard?: Flashcard[];
  }) => {
    if (aptitude && aptitude.length > 0) {
      setAptitudeQuestions(prev => {
        const merged = [...aptitude, ...prev];
        try { localStorage.setItem('placeprep_aptitude_questions', JSON.stringify(merged)); } catch {}
        return merged;
      });
    }

    if (dsa && dsa.length > 0) {
      setDsaProblems(prev => {
        const merged = [...dsa, ...prev];
        try { localStorage.setItem('placeprep_dsa_problems', JSON.stringify(merged)); } catch {}
        return merged;
      });
    }

    if (sql && sql.length > 0) {
      setSqlChallenges(prev => {
        const merged = [...sql, ...prev];
        try { localStorage.setItem('placeprep_sql_challenges', JSON.stringify(merged)); } catch {}
        return merged;
      });
    }

    if (flashcard && flashcard.length > 0) {
      setFlashcardsList(prev => {
        const merged = [...flashcard, ...prev];
        try { localStorage.setItem('placeprep_flashcards', JSON.stringify(merged)); } catch {}
        return merged;
      });
    }
  };

  // Handler for solving a DSA problem
  const handleProblemSolved = (problemId: string, xpGain: number) => {
    setProfile((prev) => {
      const alreadySolved = prev.solvedDSAIds.includes(problemId);
      const newSolved = alreadySolved ? prev.solvedDSAIds : [...prev.solvedDSAIds, problemId];
      const newDsaScore = Math.min(100, prev.moduleScores.dsa + (alreadySolved ? 0 : 6));
      
      const updatedModuleScores = {
        ...prev.moduleScores,
        dsa: newDsaScore,
      };

      const updatedProfile: StudentProfile = {
        ...prev,
        xpPoints: prev.xpPoints + (alreadySolved ? 20 : xpGain),
        solvedDSAIds: newSolved,
        moduleScores: updatedModuleScores,
      };

      const { overall } = calculateReadinessScore(updatedProfile);
      updatedProfile.readinessScore = overall;

      return updatedProfile;
    });
  };

  // Handler for completing an Aptitude question
  const handleAptitudeCompleted = (questionId: string, isCorrect: boolean, xpGain: number) => {
    setProfile((prev) => {
      const alreadySolved = prev.solvedAptitudeIds.includes(questionId);
      const newSolved = (isCorrect && !alreadySolved) ? [...prev.solvedAptitudeIds, questionId] : prev.solvedAptitudeIds;
      const newAptScore = isCorrect ? Math.min(100, prev.moduleScores.aptitude + (alreadySolved ? 0 : 3)) : prev.moduleScores.aptitude;

      const updatedModuleScores = {
        ...prev.moduleScores,
        aptitude: newAptScore,
      };

      const updatedProfile: StudentProfile = {
        ...prev,
        xpPoints: prev.xpPoints + xpGain,
        solvedAptitudeIds: newSolved,
        moduleScores: updatedModuleScores,
      };

      const { overall } = calculateReadinessScore(updatedProfile);
      updatedProfile.readinessScore = overall;

      return updatedProfile;
    });
  };

  // Handler for solving a SQL challenge
  const handleSqlCompleted = (challengeId: string, xpGain: number) => {
    setProfile((prev) => {
      const alreadySolved = prev.solvedSqlIds.includes(challengeId);
      const newSolved = alreadySolved ? prev.solvedSqlIds : [...prev.solvedSqlIds, challengeId];
      const newSqlScore = Math.min(100, prev.moduleScores.sql + (alreadySolved ? 0 : 10));

      const updatedModuleScores = {
        ...prev.moduleScores,
        sql: newSqlScore,
      };

      const updatedProfile: StudentProfile = {
        ...prev,
        xpPoints: prev.xpPoints + (alreadySolved ? 20 : xpGain),
        solvedSqlIds: newSolved,
        moduleScores: updatedModuleScores,
      };

      const { overall } = calculateReadinessScore(updatedProfile);
      updatedProfile.readinessScore = overall;

      return updatedProfile;
    });
  };

  // Handler for mastering a flashcard
  const handleFlashcardMastered = (flashcardId: string) => {
    setProfile((prev) => {
      const alreadyMastered = prev.masteredFlashcardIds.includes(flashcardId);
      const newMastered = alreadyMastered ? prev.masteredFlashcardIds : [...prev.masteredFlashcardIds, flashcardId];
      const newCsScore = Math.min(100, prev.moduleScores.coreCS + (alreadyMastered ? 0 : 5));

      const updatedModuleScores = {
        ...prev.moduleScores,
        coreCS: newCsScore,
      };

      const updatedProfile: StudentProfile = {
        ...prev,
        xpPoints: prev.xpPoints + (alreadyMastered ? 10 : 25),
        masteredFlashcardIds: newMastered,
        moduleScores: updatedModuleScores,
      };

      const { overall } = calculateReadinessScore(updatedProfile);
      updatedProfile.readinessScore = overall;

      return updatedProfile;
    });
  };

  // Handler for completing a mock interview
  const handleInterviewCompleted = (xpGain: number) => {
    setProfile((prev) => {
      const updatedBadges = prev.badges.map(b => 
        b.id === 'b-interview-ready' ? { ...b, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] } : b
      );

      const updatedModuleScores = {
        ...prev.moduleScores,
        consistency: Math.min(100, prev.moduleScores.consistency + 5),
      };

      const updatedProfile: StudentProfile = {
        ...prev,
        xpPoints: prev.xpPoints + xpGain,
        badges: updatedBadges,
        moduleScores: updatedModuleScores,
      };

      const { overall } = calculateReadinessScore(updatedProfile);
      updatedProfile.readinessScore = overall;

      return updatedProfile;
    });
  };

  // USER REQUEST: Show Login / Register page first
  if (!authUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        profile={profile}
        authUser={authUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'dsa' && (
          <DsaPlatform
            profile={profile}
            onProblemSolved={handleProblemSolved}
            problemsList={dsaProblems}
          />
        )}

        {currentTab === 'aptitude' && (
          <AptitudeModule
            profile={profile}
            onQuestionCompleted={handleAptitudeCompleted}
            questionsList={aptitudeQuestions}
          />
        )}

        {currentTab === 'sql' && (
          <SqlPractice
            profile={profile}
            onChallengeSolved={handleSqlCompleted}
            challengesList={sqlChallenges}
          />
        )}

        {currentTab === 'core-cs' && (
          <CoreCSModule
            profile={profile}
            onFlashcardMastered={handleFlashcardMastered}
            flashcardsList={flashcardsList}
          />
        )}

        {currentTab === 'mock-interview' && (
          <MockInterviewModule
            profile={profile}
          />
        )}

        {currentTab === 'resume' && (
          <ResumeBuilder
            profile={profile}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardView
            profile={profile}
          />
        )}

        {currentTab === 'admin' && authUser.role === 'admin' && (
          <AdminDashboard
            onBatchUpdateStudentPortal={handleBatchUpdateStudentPortal}
          />
        )}
      </main>

      {/* Switch Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        authUser={authUser}
        onLoginSuccess={handleLoginSuccess}
        onSignOut={handleSignOut}
      />

      {/* Clean White & Black Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">PlacePrep.AI</span>
            <span>•</span>
            <span>Campus Placement Preparation & Ingestion Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>Signed in as: <strong className="text-slate-900">{authUser.name}</strong> ({authUser.role})</span>
            <span>•</span>
            <button 
              onClick={handleSignOut}
              className="text-slate-700 hover:text-slate-900 underline cursor-pointer font-bold"
            >
              Sign Out
            </button>
            <span>•</span>
            <span>Readiness Score: <strong className="text-slate-900">{profile.readinessScore}/100</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
