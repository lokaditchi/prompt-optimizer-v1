/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GEMINI_BASE_URL?: string
  readonly VITE_SENTRY_DSN?: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
