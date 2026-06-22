/**
 * prebuild script: sync rules/skills from packages/antd into CLI assets
 * so they get bundled with the published package
 */
import { cpSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');

const targets = [
  {
    src: resolve(root, 'packages/antd/rules'),
    dest: resolve(__dirname, '../dist/assets/antd/rules'),
  },
  {
    src: resolve(root, 'packages/antd/skills'),
    dest: resolve(__dirname, '../dist/assets/antd/skills'),
  },
];

for (const { src, dest } of targets) {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`✓ synced ${src.split('/packages/')[1]} → dist/assets`);
}
