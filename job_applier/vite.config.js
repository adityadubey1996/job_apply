import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // Allow external access
    port: 5173, // Ensure it uses the same port
  },
  preview: {
    host: "0.0.0.0", // Allow external access for preview
    port: 5173, // Port for preview server
  },
});
