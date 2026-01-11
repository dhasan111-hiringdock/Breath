
CREATE TABLE breathing_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  comfort_rating TEXT,
  completed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE breathing_parameters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode TEXT NOT NULL UNIQUE,
  inhale_duration REAL NOT NULL,
  exhale_duration REAL NOT NULL,
  pause_duration REAL NOT NULL,
  total_duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO breathing_parameters (mode, inhale_duration, exhale_duration, pause_duration, total_duration_seconds) VALUES
('daily', 4.0, 6.0, 0.5, 360),
('reset', 3.0, 8.0, 1.0, 60),
('silent', 4.5, 6.5, 0.5, 360);
