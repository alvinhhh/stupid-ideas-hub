import { existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const projects = [
  ['Wiki Faker', 'vite.config.mjs'],
  ['Excuse Generator', 'vite.config.mjs'],
  ['text-back-8ball', 'vite.config.mjs'],
  ['not-yet-site', 'vite.config.mjs'],
  ['chess-chaos', 'vite.config.mjs'],
  ['typo-speed-typing', 'vite.config.mjs'],
  ['pitch-ipsum', 'vite.config.mjs'],
  ['not-hotdog', 'vite.config.mjs'],
  ['tc-life-ruiner', 'vite.config.mjs'],
  ['vc-rejection-clicker', 'vite.config.mjs'],
];

const outputRoot = resolve('public/projects');
mkdirSync(outputRoot, { recursive: true });

for (const [name, config] of projects) {
  console.log('Building ' + name + '...');
  execFileSync('npx', ['vite', 'build', '--config', resolve('projects', name, config)], { stdio: 'inherit' });

  const outputIndex = resolve(outputRoot, name, 'index.html');
  if (!existsSync(outputIndex)) {
    throw new Error('Missing build output for ' + name + ': ' + outputIndex);
  }

  console.log('Verified ' + outputIndex);
}
