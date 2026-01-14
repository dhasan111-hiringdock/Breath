import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, Settings } from 'lucide-react';
import { BreathingMode } from '@/react-app/pages/Home';
import { BreathParameters } from '@/shared/types';
import EnhancedBreathingOrb from '@/react-app/components/EnhancedBreathingOrb';
import WaveBreathingVisualizer from '@/react-app/components/WaveBreathingVisualizer';
import BarsBreathingVisualizer from '@/react-app/components/BarsBreathingVisualizer';
import KaleidoscopeBreathingVisualizer from '@/react-app/components/KaleidoscopeBreathingVisualizer';
import LissajousBreathingVisualizer from '@/react-app/components/LissajousBreathingVisualizer';
import { useBreathingAudio } from '@/react-app/hooks/useBreathingAudio';
import { useVoiceAssistant } from '@/react-app/hooks/useVoiceAssistant';

interface BreathingSessionProps {
  mode: BreathingMode;
  customDuration?: number;
  onComplete: (sessionId: number) => void;
  onCancel: () => void;
}

interface BreathPhase {
  phase: 'inhale' | 'exhale' | 'pause';
  duration: number;
  instruction: string;
}

export default function BreathingSession({ mode, customDuration, onComplete, onCancel }: BreathingSessionProps) {
  const [parameters, setParameters] = useState<BreathParameters | null>(null);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>({ phase: 'inhale', duration: 4, instruction: 'Breathe in' });
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [visualizer, setVisualizer] = useState<'orb' | 'wave' | 'bars' | 'kaleidoscope' | 'lissajous'>('orb');
  const [warmup, setWarmup] = useState<number | null>(null);
  const [overrides, setOverrides] = useState<{ inhale?: number; exhale?: number; pause?: number }>({});
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const elapsedTimeRef = useRef(0);
  const sessionIdRef = useRef<number | null>(null);
  const initOnceRef = useRef(false);
  
  const { playAmbientSound, stopAmbientSound, playTransitionChime, playCompletionSound } = useBreathingAudio({
    enabled: soundEnabled,
    volume: 0.3
  });
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { speakPhase, speakText, cancel: cancelVoice } = useVoiceAssistant({ enabled: voiceEnabled, rate: 1, pitch: 1 });
  const hasSpokenBeginRef = useRef(false);
  const stopAmbientSoundRef = useRef(stopAmbientSound);
  const cancelVoiceRef = useRef(cancelVoice);
  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '';

  useEffect(() => {
    stopAmbientSoundRef.current = stopAmbientSound;
    cancelVoiceRef.current = cancelVoice;
  }, [stopAmbientSound, cancelVoice]);

  useEffect(() => {
    if (mode === 'silent') {
      if (soundEnabled) {
        setSoundEnabled(false);
        stopAmbientSound();
      }
      if (voiceEnabled) {
        setVoiceEnabled(false);
        cancelVoice();
      }
    }
  }, [mode, soundEnabled, voiceEnabled, stopAmbientSound, cancelVoice]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    // Fetch breathing parameters and create session
    const initSession = async () => {
      if (initOnceRef.current) return;
      initOnceRef.current = true;
      try {
        const paramsRes = await fetch(`${apiBase}/api/breathing/parameters/${mode}`, {
          credentials: 'include'
        });
        if (!paramsRes.ok) throw new Error('Failed to fetch parameters');
        
        const params = await paramsRes.json();
        
        // Apply custom duration if provided
        if (customDuration) {
          params.total_duration_seconds = customDuration;
        }
        
        setParameters(params);

        const sessionRes = await fetch(`${apiBase}/api/breathing/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ mode, custom_duration: customDuration })
        });
        
        if (!sessionRes.ok) throw new Error('Failed to create session');
        
        const session = await sessionRes.json();
        sessionIdRef.current = session.id;
        
        setWarmup(3);
        const warmupInterval = setInterval(() => {
          setWarmup((prev) => {
            if (prev && prev > 1) return prev - 1;
            clearInterval(warmupInterval);
            setIsActive(true);
            return null;
          });
          return;
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        
        // Retry logic
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => initSession(), 1000 * retryCount);
        } else {
          // Failed after retries - show error and go back
          alert('Unable to start session. Please check your connection and try again.');
          onCancel();
        }
      }
    };

    initSession();
  }, [mode, customDuration, onCancel, apiBase]);

  useEffect(() => {
    if (!isActive) return;
    if (mode !== 'silent') {
      if (soundEnabled) {
        playAmbientSound();
      }
      if (voiceEnabled && !hasSpokenBeginRef.current) {
        speakText('Begin');
        hasSpokenBeginRef.current = true;
      }
    }
  }, [isActive, mode, soundEnabled, voiceEnabled, playAmbientSound, speakText]);

  useEffect(() => {
    return () => {
      stopAmbientSoundRef.current();
      cancelVoiceRef.current();
    };
  }, []);

  const handleComplete = useCallback(async () => {
    stopAmbientSound();
    cancelVoice();
    if (soundEnabled && mode !== 'silent') {
      playCompletionSound();
    }
    
    if (sessionIdRef.current) {
      try {
        const response = await fetch(`${apiBase}/api/breathing/sessions/${sessionIdRef.current}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
           credentials: 'include',
          body: JSON.stringify({ completed: true })
        });
        if (!response.ok) {
          throw new Error('Failed to mark session complete');
        }
        setTimeout(() => {
          onComplete(sessionIdRef.current!);
        }, 800);
      } catch {
        setTimeout(() => {
          onComplete(sessionIdRef.current!);
        }, 800);
      }
    }
  }, [stopAmbientSound, soundEnabled, playCompletionSound, onComplete, cancelVoice, mode, apiBase]);

  useEffect(() => {
    if (!isActive || !parameters || isPaused) return;

    const interval = setInterval(() => {
      setPhaseProgress(prev => {
        const newProgress = prev + 0.1;
        if (newProgress >= currentPhase.duration) {
          // Move to next phase
          let newPhase: BreathPhase;
          if (currentPhase.phase === 'inhale') {
            newPhase = {
              phase: mode === 'reset' ? 'pause' : 'exhale',
              duration: mode === 'reset' ? parameters.pause_duration : parameters.exhale_duration,
              instruction: mode === 'reset' ? 'Hold' : 'Breathe out'
            };
          } else if (currentPhase.phase === 'pause') {
            newPhase = {
              phase: 'exhale',
              duration: parameters.exhale_duration,
              instruction: 'Release slowly'
            };
          } else {
            newPhase = {
              phase: 'inhale',
              duration: parameters.inhale_duration,
              instruction: 'Breathe in'
            };
          }
          
          // Play transition sound
          if (soundEnabled && mode !== 'silent') {
            playTransitionChime(newPhase.phase);
          }
          if (voiceEnabled && mode !== 'silent') {
            speakPhase(newPhase.phase);
          }
          
          setCurrentPhase(newPhase);
          return 0;
        }
        return newProgress;
      });

      elapsedTimeRef.current += 0.1;
      if (elapsedTimeRef.current >= parameters.total_duration_seconds) {
        handleComplete();
      }
    }, 100);

      return () => clearInterval(interval);
  }, [isActive, parameters, currentPhase, isPaused, handleComplete, mode, playTransitionChime, soundEnabled, voiceEnabled, speakPhase]);

  const handleOrbClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    
    // Toggle pause
    setIsPaused(!isPaused);
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isActive) return;
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key.toLowerCase() === 's' && mode !== 'silent') {
        setSoundEnabled((p) => {
          if (p) stopAmbientSound();
          else playAmbientSound();
          return !p;
        });
      } else if (e.key.toLowerCase() === 'v' && mode !== 'silent') {
        setVoiceEnabled((p) => !p);
      } else if (e.key === 'Escape') {
        onCancel();
      } else if (e.key.toLowerCase() === 'o') {
        setShowSettings((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActive, mode, onCancel, playAmbientSound, stopAmbientSound]);

  const applyOverrides = (base: BreathParameters) => ({
    inhale_duration: overrides.inhale ?? base.inhale_duration,
    exhale_duration: overrides.exhale ?? base.exhale_duration,
    pause_duration: overrides.pause ?? base.pause_duration,
    total_duration_seconds: base.total_duration_seconds,
  });

  if (!parameters) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-white/10 border-b-white/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
      </div>
    );
  }

  const isSilentMode = mode === 'silent';
  const showInstruction = !isSilentMode && isActive;
  const effectiveParams = applyOverrides(parameters);
  const timeRemaining = Math.max(0, Math.ceil(effectiveParams.total_duration_seconds - elapsedTimeRef.current));

  // Background color scheme by mode
  const backgroundGradients = {
    daily: 'from-slate-950 via-indigo-950 to-purple-950',
    reset: 'from-slate-950 via-cyan-950 to-blue-950',
    silent: 'from-slate-950 via-violet-950 to-fuchsia-950'
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradients[mode]} flex flex-col items-center justify-center relative overflow-hidden`}>
      {warmup !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-xl rounded-3xl px-10 py-8 border border-white/20 text-center">
            <p className="text-white/80 text-sm mb-2">Get ready</p>
            <p className="text-white text-5xl font-light">{warmup}</p>
          </div>
        </div>
      )}
      {/* Ambient background effects */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: mode === 'daily' ? 'rgb(99 102 241)' : mode === 'reset' ? 'rgb(6 182 212)' : 'rgb(168 85 247)',
            animationDuration: '4s'
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background: mode === 'daily' ? 'rgb(168 85 247)' : mode === 'reset' ? 'rgb(59 130 246)' : 'rgb(217 70 239)',
            animationDuration: '3s',
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Controls */}
      <div className="absolute top-8 right-8 z-50 flex space-x-3">
        {!isSilentMode && (
          <>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-xl group"
            >
              {voiceEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v18" />
                  <path d="M19 12c0 3.866-3.134 7-7 7s-7-3.134-7-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 4v7a3 3 0 0 0 6 0V4" />
                  <path d="M19 12c0 3.866-3.134 7-7 7s-7-3.134-7-7" />
                  <path d="M2 2l20 20" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-xl group"
            >
              {soundEnabled ? (
                <Volume2 className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors" />
              ) : (
                <VolumeX className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-xl group"
              aria-label="Adjust timings (o)"
            >
              <Settings className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors" />
            </button>
          </>
        )}
        <button
          onClick={onCancel}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-xl group"
        >
          <X className="w-6 h-6 text-white/60 group-hover:text-white/90 transition-colors" />
        </button>
      </div>

      {/* Main breathing orb area */}
      <div 
        className="flex-1 flex items-center justify-center w-full relative"
      >
        {visualizer === 'orb' ? (
          <EnhancedBreathingOrb
            phase={currentPhase.phase}
            progress={phaseProgress / currentPhase.duration}
            mode={mode}
            isActive={isActive && !isPaused}
            onInteraction={handleOrbClick}
          />
        ) : visualizer === 'wave' ? (
          <WaveBreathingVisualizer
            phase={currentPhase.phase}
            progress={phaseProgress / currentPhase.duration}
            mode={mode}
            isActive={isActive && !isPaused}
            onInteraction={handleOrbClick}
          />
        ) : visualizer === 'bars' ? (
          <BarsBreathingVisualizer
            phase={currentPhase.phase}
            progress={phaseProgress / currentPhase.duration}
            mode={mode}
            isActive={isActive && !isPaused}
            onInteraction={handleOrbClick}
          />
        ) : visualizer === 'kaleidoscope' ? (
          <KaleidoscopeBreathingVisualizer
            phase={currentPhase.phase}
            progress={phaseProgress / currentPhase.duration}
            mode={mode}
            isActive={isActive && !isPaused}
            onInteraction={handleOrbClick}
          />
        ) : (
          <LissajousBreathingVisualizer
            phase={currentPhase.phase}
            progress={phaseProgress / currentPhase.duration}
            mode={mode}
            isActive={isActive && !isPaused}
            onInteraction={handleOrbClick}
          />
        )}
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute rounded-full border-2 border-white/40 animate-ping pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '100px',
              height: '100px',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
              <p className="text-white text-lg font-light">Paused</p>
              <p className="text-white/60 text-xs mt-1">Tap to resume</p>
            </div>
          </div>
        )}
      </div>

      {/* Instruction text with enhanced animation */}
      {showInstruction && (
        <div className="absolute bottom-24 text-center">
          <div className="relative inline-block">
            <p 
              className="text-3xl font-extralight text-white/90 tracking-wide transition-all duration-1000"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              {currentPhase.instruction}
            </p>
            {/* Subtle underline accent */}
            <div 
              className="absolute -bottom-2 left-1/2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700"
              style={{
                width: `${100 * (phaseProgress / currentPhase.duration)}%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>
      )}

      {/* Time remaining */}
      {isActive && (
        <div className="absolute bottom-24 right-8 text-white/70 text-sm">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2">
            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')} left
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && !isSilentMode && (
        <div className="absolute top-20 right-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-64">
          <p className="text-white/80 text-sm mb-3">Visualizer</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              className={`text-xs px-2 py-1 rounded-lg border ${visualizer === 'orb' ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/20 text-white/70'}`}
              onClick={() => setVisualizer('orb')}
            >Orb</button>
            <button
              className={`text-xs px-2 py-1 rounded-lg border ${visualizer === 'wave' ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/20 text-white/70'}`}
              onClick={() => setVisualizer('wave')}
            >Wave</button>
            <button
              className={`text-xs px-2 py-1 rounded-lg border ${visualizer === 'bars' ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/20 text-white/70'}`}
              onClick={() => setVisualizer('bars')}
            >Bars</button>
            <button
              className={`text-xs px-2 py-1 rounded-lg border ${visualizer === 'kaleidoscope' ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/20 text-white/70'}`}
              onClick={() => setVisualizer('kaleidoscope')}
            >Kaleidoscope</button>
            <button
              className={`text-xs px-2 py-1 rounded-lg border ${visualizer === 'lissajous' ? 'bg-white/15 border-white/30 text-white' : 'bg-white/5 border-white/20 text-white/70'}`}
              onClick={() => setVisualizer('lissajous')}
            >Lissajous</button>
          </div>
          <p className="text-white/80 text-sm mb-3">Adjust timings</p>
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-xs">Inhale: {overrides.inhale ?? parameters.inhale_duration}s</label>
              <input
                type="range"
                min="3"
                max="7"
                step="0.5"
                value={overrides.inhale ?? parameters.inhale_duration}
                onChange={(e) => setOverrides((o) => ({ ...o, inhale: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-white/60 text-xs">Exhale: {overrides.exhale ?? parameters.exhale_duration}s</label>
              <input
                type="range"
                min="4"
                max="10"
                step="0.5"
                value={overrides.exhale ?? parameters.exhale_duration}
                onChange={(e) => setOverrides((o) => ({ ...o, exhale: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-white/60 text-xs">Pause: {overrides.pause ?? parameters.pause_duration}s</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.5"
                value={overrides.pause ?? parameters.pause_duration}
                onChange={(e) => setOverrides((o) => ({ ...o, pause: Number(e.target.value) }))}
              />
            </div>
            <button
              className="mt-2 w-full text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg py-1.5 border border-white/20"
              onClick={() => {
                if (!parameters) return;
                const next = applyOverrides(parameters);
                setParameters(next);
                setShowSettings(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Progress indicator dots (very subtle) */}
      {!isSilentMode && (
        <div className="absolute bottom-8 flex space-x-2">
          {[...Array(Math.ceil(effectiveParams.total_duration_seconds / (effectiveParams.inhale_duration + effectiveParams.exhale_duration + effectiveParams.pause_duration)))].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/20 transition-all duration-300"
              style={{
                opacity: i < (elapsedTimeRef.current / (effectiveParams.inhale_duration + effectiveParams.exhale_duration + effectiveParams.pause_duration)) ? 0.6 : 0.2
              }}
            />
          )).slice(0, 20)}
        </div>
      )}
    </div>
  );
}
