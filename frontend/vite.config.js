import { defineConfig } from "vite";
import { config } from "dotenv";
import react from "@vitejs/plugin-react";
import path from "path"
// Load environment variables from .env file
config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: process.env.PORT || 5173, // Use the PORT environment variable or default to 3000
    host: "0.0.0.0", // Allow external access
    preview: {
      allowedHosts: ['job-mate.onrender.com'], // Add your domain here
    },
  },
  define: {
    "process.env": process.env,
  },
});