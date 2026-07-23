import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'dist', 'standalone', 'IT-DEPENDS');
const release = join(root, 'release');
const archive = join(release, 'IT-DEPENDS-private-alpha-standalone.zip');
const fixedTimestamp = new Date(1980, 0, 1, 0, 0, 0);
const alreadyCompressed = new Set(['.png', '.woff2']);

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

const zippable = {};
for (const file of await listFiles(source)) {
  const path = `IT-DEPENDS/${relative(source, file).replaceAll('\\', '/')}`;
  zippable[path] = [
    new Uint8Array(await readFile(file)),
    {
      level: alreadyCompressed.has(extname(file).toLowerCase()) ? 0 : 9,
      mtime: fixedTimestamp,
    },
  ];
}

await mkdir(release, { recursive: true });
await writeFile(archive, zipSync(zippable, { level: 6, mtime: fixedTimestamp }));
console.log(archive);
