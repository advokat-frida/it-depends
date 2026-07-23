import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import {
  MISSING_DETAILS,
  SCENARIOS,
  detailById,
  isCompatiblePair,
  scenarioById,
} from '../src/cards.js';

describe('IT DEPENDS Universal Core', () => {
  it('authors all 144 Scenario and Missing Detail combinations as universal', () => {
    const pairs = SCENARIOS.flatMap((scenario) =>
      MISSING_DETAILS.map((detail) => [scenario, detail]),
    );

    expect(pairs).toHaveLength(144);
    expect(pairs.every(([scenario, detail]) => isCompatiblePair(scenario, detail))).toBe(true);
  });

  it('ships no correct answer or preferred-call copy', () => {
    const serialized = JSON.stringify({ SCENARIOS, MISSING_DETAILS }).toLowerCase();

    for (const card of [...SCENARIOS, ...MISSING_DETAILS]) {
      expect(card).not.toHaveProperty('correctAnswer');
      expect(card).not.toHaveProperty('bestCall');
      expect(card).not.toHaveProperty('preferredCall');
    }
    expect(serialized).not.toContain('correct answer');
    expect(serialized).not.toContain('right answer');
  });

  it('contains twelve complete Scenario cards with distinct art', () => {
    expect(SCENARIOS).toHaveLength(12);
    expect(new Set(SCENARIOS.map(({ id }) => id)).size).toBe(12);
    expect(new Set(SCENARIOS.map(({ artKey }) => artKey)).size).toBe(12);

    for (const scenario of SCENARIOS) {
      expect(scenario.title.length).toBeGreaterThan(3);
      expect(scenario.request.length).toBeGreaterThan(40);
      expect(scenario.proposal.length).toBeGreaterThan(15);
      expect(scenario.requestTopics.length).toBeGreaterThanOrEqual(2);
      expect(scenario.artAlt.length).toBeGreaterThan(20);
      expect(scenario.artStatus).toBe('ready');
      expect(existsSync(new URL(`../assets/art/${scenario.artKey}.png`, import.meta.url))).toBe(true);
      expect(scenarioById(scenario.id)).toBe(scenario);
    }
  });

  it('contains twelve independently illustrated universal Missing Details', () => {
    expect(MISSING_DETAILS).toHaveLength(12);
    expect(new Set(MISSING_DETAILS.map(({ id }) => id)).size).toBe(12);
    expect(new Set(MISSING_DETAILS.map(({ artKey }) => artKey)).size).toBe(12);
    expect(new Set(MISSING_DETAILS.map(({ axis }) => axis)).size).toBe(6);
    expect(MISSING_DETAILS.filter(({ polarity }) => polarity === 'risk')).toHaveLength(6);
    expect(MISSING_DETAILS.filter(({ polarity }) => polarity === 'safeguard')).toHaveLength(6);

    for (const axis of new Set(MISSING_DETAILS.map(({ axis }) => axis))) {
      expect(
        MISSING_DETAILS
          .filter((detail) => detail.axis === axis)
          .map(({ polarity }) => polarity)
          .sort(),
      ).toEqual(['risk', 'safeguard']);
    }

    for (const detail of MISSING_DETAILS) {
      expect(detail.title.length).toBeGreaterThan(3);
      expect(detail.detail.length).toBeGreaterThan(35);
      expect(detail.discussionCue.length).toBeGreaterThan(20);
      expect(detail.artAlt.length).toBeGreaterThan(20);
      expect(detail.artStatus).toBe('ready');
      expect(detail.scope).toBe('universal');
      expect(['risk', 'safeguard']).toContain(detail.polarity);
      expect(existsSync(new URL(`../assets/art/${detail.artKey}.png`, import.meta.url))).toBe(true);
      expect(detailById(detail.id)).toBe(detail);
    }

    expect(existsSync(new URL('../assets/art/table-backdrop.png', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../assets/art/scenario-card-back.png', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../assets/art/curveball-card-back.png', import.meta.url))).toBe(true);
  });
});
