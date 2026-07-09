import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/entry.tsx"),
      formats: ["es"],
      fileName: () => "entry.js",
    },
    outDir: resolve(
      __dirname,
      "../../.local-apps/compute-ui-product-react/latest",
    ),
    emptyOutDir: true,
    cssCodeSplit: false,
  },
});
