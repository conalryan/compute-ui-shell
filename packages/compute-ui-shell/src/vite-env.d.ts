/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPS_BASE_URL: string;
  readonly VITE_APPS_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
