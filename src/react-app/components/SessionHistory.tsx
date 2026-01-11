import { useEffect, useState } from 'react';
import { X, TrendingUp, Calendar, Clock } from 'lucide-react';
import { BreathingMode } from '@/react-app/pages/Home';

interface SessionHistoryProps {
  onClose: () => void;
}

interface SessionData {
  id: number;
  mode: string;
  created_at: string;
  completed: number;
  comfort_rating: string | null;
}

interface Stats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  favoriteMode: string;
  modeBreakdown: Record<string, number>;
}

export default function SessionHistory({ onClose }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/breathing/sessions?limit=50');
        
        if (!res.ok) {
          throw new Error('Failed to fetch session history');
        }
        
        const data = await res.json();
        setSessions(data);
        
        // Calculate stats
        const completed = data.filter((s: SessionData) => s.completed);
        const modeCount: Record<string, number> = {};
        
        completed.forEach((s: SessionData) => {
          modeCount[s.mode] = (modeCount[s.mode] || 0) + 1;
        });
        
        const favoriteMode = Object.entries(modeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'daily';
        
        // Calculate streak
        let streak = 0;
        const dates = completed.map((s: SessionData) => new Date(s.created_at).toDateString());
        const uniqueDatesSet = new Set<string>(dates);
        const uniqueDates = Array.from(uniqueDatesSet).sort((a, b) => {
          return new Date(b).getTime() - new Date(a).getTime();
        });
        
        for (let i = 0; i < uniqueDates.length; i++) {
          const dateStr = uniqueDates[i];
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - i);
          
          if (dateStr === expectedDate.toDateString()) {
            streak++;
          } else {
            break;
          }
        }
        
        setStats({
          totalSessions: completed.length,
          totalMinutes: Math.round(completed.length * 7), // Rough estimate
          currentStreak: streak,
          favoriteMode,
          modeBreakdown: modeCount
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        // Set empty data on error so UI can still render
        setSessions([]);
        setStats({
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          favoriteMode: 'daily',
          modeBreakdown: {}
        });
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getModeColor = (mode: string) => {
    const colors = {
      daily: 'from-indigo-500 to-purple-500',
      reset: 'from-cyan-500 to-blue-500',
      silent: 'from-violet-500 to-fuchsia-500'
    };
    return colors[mode as BreathingMode] || colors.daily;
  };

  const getModeLabel = (mode: string) => {
    const labels = {
      daily: 'Daily',
      reset: 'Reset',
      silent: 'Silent'
    };
    return labels[mode as BreathingMode] || mode;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6 relative overflow-hidden animate-fadeIn">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-xl group"
      >
        <X className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors" />
      </button>

      {/* Content */}
      <div className="max-w-4xl w-full relative z-10 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="space-y-8 pb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extralight text-white/95 mb-3 tracking-wide">Your Progress</h1>
            <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-white/10 border-b-white/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center transform hover:scale-105 transition-transform duration-300 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="text-3xl font-light text-white mb-1">{stats.totalSessions}</div>
                    <div className="text-xs text-white/60">Total Sessions</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center transform hover:scale-105 transition-transform duration-300 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="text-3xl font-light text-white mb-1">{stats.totalMinutes}</div>
                    <div className="text-xs text-white/60">Minutes</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center transform hover:scale-105 transition-transform duration-300 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                    <div className="text-3xl font-light text-white mb-1">{stats.currentStreak}</div>
                    <div className="text-xs text-white/60">Day Streak</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center transform hover:scale-105 transition-transform duration-300 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                    <div className={`text-2xl font-light bg-gradient-to-r ${getModeColor(stats.favoriteMode)} bg-clip-text text-transparent mb-1`}>
                      {getModeLabel(stats.favoriteMode)}
                    </div>
                    <div className="text-xs text-white/60">Favorite</div>
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <h2 className="text-2xl font-light text-white mb-6">Recent Sessions</h2>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-block mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-white/30" />
                      </div>
                    </div>
                    <p className="text-white/50 text-lg">No sessions yet</p>
                    <p className="text-white/30 text-sm mt-2">Start your first practice to see your progress!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 20).map((session, idx) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:scale-[1.02] animate-slideInUp"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getModeColor(session.mode)} flex items-center justify-center transform hover:rotate-12 transition-transform duration-300`}>
                            <div className="text-xs font-medium text-white">
                              {getModeLabel(session.mode)[0]}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white/90">{getModeLabel(session.mode)} Session</div>
                            <div className="text-xs text-white/50 flex items-center space-x-3 mt-1">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(session.created_at).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {session.completed ? (
                            <div className="flex items-center space-x-2">
                              {session.comfort_rating && (
                                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                                  {session.comfort_rating}
                                </span>
                              )}
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-white/30" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
