import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { CARDS, isCompatiblePair } from '../src/cards.js';

describe('IT DEPENDS alpha deck', () => {
  it('every non-self request curveball pairing is authored as compatible', () => {
    const orderedPairs = CARDS.flatMap((request) =>
      CARDS.filter((curveball) => request.id !== curveball.id)
        .map((curveball) => [request, curveball]),
    );

    expect(orderedPairs).toHaveLength(132);
    expect(orderedPairs.every(([request, curveball]) => isCompatiblePair(request, curveball))).toBe(true);
  });

  it('ships no correct answer field or answer-key copy', () => {
    const serialized = JSON.stringify(CARDS).toLowerCase();

    for (const card of CARDS) {
      expect(card).not.toHaveProperty('correctAnswer');
      expect(card).not.toHaveProperty('bestCall');
    }
    expect(serialized).not.toContain('correct answer');
    expect(serialized).not.toContain('right answer');
  });

  it('contains twelve distinct dual-use cards with complete accessible copy', () => {
    expect(CARDS).toHaveLength(12);
    expect(new Set(CARDS.map(({ id }) => id)).size).toBe(12);

    for (const card of CARDS) {
      expect(card.title.length).toBeGreaterThan(3);
      expect(card.request.length).toBeGreaterThan(40);
      expect(card.proposal.length).toBeGreaterThan(15);
      expect(card.curveball.length).toBeGreaterThan(35);
      expect(card.discussionCue.length).toBeGreaterThan(20);
      expect(card.artAlt.length).toBeGreaterThan(20);
      expect(card.artStatus).toBe('ready');
      expect(existsSync(new URL(`../assets/art/${card.artKey}.png`, import.meta.url))).toBe(true);
      expect(card.pairingDomain).toBe('data-processing-proposal');
      expect(card.curveballAppliesTo).toContain('data-processing-proposal');
    }
    expect(existsSync(new URL('../assets/art/table-backdrop.png', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../assets/art/scenario-card-back.png', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../assets/art/curveball-card-back.png', import.meta.url))).toBe(true);
  });
});
