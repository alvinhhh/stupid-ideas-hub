import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: projectRoot,
  base: '/stupid-ideas-hub/projects/tc-life-ruiner/',
  plugins: [react()],
  build: {
    outDir: resolve(projectRoot, '../../public/projects/tc-life-ruiner'),
    emptyOutDir: true,
  },
});
