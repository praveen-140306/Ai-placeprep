import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldAlert, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Briefcase,
  Key,
  Bot
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import { triggerConfetti } from '../../utils/readiness';

interface AuthPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('National Institute of Technology');
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE)');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdminDetected = email.toLowerCase().includes('admin') || selectedRole === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const detectedRole: UserRole = isAdminDetected ? 'admin' : 'student';

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email, password, role: detectedRole }
        : { name, email, password, role: detectedRole, college, targetRole };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      triggerConfetti();
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong during token generation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    if (role === 'admin') {
      const adminUser: AuthUser = {
        id: 'admin-101',
        name: 'Dr. K. Sharma (Placement Officer)',
        email: 'admin@placeprep.edu',
        role: 'admin',
        college: 'National Institute of Technology',
        batch: 'Placement Cell Administration',
        targetRole: 'Placement Officer',
        token: 'tokenized_jwt_admin_session_demo',
      };
      triggerConfetti();
      onLoginSuccess(adminUser);
    } else {
      const studentUser: AuthUser = {
        id: 'stu-101',
        name: 'Devika Sharma',
        email: 'devika.s@engineering.edu',
        role: 'student',
        college: 'National Institute of Technology',
        batch: '2026 Batch - Computer Science',
        targetRole: 'Software Development Engineer (SDE)',
        token: 'tokenized_jwt_student_session_demo',
      };
      triggerConfetti();
      onLoginSuccess(studentUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white shadow-md mb-1">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            PlacePrep<span className="text-slate-500">.AI</span>
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Placement Prep Platform with Dual AI Model Engine (Local LLM & OpenAI)
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Indicator */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Placement Admin</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Devika Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'admin@placeprep.edu' : 'student@engineering.edu'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College / Institute</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Role</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Tokenizing & Authenticating...' : (mode === 'login' ? 'Sign In & Issue JWT Token' : 'Register & Enter Portal')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Instant Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* System Info Banner */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>JWT Bearer Token Authentication Active</span>
          </div>
          <span className="font-bold text-slate-900">PlacePrep v2.0</span>
        </div>
      </div>
    </div>
  );
};
