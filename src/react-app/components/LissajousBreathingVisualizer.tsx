import { useMemo } from 'react';
import { BreathingMode } from '@/react-app/pages/Home';

interface LissajousBreathingVisualizerProps {
  phase: 'inhale' | 'exhale' | 'pause';
  progress: number;
  mode: BreathingMode;
  isActive: boolean;
  onInteraction?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function LissajousBreathingVisualizer({
  phase, progress, mode, isActive, onInteraction
}: LissajousBreathingVisualizerProps) {
  const isSilentMode = mode === 'silent';

  const colorSchemes = {
    daily: { primary: 'rgb(99 102 241)', secondary: 'rgb(168 85 247)', accent: 'rgb(236 72 153)' },
    reset: { primary: 'rgb(6 182 212)', secondary: 'rgb(59 130 246)', accent: 'rgb(99 102 241)' },
    silent: { primary: 'rgb(168 85 247)', secondary: 'rgb(192 132 252)', accent: 'rgb(217 70 239)' }
  };
  const colors = colorSchemes[mode];
  const opacity = isSilentMode ? 0.25 : 0.85;

  const amp = useMemo(() => {
    if (!isActive) return 0.5;
    if (phase === 'inhale') return 0.5 + progress * 0.7;
    if (phase === 'exhale') return 1.2 - progress * 0.7;
    return 1.2;
  }, [isActive, phase, progress]);

  const rotation = phase === 'inhale' ? progress * 30 : phase === 'exhale' ? 30 + progress * 30 : 30;

  const points = useMemo(() => {
    const count = 120;
    const A = 140 * amp;
    const B = 90 * amp;
    const a = 3;
    const b = 2;
    const delta = Math.PI / 2;
    return Array.from({ length: count }, (_, i) => {
      const t = (i / count) * Math.PI * 2;
      const x = A * Math.sin(a * t + delta);
      const y = B * Math.sin(b * t);
      return { idx: i, x, y, k: i / count };
    });
  }, [amp]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onClick={(e) => onInteraction?.(e)}
    >
      {!isSilentMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${amp * 300}px`,
              height: `${amp * 300}px`,
              opacity: 0.12,
              background: `radial-gradient(circle, ${colors.primary}, transparent)`
            }}
          />
        </div>
      )}

      <div
        className="relative w-[70%] h-[60%]"
        style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 150ms linear' }}
      >
        {points.map(p => (
          <div
            key={p.idx}
            className="absolute rounded-full transition-transform duration-150 ease-linear"
            style={{
              width: '8px',
              height: '8px',
              transform: `translate(calc(50% + ${p.x}px), calc(50% + ${p.y}px))`,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 12px 3px ${colors.secondary}30`,
              opacity
            }}
          />
        ))}
      </div>
    </div>
  );
}
