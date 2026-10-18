import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Serves /api/chat during `npm run dev` using the exact same handler Vercel runs
 * in production, so the chatbot works locally without `vercel dev`.
 */
function devApi() {
  return {
    name: "wine-dev-api",
    configureServer(server) {
      const env = loadEnv("development", process.cwd(), "");
      for (const k of Object.keys(env)) process.env[k] ??= env[k];

      server.middlewares.use("/api/chat", async (req, res) => {
        try {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const raw = Buffer.concat(chunks).toString("utf8");
          req.body = raw ? JSON.parse(raw) : {};
          res.status = (code) => ((res.statusCode = code), res);
          res.json = (obj) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(obj));
          };
          const mod = await server.ssrLoadModule("/api/chat.js");
          await mod.default(req, res);
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Dev API crashed. Check the terminal.", code: "dev" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
  build: { chunkSizeWarningLimit: 700 },
});
