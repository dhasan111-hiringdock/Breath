import { useState } from 'react';
import { ComfortRating } from '@/react-app/pages/Home';
import { Sparkles, Minus, TrendingDown } from 'lucide-react';
import Confetti from '@/react-app/components/Confetti';

interface PostSessionProps {
  sessionId: number;
  onComplete: () => void;
}

export default function PostSession({ sessionId, onComplete }: PostSessionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<ComfortRating | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '';

  const handleRating = async (rating: ComfortRating) => {
    setSelectedRating(rating);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api/breathing/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comfort_rating: rating })
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      // Show celebration for "lighter" rating
      if (rating === 'lighter') {
        setShowConfetti(true);
      }
      
      setTimeout(() => {
        onComplete();
      }, rating === 'lighter' ? 1500 : 800);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setError('Failed to save your feedback. Please try again.');
      setIsSubmitting(false);
      setSelectedRating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      {/* Ambient background with animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        {/* Header with enhanced animation */}
        <div className="mb-12 animate-fadeIn">
          <div 
            className="inline-block mb-6 transition-all duration-700"
            style={{
              opacity: isSubmitting ? 0.5 : 1,
              transform: isSubmitting ? 'scale(0.9)' : 'scale(1)',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/50 mx-auto relative">
              <Sparkles className="w-8 h-8 text-white" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-ping opacity-20" />
            </div>
          </div>
          <h2 className="text-3xl font-extralight text-white/95 mb-4 tracking-wide">Session Complete</h2>
          <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4" />
          <p className="text-base text-white/60">How does your breathing feel right now?</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-shake">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Rating buttons with staggered animations */}
        <div className="space-y-4">
          <button
            onClick={() => handleRating('lighter')}
            disabled={isSubmitting}
            className={`w-full group relative overflow-hidden rounded-3xl backdrop-blur-xl border-2 p-8 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed animate-slideInUp ${
              selectedRating === 'lighter' 
                ? 'bg-gradient-to-br from-emerald-500/40 to-teal-500/40 border-emerald-400/60 scale-105 shadow-2xl shadow-emerald-500/30' 
                : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-white/10 hover:scale-[1.03] hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/20'
            }`}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-400/0 group-hover:from-emerald-400/20 group-hover:to-teal-400/20 transition-all duration-700" />
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/30 to-transparent rounded-full blur-2xl group-hover:w-40 group-hover:h-40 transition-all duration-700" />
            
            <div className="relative flex items-center justify-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">Lighter</p>
                <p className="text-xs text-white/50 mt-1">Breathing feels easier</p>
              </div>
            </div>
            {selectedRating === 'lighter' && (
              <div className="absolute inset-0 bg-emerald-400/20 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => handleRating('neutral')}
            disabled={isSubmitting}
            className={`w-full group relative overflow-hidden rounded-3xl backdrop-blur-xl border-2 p-8 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed animate-slideInUp ${
              selectedRating === 'neutral' 
                ? 'bg-gradient-to-br from-slate-500/40 to-gray-500/40 border-slate-400/60 scale-105 shadow-2xl shadow-slate-500/30' 
                : 'bg-gradient-to-br from-slate-500/20 to-gray-500/20 border-white/10 hover:scale-[1.03] hover:border-slate-400/40 hover:shadow-xl hover:shadow-slate-500/20'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/0 to-gray-400/0 group-hover:from-slate-400/20 group-hover:to-gray-400/20 transition-all duration-700" />
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400/30 to-transparent rounded-full blur-2xl group-hover:w-40 group-hover:h-40 transition-all duration-700" />
            
            <div className="relative flex items-center justify-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <Minus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">Neutral</p>
                <p className="text-xs text-white/50 mt-1">Breathing feels the same</p>
              </div>
            </div>
            {selectedRating === 'neutral' && (
              <div className="absolute inset-0 bg-slate-400/20 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => handleRating('heavy')}
            disabled={isSubmitting}
            className={`w-full group relative overflow-hidden rounded-3xl backdrop-blur-xl border-2 p-8 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed animate-slideInUp ${
              selectedRating === 'heavy' 
                ? 'bg-gradient-to-br from-orange-500/40 to-red-500/40 border-orange-400/60 scale-105 shadow-2xl shadow-orange-500/30' 
                : 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-white/10 hover:scale-[1.03] hover:border-orange-400/40 hover:shadow-xl hover:shadow-orange-500/20'
            }`}
            style={{ animationDelay: '0.3s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-red-400/0 group-hover:from-orange-400/20 group-hover:to-red-400/20 transition-all duration-700" />
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/30 to-transparent rounded-full blur-2xl group-hover:w-40 group-hover:h-40 transition-all duration-700" />
            
            <div className="relative flex items-center justify-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-light text-white">Heavy</p>
                <p className="text-xs text-white/50 mt-1">Breathing feels harder</p>
              </div>
            </div>
            {selectedRating === 'heavy' && (
              <div className="absolute inset-0 bg-orange-400/20 animate-pulse" />
            )}
          </button>
        </div>

        {/* Loading indicator with animation */}
        {isSubmitting && (
          <div className="flex items-center justify-center pt-6 animate-fadeIn">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1);
          }
        }
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
