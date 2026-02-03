/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Process env declarations for Vite define
declare const process: {
  env: {
    API_KEY?: string;
    GEMINI_API_KEY?: string;
    NODE_ENV: string;
  };
};
