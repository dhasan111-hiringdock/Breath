import { useEffect, useRef, useState } from 'react';

interface AudioOptions {
  enabled: boolean;
  volume: number;
}

export function useBreathingAudio(options: AudioOptions = { enabled: true, volume: 0.3 }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!options.enabled) return;

    const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    audioContextRef.current = new Ctor();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [options.enabled]);

  const playAmbientSound = () => {
    if (!options.enabled || !audioContextRef.current || isPlaying) return;

    const ctx = audioContextRef.current;
    
    // Create ambient drone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(110, ctx.currentTime); // Low A note
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(options.volume * 0.15, ctx.currentTime + 2);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    
    ambientOscillatorRef.current = oscillator;
    ambientGainRef.current = gainNode;
    setIsPlaying(true);
  };

  const stopAmbientSound = () => {
    if (ambientGainRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      ambientGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      
      setTimeout(() => {
        if (ambientOscillatorRef.current) {
          ambientOscillatorRef.current.stop();
          ambientOscillatorRef.current.disconnect();
        }
        if (ambientGainRef.current) {
          ambientGainRef.current.disconnect();
        }
        setIsPlaying(false);
      }, 1500);
    }
  };

  const playTransitionChime = (type: 'inhale' | 'exhale' | 'pause') => {
    if (!options.enabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Different frequencies for different phases
    const frequencies = {
      inhale: 440,   // A4
      pause: 523.25, // C5
      exhale: 329.63 // E4
    };
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[type], ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(options.volume * 0.4, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
  };

  const playCompletionSound = () => {
    if (!options.enabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const baseTime = ctx.currentTime;
    
    // Play a pleasant three-note chord
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, baseTime);
      
      gainNode.gain.setValueAtTime(0, baseTime);
      gainNode.gain.linearRampToValueAtTime(options.volume * 0.3, baseTime + 0.1 + (i * 0.1));
      gainNode.gain.exponentialRampToValueAtTime(0.01, baseTime + 1.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(baseTime + (i * 0.1));
      oscillator.stop(baseTime + 1.5);
    });
  };

  return {
    playAmbientSound,
    stopAmbientSound,
    playTransitionChime,
    playCompletionSound,
    isPlaying
  };
}
