
ALTER TABLE breathing_sessions ADD COLUMN user_id TEXT;
ALTER TABLE breathing_parameters ADD COLUMN user_id TEXT;

CREATE TABLE lung_capacity_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_id INTEGER NOT NULL,
  max_breath_hold_seconds REAL,
  average_inhale_depth REAL,
  average_exhale_control REAL,
  respiratory_rate REAL,
  comfort_level INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_progress_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  baseline_lung_capacity REAL,
  current_lung_capacity REAL,
  capacity_improvement_percent REAL,
  total_training_minutes INTEGER DEFAULT 0,
  consecutive_days_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  difficulty_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lung_capacity_user ON lung_capacity_metrics(user_id);
CREATE INDEX idx_lung_capacity_session ON lung_capacity_metrics(session_id);
CREATE INDEX idx_breathing_sessions_user ON breathing_sessions(user_id);
CREATE INDEX idx_breathing_parameters_user ON breathing_parameters(user_id);
