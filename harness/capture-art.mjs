import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startServer } from './server.mjs';

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

async function collectRound(page, cardsByArtKey, overflowFailures) {
  await page.locator('[data-action="deal"]').click();
  await cast(page, ['ship', 'slow', 'ship']);
  await page.locator('[data-action="reveal"]').click();

  overflowFailures.push(...await page.locator('.id-card').evaluateAll((nodes) => nodes.filter((node) => {
    const body = node.querySelector('.id-card-body');
    return node.scrollHeight > node.clientHeight || (body && body.scrollHeight > body.clientHeight);
  }).map((node) => node.getAttribute('aria-label'))));

  const faces = await page.locator('.id-card').evaluateAll((nodes) => nodes.map((node) => ({
    markup: node.outerHTML,
    artKey: node.querySelector('.id-art img')?.getAttribute('src')?.match(/assets\/art\/([^".]+)\.png/)?.[1],
    kind: node.classList.contains('is-curveball') ? 'detail' : 'scenario',
  })));
  for (const face of faces) {
    if (face.artKey) cardsByArtKey.set(face.artKey, face);
  }

  await cast(page, ['slow', 'slow', 'stop']);
  await page.locator('[data-action="next"]').click();
}

async function renderSheet(page, title, cards, path) {
  await page.evaluate(({ heading, cardMarkup }) => {
    document.body.innerHTML = `
      <main class="qa-card-sheet">
        <header><p>IT DEPENDS visual QA</p><h1>${heading}</h1></header>
        <div class="qa-card-grid">${cardMarkup.join('')}</div>
      </main>`;
    const style = document.createElement('style');
    style.textContent = `
      body{background:#e9e5dc;margin:0;padding:36px}
      .qa-card-sheet{width:972px;margin:0 auto}
      .qa-card-sheet header{color:#171b19;margin:0 0 26px}
      .qa-card-sheet header p{font:700 12px/1 Archivo,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#2d7540;margin:0 0 8px}
      .qa-card-sheet header h1{font:400 42px/1 Anton,sans-serif;text-transform:uppercase;margin:0}
      .qa-card-grid{display:grid;grid-template-columns:repeat(3,308px);gap:24px}
      .qa-card-grid .id-card{box-shadow:0 10px 24px rgba(0,0,0,.18)}
    `;
    document.head.append(style);
  }, { heading: title, cardMarkup: cards.map(({ markup }) => markup) });
  await page.waitForFunction(() => [...document.querySelectorAll('.id-art img')]
    .every((image) => image.complete && image.naturalWidth > 0));
  await page.screenshot({ path, fullPage: true });
}

const server = await startServer();
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', bypassCSP: true });
  await page.addInitScript(deterministicDeck);
  await page.goto(BASE, { waitUntil: 'networkidle' });

  const cardsByArtKey = new Map();
  const overflowFailures = [];
  for (let session = 0; session < 12 && cardsByArtKey.size < 24; session += 1) {
    for (let round = 0; round < 6; round += 1) {
      await collectRound(page, cardsByArtKey, overflowFailures);
    }
    if (cardsByArtKey.size < 24) await page.locator('[data-action="restart"]').click();
  }

  if (cardsByArtKey.size !== 24) {
    throw new Error(`Expected 24 unique Core faces; found ${cardsByArtKey.size}.`);
  }
  if (overflowFailures.length) {
    throw new Error(`Compact card content overflowed: ${overflowFailures.join(', ')}`);
  }

  const faces = [...cardsByArtKey.values()];
  const scenarios = faces.filter(({ kind }) => kind === 'scenario').sort((a, b) => a.artKey.localeCompare(b.artKey));
  const details = faces.filter(({ kind }) => kind === 'detail').sort((a, b) => a.artKey.localeCompare(b.artKey));
  if (scenarios.length !== 12 || details.length !== 12) {
    throw new Error(`Expected 12 Scenarios and 12 Missing Details; found ${scenarios.length} and ${details.length}.`);
  }

  await renderSheet(page, 'All twelve Scenario faces', scenarios, `${shots}/all-scenario-art-desktop.png`);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await renderSheet(page, 'All twelve Missing Detail faces', details, `${shots}/all-detail-art-desktop.png`);
  console.log(`Captured 24 unique Core faces at their 308 x 540 CSS-pixel runtime size.`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
