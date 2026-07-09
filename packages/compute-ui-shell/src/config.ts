/** Azure Blob (or CDN) base that hosts each app under /{appName}/{version}/entry.js */
export const APPS_BASE_URL = (
  import.meta.env.VITE_APPS_BASE_URL ??
  "https://<account>.blob.core.windows.net/apps"
).replace(/\/+$/, "");

/** Folder under each app prefix; use "latest" or a pinned version like "v1.2.3" */
export const APPS_VERSION = import.meta.env.VITE_APPS_VERSION ?? "latest";

export const APP_NAME_PREFIX = "compute-ui-";
