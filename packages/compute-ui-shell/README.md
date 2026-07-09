# Compute UI Shell

Lit-based host that loads product applications through **Akamai CDN** (fronting object storage) based on the URL.

The shell always resolves a **stable channel URL** (`…/latest/deploy.json`). App teams publish new builds under that channel without changing or redeploying the shell.

## Routing convention

| Browser URL | App name | CDN entry |
| --- | --- | --- |
| `/product-a` | `compute-ui-product-a` | `{base}/compute-ui-product-a/{version}/deploy.json` → hashed `entry-….js` |
| `/compute-ui-product-a` | `compute-ui-product-a` | same |

The first path segment is the product. The shell always normalizes to `compute-ui-<product>`.

Configure the CDN via env (see `.env.example`):

```bash
VITE_APPS_BASE_URL=https://<akamai-hostname>/apps
VITE_APPS_VERSION=latest
```

Keep `VITE_APPS_VERSION=latest` in production so individual app deploys never require a shell rebuild. Pin a version folder only for freezes or rollbacks.

## App contract

Every product publishes under:

```text
{VITE_APPS_BASE_URL}/compute-ui-<product>/{VITE_APPS_VERSION}/
  deploy.json          # short-lived pointer: { "entry": "entry-<hash>.js" }
  entry-<hash>.js      # content-hashed ES module (long-cacheable)
```

The shell fetches `deploy.json` with `cache: "no-store"`, then dynamically imports the hashed entry. If `deploy.json` is missing, it falls back to `entry.js` (local/dev or legacy publishes).

### Option A — Custom element (preferred for Lit, Angular Elements, wrapped React)

Side-effect register a custom element whose tag matches the app name:

```ts
// compute-ui-product-a entry
@customElement("compute-ui-product-a")
export class ComputeUiProductA extends LitElement {
  @property({ attribute: "base-path" })
  basePath = "/product-a";

  render() {
    return html`…`;
  }
}
```

The shell creates `<compute-ui-product-a base-path="/product-a">` after the module loads.

### Option B — Imperative mount (plain React / Angular bootstrap)

Export `mount` (and optionally `unmount`) from the entry module:

```ts
import { createRoot, type Root } from "react-dom/client";
import { App } from "./App";

let root: Root | undefined;

export function mount(
  container: HTMLElement,
  context: { appName: string; basePath: string; entryUrl: string },
) {
  root = createRoot(container);
  root.render(<App basename={context.basePath} />);
  return () => {
    root?.unmount();
    root = undefined;
  };
}
```

Angular example:

```ts
import { createApplication } from "@angular/platform-browser";
import { appConfig } from "./app.config";
import { AppComponent } from "./app.component";

export async function mount(
  container: HTMLElement,
  context: { basePath: string },
) {
  const app = await createApplication(appConfig);
  // bootstrap into `container` with APP_BASE_HREF = context.basePath
  return () => app.destroy();
}
```

If both a custom element and `mount` exist, **`mount` wins**.

## Caching (why `entry.js` alone is risky)

Yes — a **stable, unhashed** `entry.js` URL will be cached by Akamai and browsers. After a deploy that overwrites the same path, users can keep running the old module until TTL expires or a purge runs.

Recommended split:

| Asset | Cache-Control | Notes |
| --- | --- | --- |
| `deploy.json` | `no-store` (or very short TTL + purge on deploy) | Only mutable pointer the shell hits |
| `entry-<hash>.js` (+ chunks/assets) | `public, max-age=31536000, immutable` | Safe to cache forever; URL changes each build |

Do **not** put a long TTL on an unhashed `entry.js` unless you purge Akamai (and accept browser cache risk) on every app deploy.

## Framework notes

- **Lit** — register `compute-ui-<product>` directly.
- **React** — either wrap with a custom element library, or export `mount`/`unmount`.
- **Angular** — prefer Angular Elements (`createCustomElement`) registering `compute-ui-<product>`, or export `mount` that bootstraps into the outlet.

Child apps should treat `base-path` / `context.basePath` as their router basename so deep links like `/product-a/settings` keep working under the shell.

## Akamai / origin checklist

- Origin: object storage (or equivalent) behind the Akamai property
- CORS: allow the shell origin, methods `GET`/`HEAD`
- Correct MIME types (`application/javascript`, `application/json`, `text/css`)
- Upload each build under `compute-ui-<product>/<version>/` with hashed entry + `deploy.json`
- Promote by updating the `latest` folder’s `deploy.json` (shell stays on `VITE_APPS_VERSION=latest`)
- Optionally purge `…/latest/deploy.json` on deploy if any edge TTL remains

## Example apps

| Route | Package | Integration |
| --- | --- | --- |
| `/product-lit` | `packages/compute-ui-product-lit` | Custom element (Lit) |
| `/product-react` | `packages/compute-ui-product-react` | Imperative `mount` (React) |
| `/product-angular` | `packages/compute-ui-product-angular` | Imperative `mount` (Angular) |

Each app builds to `.local-apps/compute-ui-<product>/latest/` (`deploy.json` + hashed entry).

## Local development

```bash
pnpm install
pnpm build:apps
cp packages/compute-ui-shell/.env.example packages/compute-ui-shell/.env
# for local examples, set:
#   VITE_APPS_BASE_URL=http://localhost:5173/apps
pnpm --filter compute-ui-shell dev
```

Open:

- `http://localhost:5173/product-lit`
- `http://localhost:5173/product-react`
- `http://localhost:5173/product-angular`
