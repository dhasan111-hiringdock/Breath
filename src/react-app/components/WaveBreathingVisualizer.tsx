import { useMemo } from 'react';
import { BreathingMode } from '@/react-app/pages/Home';

interface WaveBreathingVisualizerProps {
  phase: 'inhale' | 'exhale' | 'pause';
  progress: number;
  mode: BreathingMode;
  isActive: boolean;
  onInteraction?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function WaveBreathingVisualizer({
  phase, progress, mode, isActive, onInteraction
}: WaveBreathingVisualizerProps) {
  const isSilentMode = mode === 'silent';

  const colorSchemes = {
    daily: { primary: 'rgb(99 102 241)', secondary: 'rgb(168 85 247)', accent: 'rgb(236 72 153)' },
    reset: { primary: 'rgb(6 182 212)', secondary: 'rgb(59 130 246)', accent: 'rgb(99 102 241)' },
    silent: { primary: 'rgb(168 85 247)', secondary: 'rgb(192 132 252)', accent: 'rgb(217 70 239)' }
  };
  const colors = colorSchemes[mode];

  const amp = useMemo(() => {
    if (!isActive) return 0;
    if (phase === 'inhale') return Math.min(1, progress);
    if (phase === 'exhale') return Math.min(1, 1 - progress);
    return 1;
  }, [isActive, phase, progress]);

  const bars = useMemo(() => {
    const count = 48;
    return Array.from({ length: count }, (_, i) => {
      const shift = (i / count) * Math.PI * 2;
      const wave = (Math.sin(shift + progress * Math.PI) * 0.5 + 0.5);
      const value = 0.4 + (wave * amp * 0.8);
      return { idx: i, scaleY: value };
    });
  }, [amp, progress]);

  const opacity = isSilentMode ? 0.25 : 0.8;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onClick={(e) => onInteraction?.(e)}
    >
      {!isSilentMode && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl"
               style={{ background: colors.primary }} />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl"
               style={{ background: colors.secondary }} />
        </div>
      )}

      <div className="relative w-[70%] h-48 flex items-end justify-between">
        {bars.map(b => (
          <div
            key={b.idx}
            className="rounded-full transition-transform duration-150 ease-linear"
            style={{
              width: '6px',
              height: '100%',
              transform: `scaleY(${b.scaleY})`,
              background: `linear-gradient(to top, ${colors.primary}, ${colors.secondary})`,
              opacity
            }}
          />
        ))}
      </div>
    </div>
  );
}
