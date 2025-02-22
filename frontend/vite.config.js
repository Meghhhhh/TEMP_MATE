import { defineConfig } from "vite";
import { config } from "dotenv";
import react from "@vitejs/plugin-react";
import path from "path";

// Load environment variables from .env file
config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: process.env.PORT || 5173, // Use the PORT environment variable or default to 5173
    host: "0.0.0.0", // Allow external access
    strictPort: true, // Ensure the port does not auto-switch
    allowedHosts: ["job-mate.onrender.com"], // ✅ Move this outside preview
  },
  define: {
    "process.env": process.env,
  },
});
