# IT DEPENDS

Private alpha of an Advokat Frida shared-screen privacy teaching game.

Read a proposed data use, let every player choose **Ship / Slow / Stop**, reveal the strict-majority result and every numbered selection, turn over one missing fact, and vote again. The game never supplies a correct answer. Its output is the argument and what changed.

## Current state

- Complete 12-card / 6-round mechanics alpha for 2–8 players on one shared screen.
- 132 possible non-self ordered Request/Curveball pairings.
- Twelve original object-first card illustrations, two illustrated deck backs, and one shared table illustration in the approved AF After Dark linocut/screenprint system.
- A three-lane privacy-table layout: face-up Scenario, face-down or revealed Curveball stack, and a cream player-choice rail.
- Distinct illustrated Scenario and IT DEPENDS Curveball backs with deterministic AF labels, plus an in-place top-card flip with a reduced-motion fallback.
- Hidden numbered turns, strict-majority tallying, honest no-majority outcomes, and a before/after result plus player-by-player debrief.
- Standalone-first static game. A player can unzip the package and open `IT-DEPENDS/index.html` directly; no server, installation, account, or internet connection is required.
- CSS, fonts, and art remain separate normal files. The small JavaScript module graph is bundled into one classic local script so current browsers permit direct `file://` play; nothing is Base64-crammed into the page.
- No accounts, score, telemetry, storage, cookies, active network API, or runtime dependency on Sites.
- A manual GitHub Pages workflow is staged but deliberately refuses to run while the repository is private. The earlier owner-only Sites demo is historical and is not the release source of truth.

The build authorization and product boundary are in [SPEC.md](./SPEC.md). Pairing rationale is in [PAIRING-REVIEW.md](./PAIRING-REVIEW.md). Art provenance and prompts are in [ART-DIRECTION.md](./ART-DIRECTION.md). Visual verification is in [MANUAL-VISUAL-QA.md](./MANUAL-VISUAL-QA.md).

## Commands

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run harness
npm.cmd run harness:offline
npm.cmd run harness:flip
npm.cmd run package
npm.cmd run verify:standalone
npm.cmd run qa
```

- `npm.cmd test` rebuilds the game, runs the Vitest suite, and verifies the standalone static output.
- `npm.cmd run harness` exercises multiplayer voting, distinct deck backs, hidden/revealed Curveball states, equal card geometry, the cream decision rail, desktop, mobile, keyboard, motion preference, network, storage, and screenshot checks against the built files.
- `npm.cmd run harness:offline` opens the built `index.html` directly from disk, completes desktop and mobile rounds, and proves that both illustrated backs survive the local-file path.
- `npm.cmd run harness:flip` captures five exact visual checkpoints across the 620 ms Curveball turn.
- `npm.cmd run package` creates the ignored private-alpha ZIP under `release/`.
- `npm.cmd run verify:standalone` validates the folder manifest, every SHA-256, the ZIP contents, and byte-exact copies of both back masters.
- `npm.cmd run qa` runs the complete build, test, browser, offline, flip, package, and archive-verification gate.
- `node harness/capture-art.mjs` captures all twelve exact runtime cards at their 308 x 540 CSS-pixel display size for direct visual review.
- `node harness/server.mjs` serves the built game at `http://localhost:8793` for local review.

## Structure

```text
assets/
  art/                 approved private-alpha card and table masters
  fonts/               normal self-hosted WOFF2 files
src/
  index.html           AF page skeleton
  shared.css           byte-copied AF family chrome
  styles.css           IT DEPENDS derived components
  cards.js             canonical 12-card alpha data
  core.js              pure deck and phase state machine
  app.js               accessible shared-screen runtime
test/                   named unit and static-build tests
harness/                browser acceptance and local server
tools/                  standalone build, package, and integrity checks
dist/standalone/
  IT-DEPENDS/           generated open-index.html edition, gitignored
release/                generated private-alpha ZIP, gitignored
.github/workflows/
  pages.yml             manual, public-repository-only Pages path
shots/                  exact inspected runtime screenshots
```

## Boundary

This is a synthetic teaching tool, not legal advice and not a compliance determination. No law pack, physical print package, store listing, Ghost post, public AF navigation link, repository visibility change, or public deployment is part of this alpha.
