import { APP_NAME_PREFIX } from "./config.ts";

/**
 * Top-level route → canonical app name.
 * /product-a              → compute-ui-product-a
 * /compute-ui-product-a   → compute-ui-product-a
 */
export function appNameFromPath(pathname: string): string | null {
  const segment = pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  if (!segment) return null;
  return normalizeAppName(segment);
}

export function normalizeAppName(segment: string): string {
  const slug = segment.toLowerCase();
  return slug.startsWith(APP_NAME_PREFIX) ? slug : `${APP_NAME_PREFIX}${slug}`;
}

/** Product slug used as the public route, e.g. compute-ui-product-a → product-a */
export function productSlugFromAppName(appName: string): string {
  return appName.startsWith(APP_NAME_PREFIX)
    ? appName.slice(APP_NAME_PREFIX.length)
    : appName;
}

/** Base path the child app should use for its own client router */
export function appBasePath(appName: string): string {
  return `/${productSlugFromAppName(appName)}`;
}
