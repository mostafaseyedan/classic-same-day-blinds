/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPS_API_URL?: string;
  readonly VITE_STOREFRONT_URL?: string;
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
