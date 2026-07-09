import { APPS_BASE_URL, APPS_VERSION } from "./config.ts";
import { appBasePath } from "./app-id.ts";
import type {
  AppDeployManifest,
  AppMountContext,
  AppUnmount,
  LoadedApp,
  MicrofrontendModule,
} from "./types.ts";

function versionBase(appName: string): string {
  return `${APPS_BASE_URL}/${appName}/${APPS_VERSION}`;
}

/**
 * Resolve the module URL for an app.
 *
 * Preferred: short-lived `deploy.json` pointing at a content-hashed entry
 * (safe for Akamai + browser cache; shell URL stays stable across deploys).
 *
 * Fallback: `{versionBase}/entry.js` for local/dev or older publishes.
 */
export async function resolveEntryUrl(appName: string): Promise<string> {
  const base = versionBase(appName);
  const manifest = await fetchDeployManifest(`${base}/deploy.json`);

  if (manifest?.entry) {
    if (/^https?:\/\//i.test(manifest.entry)) {
      return manifest.entry;
    }
    return `${base}/${manifest.entry.replace(/^\/+/, "")}`;
  }

  return `${base}/entry.js`;
}

async function fetchDeployManifest(
  url: string,
): Promise<AppDeployManifest | null> {
  try {
    // Never reuse a cached pointer — this is the only mutable URL the shell hits.
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data = (await res.json()) as unknown;
    if (
      !data ||
      typeof data !== "object" ||
      typeof (data as AppDeployManifest).entry !== "string" ||
      !(data as AppDeployManifest).entry
    ) {
      return null;
    }

    return data as AppDeployManifest;
  } catch {
    return null;
  }
}

function isCustomElementDefined(tagName: string): boolean {
  return Boolean(customElements.get(tagName));
}

async function waitForCustomElement(
  tagName: string,
  timeoutMs = 5_000,
): Promise<boolean> {
  if (isCustomElementDefined(tagName)) return true;

  try {
    await Promise.race([
      customElements.whenDefined(tagName),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      ),
    ]);
    return true;
  } catch {
    return isCustomElementDefined(tagName);
  }
}

/**
 * Load a remote app module and mount it into `container`.
 * Supports custom-element registration (Lit / Angular Elements / wrapped React)
 * or an imperative mount/unmount export.
 */
export async function loadAndMountApp(
  appName: string,
  container: HTMLElement,
): Promise<LoadedApp> {
  const entryUrl = await resolveEntryUrl(appName);
  const context: AppMountContext = {
    appName,
    basePath: appBasePath(appName),
    entryUrl,
  };

  const mod = (await import(
    /* @vite-ignore */ entryUrl
  )) as MicrofrontendModule;

  const tagName = mod.tagName ?? appName;

  if (typeof mod.mount === "function") {
    const maybeUnmount = await mod.mount(container, context);
    const unmount: AppUnmount =
      typeof maybeUnmount === "function"
        ? maybeUnmount
        : async () => {
            await mod.unmount?.(container);
          };

    return { kind: "imperative", unmount };
  }

  const defined = await waitForCustomElement(tagName);
  if (!defined) {
    throw new Error(
      `Module loaded from ${entryUrl} but custom element <${tagName}> was not registered and no mount() export was found.`,
    );
  }

  const el = document.createElement(tagName);
  el.setAttribute("base-path", context.basePath);
  container.replaceChildren(el);

  return { kind: "custom-element", tagName };
}

export async function unmountApp(
  loaded: LoadedApp | null,
  container: HTMLElement,
): Promise<void> {
  if (!loaded) {
    container.replaceChildren();
    return;
  }

  if (loaded.kind === "imperative") {
    await loaded.unmount();
  }

  container.replaceChildren();
}
