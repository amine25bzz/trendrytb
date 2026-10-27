/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Build-time switch set in vite.config.ts: true in the dev server and tests, and in a build only
 * with VITE_SPECIMEN=1. Replaced textually, so `false` builds drop the specimen chunk entirely.
 */
declare const __SPECIMEN_ENABLED__: boolean;
