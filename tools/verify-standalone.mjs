import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist', 'standalone', 'IT-DEPENDS');
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const archive = join(root, 'release', `IT-DEPENDS-v${packageJson.version}-standalone.zip`);
const manifest = JSON.parse(await readFile(join(output, 'release-manifest.json'), 'utf8'));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

const html = await readFile(join(output, 'index.html'), 'utf8');
const app = await readFile(join(output, 'app.js'), 'utf8');
check(html.includes('<script defer src="./app.js"></script>'), 'index.html must load the bundled classic script');
check(!html.includes('type="module"'), 'standalone HTML must not require file-scheme module loading');
check(!/^\s*import\s/m.test(app), 'bundled app.js must not contain runtime imports');
check(!/from\s+['"]\.\/(?:cards|core)\.js['"]/.test(app), 'bundled app.js must contain the card engine');
check(html.includes("connect-src 'none'"), 'standalone HTML must retain the no-network CSP');

const expectedPaths = new Set(manifest.files.map((file) => file.path));
const actualPaths = new Set((await listFiles(output))
  .map((file) => relative(output, file).replaceAll('\\', '/'))
  .filter((path) => path !== 'release-manifest.json'));
check(expectedPaths.size === actualPaths.size, 'manifest and standalone folder must contain the same file count');
for (const path of expectedPaths) check(actualPaths.has(path), `manifest file missing from output: ${path}`);

for (const entry of manifest.files) {
  const file = join(output, ...entry.path.split('/'));
  const bytes = await readFile(file);
  const hash = createHash('sha256').update(bytes).digest('hex');
  check(bytes.byteLength === entry.bytes, `byte count mismatch: ${entry.path}`);
  check(hash === entry.sha256, `SHA-256 mismatch: ${entry.path}`);
}

for (const back of ['scenario-card-back.png', 'curveball-card-back.png']) {
  const sourceHash = createHash('sha256').update(await readFile(join(root, 'assets', 'art', back))).digest('hex');
  const outputHash = createHash('sha256').update(await readFile(join(output, 'assets', 'art', back))).digest('hex');
  check(sourceHash === outputHash, `standalone back art must be byte-exact: ${back}`);
}

const archiveStat = await stat(archive);
check(archiveStat.size > 0, 'standalone ZIP must not be empty');
const unzipped = unzipSync(new Uint8Array(await readFile(archive)));
const zipPaths = Object.keys(unzipped).sort();
check(zipPaths.includes('IT-DEPENDS/index.html'), 'ZIP must contain IT-DEPENDS/index.html');
check(zipPaths.includes('IT-DEPENDS/assets/art/scenario-card-back.png'), 'ZIP must contain the Scenario back');
check(zipPaths.includes('IT-DEPENDS/assets/art/curveball-card-back.png'), 'ZIP must contain the Curveball back');
check(zipPaths.length === actualPaths.size + 1, 'ZIP and standalone folder must contain the same files');

if (failures.length) {
  throw new Error(`Standalone verification failed:\n- ${failures.join('\n- ')}`);
}

console.log(`Standalone verification passed: ${zipPaths.length} files, ${archiveStat.size} ZIP bytes.`);
