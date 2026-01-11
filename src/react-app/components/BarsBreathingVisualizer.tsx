import { useMemo } from 'react';
import { BreathingMode } from '@/react-app/pages/Home';

interface BarsBreathingVisualizerProps {
  phase: 'inhale' | 'exhale' | 'pause';
  progress: number;
  mode: BreathingMode;
  isActive: boolean;
  onInteraction?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function BarsBreathingVisualizer({
  phase, progress, mode, isActive, onInteraction
}: BarsBreathingVisualizerProps) {
  const isSilentMode = mode === 'silent';

  const colorSchemes = {
    daily: { primary: 'rgb(99 102 241)', secondary: 'rgb(168 85 247)', accent: 'rgb(236 72 153)' },
    reset: { primary: 'rgb(6 182 212)', secondary: 'rgb(59 130 246)', accent: 'rgb(99 102 241)' },
    silent: { primary: 'rgb(168 85 247)', secondary: 'rgb(192 132 252)', accent: 'rgb(217 70 239)' }
  };
  const colors = colorSchemes[mode];
  const opacity = isSilentMode ? 0.25 : 0.85;

  const amp = useMemo(() => {
    if (!isActive) return 0;
    if (phase === 'inhale') return Math.min(1, progress);
    if (phase === 'exhale') return Math.min(1, 1 - progress);
    return 0.7;
  }, [isActive, phase, progress]);

  const bars = useMemo(() => {
    const count = 12;
    return Array.from({ length: count }, (_, i) => {
      const centerBias = 1 - Math.abs((i - (count - 1) / 2) / ((count - 1) / 2));
      const value = 0.3 + (amp * (0.4 + centerBias * 0.6));
      return { idx: i, scaleY: value };
    });
  }, [amp]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onClick={(e) => onInteraction?.(e)}
    >
      {!isSilentMode && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-3xl blur-2xl"
               style={{ background: `radial-gradient(circle, ${colors.primary}, transparent)` }} />
        </div>
      )}

      <div className="relative w-[70%] h-40 flex items-end justify-between">
        {bars.map(b => (
          <div
            key={b.idx}
            className="rounded-md transition-transform duration-150 ease-linear"
            style={{
              width: '12px',
              height: '100%',
              transform: `scaleY(${b.scaleY})`,
              background: `linear-gradient(to top, ${colors.secondary}, ${colors.primary})`,
              boxShadow: `0 0 20px 4px ${colors.primary}20`,
              opacity
            }}
          />
        ))}
      </div>
    </div>
  );
}
