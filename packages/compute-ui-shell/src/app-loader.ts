import { APPS_BASE_URL, APPS_VERSION } from "./config.ts";
import { appBasePath } from "./app-id.ts";
import type {
  AppMountContext,
  AppUnmount,
  LoadedApp,
  MicrofrontendModule,
} from "./types.ts";

export function resolveEntryUrl(appName: string): string {
  return `${APPS_BASE_URL}/${appName}/${APPS_VERSION}/entry.js`;
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
  const entryUrl = resolveEntryUrl(appName);
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
