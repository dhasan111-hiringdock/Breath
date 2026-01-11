import { useState } from 'react';
import { BreathingMode } from '@/react-app/pages/Home';
import { Wind, BookOpen, TrendingUp, Settings, Brain } from 'lucide-react';
import BreathPreview from '@/react-app/components/BreathPreview';

interface ModeSelectorProps {
  onSelectMode: (mode: BreathingMode, customize?: boolean) => void;
  onShowGuide: () => void;
  onShowHistory: () => void;
  onShowProgress: () => void;
}

export default function ModeSelector({ onSelectMode, onShowGuide, onShowHistory, onShowProgress }: ModeSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<BreathingMode | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col items-center justify-center p-6 relative overflow-hidden animate-fadeIn">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center mb-16 animate-slideInDown">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
              <Wind className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extralight text-white/95 mb-3 tracking-wide">Breath</h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent mb-3" />
          <p className="text-sm text-white/50 tracking-wider uppercase">Choose your practice</p>
        </div>

        <div className="space-y-5">
          <div className="relative group animate-slideInUp" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => onSelectMode('daily')}
              onMouseEnter={() => setHoveredMode('daily')}
              onMouseLeave={() => setHoveredMode(null)}
              className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border-2 border-white/10 p-8 transition-all duration-500 hover:scale-[1.03] hover:border-indigo-400/40 hover:shadow-2xl hover:shadow-indigo-500/20"
            >
            {/* Animated gradient overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-indigo-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-indigo-400/20 group-hover:via-purple-400/20 group-hover:to-pink-400/20 transition-all duration-700"
              style={{
                transform: hoveredMode === 'daily' ? 'scale(1.1)' : 'scale(1)',
              }}
            />
            
            {/* Glowing corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/30 to-transparent rounded-full blur-2xl group-hover:w-48 group-hover:h-48 transition-all duration-700" />
            
            <div className="relative flex items-start space-x-4">
              <div className="flex-shrink-0">
                <BreathPreview mode="daily" size={56} />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-light text-white mb-1 group-hover:text-indigo-200 transition-colors">Daily Repatterning</h2>
                <p className="text-sm text-white/60 mb-3">6–10 minutes</p>
                <p className="text-xs text-white/50 leading-relaxed">Slowly reprogram your natural breathing rhythm</p>
              </div>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode('daily', true);
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
            title="Customize session"
          >
            <Settings className="w-4 h-4 text-white/60 hover:text-white/90" />
          </button>
        </div>

          <div className="relative group animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => onSelectMode('reset')}
              onMouseEnter={() => setHoveredMode('reset')}
              onMouseLeave={() => setHoveredMode(null)}
              className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border-2 border-white/10 p-8 transition-all duration-500 hover:scale-[1.03] hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-500/20"
            >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-blue-400/0 to-indigo-400/0 group-hover:from-cyan-400/20 group-hover:via-blue-400/20 group-hover:to-indigo-400/20 transition-all duration-700"
              style={{
                transform: hoveredMode === 'reset' ? 'scale(1.1)' : 'scale(1)',
              }}
            />
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-full blur-2xl group-hover:w-48 group-hover:h-48 transition-all duration-700" />
            
            <div className="relative flex items-start space-x-4">
              <div className="flex-shrink-0">
                <BreathPreview mode="reset" size={56} />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-light text-white mb-1 group-hover:text-cyan-200 transition-colors">Breath Reset</h2>
                <p className="text-sm text-white/60 mb-3">45–90 seconds</p>
                <p className="text-xs text-white/50 leading-relaxed">Rapid nervous system reset during stress</p>
              </div>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode('reset', true);
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
            title="Customize session"
          >
            <Settings className="w-4 h-4 text-white/60 hover:text-white/90" />
          </button>
        </div>

          <div className="relative group animate-slideInUp" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => onSelectMode('silent')}
              onMouseEnter={() => setHoveredMode('silent')}
              onMouseLeave={() => setHoveredMode(null)}
              className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-xl border-2 border-white/10 p-8 transition-all duration-500 hover:scale-[1.03] hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-500/20"
            >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-violet-400/0 via-purple-400/0 to-fuchsia-400/0 group-hover:from-violet-400/20 group-hover:via-purple-400/20 group-hover:to-fuchsia-400/20 transition-all duration-700"
              style={{
                transform: hoveredMode === 'silent' ? 'scale(1.1)' : 'scale(1)',
              }}
            />
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/30 to-transparent rounded-full blur-2xl group-hover:w-48 group-hover:h-48 transition-all duration-700" />
            
            <div className="relative flex items-start space-x-4">
              <div className="flex-shrink-0">
                <BreathPreview mode="silent" size={56} />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-light text-white mb-1 group-hover:text-violet-200 transition-colors">Silent Session</h2>
                <p className="text-sm text-white/60 mb-3">5–8 minutes</p>
                <p className="text-xs text-white/50 leading-relaxed">Reduce visual dependency, strengthen awareness</p>
              </div>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode('silent', true);
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
            title="Customize session"
          >
            <Settings className="w-4 h-4 text-white/60 hover:text-white/90" />
          </button>
        </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3 pt-8 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={onShowProgress}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-300 group"
            title="AI Progress Insights"
          >
            <Brain className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors">AI Insights</span>
          </button>
          <button
            onClick={onShowHistory}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <TrendingUp className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" />
            <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors">History</span>
          </button>
          <button
            onClick={onShowGuide}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <BookOpen className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" />
            <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors">Guide</span>
          </button>
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
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
        .animate-slideInDown {
          animation: slideInDown 0.6s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
