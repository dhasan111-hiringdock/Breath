import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";

interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: () => Promise<Record<string, unknown> | null>;
  all: () => Promise<{ results: Record<string, unknown>[] }>;
  run: () => Promise<unknown>;
}
interface D1Database {
  prepare: (sql: string) => D1PreparedStatement;
}

type Bindings = {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Auth endpoints
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Get breathing parameters for a mode (with optional user-specific adaptation)
app.get("/api/breathing/parameters/:mode", authMiddleware, async (c) => {
  const mode = c.req.param("mode");
  const user = c.get("user");

  // Try to get user-specific parameters first
  let params = await c.env.DB.prepare(
    "SELECT * FROM breathing_parameters WHERE mode = ? AND user_id = ?"
  )
    .bind(mode, user?.id)
    .first();

  // If no user-specific params, create them from defaults
  if (!params && user) {
    const defaultParams = await c.env.DB.prepare(
      "SELECT * FROM breathing_parameters WHERE mode = ? AND user_id IS NULL"
    )
      .bind(mode)
      .first();

    if (defaultParams) {
      await c.env.DB.prepare(
        "INSERT INTO breathing_parameters (mode, user_id, inhale_duration, exhale_duration, pause_duration, total_duration_seconds) VALUES (?, ?, ?, ?, ?, ?)"
      )
        .bind(
          mode,
          user.id,
          defaultParams.inhale_duration,
          defaultParams.exhale_duration,
          defaultParams.pause_duration,
          defaultParams.total_duration_seconds
        )
        .run();

      params = await c.env.DB.prepare(
        "SELECT * FROM breathing_parameters WHERE mode = ? AND user_id = ?"
      )
        .bind(mode, user.id)
        .first();
    }
  }

  if (!params) {
    return c.json({ error: "Mode not found" }, 404);
  }

  return c.json(params);
});

// Create a new breathing session
app.post(
  "/api/breathing/sessions",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      mode: z.enum(["daily", "reset", "silent"]),
      custom_duration: z.number().optional(),
    })
  ),
  async (c) => {
    const { mode, custom_duration } = c.req.valid("json");
    const user = c.get("user");

    // Get parameters for this mode
    const params = await c.env.DB.prepare(
      "SELECT total_duration_seconds FROM breathing_parameters WHERE mode = ? AND (user_id = ? OR user_id IS NULL) ORDER BY user_id DESC LIMIT 1"
    )
      .bind(mode, user?.id)
      .first();

    if (!params) {
      return c.json({ error: "Invalid mode" }, 400);
    }

    const duration = custom_duration || params.total_duration_seconds;

    const result = await c.env.DB.prepare(
      "INSERT INTO breathing_sessions (mode, duration_seconds, user_id) VALUES (?, ?, ?) RETURNING id"
    )
      .bind(mode, duration, user?.id)
      .first();

    return c.json(result);
  }
);

// Get session history (user-specific if authenticated)
app.get("/api/breathing/sessions", authMiddleware, async (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const user = c.get("user");
  
  const sessions = await c.env.DB.prepare(
    "SELECT * FROM breathing_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
  )
    .bind(user?.id, limit)
    .all();

  return c.json(sessions.results);
});

// Update session (mark complete or add comfort rating)
app.patch(
  "/api/breathing/sessions/:id",
  authMiddleware,
  zValidator(
    "json",
    z.object({
      completed: z.boolean().optional(),
      comfort_rating: z.enum(["lighter", "neutral", "heavy"]).optional(),
      lung_capacity_data: z.object({
        max_breath_hold_seconds: z.number().optional(),
        average_inhale_depth: z.number().optional(),
        average_exhale_control: z.number().optional(),
        respiratory_rate: z.number().optional(),
        comfort_level: z.number().optional(),
      }).optional(),
    })
  ),
  async (c) => {
    const id = parseInt(c.req.param("id"));
    const { completed, comfort_rating, lung_capacity_data } = c.req.valid("json");
    const user = c.get("user");

    const updates: string[] = [];
    const values: unknown[] = [];

    if (completed !== undefined) {
      updates.push("completed = ?");
      values.push(completed ? 1 : 0);
    }

    if (comfort_rating !== undefined) {
      updates.push("comfort_rating = ?");
      values.push(comfort_rating);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    if (updates.length === 1 && !lung_capacity_data) {
      return c.json({ error: "No updates provided" }, 400);
    }

    values.push(id);

    await c.env.DB.prepare(
      `UPDATE breathing_sessions SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`
    )
      .bind(...values, user?.id)
      .run();

    // Store lung capacity metrics
    if (lung_capacity_data && user) {
      await c.env.DB.prepare(
        "INSERT INTO lung_capacity_metrics (user_id, session_id, max_breath_hold_seconds, average_inhale_depth, average_exhale_control, respiratory_rate, comfort_level) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
        .bind(
          user.id,
          id,
          lung_capacity_data.max_breath_hold_seconds || null,
          lung_capacity_data.average_inhale_depth || null,
          lung_capacity_data.average_exhale_control || null,
          lung_capacity_data.respiratory_rate || null,
          lung_capacity_data.comfort_level || null
        )
        .run();
    }

    // Adapt parameters based on comfort rating and capacity metrics
    if (comfort_rating && user) {
      await adaptParameters(c.env.DB, id, comfort_rating, user.id);
    }

    // Update progress analytics
    if (completed && user) {
      await updateProgressAnalytics(c.env.DB, user.id);
    }

    return c.json({ success: true });
  }
);

// Get user progress analytics
app.get("/api/progress/analytics", authMiddleware, async (c) => {
  const user = c.get("user");

  let analytics = await c.env.DB.prepare(
    "SELECT * FROM user_progress_analytics WHERE user_id = ?"
  )
    .bind(user?.id)
    .first();

  if (!analytics && user) {
    // Initialize analytics for new user
    await c.env.DB.prepare(
      "INSERT INTO user_progress_analytics (user_id) VALUES (?)"
    )
      .bind(user.id)
      .run();

    analytics = await c.env.DB.prepare(
      "SELECT * FROM user_progress_analytics WHERE user_id = ?"
    )
      .bind(user.id)
      .first();
  }

  // Get recent lung capacity metrics
  const recentMetrics = await c.env.DB.prepare(
    "SELECT * FROM lung_capacity_metrics WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
  )
    .bind(user?.id)
    .all();

  return c.json({
    analytics,
    recentMetrics: recentMetrics.results,
  });
});

// Adaptive logic to adjust breathing parameters based on user performance
async function adaptParameters(
  db: D1Database,
  sessionId: number,
  comfortRating: string,
  userId: string
) {
  // Get the session to know which mode
  const session = await db
    .prepare("SELECT mode FROM breathing_sessions WHERE id = ?")
    .bind(sessionId)
    .first();

  if (!session) return;

  const mode = session.mode as string;

  // Get current user-specific parameters
  const params = await db
    .prepare("SELECT * FROM breathing_parameters WHERE mode = ? AND user_id = ?")
    .bind(mode, userId)
    .first();

  if (!params) return;

  // Get recent sessions to determine trend
  const recentSessions = await db
    .prepare(
      "SELECT comfort_rating FROM breathing_sessions WHERE mode = ? AND user_id = ? AND comfort_rating IS NOT NULL ORDER BY created_at DESC LIMIT 5"
    )
    .bind(mode, userId)
    .all();

  const recentRatings = (recentSessions.results as Array<{ comfort_rating: string | null }>).map((s) => s.comfort_rating);
  const lighterCount = recentRatings.filter((r) => r === "lighter").length;
  const heavyCount = recentRatings.filter((r) => r === "heavy").length;

  // Get lung capacity metrics to inform adaptation
  const recentMetrics = await db
    .prepare(
      "SELECT AVG(average_inhale_depth) as avg_depth, AVG(average_exhale_control) as avg_control FROM lung_capacity_metrics WHERE user_id = ? ORDER BY created_at DESC LIMIT 5"
    )
    .bind(userId)
    .first();

  let newInhale = params.inhale_duration as number;
  let newExhale = params.exhale_duration as number;
  let newPause = params.pause_duration as number;

  // Advanced adaptation rules based on performance metrics
  const avgDepth = (recentMetrics?.avg_depth as number) || 0;
  const avgControl = (recentMetrics?.avg_control as number) || 0;

  // If user is consistently finding it lighter AND has good metrics
  if (lighterCount >= 3 && comfortRating === "lighter" && avgDepth > 0.7 && avgControl > 0.7) {
    if (mode === "daily" || mode === "silent") {
      // Increase both inhale and exhale for better lung capacity
      newInhale = Math.min(newInhale + 0.3, 7.0);
      newExhale = Math.min(newExhale + 0.3, 9.0);
    } else if (mode === "reset") {
      // Extend pause for better breath control
      newPause = Math.min(newPause + 0.15, 3.0);
      newInhale = Math.min(newInhale + 0.2, 5.0);
    }
  }

  // If user is struggling, decrease difficulty more aggressively
  if (heavyCount >= 2 || comfortRating === "heavy") {
    if (mode === "daily" || mode === "silent") {
      newExhale = Math.max(newExhale - 0.3, 4.0);
      newInhale = Math.max(newInhale - 0.2, 3.5);
    } else if (mode === "reset") {
      newPause = Math.max(newPause - 0.15, 0.5);
    }
  }

  // Update parameters if changed
  if (
    newInhale !== params.inhale_duration ||
    newExhale !== params.exhale_duration ||
    newPause !== params.pause_duration
  ) {
    await db
      .prepare(
        "UPDATE breathing_parameters SET inhale_duration = ?, exhale_duration = ?, pause_duration = ?, updated_at = CURRENT_TIMESTAMP WHERE mode = ? AND user_id = ?"
      )
      .bind(newInhale, newExhale, newPause, mode, userId)
      .run();
  }
}

// Update user progress analytics
async function updateProgressAnalytics(db: D1Database, userId: string) {
  // Get or create analytics record
  let analytics = await db
    .prepare("SELECT * FROM user_progress_analytics WHERE user_id = ?")
    .bind(userId)
    .first();

  if (!analytics) {
    await db
      .prepare("INSERT INTO user_progress_analytics (user_id) VALUES (?)")
      .bind(userId)
      .run();
    analytics = await db
      .prepare("SELECT * FROM user_progress_analytics WHERE user_id = ?")
      .bind(userId)
      .first();
  }

  // Calculate lung capacity metrics
  const capacityMetrics = await db
    .prepare(
      `SELECT 
        AVG(average_inhale_depth) as avg_inhale,
        AVG(average_exhale_control) as avg_exhale,
        AVG(max_breath_hold_seconds) as avg_hold
      FROM lung_capacity_metrics 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10`
    )
    .bind(userId)
    .first();

  // Calculate current lung capacity score (0-100)
  const avgInhale = (capacityMetrics?.avg_inhale as number) || 0.5;
  const avgExhale = (capacityMetrics?.avg_exhale as number) || 0.5;
  const avgHold = (capacityMetrics?.avg_hold as number) || 10;
  const currentCapacity = Math.min(100, (avgInhale * 30 + avgExhale * 30 + (avgHold / 60) * 40));

  // Set baseline if not set
  const baselineCapacity = (analytics?.baseline_lung_capacity as number) || currentCapacity;
  
  // Calculate improvement
  const improvement = baselineCapacity > 0 
    ? ((currentCapacity - baselineCapacity) / baselineCapacity) * 100 
    : 0;

  // Get total training time
  const totalSessions = await db
    .prepare("SELECT COUNT(*) as count, SUM(duration_seconds) as total_seconds FROM breathing_sessions WHERE user_id = ? AND completed = 1")
    .bind(userId)
    .first();

  const totalMinutes = Math.floor(((totalSessions?.total_seconds as number) || 0) / 60);

  // Calculate streak
  const sessions = await db
    .prepare("SELECT created_at FROM breathing_sessions WHERE user_id = ? AND completed = 1 ORDER BY created_at DESC")
    .bind(userId)
    .all();

  const dates = (sessions.results as Array<{ created_at: string }>).map((s) => new Date(s.created_at).toDateString());
  const uniqueDates = Array.from(new Set(dates));
  
  let streak = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    if (uniqueDates[i] === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  const bestStreak = Math.max((analytics?.best_streak as number) || 0, streak);

  // Determine difficulty level based on performance
  let difficultyLevel = 'beginner';
  if (currentCapacity >= 75 && streak >= 14) {
    difficultyLevel = 'advanced';
  } else if (currentCapacity >= 60 && streak >= 7) {
    difficultyLevel = 'intermediate';
  }

  // Update analytics
  await db
    .prepare(
      `UPDATE user_progress_analytics 
      SET baseline_lung_capacity = COALESCE(baseline_lung_capacity, ?),
          current_lung_capacity = ?,
          capacity_improvement_percent = ?,
          total_training_minutes = ?,
          consecutive_days_streak = ?,
          best_streak = ?,
          last_session_date = DATE('now'),
          difficulty_level = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`
    )
    .bind(
      baselineCapacity,
      currentCapacity,
      improvement,
      totalMinutes,
      streak,
      bestStreak,
      difficultyLevel,
      userId
    )
    .run();
}

export default app;
