import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0" },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          /node_modules\/(three|@react-three)\//.test(id) ? "three" : undefined,
      },
    },
  },
});
