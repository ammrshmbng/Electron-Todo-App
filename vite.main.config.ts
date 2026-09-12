import { defineConfig } from "vite";
import { plugin } from "@electron-forge/plugin-vite";

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "better-sqlite3",
      ],
    },
  },
});