import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'src');
const output = join(root, 'dist', 'standalone', 'IT-DEPENDS');
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

function sourceRevision() {
  const githubRevision = process.env.GITHUB_SHA?.trim();
  if (/^[0-9a-f]{40}$/i.test(githubRevision ?? '')) {
    return githubRevision.slice(0, 12);
  }

  try {
    const commit = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain=v1'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return `${commit}${dirty ? '+working-tree' : ''}`;
  } catch {
    return 'source-revision-unavailable';
  }
}

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

await rm(join(root, 'dist', 'standalone'), { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of ['shared.css', 'styles.css']) {
  await cp(join(source, file), join(output, file));
}
await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });

const sourceHtml = await readFile(join(source, 'index.html'), 'utf8');
const standaloneHtml = sourceHtml.replace(
  '<script type="module" src="./app.js"></script>',
  '<script defer src="./app.js"></script>',
);
if (standaloneHtml === sourceHtml) {
  throw new Error('Standalone build could not replace the module script tag.');
}
await writeFile(join(output, 'index.html'), standaloneHtml);
await writeFile(join(output, '.nojekyll'), '');

await build({
  entryPoints: [join(source, 'app.js')],
  outfile: join(output, 'app.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome109', 'edge109', 'firefox115', 'safari16'],
  minify: false,
  sourcemap: false,
  legalComments: 'none',
  charset: 'utf8',
  banner: {
    js: '/* IT DEPENDS standalone browser bundle. Source modules remain in the repository. */',
  },
});

await writeFile(join(output, 'README.txt'), `IT DEPENDS — v${packageJson.version} standalone public alpha

Open index.html in a current desktop browser. No installation, account, server, or internet connection is required to play.

The game includes the complete shared-screen flow: deal a Scenario, collect private numbered choices, reveal the majority, turn over the Missing Detail, vote again, and debrief.

Refreshing or closing the page resets the current session. Links back to advokatfrida.com require an internet connection; the game itself does not.

This public alpha is for evaluation and playtesting. Source visibility and access do not grant redistribution rights. No license is granted unless Advokat Frida states one separately.
`);

const distributableFiles = (await listFiles(output))
  .filter((file) => file !== join(output, 'release-manifest.json'));
const manifest = {
  product: 'IT DEPENDS',
  edition: 'public-alpha-standalone',
  version: packageJson.version,
  sourceRevision: sourceRevision(),
  runtime: {
    serverRequired: false,
    internetRequired: false,
    accounts: false,
    storageWrites: false,
    externalRequests: false,
  },
  files: await Promise.all(distributableFiles.map(async (file) => ({
    path: relative(output, file).replaceAll('\\', '/'),
    bytes: (await readFile(file)).byteLength,
    sha256: await sha256(file),
  }))),
};
await writeFile(join(output, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const totalBytes = manifest.files.reduce((sum, file) => sum + file.bytes, 0);
console.log(`Built standalone IT DEPENDS: ${manifest.files.length + 1} files, ${totalBytes} bytes.`);
console.log(output);
