import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Specific keys are replaced by their values
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // Fallback: define process.env as an empty object to prevent "process is not defined" crashes
        'process.env': {},
      },
      resolve: {
        alias: {
          // Use process.cwd() instead of __dirname to avoid TypeScript errors in ESM
          '@': path.resolve(process.cwd(), '.'),
        }
      }
    };
});