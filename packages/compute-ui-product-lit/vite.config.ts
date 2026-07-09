import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/entry.ts"),
      formats: ["es"],
      fileName: () => "entry.js",
    },
    outDir: resolve(__dirname, "../../.local-apps/compute-ui-product-lit/latest"),
    emptyOutDir: true,
    cssCodeSplit: false,
  },
});
