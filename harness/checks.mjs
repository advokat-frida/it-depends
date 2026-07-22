import { mkdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { startServer } from './server.mjs';

const playwright = await import(pathToFileURL('C:/Users/Ben/Documents/Projects/frida-console/node_modules/playwright/index.mjs'));
const BASE = 'http://localhost:8793';
const shots = fileURLToPath(new URL('../shots/', import.meta.url));
mkdirSync(shots, { recursive: true });

const failures = [];
const check = (name, pass, detail = '') => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!pass) failures.push(name);
};

const deterministicDeck = (seed) => `
  (() => {
    let state = ${seed};
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

const storageState = (page) => page.evaluate(async () => ({
  local: localStorage.length,
  session: sessionStorage.length,
  idb: (await indexedDB.databases()).length,
}));

async function openPage(browser, viewport, seed = 267) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  await page.addInitScript(deterministicDeck(seed));
  const external = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on('request', (request) => {
    if (!request.url().startsWith(BASE)) external.push(request.url());
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  return { page, external, consoleErrors, pageErrors };
}

async function playToReveal(page) {
  await page.locator('[data-action="deal"]').click();
  await page.locator('[data-action="vote"][data-call="slow"]').click();
  await page.locator('[data-action="reveal"]').click();
  await page.locator('.id-card.is-curveball').waitFor();
}

const server = await startServer();
const browser = await playwright.chromium.launch({ headless: true });

try {
  const desktop = await openPage(browser, { width: 1440, height: 1100 });
  const beforeStorage = await storageState(desktop.page);
  await desktop.page.screenshot({ path: `${shots}/welcome-desktop-1440.png`, fullPage: true });

  await desktop.page.locator('[data-action="deal"]').click();
  await desktop.page.locator('img[alt*="pneumatic inbox"]').waitFor();
  await desktop.page.screenshot({ path: `${shots}/request-desktop-1440.png`, fullPage: true });
  await desktop.page.locator('[data-action="vote"][data-call="slow"]').click();
  await desktop.page.locator('[data-action="reveal"]').click();
  await desktop.page.locator('img[alt*="verification badge"]').waitFor();
  await desktop.page.screenshot({ path: `${shots}/reveal-desktop-1440.png`, fullPage: true });
  await desktop.page.locator('[data-action="vote"][data-call="stop"]').click();
  await desktop.page.locator('.id-shift').waitFor();
  await desktop.page.screenshot({ path: `${shots}/debrief-desktop-1440.png`, fullPage: true });

  const loadedImages = await desktop.page.locator('.id-card img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0));
  const desktopOverflow = await desktop.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  const afterStorage = await storageState(desktop.page);
  check('desktop card art loads at runtime', loadedImages);
  check('desktop has no horizontal overflow', desktopOverflow);
  check('desktop makes no external requests', desktop.external.length === 0, desktop.external.join(', '));
  check('desktop has no console errors', desktop.consoleErrors.length === 0, desktop.consoleErrors.join(' | '));
  check('desktop has no page errors', desktop.pageErrors.length === 0, desktop.pageErrors.join(' | '));
  check('runtime writes no storage', JSON.stringify(beforeStorage) === JSON.stringify(afterStorage), JSON.stringify(afterStorage));
  await desktop.page.close();

  const incident = await openPage(browser, { width: 1440, height: 1100 }, 56);
  await incident.page.locator('[data-action="deal"]').click();
  await incident.page.locator('img[alt*="evidence ledger"]').waitFor();
  await incident.page.screenshot({ path: `${shots}/incident-request-desktop-1440.png`, fullPage: true });
  check('incident-ledger art loads in its exact runtime card', await incident.page.locator('img[alt*="evidence ledger"]').isVisible());
  check('incident runtime has no page errors', incident.pageErrors.length === 0, incident.pageErrors.join(' | '));
  await incident.page.close();

  const mobile = await openPage(browser, { width: 390, height: 844 });
  await playToReveal(mobile.page);
  await mobile.page.screenshot({ path: `${shots}/reveal-mobile-390.png`, fullPage: true });
  const mobileOverflow = await mobile.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  const mobileCardPositions = await mobile.page.locator('.id-card').evaluateAll((cards) => cards.map((card) => {
    const box = card.getBoundingClientRect();
    return { x: Math.round(box.x), y: Math.round(box.y) };
  }));
  const mobileStacked = mobileCardPositions.length === 2
    && Math.abs(mobileCardPositions[0].x - mobileCardPositions[1].x) <= 1
    && mobileCardPositions[1].y > mobileCardPositions[0].y;
  check('mobile has no horizontal overflow', mobileOverflow);
  check('mobile reveal stacks to one card column', mobileStacked, JSON.stringify(mobileCardPositions));
  check('mobile makes no external requests', mobile.external.length === 0, mobile.external.join(', '));
  check('mobile has no console errors', mobile.consoleErrors.length === 0, mobile.consoleErrors.join(' | '));
  check('mobile has no page errors', mobile.pageErrors.length === 0, mobile.pageErrors.join(' | '));
  await mobile.page.close();

  const keyboard = await openPage(browser, { width: 1280, height: 900 });
  await keyboard.page.locator('[data-action="deal"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="vote"][data-call="ship"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="reveal"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="vote"][data-call="slow"]').focus();
  await keyboard.page.keyboard.press('Enter');
  check('keyboard completes a full round', await keyboard.page.locator('.id-debrief').isVisible());
  check('keyboard run has no page errors', keyboard.pageErrors.length === 0, keyboard.pageErrors.join(' | '));
  await keyboard.page.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length) {
  console.error(`\n${failures.length} harness check(s) failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log('\nIT DEPENDS runtime harness passed.');
