
DROP INDEX idx_breathing_parameters_user;
DROP INDEX idx_breathing_sessions_user;
DROP INDEX idx_lung_capacity_session;
DROP INDEX idx_lung_capacity_user;
DROP TABLE user_progress_analytics;
DROP TABLE lung_capacity_metrics;
ALTER TABLE breathing_parameters DROP COLUMN user_id;
ALTER TABLE breathing_sessions DROP COLUMN user_id;
