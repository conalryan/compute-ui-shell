/**
 * Published next to each app build as `deploy.json`.
 * The shell fetches this with `cache: "no-store"`, then loads `entry`.
 */
export interface AppDeployManifest {
  /** Filename relative to the version folder, or an absolute URL */
  entry: string;
}

/**
 * Contract every remote app's entry module should satisfy.
 *
 * Preferred (Lit, Angular Elements, react-to-web-component):
 *   register custom element `compute-ui-<product>` as a side effect of the module.
 *
 * Escape hatch (plain React/Angular bootstrap):
 *   export mount / unmount and render into the provided container.
 */
export interface AppMountContext {
  /** Canonical name, e.g. compute-ui-product-a */
  appName: string;
  /** Route prefix for the app router, e.g. /product-a */
  basePath: string;
  /** Absolute URL of the loaded entry module (useful for resolving assets) */
  entryUrl: string;
}

export type AppUnmount = () => void | Promise<void>;

export interface MicrofrontendModule {
  /** Override tag if it differs from the app name (rare) */
  tagName?: string;
  mount?: (
    container: HTMLElement,
    context: AppMountContext,
  ) => void | Promise<void> | AppUnmount;
  unmount?: (container: HTMLElement) => void | Promise<void>;
}

export type LoadedApp =
  | { kind: "custom-element"; tagName: string }
  | { kind: "imperative"; unmount: AppUnmount };
