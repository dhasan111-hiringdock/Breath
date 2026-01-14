import { BreathParameters } from "@/shared/types";

type BreathingMode = "daily" | "reset" | "silent";
type ComfortRating = "lighter" | "neutral" | "heavy";

type Session = {
  id: number;
  mode: BreathingMode;
  created_at: string;
  completed: number;
  comfort_rating: ComfortRating | null;
  duration_seconds: number;
};

type LungMetric = {
  max_breath_hold_seconds: number;
  average_inhale_depth: number;
  average_exhale_control: number;
  comfort_level: number;
  created_at: string;
};

type Analytics = {
  baseline_lung_capacity: number;
  current_lung_capacity: number;
  capacity_improvement_percent: number;
  total_training_minutes: number;
  consecutive_days_streak: number;
  best_streak: number;
  difficulty_level: string;
};

const KEYS = {
  sessions: "breathing_sessions",
  params: "breathing_parameters",
  analytics: "user_progress_analytics",
  metrics: "lung_capacity_metrics",
};

const defaults: Record<BreathingMode, BreathParameters> = {
  daily: { inhale_duration: 4, exhale_duration: 6, pause_duration: 0, total_duration_seconds: 360 },
  reset: { inhale_duration: 4, exhale_duration: 8, pause_duration: 2, total_duration_seconds: 60 },
  silent: { inhale_duration: 4, exhale_duration: 6, pause_duration: 0, total_duration_seconds: 360 },
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function getBreathParameters(mode: BreathingMode): Promise<BreathParameters> {
  const store = read<Record<BreathingMode, BreathParameters>>(KEYS.params, defaults);
  const params = store[mode] ?? defaults[mode];
  // Ensure store persists defaults
  if (!store[mode]) {
    store[mode] = params;
    write(KEYS.params, store);
  }
  return params;
}

export async function createBreathingSession(mode: BreathingMode, customDuration?: number): Promise<{ id: number }> {
  const sessions = read<Session[]>(KEYS.sessions, []);
  const params = await getBreathParameters(mode);
  const duration = customDuration ?? params.total_duration_seconds;
  const id = (sessions[sessions.length - 1]?.id ?? 0) + 1;
  const session: Session = {
    id,
    mode,
    created_at: new Date().toISOString(),
    completed: 0,
    comfort_rating: null,
    duration_seconds: duration,
  };
  sessions.push(session);
  write(KEYS.sessions, sessions);
  return { id };
}

export async function markSessionComplete(id: number): Promise<void> {
  const sessions = read<Session[]>(KEYS.sessions, []);
  const s = sessions.find((x) => x.id === id);
  if (s) {
    s.completed = 1;
    write(KEYS.sessions, sessions);
    await updateProgressAnalytics();
  }
}

export async function submitComfortRating(id: number, rating: ComfortRating): Promise<void> {
  const sessions = read<Session[]>(KEYS.sessions, []);
  const s = sessions.find((x) => x.id === id);
  if (s) {
    s.comfort_rating = rating;
    write(KEYS.sessions, sessions);
    await adaptParameters(s.mode, rating);
    await updateProgressAnalytics();
    // Add a derived lung metric sample for dashboard
    const metrics = read<LungMetric[]>(KEYS.metrics, []);
    const metric: LungMetric = {
      max_breath_hold_seconds: rating === "lighter" ? 35 : rating === "neutral" ? 30 : 25,
      average_inhale_depth: rating === "lighter" ? 0.8 : rating === "neutral" ? 0.7 : 0.6,
      average_exhale_control: rating === "lighter" ? 0.78 : rating === "neutral" ? 0.7 : 0.6,
      comfort_level: rating === "lighter" ? 0.75 : rating === "neutral" ? 0.65 : 0.55,
      created_at: s.created_at,
    };
    metrics.push(metric);
    write(KEYS.metrics, metrics);
  }
}

export async function getSessions(limit = 50): Promise<Session[]> {
  const sessions = read<Session[]>(KEYS.sessions, []);
  if (limit && sessions.length > limit) {
    return sessions.slice(-limit);
  }
  return sessions;
}

export async function getProgressAnalytics(): Promise<{ analytics: Analytics; recentMetrics: LungMetric[] }> {
  await updateProgressAnalytics();
  const analytics = read<Analytics>(KEYS.analytics, {
    baseline_lung_capacity: 45,
    current_lung_capacity: 45,
    capacity_improvement_percent: 0,
    total_training_minutes: 0,
    consecutive_days_streak: 0,
    best_streak: 0,
    difficulty_level: "beginner",
  });
  const recentMetrics = read<LungMetric[]>(KEYS.metrics, []).slice(-10);
  return { analytics, recentMetrics };
}

async function adaptParameters(mode: BreathingMode, rating: ComfortRating) {
  const store = read<Record<BreathingMode, BreathParameters>>(KEYS.params, defaults);
  const p = store[mode] ?? defaults[mode];
  let inhale = p.inhale_duration;
  let exhale = p.exhale_duration;
  let pause = p.pause_duration;
  if (rating === "lighter") {
    if (mode === "daily" || mode === "silent") {
      inhale = Math.min(inhale + 0.3, 7.0);
      exhale = Math.min(exhale + 0.3, 9.0);
    } else {
      pause = Math.min(pause + 0.15, 3.0);
      inhale = Math.min(inhale + 0.2, 5.0);
    }
  } else if (rating === "heavy") {
    if (mode === "daily" || mode === "silent") {
      exhale = Math.max(exhale - 0.3, 4.0);
      inhale = Math.max(inhale - 0.2, 3.5);
    } else {
      pause = Math.max(pause - 0.15, 0.5);
    }
  }
  if (inhale !== p.inhale_duration || exhale !== p.exhale_duration || pause !== p.pause_duration) {
    store[mode] = { ...p, inhale_duration: inhale, exhale_duration: exhale, pause_duration: pause };
    write(KEYS.params, store);
  }
}

async function updateProgressAnalytics() {
  const sessions = read<Session[]>(KEYS.sessions, []);
  const completed = sessions.filter((s) => s.completed === 1);
  const baseline = read<Analytics>(KEYS.analytics, {
    baseline_lung_capacity: 45,
    current_lung_capacity: 45,
    capacity_improvement_percent: 0,
    total_training_minutes: 0,
    consecutive_days_streak: 0,
    best_streak: 0,
    difficulty_level: "beginner",
  }).baseline_lung_capacity;

  const recentRated = completed.slice(-10);
  const lighterCount = recentRated.filter((s) => s.comfort_rating === "lighter").length;
  const heavyCount = recentRated.filter((s) => s.comfort_rating === "heavy").length;
  const delta = lighterCount * 2 - heavyCount * 2;
  const current = Math.max(0, Math.min(100, baseline + delta));
  const improvement = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0;

  const totalMinutes = Math.floor(completed.reduce((sum, s) => sum + s.duration_seconds, 0) / 60);

  const dates = Array.from(new Set(completed.map((s) => new Date(s.created_at).toDateString())));
  let streak = 0;
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    if (dates.includes(expected.toDateString())) streak++;
    else break;
  }

  const prev = read<Analytics>(KEYS.analytics, {
    baseline_lung_capacity: 45,
    current_lung_capacity: 45,
    capacity_improvement_percent: 0,
    total_training_minutes: 0,
    consecutive_days_streak: 0,
    best_streak: 0,
    difficulty_level: "beginner",
  });
  const bestStreak = Math.max(prev.best_streak, streak);
  let difficulty = "beginner";
  if (current >= 75 && streak >= 14) difficulty = "advanced";
  else if (current >= 60 && streak >= 7) difficulty = "intermediate";

  const analytics: Analytics = {
    baseline_lung_capacity: baseline,
    current_lung_capacity: current,
    capacity_improvement_percent: Number(improvement.toFixed(2)),
    total_training_minutes: totalMinutes,
    consecutive_days_streak: streak,
    best_streak: bestStreak,
    difficulty_level: difficulty,
  };
  write(KEYS.analytics, analytics);
}

