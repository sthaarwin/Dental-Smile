import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true, // Enable polling for Docker environments
    },
    host: true, // Listen on all addresses
    strictPort: true,
    port: 8080,
  },
})
