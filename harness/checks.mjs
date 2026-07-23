import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startServer } from './server.mjs';

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

async function openPage(browser, viewport, seed = 267, reducedMotion = 'reduce') {
  const page = await browser.newPage({ viewport, reducedMotion });
  await page.addInitScript(deterministicDeck(seed));
  const external = [];
  const consoleErrors = [];
  const pageErrors = [];
  const badResponses = [];
  page.on('request', (request) => {
    if (!request.url().startsWith(BASE)) external.push(request.url());
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  return { page, external, consoleErrors, pageErrors, badResponses };
}

async function castVotes(page, calls) {
  for (const call of calls) {
    await page.locator(`[data-action="vote"][data-call="${call}"]`).click();
  }
}

async function playToReveal(page) {
  await page.locator('[data-action="deal"]').click();
  await castVotes(page, ['slow', 'ship', 'slow']);
  await page.locator('[data-action="reveal"]').click();
  await page.locator('.id-card.is-curveball').waitFor();
}

const server = await startServer();
const browser = await chromium.launch({ headless: true });

try {
  const desktop = await openPage(browser, { width: 1440, height: 1100 });
  const beforeStorage = await storageState(desktop.page);
  await desktop.page.screenshot({ path: `${shots}/welcome-desktop-1440.png`, fullPage: true });
  const welcomeBacks = await desktop.page.locator('.id-welcome-decks .id-card-back').evaluateAll((backs) => backs.map((back) => {
    const art = back.querySelector('[data-card-back-art]');
    const title = back.querySelector('strong');
    const titleStyle = title ? getComputedStyle(title) : null;
    return {
      kind: back.getAttribute('data-card-back'),
      artKind: art?.getAttribute('data-card-back-art'),
      src: art?.getAttribute('src'),
      complete: art?.complete,
      naturalWidth: art?.naturalWidth,
      naturalHeight: art?.naturalHeight,
      titleText: title?.textContent,
      titleFontSize: titleStyle?.fontSize,
      titleWhiteSpace: titleStyle?.whiteSpace,
      titleFits: Boolean(title && title.scrollWidth <= title.clientWidth),
    };
  }));
  check(
    'welcome loads both illustrated card backs at source resolution',
    welcomeBacks.length === 2
      && welcomeBacks[0].kind === 'scenario'
      && welcomeBacks[0].artKind === 'scenario'
      && welcomeBacks[0].src?.endsWith('/scenario-card-back.png')
      && welcomeBacks[1].kind === 'curveball'
      && welcomeBacks[1].artKind === 'curveball'
      && welcomeBacks[1].src?.endsWith('/curveball-card-back.png')
      && welcomeBacks.every((back) => back.complete && back.naturalWidth === 948 && back.naturalHeight === 1659),
    JSON.stringify(welcomeBacks),
  );
  check(
    'welcome card-back titles use matching compact type and the intended labels',
    welcomeBacks[0].titleText === 'Scenario'
      && welcomeBacks[1].titleText === 'IT DEPENDS'
      && welcomeBacks.every((back) => (
        back.titleFontSize === '8px'
        && back.titleWhiteSpace === 'nowrap'
        && back.titleFits
      )),
    JSON.stringify(welcomeBacks),
  );

  await desktop.page.locator('[data-action="deal"]').click();
  await desktop.page.locator('img[alt*="pneumatic inbox"]').waitFor();
  await desktop.page.screenshot({ path: `${shots}/request-desktop-1440.png`, fullPage: true });
  const hiddenBoard = await desktop.page.evaluate(() => {
    const scenario = document.querySelector('.id-board-lane.is-scenario .id-card')?.getBoundingClientRect();
    const deck = document.querySelector('.id-board-lane.is-curveball .id-card-back')?.getBoundingClientRect();
    const rail = document.querySelector('.id-board-lane.is-decision .id-decision-rail')?.getBoundingClientRect();
    const backArt = document.querySelector('.id-board-lane.is-curveball [data-card-back-art="curveball"]');
    const backTitle = document.querySelector('.id-board-lane.is-curveball .id-card-back strong');
    const stack = document.querySelector('.id-card-slot.is-curveball.is-stacked');
    return {
      oneFaceUpCard: document.querySelectorAll('.id-pair .id-card').length === 1,
      curveballIsStacked: Boolean(document.querySelector('.id-card-slot.is-curveball.is-stacked .id-card-back')),
      aligned: Boolean(scenario && deck && rail && Math.abs(scenario.top - deck.top) <= 1 && Math.abs(deck.top - rail.top) <= 1),
      equalCardFootprints: Boolean(scenario && deck && Math.abs(scenario.width - deck.width) <= 1 && Math.abs(scenario.height - deck.height) <= 1),
      backArtLoaded: Boolean(backArt?.complete && backArt.naturalWidth === 948 && backArt.naturalHeight === 1659),
      backTitleFontSize: backTitle ? getComputedStyle(backTitle).fontSize : '',
      backTitleFits: Boolean(backTitle && backTitle.scrollWidth <= backTitle.clientWidth),
      stackBefore: stack ? getComputedStyle(stack, '::before').backgroundImage : '',
      stackAfter: stack ? getComputedStyle(stack, '::after').backgroundImage : '',
    };
  });
  check(
    'request board shows one Scenario face and the illustrated IT DEPENDS stack',
    hiddenBoard.oneFaceUpCard
      && hiddenBoard.curveballIsStacked
      && hiddenBoard.backArtLoaded
      && hiddenBoard.stackBefore.includes('curveball-card-back.png')
      && hiddenBoard.stackAfter.includes('curveball-card-back.png'),
    JSON.stringify(hiddenBoard),
  );
  check('Scenario, IT DEPENDS deck, and decision rail share one desktop row', hiddenBoard.aligned, JSON.stringify(hiddenBoard));
  check('face-down deck uses the same card footprint', hiddenBoard.equalCardFootprints, JSON.stringify(hiddenBoard));
  check(
    'table IT DEPENDS lockup stays subordinate to the back illustration',
    hiddenBoard.backTitleFontSize === '22px' && hiddenBoard.backTitleFits,
    JSON.stringify(hiddenBoard),
  );
  await castVotes(desktop.page, ['slow', 'ship', 'slow']);
  check('first tally reveals every numbered choice', await desktop.page.locator('.id-selections li').count() === 3);
  check('first tally reports the strict majority', (await desktop.page.locator('.id-reveal-rail .id-result h4').textContent()) === 'The majority chose Slow.');
  check('Missing Detail stays face-down through the first-vote discussion', await desktop.page.locator('.id-reveal-rail').isVisible() && await desktop.page.locator('.id-card-slot.is-curveball .id-card-back').isVisible());
  await desktop.page.screenshot({ path: `${shots}/first-vote-desktop-1440.png`, fullPage: true });
  await desktop.page.locator('[data-action="reveal"]').click();
  const revealedDetailArt = desktop.page.locator('.id-card.is-curveball .id-art img');
  await revealedDetailArt.waitFor();
  await desktop.page.waitForFunction(() => {
    const image = document.querySelector('.id-card.is-curveball .id-art img');
    return image?.complete && image.naturalWidth > 0;
  });
  check(
    'reveal loads a dedicated Missing Detail illustration',
    await revealedDetailArt.evaluate((image) => (
      image.complete
      && image.naturalWidth === 1448
      && image.naturalHeight === 1086
      && image.getAttribute('src')?.includes('/detail-')
    )),
  );
  check('reveal uses the in-place card-flip structure', await desktop.page.locator('.id-card-slot.is-curveball.is-revealing .id-flip-card').count() === 1);
  check(
    'flip begins with the illustrated IT DEPENDS back wired to its rear face',
    await desktop.page.locator('.id-flip-face.is-back [data-card-back-art="curveball"]').evaluate((image) => (
      image.complete
      && image.naturalWidth === 948
      && image.naturalHeight === 1659
      && image.getAttribute('src')?.endsWith('/curveball-card-back.png')
    )),
  );
  await desktop.page.screenshot({ path: `${shots}/reveal-desktop-1440.png`, fullPage: true });
  const railLayout = await desktop.page.evaluate(() => {
    const pair = document.querySelector('.id-play-grid .id-pair')?.getBoundingClientRect();
    const rail = document.querySelector('.id-decision-rail')?.getBoundingClientRect();
    const cards = [...document.querySelectorAll('.id-play-grid .id-card')].map((card) => card.getBoundingClientRect());
    const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    const railBackground = document.querySelector('.id-decision-rail') ? getComputedStyle(document.querySelector('.id-decision-rail')).backgroundColor : '';
    document.querySelector('.id-table')?.scrollIntoView({ block: 'start' });
    const visibleRail = document.querySelector('.id-decision-rail')?.getBoundingClientRect();
    const visibleCards = [...document.querySelectorAll('.id-play-grid .id-card')].map((card) => card.getBoundingClientRect());
    return {
      sideBySide: Boolean(pair && rail && cards.length === 2 && rail.left > pair.right && Math.abs(rail.top - cards[0].top) <= 1),
      matchedHeight: Boolean(rail && cards.length === 2 && cards.every((card) => Math.abs(card.height - rail.height) <= 1)),
      allVisible: Boolean(visibleRail && visibleCards.length === 2 && Math.max(visibleRail.bottom, ...visibleCards.map((card) => card.bottom)) <= window.innerHeight),
      cream: railBackground === 'rgb(255, 253, 248)',
      paper,
      railBackground,
    };
  });
  await castVotes(desktop.page, ['stop', 'stop', 'slow']);
  await desktop.page.locator('.id-shift').waitFor();
  await desktop.page.screenshot({ path: `${shots}/debrief-desktop-1440.png`, fullPage: true });

  const loadedImages = await desktop.page.locator('.id-card img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0));
  const equalCardHeights = await desktop.page.locator('.id-card').evaluateAll((cards) => cards.length === 2 && cards[0].getBoundingClientRect().height === cards[1].getBoundingClientRect().height);
  const chipsBottomRight = await desktop.page.locator('.id-card').evaluateAll((cards) => cards.every((card) => {
    const tags = card.querySelector('.id-tags');
    const body = card.querySelector('.id-card-body');
    const lastChip = tags?.lastElementChild;
    if (!tags || !body || !lastChip) return false;
    const chipBox = lastChip.getBoundingClientRect();
    const bodyBox = body.getBoundingClientRect();
    const style = getComputedStyle(body);
    const contentRight = bodyBox.right - Number.parseFloat(style.paddingRight);
    const contentBottom = bodyBox.bottom - Number.parseFloat(style.paddingBottom);
    return Math.abs(chipBox.right - contentRight) <= 1 && Math.abs(chipBox.bottom - contentBottom) <= 1;
  }));
  const desktopOverflow = await desktop.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  const afterStorage = await storageState(desktop.page);
  check('desktop card art loads at runtime', loadedImages);
  check('Scenario and Missing Detail cards are the same height', equalCardHeights);
  check('decision rail sits beside both desktop cards', railLayout.sideBySide, JSON.stringify(railLayout));
  check('decision rail matches the compact card height', railLayout.matchedHeight, JSON.stringify(railLayout));
  check('cards and decision rail fit in one desktop viewport', railLayout.allVisible, JSON.stringify(railLayout));
  check('decision rail uses the standard cream surface', railLayout.cream, JSON.stringify(railLayout));
  check('both chip rows sit at bottom right', chipsBottomRight);
  check('desktop has no horizontal overflow', desktopOverflow);
  check('desktop makes no external requests', desktop.external.length === 0, desktop.external.join(', '));
  check('desktop has no missing assets or bad responses', desktop.badResponses.length === 0, desktop.badResponses.join(' | '));
  check('desktop has no console errors', desktop.consoleErrors.length === 0, desktop.consoleErrors.join(' | '));
  check('desktop has no page errors', desktop.pageErrors.length === 0, desktop.pageErrors.join(' | '));
  check('runtime writes no storage', JSON.stringify(beforeStorage) === JSON.stringify(afterStorage), JSON.stringify(afterStorage));
  await desktop.page.close();

  const incident = await openPage(browser, { width: 1440, height: 1100 }, 56);
  await incident.page.locator('[data-action="deal"]').click();
  await incident.page.locator('img[alt*="evidence ledger"]').waitFor();
  await incident.page.screenshot({ path: `${shots}/incident-request-desktop-1440.png`, fullPage: true });
  check('incident-ledger art loads in its exact runtime card', await incident.page.locator('img[alt*="evidence ledger"]').isVisible());
  check('incident runtime has no missing assets', incident.badResponses.length === 0, incident.badResponses.join(' | '));
  check('incident runtime has no page errors', incident.pageErrors.length === 0, incident.pageErrors.join(' | '));
  await incident.page.close();

  const fullTable = await openPage(browser, { width: 1440, height: 1100 }, 267);
  for (let index = 0; index < 5; index += 1) await fullTable.page.locator('[data-action="players-plus"]').click();
  await fullTable.page.locator('[data-action="deal"]').click();
  await castVotes(fullTable.page, ['slow', 'ship', 'stop', 'slow', 'ship', 'slow', 'stop', 'ship']);
  const eightPlayerResult = await fullTable.page.locator('.id-reveal-rail').evaluate((rail) => ({
    allSelections: rail.querySelectorAll('.id-selections li').length === 8,
    noInternalScroll: rail.scrollHeight <= rail.clientHeight,
  }));
  await fullTable.page.screenshot({ path: `${shots}/first-vote-8-player-desktop-1440.png`, fullPage: true });
  check('eight-player first-vote result fits the cream rail without scrolling', eightPlayerResult.allSelections && eightPlayerResult.noInternalScroll, JSON.stringify(eightPlayerResult));
  await fullTable.page.locator('[data-action="reveal"]').click();
  const eightPlayerSecondVote = await fullTable.page.locator('.id-decision-rail').evaluate((rail) => ({
    seats: rail.querySelectorAll('.id-seat-track li').length,
    noInternalScroll: rail.scrollHeight <= rail.clientHeight,
  }));
  check('eight-player second-vote controls fit the cream rail without scrolling', eightPlayerSecondVote.seats === 8 && eightPlayerSecondVote.noInternalScroll, JSON.stringify(eightPlayerSecondVote));
  check('eight-player run has no page errors', fullTable.pageErrors.length === 0, fullTable.pageErrors.join(' | '));
  await fullTable.page.close();

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
  check('mobile has no missing assets', mobile.badResponses.length === 0, mobile.badResponses.join(' | '));
  check('mobile has no console errors', mobile.consoleErrors.length === 0, mobile.consoleErrors.join(' | '));
  check('mobile has no page errors', mobile.pageErrors.length === 0, mobile.pageErrors.join(' | '));
  await mobile.page.close();

  const motion = await openPage(browser, { width: 1440, height: 1100 }, 267, 'no-preference');
  await motion.page.locator('[data-action="deal"]').click();
  await castVotes(motion.page, ['slow', 'ship', 'slow']);
  await motion.page.locator('[data-action="reveal"]').click();
  const flipAnimation = await motion.page.locator('.id-flip-card').evaluate((node) => {
    const animation = node.getAnimations()[0];
    return {
      name: getComputedStyle(node).animationName,
      duration: animation?.effect.getTiming().duration,
      playState: animation?.playState,
    };
  });
  check('Missing Detail uses a finite in-place flip when motion is allowed', flipAnimation.name === 'flip-curveball' && flipAnimation.duration === 620, JSON.stringify(flipAnimation));
  check('motion run has no page errors', motion.pageErrors.length === 0, motion.pageErrors.join(' | '));
  await motion.page.close();

  const keyboard = await openPage(browser, { width: 1280, height: 900 });
  await keyboard.page.locator('[data-action="deal"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="vote"][data-call="ship"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="vote"][data-call="slow"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="vote"][data-call="ship"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="reveal"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="vote"][data-call="slow"]').focus();
  await keyboard.page.keyboard.press('Enter');
  await keyboard.page.locator('[data-action="vote"][data-call="stop"]').focus();
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
