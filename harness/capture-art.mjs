import { mkdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { startServer } from './server.mjs';

const playwright = await import(pathToFileURL('C:/Users/Ben/Documents/Projects/frida-console/node_modules/playwright/index.mjs'));
const BASE = 'http://localhost:8793';
const shots = fileURLToPath(new URL('../shots/', import.meta.url));
mkdirSync(shots, { recursive: true });

const deterministicDeck = `
  (() => {
    let state = 267;
    const next = () => {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state;
    };
    Object.defineProperty(globalThis.crypto, 'getRandomValues', {
      configurable: true,
      value(array) {
        for (let index = 0; index < array.length; index += 1) array[index] = next();
        return array;
      },
    });
  })();`;

async function cast(page, calls) {
  for (const call of calls) {
    await page.locator(`[data-action="vote"][data-call="${call}"]`).click();
  }
}

const server = await startServer();
const browser = await playwright.chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', bypassCSP: true });
  await page.addInitScript(deterministicDeck);
  await page.goto(BASE, { waitUntil: 'networkidle' });

  const cards = [];
  for (let round = 0; round < 6; round += 1) {
    await page.locator('[data-action="deal"]').click();
    await cast(page, ['ship', 'slow', 'ship']);
    await page.locator('[data-action="reveal"]').click();
    cards.push(...await page.locator('.id-card').evaluateAll((nodes) => nodes.map((node) => node.outerHTML)));
    await cast(page, ['slow', 'slow', 'stop']);
    await page.locator('[data-action="next"]').click();
  }

  const artKeys = cards.map((markup) => markup.match(/assets\/art\/([^".]+)\.png/)?.[1]).filter(Boolean);
  if (cards.length !== 12 || new Set(artKeys).size !== 12) {
    throw new Error(`Expected 12 unique runtime cards; found ${cards.length} cards and ${new Set(artKeys).size} art files.`);
  }

  await page.evaluate((cardMarkup) => {
    document.body.innerHTML = `
      <main class="qa-card-sheet">
        <header><p>IT DEPENDS visual QA</p><h1>All twelve runtime cards</h1></header>
        <div class="qa-card-grid">${cardMarkup.join('')}</div>
      </main>`;
    const style = document.createElement('style');
    style.textContent = `
      body{background:#e9e5dc;margin:0;padding:36px}
      .qa-card-sheet{width:1128px;margin:0 auto}
      .qa-card-sheet header{color:#171b19;margin:0 0 26px}
      .qa-card-sheet header p{font:700 12px/1 Archivo,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#2d7540;margin:0 0 8px}
      .qa-card-sheet header h1{font:400 42px/1 Anton,sans-serif;text-transform:uppercase;margin:0}
      .qa-card-grid{display:grid;grid-template-columns:repeat(3,360px);gap:24px}
      .qa-card-grid .id-card{box-shadow:0 10px 24px rgba(0,0,0,.18)}
    `;
    document.head.append(style);
  }, cards);

  await page.screenshot({ path: `${shots}/all-card-art-desktop.png`, fullPage: true });
  console.log(`Captured 12 unique card artworks at their 360 x 650 CSS-pixel runtime size: ${artKeys.join(', ')}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
