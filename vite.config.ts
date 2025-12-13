import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Read package.json
    const packageJsonPath = path.resolve('package.json');
    let packageJson;
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    } catch (e) {
      console.error("Failed to read package.json", e);
      packageJson = { version: '1.1.0' };
    }

    let version = packageJson.version;

    // Automatically increment patch version ONLY during build
    if (command === 'build') {
      const parts = version.split('.');
      if (parts.length === 3) {
        const patch = parseInt(parts[2], 10);
        if (!isNaN(patch)) {
          parts[2] = (patch + 1).toString();
          version = parts.join('.');
          
          // Update package.json
          packageJson.version = version;
          try {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`Version incremented to ${version}`);
          } catch (e) {
            console.error("Failed to update package.json version", e);
          }
        }
      }
    }

    // Format as "ver1.1.0"
    const displayVersion = `ver${version}`;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Correctly define environment variables
        // Using JSON.stringify ensures they are treated as string literals in the code
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.APP_VERSION': JSON.stringify(displayVersion),
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      }
    };
});