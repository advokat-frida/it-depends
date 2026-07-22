import { CARDS, cardById } from './cards.js';
import {
  CALLS,
  PHASES,
  createSession,
  dealRound,
  nextRound,
  revealCurveball,
  submitCall,
  summarizeShift,
} from './core.js';

const ICONS = {
  ship: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.87 12.87 0 0 1 22 2c0 2.72-.78 7.5-6.05 11A22.35 22.35 0 0 1 12 15z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  slow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M10 15V9"/><path d="M14 15V9"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M8 12h8"/></svg>',
};

const CALL_LABELS = {
  [CALLS.SHIP]: 'Ship',
  [CALLS.SLOW]: 'Slow',
  [CALLS.STOP]: 'Stop',
};

const stage = document.querySelector('#stage');
const live = document.querySelector('#live');
const roundCount = document.querySelector('#round-count');
const phaseItems = [...document.querySelectorAll('#phase-rail li')];

function cryptoRandom() {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] / 4294967296;
}

let state = createSession(CARDS, cryptoRandom);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function callPill(call) {
  return `<span class="call-pill ${call}"><span class="ic" aria-hidden="true">${ICONS[call]}</span>${CALL_LABELS[call]}</span>`;
}

function voteButtons(prompt, selected = null) {
  return `
    <section class="id-action-panel" aria-labelledby="vote-title">
      <h3 id="vote-title">${escapeHtml(prompt)}</h3>
      <p>Choose the room&rsquo;s call, then ask at least two people to explain it.</p>
      <div class="id-votes" role="group" aria-label="Choose the room's call">
        ${Object.values(CALLS).map((call) => `
          <button class="id-vote ${call}" type="button" data-action="vote" data-call="${call}" aria-pressed="${selected === call}">
            <span class="ic" aria-hidden="true">${ICONS[call]}</span>${CALL_LABELS[call]}
          </button>`).join('')}
      </div>
    </section>`;
}

function artMarkup(card) {
  if (card.artStatus === 'ready') {
    return `<img src="./assets/art/${escapeHtml(card.artKey)}.png" alt="${escapeHtml(card.artAlt)}">`;
  }
  const cardNumber = String(CARDS.indexOf(card) + 1).padStart(2, '0');
  return `<div class="id-art-mat" role="img" aria-label="Art brief pending: ${escapeHtml(card.artAlt)}"><span class="id-art-number">${cardNumber}</span><span class="id-art-status">After Dark art brief</span></div>`;
}

function cardMarkup(card, face) {
  const isRequest = face === 'request';
  const copy = isRequest ? card.request : card.curveball;
  const eyebrow = isRequest ? 'Request' : 'Curveball';
  const meta = isRequest ? card.id : card.curveballAxis;
  return `
    <article class="id-card ${isRequest ? '' : 'is-curveball'}" aria-label="${eyebrow}: ${escapeHtml(card.title)}">
      <div class="id-card-top"><span>${eyebrow}</span><span>${escapeHtml(meta)}</span></div>
      <div class="id-art">${artMarkup(card)}</div>
      <div class="id-card-body">
        <h3>${escapeHtml(card.title)}</h3>
        <p class="id-card-copy">${escapeHtml(copy)}</p>
        ${isRequest ? `<p class="id-card-action"><strong>Your call:</strong> ${escapeHtml(card.requestAction)}</p>` : ''}
        <ul class="id-tags" aria-label="${isRequest ? 'Topics' : 'Curveball type'}">
          ${(isRequest ? card.requestTopics : [card.curveballAxis]).map((topic) => `<li>${escapeHtml(topic)}</li>`).join('')}
        </ul>
      </div>
    </article>`;
}

function pairMarkup(showCurveball) {
  const request = cardById(state.current.requestId);
  const curveball = cardById(state.current.curveballId);
  return `<div class="id-pair ${showCurveball ? '' : 'is-single'}">${cardMarkup(request, 'request')}${showCurveball ? cardMarkup(curveball, 'curveball') : ''}</div>`;
}

function phaseIndex() {
  switch (state.phase) {
    case PHASES.REQUEST_VOTE: return 0;
    case PHASES.REQUEST_DISCUSS: return 1;
    case PHASES.SECOND_VOTE: return 3;
    case PHASES.DEBRIEF: return 4;
    case PHASES.COMPLETE: return 5;
    default: return -1;
  }
}

function renderRail() {
  const current = phaseIndex();
  phaseItems.forEach((item, index) => {
    item.classList.toggle('is-complete', index < current);
    item.classList.toggle('is-current', index === current);
    if (index === current) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}

function focusPhase() {
  const heading = stage.querySelector('h3,button');
  if (!heading) return;
  if (heading.matches('h3')) heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function renderWelcome() {
  const isFirst = state.roundNumber === 0;
  const remainingRounds = Math.floor(state.remainingIds.length / 2);
  stage.innerHTML = `
    <section class="id-welcome">
      <div class="id-welcome-mark" aria-hidden="true">?</div>
      <h3>${isFirst ? 'Deal the first impossible meeting' : 'The table is ready again'}</h3>
      <p>${isFirst ? 'Put this screen where everyone can see it. Anyone can read the card and tap the room’s call. The page handles the order; the people supply the argument.' : `${remainingRounds} round${remainingRounds === 1 ? '' : 's'} remain. The used cards stay out of the deck.`}</p>
      <button class="btn primary" type="button" data-action="deal">${isFirst ? 'Deal the first request' : 'Deal the next request'}</button>
    </section>`;
  live.textContent = isFirst ? 'The table is ready. Deal the first request.' : 'The next round is ready to deal.';
}

function renderRequestVote() {
  stage.innerHTML = `<div class="id-round">${pairMarkup(false)}${voteButtons('What does the room do?')}</div>`;
  live.textContent = 'Request dealt. Read it aloud and choose Ship, Slow, or Stop.';
}

function renderRequestDiscuss() {
  stage.innerHTML = `
    <div class="id-round">
      ${pairMarkup(false)}
      <section class="id-discuss">
        <h3>The room called ${CALL_LABELS[state.current.beforeCall]}.</h3>
        <p>${callPill(state.current.beforeCall)}</p>
        <p>Ask two people why. Let someone disagree. The point is to expose the assumption before the card exposes the fact.</p>
        <button class="btn primary" type="button" data-action="reveal">Reveal the missing fact</button>
      </section>
    </div>`;
  live.textContent = `First call recorded: ${CALL_LABELS[state.current.beforeCall]}. Discuss before revealing the missing fact.`;
}

function renderSecondVote() {
  stage.innerHTML = `<div class="id-round">${pairMarkup(true)}${voteButtons('Now what does the room do?')}</div>`;
  live.textContent = 'Curveball revealed. Make the room’s call again.';
}

function renderDebrief() {
  const curveball = cardById(state.current.curveballId);
  const shift = summarizeShift(state.current.beforeCall, state.current.afterCall);
  stage.innerHTML = `
    <div class="id-round">
      ${pairMarkup(true)}
      <section class="id-debrief">
        <h3>${escapeHtml(shift.label)}</h3>
        <div class="id-shift ${shift.changed ? 'changed' : ''}" aria-label="Room call before and after">
          <div class="id-shift-cell"><span class="id-shift-label">Before the fact</span><span class="id-shift-value">${CALL_LABELS[state.current.beforeCall]}</span></div>
          <span class="id-shift-arrow" aria-hidden="true">&rarr;</span>
          <div class="id-shift-cell"><span class="id-shift-label">After the fact</span><span class="id-shift-value">${CALL_LABELS[state.current.afterCall]}</span></div>
        </div>
        <ul class="id-prompts">
          <li>What changed, or why did nothing change?</li>
          <li>${escapeHtml(curveball.discussionCue)}</li>
          <li>Which fact would you ask for next?</li>
        </ul>
        <button class="btn primary" type="button" data-action="next">${state.remainingIds.length >= 2 ? 'Close the round' : 'Close the final round'}</button>
      </section>
    </div>`;
  live.textContent = shift.label;
}

function renderComplete() {
  const changed = state.history.filter(({ beforeCall, afterCall }) => beforeCall !== afterCall).length;
  const held = state.history.length - changed;
  stage.innerHTML = `
    <section class="id-welcome">
      <div class="id-welcome-mark" aria-hidden="true">6</div>
      <h3>The alpha deck is exhausted.</h3>
      <p>You made twelve cards do six rounds of work. The tally is descriptive, not a score.</p>
      <div class="id-complete-stats">
        <div><strong>${state.history.length}</strong><span>Rounds</span></div>
        <div><strong>${changed}</strong><span>Changed calls</span></div>
        <div><strong>${held}</strong><span>Held calls</span></div>
      </div>
      <button class="btn primary" type="button" data-action="restart">Shuffle all twelve cards</button>
    </section>`;
  live.textContent = 'Session complete. All twelve alpha cards were used once.';
}

function render() {
  roundCount.textContent = state.phase === PHASES.COMPLETE
    ? 'Session complete'
    : `Round ${Math.min(state.roundNumber + (state.current ? 0 : 1), 6)} of 6`;
  renderRail();

  switch (state.phase) {
    case PHASES.WELCOME: renderWelcome(); break;
    case PHASES.REQUEST_VOTE: renderRequestVote(); break;
    case PHASES.REQUEST_DISCUSS: renderRequestDiscuss(); break;
    case PHASES.SECOND_VOTE: renderSecondVote(); break;
    case PHASES.DEBRIEF: renderDebrief(); break;
    case PHASES.COMPLETE: renderComplete(); break;
    default: throw new Error(`Unknown phase: ${state.phase}`);
  }

  focusPhase();
}

stage.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');
  if (!control) return;

  switch (control.dataset.action) {
    case 'deal':
      state = dealRound(state);
      break;
    case 'vote':
      state = submitCall(state, control.dataset.call);
      break;
    case 'reveal':
      state = revealCurveball(state);
      break;
    case 'next':
      state = nextRound(state);
      break;
    case 'restart':
      state = createSession(CARDS, cryptoRandom);
      break;
    default:
      return;
  }
  render();
});

render();
