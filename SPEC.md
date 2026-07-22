# IT DEPENDS — local alpha specification

Status: greenlit for local development by Ben on 2026-07-22. No publishing, deployment, storefront work, spending, or physical production is authorized.

## Goal

Build a shared-screen privacy teaching game that makes the room commit to a call, reveals one missing fact, and asks the room to make the call again. The useful output is the reasoning and the change, not a score or a legal answer key.

The loop is deliberately small:

1. Deal a Request card.
2. The room chooses **Ship**, **Slow**, or **Stop**.
3. Discuss why.
4. Reveal a Curveball from a different card.
5. The room chooses again.
6. Debrief what changed, what did not, and what fact is still missing.

Anyone can run the round. The screen supplies the instructions and pacing; no trained facilitator is required.

## Product shape

- Free browser teaching edition for Advokat Frida.
- One shared screen; no accounts, player names, multiplayer service, scoring, analytics, telemetry, cookies, or saved history.
- Twelve-card private alpha. Public v1 target: 34 dual-use Decision cards.
- A Decision card has both a Request and a broadly compatible Curveball. The app draws two different cards and uses the first card's Request plus the second card's Curveball.
- No repeated physical card within the first six alpha rounds. A new session reshuffles.
- No correct answer. Ship, Slow, and Stop are discussion positions, not legal determinations.
- The canonical card data should later feed the browser app, self-print cards, and a professionally printed physical deck.

## Touched surfaces

- New sibling repo: `advokat-frida/it-depends/`.
- Static multi-file runtime under `dist/`: small HTML, normal CSS/JS modules, self-hosted fonts, and separate image files.
- Advokat Frida `FAMILY-CHROME.md`: derived component anatomy for the tabletop, card, vote row, phase rail, and call-shift summary.
- No Ghost post, theme asset copy, live URL, or Epsilon change in this milestone.

## Architecture

- Source: `src/index.html`, `src/styles.css`, `src/app.js`, `src/core.js`, `src/cards.js`.
- Art: `assets/art/` with one file per approved card illustration. Missing alpha art renders an intentional numbered specimen mat, never a broken-image icon.
- Fonts: normal self-hosted `.woff2` files under `assets/fonts/`; no Base64 embedding.
- Build: copy the static modules and assets to `dist/` without bundling them into one document.
- Security: restrictive CSP; no active network API; no storage. Normal same-origin static asset requests are expected. The UI claims no tracking, not “fully offline.”
- Randomness: a shuffled deck from Web Crypto in the runtime; injectable deterministic randomness in tests.

## State machine

`WELCOME → REQUEST_VOTE → REQUEST_DISCUSS → CURVEBALL_REVEAL → SECOND_VOTE → DEBRIEF → NEXT`

Transitions are explicit. A vote must be recorded before its discussion/reveal action becomes available. The reveal never auto-advances. A round can be restarted without mutating the deck order; a session restart creates a fresh order.

## Alpha content contract

Each card includes:

```text
id, title, request, requestTopics[], requestAction,
curveball, curveballAxis, discussionCue,
artKey, artAlt, artStatus, sourceNotes[], verifiedAsOf
```

There is deliberately no `correctAnswer` field.

All alpha Requests describe a concrete proposed data use or operational shortcut. All Curveballs are cross-cutting facts that remain coherent when paired with any other Request. Content avoids real companies, real incidents, trademark bait, named products, and jurisdiction-specific claims that would turn the game into an answer key.

## Art system: AF After Dark, object-first

Working art name: **Privacy aftermath still lifes**.

- Zero human faces in the alpha art. Prefer no people at all.
- Empty scenes and implicated objects: cabinets, sealed letters, keys, clocks, ledgers, lenses, listening tubes, mechanical eyes, evidence trays, pneumatic pipes, switches, specimen drawers, and abandoned workstations.
- Style reference: Advokat Frida Victorian After Dark stickers — dark engraved linework, deep forest and midnight teal, oxblood accents, parchment highlights, dull brass, printed chromolithograph texture, attractive-first absurdity.
- Generated files are illustration only: no card frame, typography, letters, numbers, logos, watermark, real interface, or third-party game symbols.
- The deterministic HTML/CSS card supplies the original AF frame and all text. This keeps copy editable and avoids generated spelling errors.
- Canvas contract: portrait master, central object hierarchy, quiet top and bottom crop zones, robust at a roughly 360 × 504 CSS-pixel card and a 5:7 future print window.
- First visual gate: three original masters representing (1) the pneumatic support inbox, (2) the listening badge and data cabinet, and (3) the incident evidence ledger. The remaining nine alpha cards carry authored art briefs and intentional mats until separately generated and approved.

Reference files inspected before generation:

- `stickers/privacy-ai-set-10-victorian-after-dark-small-signature/proofs/set-10-selection-board.png`
- `stickers/privacy-ai-set-10-victorian-after-dark-small-signature/artwork/02-miracle-consent-tonic.png`
- `stickers/privacy-ai-set-10-victorian-after-dark-small-signature/artwork/04-the-common-tracking-pixel.png`
- `stickers/gdpr-deck-01-dark-victorian-dystopia/proofs/physical/article-15-right-of-access-2.5x3.5in-300dpi.png` (frame-density reference only; people are not carried forward)

## Interaction and accessibility

- Ship / Slow / Stop are three equal-size buttons with text, distinct icons, and color; color is never the only signal.
- Full keyboard path. Focus moves to the newly revealed phase heading.
- The current phase is announced in a polite live region.
- Card art has scenario-specific alt text; decorative frame detail is hidden from assistive technology.
- No drag, hover-only instruction, countdown pressure, or required animation.
- Motion is limited to transform/opacity and disabled under reduced-motion preference.
- Desktop shows a centered two-card table after reveal. Mobile stacks the cards and keeps the voting controls immediately after the active card.

## Acceptance

- A new visitor can understand the loop and start without reading a manual.
- The app deals two different cards, records the first room call, reveals the paired Curveball only after discussion, records the second call, and shows an accurate before/after debrief.
- Six alpha rounds consume all twelve cards without repetition; the seventh starts a fresh shuffled session only after an explicit restart.
- Every one of the 132 non-self ordered alpha Request/Curveball pairings passes the authored compatibility gate.
- No answer key, score, legal conclusion, or “best” vote appears.
- The built page loads from a local HTTP server at 1440 px and 390 px with no console errors, no external requests, and no storage writes.
- It visually reads as the same AF family as Build-A-Prompt while the play surface reads as AF After Dark.
- Exact runtime art is manually inspected at native size, literal card display size, desktop context, and mobile context before it can be marked final.

## Named tests (written before implementation)

- `deals two distinct cards from the remaining deck`
- `uses every alpha card once across six rounds`
- `does not reveal a curveball before the first discussion gate`
- `records the room call before and after the reveal`
- `reports changed and unchanged calls accurately`
- `every non-self request curveball pairing is authored as compatible`
- `ships no correct answer field or answer-key copy`
- `built page references separate local modules fonts and art`
- `built page contains the AF skeleton and IT DEPENDS phase landmarks`
- `runtime completes one full keyboard-playable round at desktop and mobile widths`
- `runtime makes no external requests and writes no browser storage`

## Out of scope for this milestone

- Public deployment or a Ghost companion post.
- Physical-card imposition, print vendor templates, packaging, sales, or marketplace listing.
- Full 34-card copy and full 34-illustration production.
- Accounts, remote multiplayer, player-by-player voting, scores, leaderboards, saved sessions, facilitator dashboard, or legal citations on every card.
- Law packs, topic filtering, purchased-deck unlocks, SaaS entitlements, and Epsilon migration.

## Expansion path

After the loop survives real play, expand the same canonical schema into a 34-card Core deck, then optional topic/law collections. A collection adds cards and art, not new game rules. The browser edition can later accept a deck manifest selected by the facilitator while keeping the same tiny state machine.
