# IT DEPENDS

Local alpha of an Advokat Frida shared-screen privacy teaching game.

Read a proposed data use, record the room's **Ship / Slow / Stop** call, reveal one missing fact from a different card, and make the call again. The game never supplies a correct answer. Its output is the argument and what changed.

## Current state

- Complete 12-card / 6-round mechanics alpha.
- 132 possible non-self ordered Request/Curveball pairings.
- Three provisional AF After Dark art masters integrated: `support-inbox`, `trust-badge`, and `incident-ledger`.
- Nine intentional specimen mats with authored art briefs. They are unfinished, not broken assets.
- Multi-file static game wrapped in the standard Sites runtime. HTML, modules, CSS, fonts, and art remain separate normal files; nothing is Base64-crammed into the page.
- No accounts, score, telemetry, storage, cookies, or active network API.
- The hosted demo is private and deliberately unlinked from the Advokat Frida website.

The build authorization and product boundary are in [SPEC.md](./SPEC.md). Pairing rationale is in [PAIRING-REVIEW.md](./PAIRING-REVIEW.md). Art provenance and prompts are in [ART-DIRECTION.md](./ART-DIRECTION.md). Visual verification is in [MANUAL-VISUAL-QA.md](./MANUAL-VISUAL-QA.md).

## Commands

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run harness
```

- `npm.cmd test` rebuilds the game, runs the Vitest suite, and verifies the deployable Sites bundle.
- `npm.cmd run harness` exercises desktop, mobile, keyboard, network, storage, and screenshot checks against the built files.
- `node harness/server.mjs` serves the built game at `http://localhost:8793` for local review.

## Structure

```text
assets/
  art/                 provisional card-window masters
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
app/                    tiny Sites entry route into the game
public/demo/            generated multi-file static game, gitignored
worker/                 Sites runtime entry point
dist/                   generated Sites bundle, gitignored
shots/                  exact inspected runtime screenshots
```

## Boundary

This is a synthetic teaching tool, not legal advice and not a compliance determination. No law pack, physical print package, store listing, Ghost post, or public AF navigation link is part of this alpha.
