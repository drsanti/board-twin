import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // file:-linked TRN packages — never double-bundle React
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  server: {
    port: 7393, // 5173 is taken by another app on this machine
    strictPort: true,
    watch: {
      // Rust build trees — never watch these (EBUSY / churn on Windows)
      ignored: ["**/src-tauri/**", "**/target/**", "**/broker/target/**"],
    },
  },
});
