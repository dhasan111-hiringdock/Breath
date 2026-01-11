import path from "path";
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";

const devApiStub = (): PluginOption => ({
  name: "dev-api-stub",
  apply: "serve",
  configureServer(server) {
    type Session = {
      id: number;
      mode: string;
      created_at: string;
      completed: number;
      comfort_rating: string | null;
    };
    const sessions: Session[] = [];
    let nextId = 1;
    let loggedIn = false;
    const user = { id: "dev-user-1", email: "dev@example.com", name: "Dev User" };

    server.middlewares.use((req, res, next) => {
      if (!req.url || !req.url.startsWith("/api")) return next();
      res.setHeader("Content-Type", "application/json");
      const url = new URL(req.url, "http://localhost");
      const { pathname, searchParams } = url;

      if (req.method === "GET" && pathname === "/api/users/me") {
        res.end(JSON.stringify(loggedIn ? user : null));
        return;
      }

      if (req.method === "GET" && pathname === "/api/logout") {
        loggedIn = false;
        res.end(JSON.stringify({ success: true }));
        return;
      }

      if (req.method === "GET" && pathname === "/api/oauth/google/redirect_url") {
        res.end(JSON.stringify({ redirectUrl: "/auth/callback?code=dev" }));
        return;
      }

      if (req.method === "POST" && pathname === "/api/sessions") {
        loggedIn = true;
        res.end(JSON.stringify({ success: true }));
        return;
      }

      const paramMatch = pathname.match(/^\/api\/breathing\/parameters\/(daily|reset|silent)$/);
      if (req.method === "GET" && paramMatch) {
        const mode = paramMatch[1] as "daily" | "reset" | "silent";
        const defaults = {
          daily: { inhale_duration: 4, exhale_duration: 6, pause_duration: 0, total_duration_seconds: 360 },
          reset: { inhale_duration: 4, exhale_duration: 8, pause_duration: 2, total_duration_seconds: 60 },
          silent: { inhale_duration: 4, exhale_duration: 6, pause_duration: 0, total_duration_seconds: 360 },
        };
        res.end(JSON.stringify(defaults[mode]));
        return;
      }

      if (req.method === "POST" && pathname === "/api/breathing/sessions") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          let mode = "daily";
          try {
            const parsed = body ? JSON.parse(body) : {};
            mode = parsed.mode ?? mode;
          } catch {
            // ignore parse errors, use defaults
          }
          const id = nextId++;
          const created_at = new Date().toISOString();
          sessions.push({
            id,
            mode,
            created_at,
            completed: 0,
            comfort_rating: null,
          });
          res.end(JSON.stringify({ id }));
        });
        return;
      }

      const patchMatch = pathname.match(/^\/api\/breathing\/sessions\/(\d+)$/);
      if (patchMatch && req.method === "PATCH") {
        const id = Number(patchMatch[1]);
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          let completed: boolean | undefined;
          let comfort_rating: string | null | undefined;
          try {
            const parsed = body ? JSON.parse(body) : {};
            completed = parsed.completed;
            comfort_rating = parsed.comfort_rating;
          } catch {
            // ignore parse errors
          }
          const session = sessions.find((s) => s.id === id);
          if (!session) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "not found" }));
            return;
          }
          if (typeof completed === "boolean") session.completed = completed ? 1 : 0;
          if (typeof comfort_rating === "string" || comfort_rating === null) session.comfort_rating = comfort_rating ?? null;
          res.end(JSON.stringify({ success: true }));
        });
        return;
      }

      if (req.method === "GET" && pathname === "/api/breathing/sessions") {
        const limitStr = searchParams.get("limit");
        const limit = limitStr ? Number(limitStr) : 50;
        const data = sessions.slice(-limit);
        res.end(JSON.stringify(data));
        return;
      }

      if (req.method === "GET" && pathname === "/api/progress/analytics") {
        const recent = sessions.slice(-10);
        res.end(
          JSON.stringify({
            analytics: {
              baseline_lung_capacity: 45,
              current_lung_capacity: 52,
              capacity_improvement_percent: 15.5,
              total_training_minutes: recent.length * 10,
              consecutive_days_streak: 1,
              best_streak: 3,
              difficulty_level: "beginner",
            },
            recentMetrics: recent.map((s) => ({
              max_breath_hold_seconds: 30,
              average_inhale_depth: 0.8,
              average_exhale_control: 0.75,
              comfort_level: 0.7,
              created_at: s.created_at,
            })),
          })
        );
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ error: "not found" }));
    });
  },
});

export default defineConfig(({ command }) => {
  const pluginSet = mochaPlugins(process.env as Record<string, string | undefined>);
  const basePlugins: PluginOption[] = Array.isArray(pluginSet) ? pluginSet : [pluginSet];
  const plugins: PluginOption[] = [...basePlugins, react()];
  if (command === "build") {
    plugins.push(cloudflare());
  } else {
    plugins.push(devApiStub());
  }
  return {
    plugins,
    server: {
      allowedHosts: true,
    },
    build: {
      chunkSizeWarningLimit: 5000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
