import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import ModeSelector from '@/react-app/components/ModeSelector';
import BreathingSession from '@/react-app/components/BreathingSession';
import PostSession from '@/react-app/components/PostSession';
import BreathingGuide from '@/react-app/components/BreathingGuide';
import SessionHistory from '@/react-app/components/SessionHistory';
import SessionCustomizer from '@/react-app/components/SessionCustomizer';
import LoginPrompt from '@/react-app/components/LoginPrompt';
import ProgressDashboard from '@/react-app/components/ProgressDashboard';

export type BreathingMode = 'daily' | 'reset' | 'silent';
export type ComfortRating = 'lighter' | 'neutral' | 'heavy';

export default function Home() {
  const { user, isPending } = useAuth();
  const [activeMode, setActiveMode] = useState<BreathingMode | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [customDuration, setCustomDuration] = useState<number | undefined>(undefined);
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Show loading while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-white/10 border-b-white/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return <LoginPrompt />;
  }

  const handleModeSelect = (mode: BreathingMode, customize: boolean = false) => {
    setActiveMode(mode);
    setShowFeedback(false);
    if (customize) {
      setShowCustomizer(true);
    }
  };

  const handleCustomizerStart = (duration?: number) => {
    setCustomDuration(duration);
    setShowCustomizer(false);
  };

  const handleSessionComplete = (id: number) => {
    setSessionId(id);
    setShowFeedback(true);
  };

  const handleFeedbackComplete = () => {
    setActiveMode(null);
    setShowFeedback(false);
    setSessionId(null);
  };

  if (showGuide) {
    return <BreathingGuide onClose={() => setShowGuide(false)} />;
  }

  if (showHistory) {
    return <SessionHistory onClose={() => setShowHistory(false)} />;
  }

  if (showProgressDashboard) {
    return <ProgressDashboard onClose={() => setShowProgressDashboard(false)} />;
  }

  if (showCustomizer && activeMode) {
    return (
      <SessionCustomizer
        mode={activeMode}
        onStart={handleCustomizerStart}
        onCancel={() => {
          setShowCustomizer(false);
          setActiveMode(null);
        }}
      />
    );
  }

  if (showFeedback && sessionId) {
    return (
      <PostSession
        sessionId={sessionId}
        onComplete={handleFeedbackComplete}
      />
    );
  }

  if (activeMode && !showCustomizer) {
    return (
      <BreathingSession
        mode={activeMode}
        customDuration={customDuration}
        onComplete={handleSessionComplete}
        onCancel={() => {
          setActiveMode(null);
          setCustomDuration(undefined);
        }}
      />
    );
  }

  return (
    <ModeSelector
      onSelectMode={handleModeSelect}
      onShowGuide={() => setShowGuide(true)}
      onShowHistory={() => setShowHistory(true)}
      onShowProgress={() => setShowProgressDashboard(true)}
    />
  );
}
