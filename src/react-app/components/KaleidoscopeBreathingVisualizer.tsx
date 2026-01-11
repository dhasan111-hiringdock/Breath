import { useMemo } from 'react';
import { BreathingMode } from '@/react-app/pages/Home';

interface KaleidoscopeBreathingVisualizerProps {
  phase: 'inhale' | 'exhale' | 'pause';
  progress: number;
  mode: BreathingMode;
  isActive: boolean;
  onInteraction?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function KaleidoscopeBreathingVisualizer({
  phase, progress, mode, isActive, onInteraction
}: KaleidoscopeBreathingVisualizerProps) {
  const isSilentMode = mode === 'silent';

  const colorSchemes = {
    daily: { primary: 'rgb(99 102 241)', secondary: 'rgb(168 85 247)', accent: 'rgb(236 72 153)' },
    reset: { primary: 'rgb(6 182 212)', secondary: 'rgb(59 130 246)', accent: 'rgb(99 102 241)' },
    silent: { primary: 'rgb(168 85 247)', secondary: 'rgb(192 132 252)', accent: 'rgb(217 70 239)' }
  };
  const colors = colorSchemes[mode];

  const amplitude = useMemo(() => {
    if (!isActive) return 0.6;
    if (phase === 'inhale') return 0.6 + progress * 0.8;
    if (phase === 'exhale') return 1.4 - progress * 0.8;
    return 1.4;
  }, [isActive, phase, progress]);

  const petalCount = 12;
  const ringRadius = 140 * amplitude;
  const petalLen = 120 * amplitude;
  const petalWidth = 24;
  const rotationBase = phase === 'inhale' ? progress * 30 : phase === 'exhale' ? 30 + progress * 30 : 30;
  const opacity = isSilentMode ? 0.25 : 0.9;

  const petals = useMemo(() => {
    return Array.from({ length: petalCount }, (_, i) => ({
      idx: i,
      angle: (i / petalCount) * 360 + rotationBase,
    }));
  }, [petalCount, rotationBase]);

  const dots = useMemo(() => {
    const count = 24;
    return Array.from({ length: count }, (_, i) => {
      const theta = (i / count) * Math.PI * 2;
      const r = ringRadius;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      return { idx: i, x, y };
    });
  }, [ringRadius]);

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
              width: `${ringRadius * 1.6}px`,
              height: `${ringRadius * 1.6}px`,
              opacity: 0.15,
              background: `radial-gradient(circle, ${colors.primary}, transparent)`
            }}
          />
        </div>
      )}

      <div className="relative w-[60%] h-[60%]">
        {petals.map(p => (
          <div
            key={p.idx}
            className="absolute left-1/2 top-1/2 transition-transform duration-150 ease-linear"
            style={{
              width: `${petalWidth}px`,
              height: `${petalLen}px`,
              transform: `translate(-50%, -100%) rotate(${p.angle}deg) translateY(-${ringRadius}px)`,
              background: `linear-gradient(to top, ${colors.primary}, ${colors.secondary})`,
              borderRadius: `${petalWidth * 0.7}px`,
              opacity
            }}
          />
        ))}

        {!isSilentMode && dots.map(d => (
          <div
            key={d.idx}
            className="absolute rounded-full transition-transform duration-150 ease-linear"
            style={{
              width: '10px',
              height: '10px',
              transform: `translate(calc(50% + ${d.x}px), calc(50% + ${d.y}px))`,
              background: colors.accent,
              boxShadow: `0 0 14px 4px ${colors.accent}40`,
              opacity
            }}
          />
        ))}
      </div>
    </div>
  );
}
