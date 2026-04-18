import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: projectRoot,
  base: '/stupid-ideas-hub/projects/pitch-ipsum/',
  plugins: [react()],
  build: {
    outDir: resolve(projectRoot, '../../public/projects/pitch-ipsum'),
    emptyOutDir: true,
  },
});
