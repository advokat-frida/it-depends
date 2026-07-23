import { describe, expect, it } from 'vitest';
import { CARDS } from '../src/cards.js';
import {
  CALLS,
  PHASES,
  createSession,
  dealRound,
  nextRound,
  revealCurveball,
  setPlayerCount,
  submitVote,
  summarizeShift,
  tallyVotes,
} from '../src/core.js';

const fixedRandom = () => 0.417;
const cast = (state, calls) => calls.reduce((current, call) => submitVote(current, call), state);

describe('IT DEPENDS session', () => {
  it('deals two distinct cards from the remaining deck', () => {
    const state = dealRound(createSession(CARDS, fixedRandom));

    expect(state.current.requestId).not.toBe(state.current.curveballId);
    expect(state.remainingIds).not.toContain(state.current.requestId);
    expect(state.remainingIds).not.toContain(state.current.curveballId);
  });

  it('uses every alpha card once across six rounds', () => {
    let state = createSession(CARDS, fixedRandom);
    const seen = new Set();

    for (let round = 0; round < 6; round += 1) {
      state = dealRound(state);
      seen.add(state.current.requestId);
      seen.add(state.current.curveballId);
      state = cast(state, [CALLS.SHIP, CALLS.SHIP, CALLS.SLOW]);
      state = revealCurveball(state);
      state = cast(state, [CALLS.SLOW, CALLS.SLOW, CALLS.SHIP]);
      state = nextRound(state);
    }

    expect(seen.size).toBe(12);
    expect(state.phase).toBe(PHASES.COMPLETE);
    expect(state.remainingIds).toHaveLength(0);
  });

  it('does not reveal a curveball until every player has voted', () => {
    let state = dealRound(createSession(CARDS, fixedRandom));
    state = submitVote(state, CALLS.SHIP);

    expect(() => revealCurveball(state)).toThrow(/finish the first vote/i);
    expect(state.phase).toBe(PHASES.REQUEST_VOTE);
  });

  it('records every numbered selection before and after the reveal', () => {
    let state = dealRound(createSession(CARDS, fixedRandom));
    state = cast(state, [CALLS.STOP, CALLS.SLOW, CALLS.STOP]);
    expect(state.current.beforeVotes).toEqual([CALLS.STOP, CALLS.SLOW, CALLS.STOP]);
    expect(state.phase).toBe(PHASES.REQUEST_DISCUSS);

    state = revealCurveball(state);
    state = cast(state, [CALLS.SLOW, CALLS.SLOW, CALLS.STOP]);
    expect(state.current.afterVotes).toEqual([CALLS.SLOW, CALLS.SLOW, CALLS.STOP]);
    expect(state.phase).toBe(PHASES.DEBRIEF);
  });

  it('uses a strict majority and never promotes a plurality', () => {
    const twoOneOne = tallyVotes([CALLS.SHIP, CALLS.SHIP, CALLS.SLOW, CALLS.STOP], 4);
    const twoTwo = tallyVotes([CALLS.SHIP, CALLS.SHIP, CALLS.STOP, CALLS.STOP], 4);
    const threeOne = tallyVotes([CALLS.SLOW, CALLS.SLOW, CALLS.SLOW, CALLS.STOP], 4);

    expect(twoOneOne.majorityCall).toBeNull();
    expect(twoOneOne.split).toBe(true);
    expect(twoTwo.majorityCall).toBeNull();
    expect(threeOne.majorityCall).toBe(CALLS.SLOW);
    expect(threeOne.threshold).toBe(3);
  });

  it('reports changed, held, and split majority results accurately', () => {
    const changed = summarizeShift(
      [CALLS.SHIP, CALLS.SHIP, CALLS.SLOW],
      [CALLS.STOP, CALLS.STOP, CALLS.SLOW],
      3,
    );
    const held = summarizeShift(
      [CALLS.SLOW, CALLS.SLOW, CALLS.SHIP],
      [CALLS.SLOW, CALLS.SLOW, CALLS.STOP],
      3,
    );
    const split = summarizeShift(
      [CALLS.SHIP, CALLS.SLOW, CALLS.STOP],
      [CALLS.SHIP, CALLS.SLOW, CALLS.STOP],
      3,
    );

    expect(changed.label).toBe('The majority changed from Ship to Stop.');
    expect(changed.changed).toBe(true);
    expect(held.label).toBe('The majority held at Slow.');
    expect(held.changed).toBe(false);
    expect(split.label).toBe('The group is still split.');
  });

  it('allows the player count to change only before the first deal', () => {
    let state = setPlayerCount(createSession(CARDS, fixedRandom), 6);
    expect(state.playerCount).toBe(6);
    state = dealRound(state);

    expect(() => setPlayerCount(state, 5)).toThrow(/before the first request/i);
    expect(() => createSession(CARDS, fixedRandom, 1)).toThrow(/between 2 and 8/i);
  });
});
