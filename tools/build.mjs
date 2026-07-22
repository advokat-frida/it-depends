import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'public', 'demo');
const sitesDist = join(root, 'dist');

await rm(sitesDist, { recursive: true, force: true });
await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'assets'), { recursive: true });

for (const file of ['index.html', 'shared.css', 'styles.css', 'app.js', 'core.js', 'cards.js']) {
  await cp(join(root, 'src', file), join(dist, file));
}

await cp(join(root, 'assets'), join(dist, 'assets'), { recursive: true });

console.log('Built public/demo/ as a multi-file static app.');
