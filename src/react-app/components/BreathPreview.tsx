import { useEffect, useState } from 'react';
import { BreathingMode } from '@/react-app/pages/Home';

interface BreathPreviewProps {
  mode: BreathingMode;
  size?: number;
}

export default function BreathPreview({ mode, size = 60 }: BreathPreviewProps) {
  const [phase, setPhase] = useState<'inhale' | 'exhale' | 'pause'>('inhale');
  const [progress, setProgress] = useState(0);

  const timings = {
    daily: { inhale: 4, exhale: 6, pause: 0 },
    reset: { inhale: 4, exhale: 8, pause: 2 },
    silent: { inhale: 4, exhale: 6, pause: 0 }
  };

  const { inhale, exhale, pause } = timings[mode];
  const totalCycle = inhale + exhale + pause;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = (prev + 0.05) % totalCycle;
        
        if (newProgress < inhale) {
          setPhase('inhale');
        } else if (pause > 0 && newProgress < inhale + pause) {
          setPhase('pause');
        } else {
          setPhase('exhale');
        }
        
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [inhale, exhale, pause, totalCycle]);

  const getScale = () => {
    if (phase === 'inhale') {
      const phaseProgress = progress / inhale;
      return 0.5 + (phaseProgress * 0.5);
    } else if (phase === 'pause') {
      return 1;
    } else {
      const phaseProgress = (progress - inhale - pause) / exhale;
      return 1 - (phaseProgress * 0.5);
    }
  };

  const colors = {
    daily: 'from-indigo-500 to-purple-500',
    reset: 'from-cyan-500 to-blue-500',
    silent: 'from-violet-500 to-fuchsia-500'
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div
        className={`absolute rounded-full blur-lg bg-gradient-to-br ${colors[mode]} transition-all duration-700 ease-in-out`}
        style={{
          width: `${size * getScale()}px`,
          height: `${size * getScale()}px`,
          opacity: 0.4
        }}
      />
      
      {/* Main orb */}
      <div
        className={`absolute rounded-full bg-gradient-to-br ${colors[mode]} transition-all duration-700 ease-in-out`}
        style={{
          width: `${size * 0.6 * getScale()}px`,
          height: `${size * 0.6 * getScale()}px`,
          opacity: 0.8,
          boxShadow: `0 0 ${size * 0.3 * getScale()}px ${size * 0.1 * getScale()}px rgba(99, 102, 241, 0.3)`
        }}
      />
    </div>
  );
}
