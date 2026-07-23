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
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'no-preference' });
  await page.addInitScript(deterministicDeck);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.locator('[data-action="deal"]').click();
  await cast(page, ['slow', 'ship', 'slow']);
  await page.locator('[data-action="reveal"]').click();

  const flip = page.locator('.id-flip-card');
  await flip.waitFor();
  await flip.evaluate((node) => node.getAnimations()[0]?.pause());

  for (const millisecond of [0, 155, 310, 465, 620]) {
    await flip.evaluate((node, time) => {
      const animation = node.getAnimations()[0];
      if (animation) animation.currentTime = time;
    }, millisecond);
    await page.locator('.id-board-lane.is-curveball').screenshot({ path: `${shots}/curveball-flip-${String(millisecond).padStart(3, '0')}ms.png` });
  }

  console.log('Captured the Curveball flip at 0, 155, 310, 465, and 620 milliseconds.');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
