import type { Plugin } from "vite";

/**
 * Emit hashed entry chunks and a short-lived deploy.json pointer.
 * The shell always loads `…/latest/deploy.json` (no-store), then imports
 * the hashed entry URL — so app deploys do not require a shell rebuild,
 * and CDN/browser caches can safely long-cache the hashed file.
 */
export function mfeLibBuild(options: {
  /** Absolute path to the app entry module */
  entry: string;
  /** Absolute outDir, typically …/compute-ui-<product>/latest */
  outDir: string;
}): {
  plugins: Plugin[];
  build: {
    lib: {
      entry: string;
      formats: ["es"];
      fileName: string;
    };
    outDir: string;
    emptyOutDir: boolean;
    cssCodeSplit: boolean;
    rollupOptions: {
      output: {
        entryFileNames: string;
        chunkFileNames: string;
        assetFileNames: string;
      };
    };
  };
} {
  return {
    plugins: [writeDeployManifest()],
    build: {
      lib: {
        entry: options.entry,
        formats: ["es"],
        fileName: "entry",
      },
      outDir: options.outDir,
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: "entry-[hash].js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
  };
}

function writeDeployManifest(): Plugin {
  return {
    name: "write-deploy-manifest",
    generateBundle(_options, bundle) {
      const entryChunk = Object.values(bundle).find(
        (file) => file.type === "chunk" && file.isEntry,
      );
      if (!entryChunk || entryChunk.type !== "chunk") return;

      this.emitFile({
        type: "asset",
        fileName: "deploy.json",
        source: `${JSON.stringify(
          {
            entry: entryChunk.fileName,
          },
          null,
          2,
        )}\n`,
      });
    },
  };
}
