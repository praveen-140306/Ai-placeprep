import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Award, 
  Crown, 
  GraduationCap
} from 'lucide-react';
import { StudentProfile, LeaderboardUser } from '../../types';
import { sampleLeaderboard } from '../../data/mockData';

interface LeaderboardViewProps {
  profile: StudentProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ profile }) => {
  const [leaderboardList] = useState<LeaderboardUser[]>(sampleLeaderboard);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-slate-900" />
            Campus Placement Leaderboard & Hall of Fame
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare placement preparation momentum across engineering colleges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 shadow-xs">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> Your Rank: #4
          </span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {leaderboardList.slice(0, 3).map((user, idx) => {
          const podiumLabels = ['1st Place', '2nd Place', '3rd Place'];
          const isWinner = idx === 0;

          return (
            <div
              key={user.id}
              className={`rounded-2xl bg-white border p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden shadow-xs ${
                isWinner ? 'border-slate-900 ring-2 ring-slate-900' : 'border-slate-200'
              }`}
            >
              <div className="text-4xl mb-1">{user.avatar}</div>
              <div className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-900 text-white">
                {podiumLabels[idx]}
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">{user.name}</h4>
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-600" /> {user.college}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-slate-100 w-full">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> {user.xpPoints.toLocaleString()} XP
                </span>
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {user.streakDays}d Streak
                </span>
                <span className="font-bold text-slate-900">
                  {user.readinessScore}% Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All-India Placement Batch Rankings
          </span>
          <span className="text-xs text-slate-500 font-semibold">Updated Daily</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Institution</th>
                <th className="px-5 py-3">XP Points</th>
                <th className="px-5 py-3">Study Streak</th>
                <th className="px-5 py-3">Readiness Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {leaderboardList.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-bold text-slate-900">#{usr.rank}</td>
                  <td className="px-5 py-3 font-bold text-slate-900 flex items-center gap-2">
                    <span>{usr.avatar}</span>
                    <span>{usr.name}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{usr.college}</td>
                  <td className="px-5 py-3 font-bold text-slate-900">{usr.xpPoints.toLocaleString()} XP</td>
                  <td className="px-5 py-3 text-slate-700">{usr.streakDays} Days</td>
                  <td className="px-5 py-3 font-bold text-slate-900">{usr.readinessScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
