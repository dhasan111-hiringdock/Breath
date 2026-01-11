import { useCallback } from 'react';
type Phase = 'inhale' | 'exhale' | 'pause';

type VoiceOptions = {
  enabled: boolean;
  rate?: number;
  pitch?: number;
  voiceName?: string;
};

export function useVoiceAssistant(options: VoiceOptions = { enabled: false, rate: 1, pitch: 1 }) {
  let synth: SpeechSynthesis | null = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synth = window.speechSynthesis;
  }

  const getVoice = useCallback(() => {
    if (!synth) return null;
    const voices = synth.getVoices();
    if (options.voiceName) {
      const match = voices.find(v => v.name === options.voiceName);
      if (match) return match;
    }
    // Prefer an English voice if available
    return voices.find(v => v.lang.startsWith('en')) ?? voices[0] ?? null;
  }, [synth, options.voiceName]);

  const cancel = useCallback(() => {
    if (!synth) return;
    synth.cancel();
  }, [synth]);

  const speakText = useCallback((text: string) => {
    if (!options.enabled || !synth) return;
    const utter = new SpeechSynthesisUtterance(text);
    const voice = getVoice();
    if (voice) utter.voice = voice;
    utter.rate = options.rate ?? 1;
    utter.pitch = options.pitch ?? 1;
    cancel();
    synth.speak(utter);
  }, [options.enabled, options.rate, options.pitch, synth, getVoice, cancel]);

  const speakPhase = useCallback((phase: Phase) => {
    const lines: Record<Phase, string> = {
      inhale: 'Inhale gently',
      pause: 'Hold',
      exhale: 'Exhale slowly',
    };
    speakText(lines[phase]);
  }, [speakText]);

  return { speakText, speakPhase, cancel };
}
