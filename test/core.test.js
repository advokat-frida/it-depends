import { describe, expect, it } from 'vitest';
import { CARDS } from '../src/cards.js';
import {
  CALLS,
  PHASES,
  createSession,
  dealRound,
  nextRound,
  revealCurveball,
  submitCall,
  summarizeShift,
} from '../src/core.js';

const fixedRandom = () => 0.417;

describe('IT DEPENDS session', () => {
  it('deals two distinct cards from the remaining deck', () => {
    const state = dealRound(createSession(CARDS, fixedRandom), CARDS);

    expect(state.current.requestId).not.toBe(state.current.curveballId);
    expect(state.remainingIds).not.toContain(state.current.requestId);
    expect(state.remainingIds).not.toContain(state.current.curveballId);
  });

  it('uses every alpha card once across six rounds', () => {
    let state = createSession(CARDS, fixedRandom);
    const seen = new Set();

    for (let round = 0; round < 6; round += 1) {
      state = dealRound(state, CARDS);
      seen.add(state.current.requestId);
      seen.add(state.current.curveballId);
      state = submitCall(state, CALLS.SHIP);
      state = revealCurveball(state);
      state = submitCall(state, CALLS.SLOW);
      state = nextRound(state);
    }

    expect(seen.size).toBe(12);
    expect(state.phase).toBe(PHASES.COMPLETE);
    expect(state.remainingIds).toHaveLength(0);
  });

  it('does not reveal a curveball before the first discussion gate', () => {
    const state = dealRound(createSession(CARDS, fixedRandom), CARDS);

    expect(() => revealCurveball(state)).toThrow(/first call/i);
    expect(state.phase).toBe(PHASES.REQUEST_VOTE);
  });

  it('records the room call before and after the reveal', () => {
    let state = dealRound(createSession(CARDS, fixedRandom), CARDS);
    state = submitCall(state, CALLS.STOP);
    expect(state.current.beforeCall).toBe(CALLS.STOP);
    expect(state.phase).toBe(PHASES.REQUEST_DISCUSS);

    state = revealCurveball(state);
    state = submitCall(state, CALLS.SLOW);
    expect(state.current.afterCall).toBe(CALLS.SLOW);
    expect(state.phase).toBe(PHASES.DEBRIEF);
  });

  it('reports changed and unchanged calls accurately', () => {
    expect(summarizeShift(CALLS.SHIP, CALLS.STOP)).toEqual({
      changed: true,
      label: 'The room changed its call.',
    });
    expect(summarizeShift(CALLS.SLOW, CALLS.SLOW)).toEqual({
      changed: false,
      label: 'The room held its call.',
    });
  });
});

