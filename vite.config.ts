import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // Development server configuration
    server: {
      port: 3000,
      host: '0.0.0.0',
      open: true,
    },

    // Preview server configuration
    preview: {
      port: 3001,
    },

    // Plugins
    plugins: [react()],

    // Environment variable definitions
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },

    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'esbuild',
      target: 'es2022',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            genai: ['@google/genai'],
          },
        },
      },
    },

    // Optimization
    optimizeDeps: {
      include: ['react', 'react-dom', '@google/genai'],
    },
  };
});
