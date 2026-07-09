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
            : "application/octet-stream";

        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [serveLocalApps()],
  server: {
    port: 5173,
  },
});
