import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_SUPABASE_");
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  // Fail before Vite substitutes an accidentally supplied privileged key into a bundle.
  if (key && !key.startsWith("sb_publishable_")) {
    throw new Error(
      "VITE_SUPABASE_PUBLISHABLE_KEY must contain a publishable key. Never supply a service-role or secret key to Vite.",
    );
  }
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("/node_modules/@supabase/")) return "supabase";
          },
        },
      },
    },
  };
});
