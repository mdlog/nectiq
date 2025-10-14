import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // Completely disable React refresh to avoid preamble issues
      fastRefresh: false,
      include: "**/*.{jsx,tsx}",
      exclude: /node_modules/,
    }),
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    hmr: false, // Disable hot module replacement
  },
  build: {
    minify: false, // Disable minification for debugging
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
