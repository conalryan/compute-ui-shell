/**
 * Akamai CDN base that fronts object storage.
 * Each app is published under /{appName}/{version}/ with a deploy.json pointer.
 */
export const APPS_BASE_URL = (
  import.meta.env.VITE_APPS_BASE_URL ??
  "https://<akamai-hostname>/apps"
).replace(/\/+$/, "");

/**
 * Channel folder under each app prefix.
 * Keep this as "latest" so the shell never needs a rebuild when apps deploy.
 * Pin to a version folder (e.g. "v1.2.3") only for deliberate freezes/rollbacks.
 */
export const APPS_VERSION = import.meta.env.VITE_APPS_VERSION ?? "latest";

export const APP_NAME_PREFIX = "compute-ui-";
