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

const VALID_CALLS = new Set(Object.values(CALLS));

export function shuffleIds(ids, random) {
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapWith]] = [shuffled[swapWith], shuffled[index]];
  }
  return shuffled;
}

export function createSession(cards, random) {
  if (typeof random !== 'function') throw new TypeError('A random source is required.');
  return {
    phase: PHASES.WELCOME,
    remainingIds: shuffleIds(cards.map(({ id }) => id), random),
    current: null,
    history: [],
    roundNumber: 0,
  };
}

export function dealRound(state) {
  if (state.current) throw new Error('Finish the current round before dealing another.');
  if (state.remainingIds.length < 2) return { ...state, phase: PHASES.COMPLETE };

  const [requestId, curveballId, ...remainingIds] = state.remainingIds;
  return {
    ...state,
    phase: PHASES.REQUEST_VOTE,
    remainingIds,
    roundNumber: state.roundNumber + 1,
    current: {
      requestId,
      curveballId,
      beforeCall: null,
      afterCall: null,
    },
  };
}

export function submitCall(state, call) {
  if (!VALID_CALLS.has(call)) throw new Error('Choose Ship, Slow, or Stop.');
  if (!state.current) throw new Error('Deal a round before making a call.');

  if (state.phase === PHASES.REQUEST_VOTE) {
    return {
      ...state,
      phase: PHASES.REQUEST_DISCUSS,
      current: { ...state.current, beforeCall: call },
    };
  }

  if (state.phase === PHASES.SECOND_VOTE) {
    return {
      ...state,
      phase: PHASES.DEBRIEF,
      current: { ...state.current, afterCall: call },
    };
  }

  throw new Error('The room cannot make a call in this phase.');
}

export function revealCurveball(state) {
  if (state.phase !== PHASES.REQUEST_DISCUSS || !state.current?.beforeCall) {
    throw new Error('Record the first call and discussion before revealing the curveball.');
  }
  return { ...state, phase: PHASES.SECOND_VOTE };
}

export function summarizeShift(beforeCall, afterCall) {
  const changed = beforeCall !== afterCall;
  return {
    changed,
    label: changed ? 'The room changed its call.' : 'The room held its call.',
  };
}

export function nextRound(state) {
  if (state.phase !== PHASES.DEBRIEF || !state.current?.afterCall) {
    throw new Error('Finish the debrief before moving to the next round.');
  }

  const history = [...state.history, state.current];
  if (state.remainingIds.length < 2) {
    return { ...state, phase: PHASES.COMPLETE, current: null, history };
  }

  return { ...state, phase: PHASES.WELCOME, current: null, history };
}

