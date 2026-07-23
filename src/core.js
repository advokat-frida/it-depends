export const CALLS = Object.freeze({
  SHIP: 'ship',
  SLOW: 'slow',
  STOP: 'stop',
});

export const PHASES = Object.freeze({
  WELCOME: 'welcome',
  REQUEST_VOTE: 'request-vote',
  REQUEST_DISCUSS: 'request-discuss',
  SECOND_VOTE: 'second-vote',
  DEBRIEF: 'debrief',
  COMPLETE: 'complete',
});

export const DEFAULT_PLAYER_COUNT = 3;
export const MIN_PLAYER_COUNT = 2;
export const MAX_PLAYER_COUNT = 8;
export const SESSION_ROUNDS = 6;

const VALID_CALLS = new Set(Object.values(CALLS));

function assertPlayerCount(playerCount) {
  if (!Number.isInteger(playerCount) || playerCount < MIN_PLAYER_COUNT || playerCount > MAX_PLAYER_COUNT) {
    throw new RangeError(`Choose between ${MIN_PLAYER_COUNT} and ${MAX_PLAYER_COUNT} people.`);
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function shuffleIds(ids, random) {
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapWith]] = [shuffled[swapWith], shuffled[index]];
  }
  return shuffled;
}

export function createSession(scenarios, details, random, playerCount = DEFAULT_PLAYER_COUNT) {
  if (typeof random !== 'function') throw new TypeError('A random source is required.');
  assertPlayerCount(playerCount);
  if (!Array.isArray(scenarios) || scenarios.length === 0) throw new TypeError('A Scenario deck is required.');
  if (!Array.isArray(details) || details.length === 0) throw new TypeError('A Missing Detail deck is required.');
  const scenarioIds = scenarios.map(({ id }) => id);
  const detailIds = details.map(({ id }) => id);
  return {
    phase: PHASES.WELCOME,
    playerCount,
    remainingScenarioIds: shuffleIds(scenarioIds, random),
    remainingDetailIds: shuffleIds(detailIds, random),
    roundLimit: Math.min(SESSION_ROUNDS, scenarioIds.length, detailIds.length),
    current: null,
    history: [],
    roundNumber: 0,
  };
}

export function setPlayerCount(state, playerCount) {
  assertPlayerCount(playerCount);
  if (state.phase !== PHASES.WELCOME || state.roundNumber !== 0 || state.current) {
    throw new Error('Choose the number of voters before the first request is dealt.');
  }
  return { ...state, playerCount };
}

export function dealRound(state) {
  if (state.current) throw new Error('Finish the current round before dealing another.');
  if (
    state.roundNumber >= state.roundLimit
    || state.remainingScenarioIds.length === 0
    || state.remainingDetailIds.length === 0
  ) {
    return { ...state, phase: PHASES.COMPLETE };
  }

  const [scenarioId, ...remainingScenarioIds] = state.remainingScenarioIds;
  const [detailId, ...remainingDetailIds] = state.remainingDetailIds;
  return {
    ...state,
    phase: PHASES.REQUEST_VOTE,
    remainingScenarioIds,
    remainingDetailIds,
    roundNumber: state.roundNumber + 1,
    current: {
      scenarioId,
      detailId,
      beforeVotes: [],
      afterVotes: [],
    },
  };
}

export function tallyVotes(votes, playerCount) {
  assertPlayerCount(playerCount);
  if (!Array.isArray(votes) || votes.some((call) => !VALID_CALLS.has(call))) {
    throw new Error('Every vote must be Ship, Slow, or Stop.');
  }
  if (votes.length > playerCount) throw new Error('The vote contains more selections than players.');

  const counts = {
    [CALLS.SHIP]: 0,
    [CALLS.SLOW]: 0,
    [CALLS.STOP]: 0,
  };
  votes.forEach((call) => { counts[call] += 1; });

  const threshold = Math.floor(playerCount / 2) + 1;
  const majorityCall = Object.values(CALLS).find((call) => counts[call] >= threshold) ?? null;
  return {
    counts,
    majorityCall,
    threshold,
    total: votes.length,
    complete: votes.length === playerCount,
    split: votes.length === playerCount && majorityCall === null,
  };
}

export function submitVote(state, call) {
  if (!VALID_CALLS.has(call)) throw new Error('Choose Ship, Slow, or Stop.');
  if (!state.current) throw new Error('Deal a round before voting.');

  if (state.phase === PHASES.REQUEST_VOTE) {
    if (state.current.beforeVotes.length >= state.playerCount) throw new Error('The first vote is already complete.');
    const beforeVotes = [...state.current.beforeVotes, call];
    return {
      ...state,
      phase: beforeVotes.length === state.playerCount ? PHASES.REQUEST_DISCUSS : PHASES.REQUEST_VOTE,
      current: { ...state.current, beforeVotes },
    };
  }

  if (state.phase === PHASES.SECOND_VOTE) {
    if (state.current.afterVotes.length >= state.playerCount) throw new Error('The second vote is already complete.');
    const afterVotes = [...state.current.afterVotes, call];
    return {
      ...state,
      phase: afterVotes.length === state.playerCount ? PHASES.DEBRIEF : PHASES.SECOND_VOTE,
      current: { ...state.current, afterVotes },
    };
  }

  throw new Error('The group cannot vote in this phase.');
}

export function revealDetail(state) {
  if (state.phase !== PHASES.REQUEST_DISCUSS || state.current?.beforeVotes.length !== state.playerCount) {
    throw new Error('Finish the first vote and discussion before revealing the Missing Detail.');
  }
  return { ...state, phase: PHASES.SECOND_VOTE };
}

export function summarizeShift(beforeVotes, afterVotes, playerCount) {
  const before = tallyVotes(beforeVotes, playerCount);
  const after = tallyVotes(afterVotes, playerCount);
  if (!before.complete || !after.complete) throw new Error('Both votes must be complete before the debrief.');

  const beforeKey = before.majorityCall ?? 'split';
  const afterKey = after.majorityCall ?? 'split';
  const changed = beforeKey !== afterKey;
  let label;

  if (!changed && before.split) label = 'The group is still split.';
  else if (!changed) label = `The majority held at ${capitalize(before.majorityCall)}.`;
  else if (before.split) label = `A majority formed for ${capitalize(after.majorityCall)}.`;
  else if (after.split) label = 'The second vote has no majority.';
  else label = `The majority changed from ${capitalize(before.majorityCall)} to ${capitalize(after.majorityCall)}.`;

  return { changed, label, before, after };
}

export function nextRound(state) {
  if (state.phase !== PHASES.DEBRIEF || state.current?.afterVotes.length !== state.playerCount) {
    throw new Error('Finish the debrief before moving to the next round.');
  }

  const history = [...state.history, state.current];
  if (
    state.roundNumber >= state.roundLimit
    || state.remainingScenarioIds.length === 0
    || state.remainingDetailIds.length === 0
  ) {
    return { ...state, phase: PHASES.COMPLETE, current: null, history };
  }

  return { ...state, phase: PHASES.WELCOME, current: null, history };
}
