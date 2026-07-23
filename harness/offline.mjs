import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const pagePath = fileURLToPath(new URL('../dist/standalone/IT-DEPENDS/index.html', import.meta.url));
const pageUrl = pathToFileURL(pagePath).href;
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

const failures = [];
const check = (name, pass, detail = '') => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` - ${detail}` : ''}`);
  if (!pass) failures.push(name);
};

async function castVotes(page, calls) {
  for (const call of calls) {
    await page.locator(`[data-action="vote"][data-call="${call}"]`).click();
  }
}

async function inspectBacks(page) {
  return page.locator('[data-card-back-art]').evaluateAll((images) => images.map((image) => ({
    kind: image.getAttribute('data-card-back-art'),
    src: image.getAttribute('src'),
    complete: image.complete,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
  })));
}

async function waitForVisualSettle(page) {
  await page.locator('.id-card').evaluateAll(async (cards) => {
    const animations = cards.flatMap((card) => card.getAnimations());
    await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
  });
}

const browser = await chromium.launch({ headless: true });

try {
  for (const target of [
    {
      label: 'desktop',
      width: 1440,
      height: 1100,
      screenshot: 'standalone-file-desktop-1440.png',
      debriefScreenshot: 'standalone-file-debrief-desktop-1440.png',
    },
    {
      label: 'mobile',
      width: 390,
      height: 844,
      screenshot: 'standalone-file-mobile-390.png',
      debriefScreenshot: 'standalone-file-debrief-mobile-390.png',
    },
  ]) {
    const page = await browser.newPage({
      viewport: { width: target.width, height: target.height },
      reducedMotion: 'no-preference',
    });
    await page.addInitScript(deterministicDeck);

    const requests = [];
    const consoleErrors = [];
    const pageErrors = [];
    page.on('request', (request) => requests.push(request.url()));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(pageUrl, { waitUntil: 'load' });
    await page.locator('.id-welcome').waitFor();

    const welcomeBacks = await inspectBacks(page);
    check(
      `${target.label} file launch loads both deck-back illustrations`,
      welcomeBacks.length === 2
        && welcomeBacks.some((back) => back.kind === 'scenario' && back.src?.endsWith('/scenario-card-back.png'))
        && welcomeBacks.some((back) => back.kind === 'curveball' && back.src?.endsWith('/curveball-card-back.png'))
        && welcomeBacks.every((back) => back.complete && back.naturalWidth === 948 && back.naturalHeight === 1659),
      JSON.stringify(welcomeBacks),
    );

    await page.locator('[data-action="deal"]').click();
    const hiddenBack = page.locator('.id-board-lane.is-curveball [data-card-back-art="curveball"]');
    await hiddenBack.waitFor();
    await waitForVisualSettle(page);
    check(
      `${target.label} file round deals the illustrated Curveball back`,
      await hiddenBack.evaluate((image) => (
        image.complete
        && image.naturalWidth === 948
        && image.naturalHeight === 1659
        && image.getAttribute('src')?.endsWith('/curveball-card-back.png')
      )),
    );
    await page.screenshot({ path: `${shots}/${target.screenshot}`, fullPage: true });

    await castVotes(page, ['slow', 'ship', 'slow']);
    await page.locator('[data-action="reveal"]').click();
    const flipBack = page.locator('.id-flip-face.is-back [data-card-back-art="curveball"]');
    await flipBack.waitFor();
    check(
      `${target.label} file reveal flips from the illustrated back`,
      await flipBack.evaluate((image) => image.complete && image.naturalWidth === 948 && image.naturalHeight === 1659),
    );
    await page.locator('.id-flip-card').evaluate((node) => {
      const animation = node.getAnimations()[0];
      if (animation) animation.finish();
    });
    await castVotes(page, ['stop', 'stop', 'slow']);
    await page.locator('.id-debrief').waitFor();
    await waitForVisualSettle(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    check(`${target.label} file round completes through debrief`, await page.locator('.id-debrief').isVisible());
    check(`${target.label} file runtime has no horizontal overflow`, !overflow);
    check(`${target.label} file runtime has no console errors`, consoleErrors.length === 0, consoleErrors.join(' | '));
    check(`${target.label} file runtime has no page errors`, pageErrors.length === 0, pageErrors.join(' | '));
    check(
      `${target.label} file runtime makes only local file requests`,
      requests.length > 0 && requests.every((url) => url.startsWith('file:///')),
      requests.filter((url) => !url.startsWith('file:///')).join(' | '),
    );

    await page.screenshot({ path: `${shots}/${target.debriefScreenshot}`, fullPage: true });
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  throw new Error(`Offline verification failed:\n- ${failures.join('\n- ')}`);
}

console.log('\nIT DEPENDS opened and completed a round directly from index.html.');
