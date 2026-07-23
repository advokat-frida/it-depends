# IT DEPENDS

An Advokat Frida shared-screen privacy teaching game.

**Play Universal Core v0.2.0:** https://advokat-frida.github.io/it-depends/

One small detail can change the call. Read a proposed data use, let every player choose **Ship / Slow / Stop**, reveal one Missing Detail, and vote again. The game shows exactly what changed, what held, and which detail mattered. It never supplies a correct answer.

## Universal Core

- Twelve independently shuffled Scenario cards and twelve independently shuffled Missing Detail cards.
- 144 authored Scenario/Detail combinations with no compatibility filter.
- Six decision axes: Retention, Access, Scope, Purpose, Ownership, and Evidence.
- One risk fact and one safeguard on each axis, so the second vote is not trained to move in only one direction.
- Six rounds per session, sampling six unique cards from each full deck.
- Twenty-four original object-first face illustrations, two illustrated backs, and one shared-table backdrop in the approved AF After Dark linocut/screenprint system.
- A three-lane tabletop: face-up Scenario, face-down or revealed IT DEPENDS stack, and a cream player-choice rail.
- Hidden numbered turns, strict-majority tallying, honest no-majority outcomes, and a before/after debrief.
- Two to eight players on one shared screen. No dedicated facilitator, account, score, telemetry, storage, cookies, or runtime API.
- Standalone-first static files. The generated edition opens directly through `file://` with no server or internet connection.

The product boundary is in [SPEC.md](./SPEC.md). The 144-pair semantic audit is in [PAIRING-REVIEW.md](./PAIRING-REVIEW.md). Art prompts, provenance, and hashes are in [ART-DIRECTION.md](./ART-DIRECTION.md). Direct visual inspection is recorded in [MANUAL-VISUAL-QA.md](./MANUAL-VISUAL-QA.md).

## Commands

```powershell
npm.cmd test
npm.cmd run harness
npm.cmd run harness:art
npm.cmd run harness:offline
npm.cmd run harness:flip
npm.cmd run build
npm.cmd run qa
```

- `npm.cmd test` rebuilds the game and runs the unit/static suite.
- `npm.cmd run harness` plays the browser flow across player counts, desktop/mobile layouts, keyboard use, motion preferences, network isolation, and storage isolation.
- `npm.cmd run harness:art` deals repeated deterministic sessions, collects all 24 unique faces, checks card overflow, and captures both literal-size review sheets.
- `npm.cmd run harness:offline` completes desktop and mobile rounds from the generated `index.html` opened directly from disk.
- `npm.cmd run harness:flip` captures five exact checkpoints across the 620 ms Missing Detail turn.
- `npm.cmd run build` creates the standalone folder under `dist/standalone/IT-DEPENDS/`.

`npm.cmd run qa` runs the complete release gate, including the versioned standalone archive and integrity verification.

## Structure

```text
assets/
  art/                 12 Scenario faces, 12 Missing Detail faces, 2 backs, table art
  fonts/               self-hosted WOFF2 files
src/
  index.html           AF page skeleton
  shared.css           AF family chrome
  styles.css           IT DEPENDS components
  cards.js             two canonical 12-card decks
  core.js              independent-deck and phase state machine
  app.js               accessible shared-screen runtime
test/                   unit and static-build tests
harness/                browser, offline, motion, and visual acceptance
tools/                  standalone build, packaging, and integrity checks
shots/                  exact runtime inspection evidence
```

## Boundary

This is a synthetic teaching tool, not legal advice or a compliance determination. No law pack, print package, store listing, Ghost article, or public AF navigation change is included here.

The repository is source-visible but deliberately `UNLICENSED`. Public access does not grant permission to copy, modify, or redistribute the code or artwork unless Advokat Frida later publishes separate terms.
