/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_API_PREFIX: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}