import {
  MISSING_DETAILS,
  SCENARIOS,
  detailById,
  scenarioById,
} from './cards.js';
import {
  CALLS,
  MAX_PLAYER_COUNT,
  MIN_PLAYER_COUNT,
  PHASES,
  createSession,
  dealRound,
  nextRound,
  revealDetail,
  setPlayerCount,
  submitVote,
  summarizeShift,
  tallyVotes,
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

const ALL_FACES = [...SCENARIOS, ...MISSING_DETAILS];

let state = createSession(SCENARIOS, MISSING_DETAILS, cryptoRandom);
let animateDetailReveal = false;

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

function outcomeMarkup(result) {
  if (result.majorityCall) return callPill(result.majorityCall);
  return '<span class="call-pill split"><span class="split-mark" aria-hidden="true">&#8644;</span>No majority</span>';
}

function outcomeSentence(result) {
  return result.majorityCall
    ? `The majority chose ${CALL_LABELS[result.majorityCall]}.`
    : 'There is no majority.';
}

function seatTrack(votes) {
  return `
    <ol class="id-seat-track" aria-label="Voting progress">
      ${Array.from({ length: state.playerCount }, (_, index) => {
        const status = index < votes.length ? 'is-ready' : index === votes.length ? 'is-current' : '';
        const text = index < votes.length ? `Player ${index + 1} has voted` : index === votes.length ? `Player ${index + 1} is voting` : `Player ${index + 1} is waiting`;
        return `<li class="${status}" aria-label="${text}"><span>P${index + 1}</span></li>`;
      }).join('')}
    </ol>`;
}

function voteButtons(prompt, votes, { rail = false, footer = '' } = {}) {
  const playerNumber = votes.length + 1;
  const turnInstruction = playerNumber === state.playerCount
    ? 'Choose privately. Your pick reveals every selection and the majority.'
    : 'Choose privately, then pass the screen. Every pick appears after the last player.';
  return `
    <section class="id-action-panel${rail ? ' id-decision-rail' : ''}" aria-labelledby="vote-title">
      <p class="id-turn">Player ${playerNumber} of ${state.playerCount}</p>
      <h3 id="vote-title">${escapeHtml(prompt)}</h3>
      <p class="id-vote-instruction">${turnInstruction}</p>
      ${seatTrack(votes)}
      <div class="id-votes" role="group" aria-label="Player ${playerNumber}: choose Ship, Slow, or Stop">
        ${Object.values(CALLS).map((call) => `
          <button class="id-vote ${call}" type="button" data-action="vote" data-call="${call}">
            <span class="ic" aria-hidden="true">${ICONS[call]}</span>${CALL_LABELS[call]}
          </button>`).join('')}
      </div>
      ${footer}
    </section>`;
}

function artMarkup(card) {
  if (card.artStatus === 'ready') {
    return `<img src="./assets/art/${escapeHtml(card.artKey)}.png" alt="${escapeHtml(card.artAlt)}">`;
  }
  const cardNumber = String(ALL_FACES.indexOf(card) + 1).padStart(2, '0');
  return `<div class="id-art-mat" role="img" aria-label="Art brief pending: ${escapeHtml(card.artAlt)}"><span class="id-art-number">${cardNumber}</span><span class="id-art-status">After Dark art brief</span></div>`;
}

function cardMarkup(card, face) {
  const isScenario = face === 'scenario';
  const copy = isScenario ? card.request : card.detail;
  const eyebrow = isScenario ? 'Request' : 'Missing detail';
  const meta = isScenario ? card.id : card.axis;
  const tags = isScenario
    ? card.requestTopics.map((topic) => ({ label: topic, className: '' }))
    : [
      { label: card.axis, className: '' },
      { label: card.polarity === 'risk' ? 'Risk fact' : 'Safeguard', className: `is-${card.polarity}` },
    ];
  return `
    <article class="id-card ${isScenario ? '' : 'is-curveball'}" aria-label="${eyebrow}: ${escapeHtml(card.title)}">
      <div class="id-card-top"><span>${eyebrow}</span><span>${escapeHtml(meta)}</span></div>
      <div class="id-art">${artMarkup(card)}</div>
      <div class="id-card-body">
        <h3>${escapeHtml(card.title)}</h3>
        <p class="id-card-copy">${escapeHtml(copy)}</p>
        ${isScenario ? `<p class="id-card-action"><strong>The proposal:</strong> ${escapeHtml(card.proposal)}</p>` : ''}
        <ul class="id-tags" aria-label="${isScenario ? 'Topics' : 'Missing Detail type'}">
          ${tags.map(({ label, className }) => `<li class="${className}">${escapeHtml(label)}</li>`).join('')}
        </ul>
      </div>
    </article>`;
}

function cardBackMarkup(kind, { decorative = false } = {}) {
  const isScenario = kind === 'scenario';
  const eyebrow = isScenario ? 'IT DEPENDS' : 'Missing detail';
  const label = isScenario ? 'Scenario deck' : 'IT DEPENDS';
  const foot = isScenario ? 'Make the call' : 'The missing fact';
  const accessibleLabel = isScenario ? 'Scenario deck' : 'IT DEPENDS Missing Detail deck';
  const accessibility = decorative
    ? 'aria-hidden="true"'
    : `role="img" aria-label="Face-down ${accessibleLabel}"`;
  return `
    <div class="id-card-back is-${kind}" data-card-back="${kind}" ${accessibility}>
      <img class="id-back-art" data-card-back-art="${kind}" src="./assets/art/${kind}-card-back.png" width="948" height="1659" alt="" aria-hidden="true">
      <div class="id-back-frame">
        <span class="id-back-eyebrow">${eyebrow}</span>
        <span class="id-back-lockup">
          <strong>${label}</strong>
          <span class="id-back-foot">${foot}</span>
        </span>
      </div>
    </div>`;
}

function cardSlotMarkup(kind, content, { stacked = false, revealing = false } = {}) {
  return `<div class="id-card-slot is-${kind}${stacked ? ' is-stacked' : ''}${revealing ? ' is-revealing' : ''}">${content}</div>`;
}

function flipMarkup(detail) {
  return `
    <div class="id-flip-card">
      <div class="id-flip-face is-back">${cardBackMarkup('curveball', { decorative: true })}</div>
      <div class="id-flip-face is-front">${cardMarkup(detail, 'detail')}</div>
    </div>`;
}

function boardLaneMarkup(kind, label, content) {
  return `
    <div class="id-board-lane is-${kind}">
      <p class="id-lane-label"><span aria-hidden="true"></span>${escapeHtml(label)}</p>
      ${content}
    </div>`;
}

function pairMarkup({ showDetail = false, animateReveal = false } = {}) {
  const scenario = scenarioById(state.current.scenarioId);
  const detail = detailById(state.current.detailId);
  const scenarioLane = boardLaneMarkup(
    'scenario',
    'Scenario in play',
    cardSlotMarkup('scenario', cardMarkup(scenario, 'scenario')),
  );
  const detailContent = showDetail
    ? (animateReveal ? flipMarkup(detail) : cardMarkup(detail, 'detail'))
    : cardBackMarkup('curveball');
  const detailLane = boardLaneMarkup(
    'curveball',
    showDetail ? 'Missing detail revealed' : 'IT DEPENDS deck',
    cardSlotMarkup('curveball', detailContent, { stacked: true, revealing: animateReveal }),
  );
  return `<div class="id-pair">${scenarioLane}${detailLane}</div>`;
}

function playGridMarkup(pairOptions, railMarkup, railLabel = 'Players\' call') {
  const railLane = boardLaneMarkup('decision', railLabel, railMarkup);
  return `<div class="id-play-grid">${pairMarkup(pairOptions)}${railLane}</div>`;
}

function totalsMarkup(result) {
  return `
    <dl class="id-totals" aria-label="Vote totals">
      ${Object.values(CALLS).map((call) => `<div class="${call}"><dt>${CALL_LABELS[call]}</dt><dd>${result.counts[call]}</dd></div>`).join('')}
    </dl>`;
}

function selectionsMarkup(votes) {
  return `
    <ol class="id-selections" aria-label="Each player's selection">
      ${votes.map((call, index) => `<li><span>Player ${index + 1}</span>${callPill(call)}</li>`).join('')}
    </ol>`;
}

function resultMarkup(label, votes) {
  const result = tallyVotes(votes, state.playerCount);
  return `
    <section class="id-result" aria-label="${escapeHtml(label)} results">
      <div class="id-result-head">
        <div><p class="id-result-label">${escapeHtml(label)}</p><h4>${escapeHtml(outcomeSentence(result))}</h4></div>
        ${outcomeMarkup(result)}
      </div>
      ${totalsMarkup(result)}
      ${selectionsMarkup(votes)}
    </section>`;
}

function playerChangesMarkup(beforeVotes, afterVotes) {
  return `
    <ol class="id-player-changes" aria-label="Each player's first and second selection">
      ${beforeVotes.map((before, index) => {
        const after = afterVotes[index];
        const held = before === after;
        return `<li><span class="id-player-name">Player ${index + 1}</span><span>${callPill(before)}<span class="id-change-arrow" aria-hidden="true">&rarr;</span>${callPill(after)}</span><small>${held ? 'Held' : 'Changed'}</small></li>`;
      }).join('')}
    </ol>`;
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

function playerSetupMarkup() {
  return `
    <fieldset class="id-player-setup">
      <legend>How many people are voting?</legend>
      <p>Each person gets one private choice per vote.</p>
      <div class="id-player-stepper">
        <button type="button" data-action="players-minus" aria-label="Remove one player" ${state.playerCount === MIN_PLAYER_COUNT ? 'disabled' : ''}>&minus;</button>
        <output aria-live="polite"><strong>${state.playerCount}</strong><span>players</span></output>
        <button type="button" data-action="players-plus" aria-label="Add one player" ${state.playerCount === MAX_PLAYER_COUNT ? 'disabled' : ''}>+</button>
      </div>
    </fieldset>`;
}

function renderWelcome() {
  const isFirst = state.roundNumber === 0;
  const remainingRounds = state.roundLimit - state.roundNumber;
  stage.innerHTML = `
    <section class="id-welcome">
      <div class="id-welcome-decks" aria-label="Two distinct decks: Scenario cards and IT DEPENDS Missing Detail cards">
        <div class="id-deck-preview">
          <span>Scenarios</span>
          ${cardSlotMarkup('scenario', cardBackMarkup('scenario'), { stacked: true })}
        </div>
        <div class="id-deck-preview">
          <span>Missing details</span>
          ${cardSlotMarkup('curveball', cardBackMarkup('curveball'), { stacked: true })}
        </div>
      </div>
      <h3>${isFirst ? 'Deal the first impossible meeting' : 'The table is ready again'}</h3>
      <p>${isFirst ? 'No referee is required. One person reads the cards and taps Deal or Reveal. Every player enters one numbered choice on this screen; the game reveals the tally after the final vote.' : `${remainingRounds} round${remainingRounds === 1 ? '' : 's'} remain. Used Scenarios and Missing Details stay out of their decks, and the same ${state.playerCount} players vote again.`}</p>
      ${isFirst ? playerSetupMarkup() : ''}
      <button class="btn primary" type="button" data-action="deal">${isFirst ? 'Deal the first request' : 'Deal the next request'}</button>
    </section>`;
  live.textContent = isFirst ? `The table is ready for ${state.playerCount} players.` : 'The next round is ready to deal.';
}

function renderRequestVote() {
  const votes = state.current.beforeVotes;
  stage.innerHTML = `<div class="id-round">${playGridMarkup({}, voteButtons('What do you choose?', votes, { rail: true }))}</div>`;
  live.textContent = `Request dealt. Player ${votes.length + 1} of ${state.playerCount} chooses Ship, Slow, or Stop.`;
}

function revealRailMarkup() {
  return `
    <section class="id-action-panel id-decision-rail id-reveal-rail" aria-labelledby="reveal-title">
      <p class="id-turn">First vote complete</p>
      <h3 id="reveal-title">The first vote is in.</h3>
      ${resultMarkup('First vote', state.current.beforeVotes)}
      <p class="id-guidance">Take a quick lap around the table. Each player shares the fact or assumption behind their pick. Different answers are useful. Once everyone has had a turn, reveal the Missing Detail.</p>
      <button class="btn primary" type="button" data-action="reveal">Reveal the Missing Detail</button>
    </section>`;
}

function renderRequestDiscuss() {
  const result = tallyVotes(state.current.beforeVotes, state.playerCount);
  stage.innerHTML = `
    <div class="id-round">
      ${playGridMarkup({}, revealRailMarkup(), 'First-vote result')}
    </div>`;
  live.textContent = `${outcomeSentence(result)} Every player's first selection is now visible.`;
}

function renderSecondVote() {
  const votes = state.current.afterVotes;
  const shouldAnimate = animateDetailReveal;
  animateDetailReveal = false;
  const firstVoteRecap = `<details class="id-first-recap id-rail-recap"><summary>Review the first vote</summary>${resultMarkup('First vote', state.current.beforeVotes)}</details>`;
  stage.innerHTML = `
    <div class="id-round">
      ${playGridMarkup({ showDetail: true, animateReveal: shouldAnimate }, voteButtons('What do you choose now?', votes, { rail: true, footer: firstVoteRecap }))}
    </div>`;
  live.textContent = `Missing Detail revealed. Player ${votes.length + 1} of ${state.playerCount} votes again.`;
}

function renderDebrief() {
  const detail = detailById(state.current.detailId);
  const shift = summarizeShift(state.current.beforeVotes, state.current.afterVotes, state.playerCount);
  stage.innerHTML = `
    <div class="id-round">
      ${pairMarkup({ showDetail: true })}
      <section class="id-debrief">
        <h3>${escapeHtml(shift.label)}</h3>
        <div class="id-shift ${shift.changed ? 'changed' : ''}" aria-label="Majority result before and after the missing fact">
          <div class="id-shift-cell"><span class="id-shift-label">Before the fact</span>${outcomeMarkup(shift.before)}</div>
          <span class="id-shift-arrow" aria-hidden="true">&rarr;</span>
          <div class="id-shift-cell"><span class="id-shift-label">After the fact</span>${outcomeMarkup(shift.after)}</div>
        </div>
        ${playerChangesMarkup(state.current.beforeVotes, state.current.afterVotes)}
        <details class="id-full-tallies"><summary>See both full tallies</summary><div class="id-result-grid">${resultMarkup('First vote', state.current.beforeVotes)}${resultMarkup('Second vote', state.current.afterVotes)}</div></details>
        <ul class="id-prompts">
          <li>What changed, or why did your choice hold?</li>
          <li>${escapeHtml(detail.discussionCue)}</li>
          <li>Which fact would you ask for next?</li>
        </ul>
        <button class="btn primary" type="button" data-action="next">${state.roundNumber < state.roundLimit ? 'Close the round' : 'Close the final round'}</button>
      </section>
    </div>`;
  live.textContent = shift.label;
}

function renderComplete() {
  const changed = state.history.filter(({ beforeVotes, afterVotes }) => summarizeShift(beforeVotes, afterVotes, state.playerCount).changed).length;
  const held = state.history.length - changed;
  stage.innerHTML = `
    <section class="id-welcome">
      <div class="id-welcome-mark" aria-hidden="true">6</div>
      <h3>The table has had enough for one session.</h3>
      <p>You paired six of twelve Scenarios with six of twelve Missing Details. The tally describes the conversation; it is not a score.</p>
      <div class="id-complete-stats">
        <div><strong>${state.history.length}</strong><span>Rounds</span></div>
        <div><strong>${changed}</strong><span>Changed results</span></div>
        <div><strong>${held}</strong><span>Held results</span></div>
      </div>
      <button class="btn primary" type="button" data-action="restart">Shuffle both decks</button>
    </section>`;
  live.textContent = 'Session complete. Six Scenarios and six Missing Details were used.';
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
  let returnFocusTo = null;

  switch (control.dataset.action) {
    case 'players-minus':
      state = setPlayerCount(state, state.playerCount - 1);
      returnFocusTo = 'players-minus';
      break;
    case 'players-plus':
      state = setPlayerCount(state, state.playerCount + 1);
      returnFocusTo = 'players-plus';
      break;
    case 'deal':
      state = dealRound(state);
      break;
    case 'vote':
      state = submitVote(state, control.dataset.call);
      break;
    case 'reveal':
      animateDetailReveal = true;
      state = revealDetail(state);
      break;
    case 'next':
      state = nextRound(state);
      break;
    case 'restart':
      state = createSession(SCENARIOS, MISSING_DETAILS, cryptoRandom, state.playerCount);
      break;
    default:
      return;
  }
  render();
  if (returnFocusTo) {
    const preferred = stage.querySelector(`[data-action="${returnFocusTo}"]:not(:disabled)`);
    (preferred ?? stage.querySelector('.id-player-stepper button:not(:disabled)'))?.focus();
  }
});

render();
