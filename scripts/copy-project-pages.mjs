import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('public/projects');
const target = resolve('out/projects');

if (!existsSync(source)) {
  throw new Error('Missing source directory: ' + source);
}

mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

const nojekyllSource = resolve('public/.nojekyll');
const nojekyllTarget = resolve('out/.nojekyll');
if (existsSync(nojekyllSource)) {
  cpSync(nojekyllSource, nojekyllTarget);
}

console.log('Copied project pages into out/');
