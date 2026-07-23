# IT DEPENDS private-alpha specification

Status: greenlit by Ben on 2026-07-22. Local development and owner-only Sites demos are authorized. Public publishing, Ghost navigation, storefront work, spending, and physical production are not authorized.

## Goal

Build a shared-screen privacy teaching game that makes each player commit to a choice, reveals one missing fact, and asks everyone to choose again. The useful output is the reasoning, the disagreements, and the change. There is no score or legal answer key.

One round:

1. Deal a Request card and read its proposal.
2. Each player privately chooses **Ship**, **Slow**, or **Stop** on the shared screen.
3. Reveal every numbered selection and the strict-majority result. A plurality is never promoted to a majority.
4. Let each player name the fact or assumption behind the choice.
5. Flip the top card of the face-down IT DEPENDS Curveball deck, revealing a Curveball from a different card.
6. Repeat the private numbered vote.
7. Compare the majority result and every player's before/after choice, then discuss what changed, held, or remains unknown.

No dedicated facilitator is required. One person reads the cards and taps Deal or Reveal. The screen handles order, hidden turns, tallying, and pacing.

## Product shape

- Free browser teaching edition for Advokat Frida.
- One shared screen for 2-8 players.
- No player names, accounts, remote multiplayer service, scoring, analytics, telemetry, cookies, or saved history.
- Twelve-card private alpha. Public v1 target remains a 34-card Core deck only after playtesting.
- A Decision card contains both a Request and a broadly compatible Curveball. The app draws two different cards and uses the first card's Request plus the second card's Curveball.
- The browser presents these as two physical-feeling decks with distinct backs: a forest Scenario deck and an oxblood IT DEPENDS Curveball deck. The backs are deterministic HTML/CSS, not generated raster art or borrowed playing-card trade dress.
- Six rounds consume all twelve alpha cards without repetition. Restarting explicitly reshuffles.
- No correct answer. Ship, Slow, and Stop are discussion positions, not legal determinations.
- The canonical card data can later feed the browser app, self-print cards, and a professionally printed physical deck.

## Touched surfaces

- Repo: `advokat-frida/it-depends/`.
- Static multi-file runtime under `public/demo/`: HTML, CSS, JS modules, self-hosted fonts, and separate PNG files.
- Standard Sites wrapper and the existing owner-only Sites project.
- No Ghost post, AF navigation change, storefront listing, Epsilon change, or public release in this milestone.

## Architecture

- Source: `src/index.html`, `src/styles.css`, `src/app.js`, `src/core.js`, `src/cards.js`.
- Art: twelve 1060 x 1484 card-window PNGs plus one 1672 x 941 table backdrop under `assets/art/`.
- Fonts: normal self-hosted WOFF2 files under `assets/fonts/`; no Base64 embedding.
- Build: copy the static modules and assets to `public/demo/`, then package the standard Sites runtime.
- Security: restrictive CSP, no active network API, and no browser storage. Normal same-origin static asset requests are expected.
- Randomness: a shuffled deck from Web Crypto in the runtime; injectable deterministic randomness in tests.

## State machine

`WELCOME -> REQUEST_VOTE -> REQUEST_DISCUSS -> SECOND_VOTE -> DEBRIEF -> NEXT`

`REQUEST_VOTE` and `SECOND_VOTE` remain active until exactly one valid choice has been collected for every configured player. Earlier choices stay hidden during collection. The result is revealed only when the final player votes.

The majority threshold is `floor(playerCount / 2) + 1`. A 2-1-1 or 2-2 result among four players is **No majority**, not a plurality win.

Player count can change only before the first Request is dealt. A restart keeps the chosen player count and reshuffles the deck.

## Alpha content contract

Each card includes:

```text
id, title, request, requestTopics[], proposal,
curveball, curveballAxis, discussionCue,
artKey, artAlt, artStatus, sourceNotes[], verifiedAsOf
```

There is deliberately no `correctAnswer` field.

All Requests describe a concrete proposed data use or operational shortcut. All Curveballs are cross-cutting implementation facts that remain coherent when paired with any other Request. Content avoids real companies, real incidents, trademark bait, named products, and jurisdiction-specific claims that would turn the game into an answer key.

Durations use comparable units where a contrast is the point. The retention request says **365 days instead of 30 days**, not "a year instead of 30 days."

## Art system: AF After Dark linocut

Working art name: **Privacy aftermath still lifes**.

- Style selected by Ben: variation A, bold Victorian linocut and screenprint.
- Flat five-ink logic, chunky carved contours, broad shadow masses, expressive crosshatching, imperfect registration, and paper speckle.
- Near-black, deep forest, midnight teal, oxblood, parchment, and dull-brass ink.
- Zero human faces, bodies, hands, or silhouettes. Objects and empty rooms carry the story.
- No generated card frame or wording. HTML/CSS supplies every title, scenario, label, chip, and accessible name.
- No letters, numbers, pseudo-writing, logos, real interfaces, or third-party game symbols inside the illustration files.
- Every card master is 1060 x 1484 and must survive the runtime's 4:3 center crop. The table backdrop is 1672 x 941 with a deliberately quiet center.
- AI origin, prompts, source-output IDs, corrections, dimensions, hashes, and selection proofs are recorded in `ART-DIRECTION.md`.
- These are private-alpha raster masters. They have not received print prepress or physical proofing.

## Interaction and accessibility

- Ship / Slow / Stop are equal-size buttons with text, distinct icons, and color. Color is never the only signal.
- Each hidden turn identifies the current numbered player and shows only which seats have completed a vote, never their choices.
- Full keyboard path. Focus moves to the new phase heading after each action.
- The current player, result, and phase changes are announced in a polite live region.
- Every completed vote reveals the strict-majority or No-majority result, all player selections, and the Ship/Slow/Stop totals.
- Card art has scenario-specific alt text; decorative table art is CSS background imagery.
- No drag, hover-only instruction, countdown pressure, or required animation.
- Motion is limited to transform/opacity. The top Curveball turns in place over 620 ms when motion is allowed; reduced-motion users receive the revealed face immediately.
- Desktop uses three fixed lanes: face-up Scenario at left, face-down/revealed Curveball stack in the middle, and the standard cream choice or first-vote rail at right. The three lanes fit in one 1440 x 1100 viewport after the table is brought to the top.
- Before reveal, the Curveball back occupies exactly the same 308 x 540 CSS-pixel footprint as the Scenario card. After reveal, Request and Curveball faces remain equal size. Mobile stacks Scenario, Curveball, and rail in DOM order.
- Thin brass table outlines, privacy-lock motifs, and separate forest/oxblood deck systems provide the casino-table geometry without suits, chips, gambling copy, or copied game language.
- Topic and Curveball chips are bottom-right aligned on both card faces.

## Acceptance

- A new visitor can understand the loop, choose 2-8 players, and start without a manual.
- No trained facilitator is required.
- Every configured player gets exactly one hidden numbered choice per vote.
- A result appears only after the final choice, includes every selection, and uses a strict majority.
- The app reveals the paired Curveball only after the first vote and discussion gate.
- Scenario and Curveball backs are visibly distinct, and the face-down Curveball remains hidden through the first-vote discussion.
- Activating **Flip the Curveball** replaces the top back with the paired face in the same card slot. The remaining stack stays visibly present behind it.
- The debrief accurately compares the majority result and every player before and after the fact.
- Six rounds consume all twelve cards without repetition.
- Every one of the 132 non-self ordered alpha Request/Curveball pairings passes the authored compatibility gate.
- No answer key, score, legal conclusion, or best vote appears.
- All twelve card illustrations and the table backdrop load as separate local files.
- The built page works at 1440 px and 390 px with no horizontal overflow, console/page errors, external requests, or storage writes.
- Exact runtime art is directly inspected at native size, 308 x 540 card size, desktop context, and mobile context before promotion.

## Named verification

- Unit tests cover distinct dealing, full deck exhaustion, complete-vote reveal gates, numbered selection recording, strict majority, split outcomes, result shifts, player-count bounds, card schema, asset presence, pairing compatibility, and absence of answer-key fields.
- Browser harness covers multiplayer tallying, unique card-back identity, hidden/revealed Curveball state, in-place flip structure and timing, equal card height, cream-rail geometry, bottom-right chips, desktop/mobile overflow, keyboard completion, image loading, network isolation, console/page errors, and zero storage writes.
- `harness/capture-art.mjs` deals all six rounds and captures all twelve unique runtime cards at literal 308 x 540 CSS-pixel size.
- `harness/capture-flip.mjs` freezes the 620 ms transform at five points so the back, edge turn, revealed face, remaining deck, and final fallback can be inspected directly.

## Out of scope

- Public deployment, Ghost companion post, or AF navigation link.
- Physical-card imposition, print-vendor templates, packaging, sales, or marketplace listing.
- Full 34-card copy and illustration production.
- Networked multiplayer, remote phones, player identity, accounts, facilitator dashboard, leaderboards, or saved sessions.
- Law packs, topic filtering, purchased-deck unlocks, SaaS entitlements, and Epsilon migration.

## Expansion path

After the loop survives real play, expand the same canonical schema into a 34-card Core deck, then optional topic or law collections. A collection adds cards and art, not new game rules. A future browser edition may accept a deck manifest selected by the group while keeping the same state machine and no-account default.
