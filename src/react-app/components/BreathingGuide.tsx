import { X, Zap, Target, Heart, Brain } from 'lucide-react';

interface BreathingGuideProps {
  onClose: () => void;
}

export default function BreathingGuide({ onClose }: BreathingGuideProps) {
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

      {/* Guide content */}
      <div className="max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="space-y-8 pb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extralight text-white/95 mb-3 tracking-wide">Breathing Guide</h1>
            <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent mb-3" />
            <p className="text-sm text-white/60">Learn the foundations of effective breathing</p>
          </div>

          {/* Proper Technique Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-light text-white">Proper Technique</h2>
            </div>
            
            <div className="space-y-4 text-white/80">
              <div>
                <h3 className="text-lg font-light text-white/90 mb-2">1. Posture</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Sit or lie in a comfortable position with your spine straight but not rigid. Relax your shoulders away from your ears. Keep your chest open and your body at ease.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-light text-white/90 mb-2">2. Diaphragmatic Breathing</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Breathe deeply into your belly, not your chest. Place one hand on your chest and one on your belly. The belly hand should rise more than the chest hand. This engages your diaphragm, the primary breathing muscle.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-light text-white/90 mb-2">3. Nasal Breathing</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Breathe in and out through your nose when possible. Nasal breathing filters air, regulates temperature, and naturally slows your breath for better oxygen absorption.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-light text-white/90 mb-2">4. Natural Rhythm</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Don't force deep breaths. Allow your breath to be smooth and natural. The goal is to gradually retrain your default breathing pattern, not to hyperventilate.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-light text-white">Understanding the Practice</h2>
            </div>
            
            <div className="space-y-4 text-white/80">
              <div>
                <h3 className="text-lg font-light text-white/90 mb-2">Why Slow Breathing?</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Slowing your breath increases CO₂ tolerance, which paradoxically improves oxygen delivery to cells. It also activates the parasympathetic nervous system, promoting calm and focus.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-light text-white/90 mb-2">Extended Exhales</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Longer exhales than inhales shift your nervous system toward relaxation. This is why many modes emphasize the exhale phase.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-light text-white/90 mb-2">Consistency Over Intensity</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Daily practice, even if brief, creates lasting change. The app adapts gradually based on your feedback, so trust the process and practice regularly.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Explanations */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-light text-white">Mode Guidance</h2>
            </div>
            
            <div className="space-y-5">
              <div className="border-l-2 border-indigo-500/50 pl-4">
                <h3 className="text-lg font-light text-white/90 mb-2">Daily Repatterning</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Your primary practice. Use this daily to slowly retrain your breathing rhythm. Focus on smooth, natural breaths with slightly longer exhales. Over weeks, this builds CO₂ tolerance and diaphragm strength.
                </p>
              </div>
              
              <div className="border-l-2 border-cyan-500/50 pl-4">
                <h3 className="text-lg font-light text-white/90 mb-2">Breath Reset</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Use when stressed or fatigued. The extended exhale with a brief hold quickly activates your relaxation response. Perfect for moments when you need to reset your nervous system.
                </p>
              </div>
              
              <div className="border-l-2 border-violet-500/50 pl-4">
                <h3 className="text-lg font-light text-white/90 mb-2">Silent Session</h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Advanced practice for developing internal awareness. With minimal visual cues, you learn to sense your breath without external guidance. This deepens your connection to your natural rhythm.
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-6">
            <h3 className="text-lg font-light text-white/90 mb-4">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Practice in a quiet space where you won't be disturbed</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Don't practice on a full stomach</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>If you feel dizzy or uncomfortable, return to normal breathing</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Your honest feedback after each session helps the app adapt to your needs</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Progress is subtle and gradual—notice how you feel over weeks, not days</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
