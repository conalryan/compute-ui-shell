import { defineConfig } from "vite";
import { resolve } from "node:path";
import { mfeLibBuild } from "../../tools/vite-mfe-build.ts";

const mfe = mfeLibBuild({
  entry: resolve(__dirname, "src/entry.ts"),
  outDir: resolve(
    __dirname,
    "../../.local-apps/compute-ui-product-angular/latest",
  ),
});

export default defineConfig({
  plugins: mfe.plugins,
  build: mfe.build,
});
