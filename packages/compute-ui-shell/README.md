# Compute UI Shell

Lit-based host that loads product applications from Azure Blob Storage (or a CDN in front of it) based on the URL.

## Routing convention

| Browser URL | App name | Blob entry |
| --- | --- | --- |
| `/product-a` | `compute-ui-product-a` | `{base}/compute-ui-product-a/{version}/entry.js` |
| `/compute-ui-product-a` | `compute-ui-product-a` | same |

The first path segment is the product. The shell always normalizes to `compute-ui-<product>`.

Configure storage via env (see `.env.example`):

```bash
VITE_APPS_BASE_URL=https://<account>.blob.core.windows.net/apps
VITE_APPS_VERSION=latest
```

## App contract

Every product publishes an ES module at:

```text
{VITE_APPS_BASE_URL}/compute-ui-<product>/{VITE_APPS_VERSION}/entry.js
```

### Option A — Custom element (preferred for Lit, Angular Elements, wrapped React)

Side-effect register a custom element whose tag matches the app name:

```ts
// compute-ui-product-a entry.js
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

Export `mount` (and optionally `unmount`) from `entry.js`:

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

## Framework notes

- **Lit** — register `compute-ui-<product>` directly.
- **React** — either wrap with a custom element library, or export `mount`/`unmount`.
- **Angular** — prefer Angular Elements (`createCustomElement`) registering `compute-ui-<product>`, or export `mount` that bootstraps into the outlet.

Child apps should treat `base-path` / `context.basePath` as their router basename so deep links like `/product-a/settings` keep working under the shell.

## Azure Blob checklist

- CORS: allow the shell origin, methods `GET`/`HEAD`
- Correct MIME types (`application/javascript`, `text/css`)
- Upload each build under `compute-ui-<product>/<version>/` and promote `latest` (or pin `VITE_APPS_VERSION`)

## Example apps

| Route | Package | Integration |
| --- | --- | --- |
| `/product-lit` | `packages/compute-ui-product-lit` | Custom element (Lit) |
| `/product-react` | `packages/compute-ui-product-react` | Imperative `mount` (React) |
| `/product-angular` | `packages/compute-ui-product-angular` | Imperative `mount` (Angular) |

Each app builds an ES module to `.local-apps/compute-ui-<product>/latest/entry.js`.

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
