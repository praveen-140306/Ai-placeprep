import React from 'react';
import { 
  Flame, 
  Zap, 
  Award, 
  Code2, 
  Database, 
  BookOpen, 
  Video, 
  FileText, 
  Trophy, 
  LayoutDashboard,
  ShieldAlert,
  GraduationCap,
  LogOut,
  LogIn,
  Bot,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { ModuleTab, UserRole, StudentProfile, AuthUser } from '../types';
import { getReadinessCategory } from '../utils/readiness';

interface NavbarProps {
  currentTab: ModuleTab;
  setCurrentTab: (tab: ModuleTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  profile: StudentProfile;
  authUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  profile,
  authUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  const readinessCategory = getReadinessCategory(profile.readinessScore);
  const isAdmin = authUser?.role === 'admin';

  // Base student navigation items
  const navItems = [
    { id: 'dashboard', label: 'Readiness & Plan', icon: LayoutDashboard },
    { id: 'dsa', label: 'DSA Arena', icon: Code2 },
    { id: 'aptitude', label: 'Aptitude Tests', icon: Award },
    { id: 'sql', label: 'SQL Practice', icon: Database },
    { id: 'core-cs', label: 'Core CS & Cards', icon: BookOpen },
    { id: 'mock-interview', label: 'Mock Interviews', icon: Video },
    { id: 'resume', label: 'ATS Resume', icon: FileText },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner with Student Target and Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  PlacePrep<span className="text-slate-500">.AI</span>
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                  isAdmin 
                    ? 'bg-amber-50 text-amber-900 border-amber-300' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {isAdmin ? <ShieldAlert className="w-3 h-3 text-amber-600" /> : <Bot className="w-3 h-3 text-slate-700" />}
                  {isAdmin ? 'Admin Portal' : 'Student Candidate'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {isAdmin ? 'Curriculum Ingestion, Question Parsing & Cohort Analytics' : 'Placement Practice: DSA • Aptitude • Logical • SQL'}
              </p>
            </div>
          </div>

          {/* Quick Metrics (Streak, XP, Readiness Badge for Students / Admin Info for Admin) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isAdmin ? (
              <>
                {/* Streak */}
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
                  title="Daily Placement Practice Streak"
                >
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{profile.streakDays}d Streak</span>
                </div>

                {/* XP */}
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
                  title="Experience Points earned through solved problems and tests"
                >
                  <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>{profile.xpPoints.toLocaleString()} XP</span>
                </div>

                {/* Placement Readiness Badge */}
                <div 
                  onClick={() => setCurrentTab('dashboard')}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold cursor-pointer transition text-white hover:bg-black shadow-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {profile.readinessScore}% • {readinessCategory.level}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Placement Cell Administrator
                </span>

                {/* Admin View Mode Switcher */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentTab === 'admin') {
                      setCurrentTab('dashboard');
                    } else {
                      setCurrentTab('admin');
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-xs'
                  }`}
                  title={currentTab === 'admin' ? 'Preview Student Portal' : 'Return to Admin Management Portal'}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {currentTab === 'admin' ? 'Preview Student View' : 'Back to Admin Portal'}
                </button>
              </div>
            )}

            {/* Auth User Info & Sign Out Button */}
            {authUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div 
                  onClick={onOpenAuthModal}
                  className="hidden sm:flex flex-col text-right cursor-pointer hover:opacity-80 transition"
                  title="Click to view token & account details"
                >
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {authUser.name}
                  </span>
                  <span className={`text-[10px] uppercase font-semibold ${isAdmin ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                    {isAdmin ? 'Placement Officer' : 'Candidate'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Filtered strictly by role */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {/* Admin Tab (Only visible to Admin role) */}
          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Management Portal</span>
            </button>
          )}

          {/* Student Tabs (Visible to all students, and to admin during preview) */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
