import { useEffect, useState } from 'react';
import { X, TrendingUp, Award, Target, Flame, Brain, Wind } from 'lucide-react';

interface ProgressDashboardProps {
  onClose: () => void;
}

interface Analytics {
  baseline_lung_capacity: number;
  current_lung_capacity: number;
  capacity_improvement_percent: number;
  total_training_minutes: number;
  consecutive_days_streak: number;
  best_streak: number;
  difficulty_level: string;
}

interface LungMetric {
  max_breath_hold_seconds: number;
  average_inhale_depth: number;
  average_exhale_control: number;
  comfort_level: number;
  created_at: string;
}

export default function ProgressDashboard({ onClose }: ProgressDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<LungMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${apiBase}/api/progress/analytics`, {
          credentials: 'include'
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const data = await res.json();
        setAnalytics(data.analytics);
        setRecentMetrics(data.recentMetrics);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Set empty analytics on error
        setAnalytics({
          baseline_lung_capacity: 0,
          current_lung_capacity: 0,
          capacity_improvement_percent: 0,
          total_training_minutes: 0,
          consecutive_days_streak: 0,
          best_streak: 0,
          difficulty_level: 'beginner'
        });
        setRecentMetrics([]);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [apiBase]);

  const getDifficultyColor = (level: string) => {
    const colors = {
      beginner: 'from-green-500 to-emerald-500',
      intermediate: 'from-yellow-500 to-orange-500',
      advanced: 'from-red-500 to-pink-500'
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  const getImprovementMessage = (improvement: number) => {
    if (improvement > 20) return 'Exceptional progress!';
    if (improvement > 10) return 'Strong improvement';
    if (improvement > 5) return 'Steady progress';
    if (improvement > 0) return 'Making gains';
    return 'Keep practicing';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6 relative overflow-hidden">
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
      <div className="max-w-5xl w-full relative z-10 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent animate-fadeIn">
        <div className="space-y-8 pb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extralight text-white/95 mb-2 tracking-wide">AI Progress Insights</h1>
            <p className="text-white/60 text-sm">Your intelligent breathing coach is tracking your improvement</p>
            <div className="h-px w-48 mx-auto mt-4 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-white/10 border-b-white/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
              </div>
            </div>
          ) : analytics ? (
            <>
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Lung Capacity */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 relative overflow-hidden transform hover:scale-105 transition-transform duration-300 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <Wind className="w-8 h-8 text-indigo-400" />
                      <span className="text-xs text-white/50">Capacity</span>
                    </div>
                    <div className="text-4xl font-extralight text-white mb-1">
                      {Math.round(analytics.current_lung_capacity)}%
                    </div>
                    <div className="text-xs text-white/60">Lung Capacity Score</div>
                    {analytics.capacity_improvement_percent > 0 && (
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${Math.min(100, analytics.current_lung_capacity)}%` }}
                          />
                        </div>
                        <span className="text-xs text-green-400">+{Math.round(analytics.capacity_improvement_percent)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Training Time */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 relative overflow-hidden transform hover:scale-105 transition-transform duration-300 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <Target className="w-8 h-8 text-purple-400" />
                      <span className="text-xs text-white/50">Training</span>
                    </div>
                    <div className="text-4xl font-extralight text-white mb-1">
                      {analytics.total_training_minutes}
                    </div>
                    <div className="text-xs text-white/60">Minutes Practiced</div>
                    <div className="mt-3 text-xs text-purple-400">
                      {getImprovementMessage(analytics.capacity_improvement_percent)}
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 relative overflow-hidden transform hover:scale-105 transition-transform duration-300 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <Flame className="w-8 h-8 text-orange-400" />
                      <span className="text-xs text-white/50">Streak</span>
                    </div>
                    <div className="text-4xl font-extralight text-white mb-1">
                      {analytics.consecutive_days_streak}
                    </div>
                    <div className="text-xs text-white/60">
                      Days | Best: {analytics.best_streak}
                    </div>
                    {analytics.consecutive_days_streak >= 7 && (
                      <div className="mt-3 flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400">On fire!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-white/80" />
                    <h2 className="text-2xl font-light text-white">Your Level</h2>
                  </div>
                  <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getDifficultyColor(analytics.difficulty_level)} text-white text-sm font-medium capitalize shadow-lg`}>
                    {analytics.difficulty_level}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-2xl border transition-all ${analytics.difficulty_level === 'beginner' ? 'bg-green-500/20 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
                    <div className="text-sm text-white/90 mb-1">Beginner</div>
                    <div className="text-xs text-white/60">Building foundation</div>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-all ${analytics.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-white/5 border-white/10'}`}>
                    <div className="text-sm text-white/90 mb-1">Intermediate</div>
                    <div className="text-xs text-white/60">Developing capacity</div>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-all ${analytics.difficulty_level === 'advanced' ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                    <div className="text-sm text-white/90 mb-1">Advanced</div>
                    <div className="text-xs text-white/60">Peak performance</div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/90 text-sm mb-1 font-medium">AI Adaptation Active</p>
                      <p className="text-white/60 text-xs">
                        Your workouts are automatically adjusting based on your performance metrics, 
                        comfort ratings, and lung capacity improvements. Keep practicing consistently 
                        for best results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Performance Metrics */}
              {recentMetrics.length > 0 && (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                  <h2 className="text-2xl font-light text-white mb-6">Recent Performance</h2>
                  <div className="space-y-3">
                    {recentMetrics.slice(0, 5).map((metric, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-white/50">Inhale Depth</div>
                              <div className="text-sm text-white/90">{Math.round((metric.average_inhale_depth || 0) * 100)}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-white/50">Exhale Control</div>
                              <div className="text-sm text-white/90">{Math.round((metric.average_exhale_control || 0) * 100)}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-white/50">Hold Time</div>
                              <div className="text-sm text-white/90">{Math.round(metric.max_breath_hold_seconds || 0)}s</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-white/40">
                          {new Date(metric.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <h2 className="text-2xl font-light text-white mb-6">Smart Insights</h2>
                <div className="space-y-4">
                  {analytics.capacity_improvement_percent > 10 && (
                    <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/90 text-sm mb-1 font-medium">Outstanding Progress</p>
                          <p className="text-white/60 text-xs">
                            You've improved your lung capacity by {Math.round(analytics.capacity_improvement_percent)}%. 
                            This is excellent progress! Your breathing efficiency is significantly better than when you started.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {analytics.consecutive_days_streak >= 7 && (
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-start space-x-3">
                        <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/90 text-sm mb-1 font-medium">Consistency Streak</p>
                          <p className="text-white/60 text-xs">
                            You've practiced {analytics.consecutive_days_streak} days in a row! 
                            Consistency is key to building lasting lung capacity improvements.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {analytics.difficulty_level === 'advanced' && (
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-start space-x-3">
                        <Award className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/90 text-sm mb-1 font-medium">Advanced Practitioner</p>
                          <p className="text-white/60 text-xs">
                            You've reached advanced level! Your breathing control and lung capacity 
                            are in the top tier. Continue challenging yourself with longer sessions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 animate-fadeIn">
              <div className="inline-block mb-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white/30" />
                </div>
              </div>
              <p className="text-white/60 text-lg mb-2">No analytics data yet</p>
              <p className="text-white/40 text-sm">Complete some sessions to see your AI-powered insights!</p>
            </div>
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
