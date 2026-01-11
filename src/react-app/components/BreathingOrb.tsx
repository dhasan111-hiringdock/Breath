import { useEffect, useState } from 'react';
import { BreathingMode } from '@/react-app/pages/Home';

interface BreathingOrbProps {
  phase: 'inhale' | 'exhale' | 'pause';
  progress: number;
  mode: BreathingMode;
  isActive: boolean;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  opacity: number;
  size: number;
}

export default function BreathingOrb({ phase, progress, mode, isActive }: BreathingOrbProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const isSilentMode = mode === 'silent';
  
  // Generate particles on mount
  useEffect(() => {
    if (isSilentMode) return;
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        angle: (i / 20) * Math.PI * 2,
        distance: 150 + Math.random() * 100,
        opacity: 0.3 + Math.random() * 0.4,
        size: 4 + Math.random() * 8
      });
    }
    setParticles(newParticles);
  }, [isSilentMode]);
  
  // Calculate scale based on phase and progress with easing
  let scale = 1;
  if (isActive) {
    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easedProgress = easeInOut(progress);
    
    if (phase === 'inhale') {
      scale = 0.5 + (easedProgress * 1.2); // Grow from 0.5 to 1.7
    } else if (phase === 'exhale') {
      scale = 1.7 - (easedProgress * 1.2); // Shrink from 1.7 to 0.5
    } else {
      scale = 1.7; // Hold at max
    }
  }

  // Silent mode has minimal movement
  const silentScale = isSilentMode ? 0.95 + (Math.sin(progress * Math.PI) * 0.05) : scale;
  const finalScale = isSilentMode ? silentScale : scale;

  // Enhanced color schemes by mode
  const colorSchemes = {
    daily: {
      primary: 'rgb(99 102 241)',
      secondary: 'rgb(168 85 247)',
      accent: 'rgb(236 72 153)',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500'
    },
    reset: {
      primary: 'rgb(6 182 212)',
      secondary: 'rgb(59 130 246)',
      accent: 'rgb(99 102 241)',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500'
    },
    silent: {
      primary: 'rgb(168 85 247)',
      secondary: 'rgb(192 132 252)',
      accent: 'rgb(217 70 239)',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500'
    }
  };

  const colors = colorSchemes[mode];
  const opacity = isSilentMode ? 0.3 : 0.7;

  // Rotation based on phase
  const rotation = phase === 'inhale' ? progress * 180 : phase === 'exhale' ? 180 + (progress * 180) : 180;

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Animated background rings */}
      {!isSilentMode && (
        <>
          <div 
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${finalScale * 600}px`,
              height: `${finalScale * 600}px`,
              opacity: 0.1,
              background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
              animation: 'pulse 4s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${finalScale * 500}px`,
              height: `${finalScale * 500}px`,
              opacity: 0.15,
              background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
              animation: 'pulse 3s ease-in-out infinite',
              animationDelay: '1s'
            }}
          />
        </>
      )}

      {/* Outer glow rings with blur */}
      <div 
        className="absolute rounded-full blur-3xl transition-all duration-1000 ease-in-out"
        style={{
          width: `${finalScale * 450}px`,
          height: `${finalScale * 450}px`,
          opacity: opacity * 0.25,
          background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 50%, transparent 70%)`
        }}
      />
      
      {/* Middle glow with rotation */}
      <div 
        className="absolute rounded-full blur-2xl transition-all duration-700 ease-in-out"
        style={{
          width: `${finalScale * 350}px`,
          height: `${finalScale * 350}px`,
          opacity: opacity * 0.4,
          background: `conic-gradient(from ${rotation}deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}, ${colors.primary})`,
          transform: `rotate(${rotation}deg)`
        }}
      />

      {/* Main orb with enhanced gradient */}
      <div 
        className={`absolute rounded-full bg-gradient-to-br ${colors.gradient} backdrop-blur-xl transition-all duration-700 ease-in-out`}
        style={{
          width: `${finalScale * 240}px`,
          height: `${finalScale * 240}px`,
          opacity: isSilentMode ? 0.2 : opacity,
          boxShadow: `
            0 0 ${finalScale * 40}px ${finalScale * 15}px ${colors.primary}40,
            0 0 ${finalScale * 80}px ${finalScale * 30}px ${colors.secondary}20,
            inset 0 0 ${finalScale * 60}px ${finalScale * 20}px rgba(255, 255, 255, 0.1)
          `,
          background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 50%), linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`
        }}
      />

      {/* Inner rotating gradient layer */}
      {!isSilentMode && (
        <div 
          className="absolute rounded-full transition-all duration-700 ease-in-out"
          style={{
            width: `${finalScale * 220}px`,
            height: `${finalScale * 220}px`,
            opacity: 0.6,
            background: `conic-gradient(from ${-rotation}deg, transparent 0%, ${colors.accent}40 25%, transparent 50%, ${colors.primary}40 75%, transparent 100%)`,
            transform: `rotate(${-rotation}deg)`,
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Particles floating around */}
      {!isSilentMode && particles.map((particle) => {
        const particleScale = phase === 'inhale' ? 1 + (progress * 0.5) : phase === 'exhale' ? 1.5 - (progress * 0.5) : 1.5;
        const x = Math.cos(particle.angle) * particle.distance * particleScale;
        const y = Math.sin(particle.angle) * particle.distance * particleScale;
        
        return (
          <div
            key={particle.id}
            className="absolute rounded-full blur-sm transition-all duration-700 ease-in-out"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: `translate(${x}px, ${y}px)`,
              opacity: particle.opacity * opacity,
              background: `radial-gradient(circle, ${colors.accent}, transparent)`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px ${colors.accent}80`
            }}
          />
        );
      })}

      {/* Inner highlight with shimmer */}
      <div 
        className="absolute rounded-full blur-xl transition-all duration-700 ease-in-out"
        style={{
          width: `${finalScale * 100}px`,
          height: `${finalScale * 100}px`,
          opacity: isSilentMode ? 0.1 : 0.5,
          background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.8), transparent 60%)',
          transform: 'translate(-20%, -20%)'
        }}
      />

      {/* Ripple effect during phase transitions */}
      {!isSilentMode && progress < 0.2 && (
        <div 
          className="absolute rounded-full border-2 animate-ping"
          style={{
            width: `${finalScale * 240}px`,
            height: `${finalScale * 240}px`,
            borderColor: colors.primary,
            opacity: 0.3 - (progress * 1.5)
          }}
        />
      )}
    </div>
  );
}
