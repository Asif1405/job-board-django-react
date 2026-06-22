import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: "./index.html",
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  source: {
    entry: {
      index: "./src/main.tsx",
    },
  },
  output: {
    cssModules: {
      auto: true,
    },
  },
});
