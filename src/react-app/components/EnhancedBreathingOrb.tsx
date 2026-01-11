import { useEffect, useState } from 'react';
import { BreathingMode } from '@/react-app/pages/Home';

interface EnhancedBreathingOrbProps {
  phase: 'inhale' | 'exhale' | 'pause';
  progress: number;
  mode: BreathingMode;
  isActive: boolean;
  onInteraction?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  opacity: number;
  size: number;
  speed: number;
}

export default function EnhancedBreathingOrb({ 
  phase, 
  progress, 
  mode, 
  isActive,
  onInteraction 
}: EnhancedBreathingOrbProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const isSilentMode = mode === 'silent';
  
  // Generate particles on mount
  useEffect(() => {
    if (isSilentMode) return;
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        angle: (i / 30) * Math.PI * 2,
        distance: 150 + Math.random() * 120,
        opacity: 0.2 + Math.random() * 0.5,
        size: 3 + Math.random() * 10,
        speed: 0.5 + Math.random() * 1.5
      });
    }
    setParticles(newParticles);
  }, [isSilentMode]);

  // Animate particles
  useEffect(() => {
    if (isSilentMode || !isActive) return;

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        angle: p.angle + (p.speed * 0.001)
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [isSilentMode, isActive]);
  
  // Calculate scale based on phase and progress (linear for sync)
  let scale = 1;
  if (isActive) {
    const easedProgress = progress;
    
    if (phase === 'inhale') {
      scale = 0.5 + (easedProgress * 1.2);
    } else if (phase === 'exhale') {
      scale = 1.7 - (easedProgress * 1.2);
    } else {
      scale = 1.7;
    }
  }

  // Silent mode has minimal movement
  const silentScale = isSilentMode ? 0.95 + (Math.sin(progress * Math.PI) * 0.05) : scale;
  const finalScale = isSilentMode ? silentScale : scale;

  // Enhanced color schemes by mode with more depth
  const colorSchemes = {
    daily: {
      primary: 'rgb(99 102 241)',
      secondary: 'rgb(168 85 247)',
      accent: 'rgb(236 72 153)',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      glow: 'rgba(99, 102, 241, 0.4)'
    },
    reset: {
      primary: 'rgb(6 182 212)',
      secondary: 'rgb(59 130 246)',
      accent: 'rgb(99 102 241)',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      glow: 'rgba(6, 182, 212, 0.4)'
    },
    silent: {
      primary: 'rgb(168 85 247)',
      secondary: 'rgb(192 132 252)',
      accent: 'rgb(217 70 239)',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      glow: 'rgba(168, 85, 247, 0.4)'
    }
  };

  const colors = colorSchemes[mode];
  const opacity = isSilentMode ? 0.3 : 0.7;
  const hoverScale = isHovering ? 1.05 : 1;

  // Rotation based on phase with smoother transitions
  const rotation = phase === 'inhale' 
    ? progress * 180 
    : phase === 'exhale' 
    ? 180 + (progress * 180) 
    : 180;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x: x * 20, y: y * 20 });
  };

  return (
    <div 
      className="relative flex items-center justify-center w-full h-full transition-transform duration-300"
      style={{ transform: `scale(${hoverScale})` }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      onClick={(e) => onInteraction?.(e)}
    >
      {/* Background rings synced to scale */}
      {!isSilentMode && (
        <>
          <div 
            className="absolute rounded-full transition-all duration-150"
            style={{
              width: `${finalScale * 600}px`,
              height: `${finalScale * 600}px`,
              opacity: 0.1,
              background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
            }}
          />
          <div 
            className="absolute rounded-full transition-all duration-150"
            style={{
              width: `${finalScale * 500}px`,
              height: `${finalScale * 500}px`,
              opacity: 0.15,
              background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {/* Outer glow rings with blur and mouse parallax */}
      <div 
        className="absolute rounded-full blur-3xl transition-all duration-150 ease-linear"
        style={{
          width: `${finalScale * 450}px`,
          height: `${finalScale * 450}px`,
          opacity: opacity * 0.25,
          background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 50%, transparent 70%)`,
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
        }}
      />
      
      {/* Middle glow with rotation and parallax */}
      <div 
        className="absolute rounded-full blur-2xl transition-all duration-150 ease-linear"
        style={{
          width: `${finalScale * 350}px`,
          height: `${finalScale * 350}px`,
          opacity: opacity * 0.4,
          background: `conic-gradient(from ${rotation}deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}, ${colors.primary})`,
          transform: `rotate(${rotation}deg) translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          mixBlendMode: 'screen'
        }}
      />

      {/* Main orb with enhanced gradient and 3D depth */}
      <div 
        className={`absolute rounded-full bg-gradient-to-br ${colors.gradient} backdrop-blur-xl transition-all duration-150 ease-linear cursor-pointer`}
        style={{
          width: `${finalScale * 240}px`,
          height: `${finalScale * 240}px`,
          opacity: isSilentMode ? 0.2 : opacity,
          boxShadow: `
            0 0 ${finalScale * 40}px ${finalScale * 15}px ${colors.glow},
            0 0 ${finalScale * 80}px ${finalScale * 30}px ${colors.secondary}20,
            inset 0 0 ${finalScale * 60}px ${finalScale * 20}px rgba(255, 255, 255, 0.1),
            inset ${finalScale * 20}px ${finalScale * 20}px ${finalScale * 40}px rgba(0, 0, 0, 0.2)
          `,
          background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 50%), 
                       linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
        }}
      />

      {/* Inner rotating gradient layer with enhanced depth */}
      {!isSilentMode && (
        <div 
          className="absolute rounded-full transition-all duration-150 ease-linear pointer-events-none"
          style={{
            width: `${finalScale * 220}px`,
            height: `${finalScale * 220}px`,
            opacity: 0.6,
            background: `conic-gradient(from ${-rotation}deg, transparent 0%, ${colors.accent}40 25%, transparent 50%, ${colors.primary}40 75%, transparent 100%)`,
            transform: `rotate(${-rotation}deg) translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Animated particles floating around with physics */}
      {!isSilentMode && particles.map((particle) => {
        const particleScale = phase === 'inhale' ? 1 + (progress * 0.5) : phase === 'exhale' ? 1.5 - (progress * 0.5) : 1.5;
        const x = Math.cos(particle.angle) * particle.distance * particleScale;
        const y = Math.sin(particle.angle) * particle.distance * particleScale;
        
        return (
          <div
            key={particle.id}
            className="absolute rounded-full blur-sm transition-all duration-150 ease-linear pointer-events-none"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: `translate(${x + mousePos.x * 0.2}px, ${y + mousePos.y * 0.2}px)`,
              opacity: particle.opacity * opacity * (isHovering ? 1.2 : 1),
              background: `radial-gradient(circle, ${colors.accent}, transparent)`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px ${colors.accent}80`
            }}
          />
        );
      })}

      {/* Inner highlight with shimmer and movement */}
      <div 
        className="absolute rounded-full blur-xl transition-all duration-700 ease-in-out pointer-events-none"
        style={{
          width: `${finalScale * 100}px`,
          height: `${finalScale * 100}px`,
          opacity: isSilentMode ? 0.1 : 0.5,
          background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.8), transparent 60%)',
          transform: `translate(-20%, -20%) translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`
        }}
      />

      {/* Ripple effect during phase transitions with enhanced animation */}
      {!isSilentMode && progress < 0.2 && (
        <div 
          className="absolute rounded-full border-2 pointer-events-none transition-all duration-150"
          style={{
            width: `${finalScale * 240}px`,
            height: `${finalScale * 240}px`,
            borderColor: colors.primary,
            opacity: 0.3 - (progress * 1.5),
          }}
        />
      )}

      {/* Hover hint */}
      {isHovering && !isSilentMode && (
        <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20 animate-fade-in">
            <p className="text-white/80 text-xs whitespace-nowrap">Tap to pause</p>
          </div>
        </div>
      )}
    </div>
  );
}
