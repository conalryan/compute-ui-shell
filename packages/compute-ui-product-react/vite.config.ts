import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { mfeLibBuild } from "../../tools/vite-mfe-build.ts";

const mfe = mfeLibBuild({
  entry: resolve(__dirname, "src/entry.tsx"),
  outDir: resolve(
    __dirname,
    "../../.local-apps/compute-ui-product-react/latest",
  ),
});

export default defineConfig({
  plugins: [react(), ...mfe.plugins],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: mfe.build,
});
