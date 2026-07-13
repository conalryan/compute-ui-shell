import { defineConfig, type Plugin } from "vite";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

/** Serve built example apps from repo `.local-apps` at `/apps/...`. */
function serveLocalApps(): Plugin {
  const appsRoot = resolve(__dirname, "../../.local-apps");

  return {
    name: "serve-local-apps",
    configureServer(server) {
      server.middlewares.use("/apps", (req, res, next) => {
        const urlPath = (req.url ?? "/").split("?")[0];
        const filePath = resolve(appsRoot, `.${urlPath}`);

        if (
          !filePath.startsWith(appsRoot) ||
          !existsSync(filePath) ||
          !statSync(filePath).isFile()
        ) {
          next();
          return;
        }

        const contentType = filePath.endsWith(".css")
          ? "text/css"
          : filePath.endsWith(".js") || filePath.endsWith(".mjs")
            ? "text/javascript"
            : filePath.endsWith(".json")
              ? "application/json"
              : "application/octet-stream";

        const isPointer = filePath.endsWith("deploy.json") || /[/\\]entry\.js$/.test(filePath);

        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        // Match production Akamai guidance: never long-cache the mutable pointer.
        res.setHeader(
          "Cache-Control",
          isPointer ? "no-store" : "public, max-age=31536000, immutable",
        );
        createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/compute-ui-portal.ts"),
      },
    },
  },
  plugins: [serveLocalApps()],
  server: {
    port: 5173,
  },
});
