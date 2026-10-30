// Copies the built IIFE web components into a host app's static folder.
// Usage: node scripts/publish-webcomponents.mjs [targetDir]
// Default target is the Pratham 2.0 workspace MFE, served at /mfe_workspace/webcomponents/.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(
  process.argv[2] ??
    process.env.WEBCOMPONENTS_TARGET ??
    resolve(root, '../Parth-Product-Roadmap/pratham2.0/mfes/workspace/public/webcomponents')
);

const bundles = [
  'packages/editor-webcomponent/dist/editor-wrapper.iife.js',
  'packages/shell-manage/dist/shell-manage.iife.js',
];

mkdirSync(target, { recursive: true });
for (const rel of bundles) {
  const src = resolve(root, rel);
  if (!existsSync(src)) {
    console.error(`Missing ${rel} — run "npm run build:all" first.`);
    process.exit(1);
  }
  const dest = resolve(target, rel.split('/').pop());
  copyFileSync(src, dest);
  console.log(`${rel} -> ${dest}`);
}
