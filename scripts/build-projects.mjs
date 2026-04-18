import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const projects = [
  ['chess-chaos', 'vite.config.mjs'],
  ['pitch-ipsum', 'vite.config.mjs'],
  ['not-hotdog', 'vite.config.mjs'],
  ['tc-life-ruiner', 'vite.config.mjs'],
  ['vc-rejection-clicker', 'vite.config.mjs'],
];

for (const [name, config] of projects) {
  console.log('Building ' + name + '...');
  execFileSync('npx', ['vite', 'build', '--config', resolve('projects', name, config)], { stdio: 'inherit' });
}
