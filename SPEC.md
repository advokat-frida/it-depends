# IT DEPENDS public-alpha specification

Status: the public alpha was greenlit by Ben on 2026-07-22. The Universal Core revision was approved on 2026-07-23, and its v0.2.0 GitHub Pages deployment was authorized on 2026-07-23. Ghost navigation, storefront work, spending, commercial licensing, and physical production remain separately gated. The earlier owner-only Sites demo is historical and remains untouched.

## Goal

Build a shared-screen privacy teaching game that makes one principle visible: a small implementation detail can change the call. Each player commits to a choice, meets one missing fact, and chooses again. The useful output is the reasoning, the disagreements, and what changed or held. There is no score or legal answer key.

## Editorial frame

The game and its eventual companion article share one thesis: **privacy decisions often turn on a small implementation detail that the headline leaves out**.

- Do not lead the article with the card mechanics. Lead with the familiar experience of two sensible people answering the same privacy question differently because each is assuming a different fact.
- Use the game loop as the demonstration: commit to a call, expose one hidden detail, make the call again, then name what changed or held.
- Treat an unchanged vote as evidence too. The lesson is not that every Missing Detail must reverse the room; it is that the room should be able to say whether the new fact was decision-relevant and why.
- Frame “it depends” as a demand for specificity, not an escape hatch. The useful next question is: **what does it depend on?**
- End by inviting readers to play a round and notice which details actually move them. Do not present the game as a legal-answer generator.

One round:

1. Deal a Request card and read its proposal.
2. Each player privately chooses **Ship**, **Slow**, or **Stop** on the shared screen.
3. Reveal every numbered selection and the strict-majority result. A plurality is never promoted to a majority.
4. Let each player name the fact or assumption behind the choice.
5. Flip the top card of the face-down IT DEPENDS deck, revealing an independently authored Missing Detail.
6. Repeat the private numbered vote.
7. Compare the majority result and every player's before/after choice, then discuss what changed, held, or remains unknown.

No dedicated facilitator is required. One person reads the cards and taps Deal or Reveal. The screen handles order, hidden turns, tallying, and pacing.

## Product shape

- Free browser teaching edition for Advokat Frida.
- One shared screen for 2-8 players.
- No player names, accounts, remote multiplayer service, scoring, analytics, telemetry, cookies, or saved history.
- Universal Core: twelve Scenario cards and twelve independently authored Missing Detail cards.
- The app shuffles the two decks independently. A six-round session samples six unique Scenarios and six unique Missing Details; restarting explicitly reshuffles both full decks.
- The browser presents these as two physical-feeling decks with distinct illustrated backs: a forest Scenario deck and an oxblood IT DEPENDS Missing Detail deck. Original raster art carries the object-based scene; deterministic HTML/CSS carries every label, accessible name, border, and layout. Neither back borrows playing-card trade dress.
- Every Core Missing Detail is universal. All 144 Scenario/Detail combinations must read naturally without inventing an unstated vendor, account, model, camera, region, or other scenario-specific architecture.
- Missing Details are balanced across six decision axes. Each axis contains one risk fact and one safeguard so the second vote is not trained to move in only one direction.
- No correct answer. Ship, Slow, and Stop are discussion positions, not legal determinations.
- The canonical card data can later feed the browser app, self-print cards, and a professionally printed physical deck.

## Touched surfaces

- Repo: `advokat-frida/it-depends/`.
- Standalone static output under `dist/standalone/IT-DEPENDS/`: HTML, one bundled classic script, self-hosted CSS/fonts, and separate PNG files.
- Versioned archive under `release/IT-DEPENDS-v0.1.1-standalone.zip`.
- Manual GitHub Pages workflow under `.github/workflows/pages.yml`; it builds, verifies, and deploys the exact standalone folder from the public repository.
- The existing owner-only Sites project is not a dependency or deployment target.
- No Ghost post, AF navigation change, storefront listing, Epsilon change, or physical release in this milestone.

## Architecture

- Source: `src/index.html`, `src/styles.css`, `src/app.js`, `src/core.js`, `src/cards.js`.
- Art: twelve Scenario and twelve Missing Detail exact 1448 x 1086 (4:3) card-window PNGs, two exact 948 x 1659 (4:7) browser-back PNGs, and one 1672 x 941 table backdrop under `assets/art/`.
- Fonts: normal self-hosted WOFF2 files under `assets/fonts/`; no Base64 embedding.
- Build: copy HTML, CSS, fonts, and art into the standalone folder; bundle the JavaScript module graph as a classic IIFE so direct local-file execution does not depend on module loading or a web server.
- Package: add a plain-English local README and a SHA-256 release manifest, then produce a deterministic ZIP with one `IT-DEPENDS/` root.
- Hosting option: the same verified folder can be served unchanged by an ordinary static host. The manual Pages workflow builds and runs the full QA gate before uploading that folder.
- Security: restrictive CSP, no active network API, and no browser storage. The offline edition permits only its own local static-file requests.
- Randomness: a shuffled deck from Web Crypto in the runtime; injectable deterministic randomness in tests.

## State machine

`WELCOME -> REQUEST_VOTE -> REQUEST_DISCUSS -> SECOND_VOTE -> DEBRIEF -> NEXT`

`REQUEST_VOTE` and `SECOND_VOTE` remain active until exactly one valid choice has been collected for every configured player. Earlier choices stay hidden during collection. The result is revealed only when the final player votes.

The majority threshold is `floor(playerCount / 2) + 1`. A 2-1-1 or 2-2 result among four players is **No majority**, not a plurality win.

Player count can change only before the first Request is dealt. A restart keeps the chosen player count and reshuffles the deck.

## Alpha content contract

Each Scenario includes:

```text
id, title, request, requestTopics[], proposal,
artKey, artAlt, artStatus, sourceNotes[], verifiedAsOf
```

Each Missing Detail includes:

```text
id, title, detail, axis, polarity, discussionCue,
artKey, artAlt, artStatus, scope, sourceNotes[], verifiedAsOf
```

There is deliberately no `correctAnswer` or preferred-call field.

All Requests describe a concrete proposed data use or operational shortcut. All Core Missing Details use only concepts guaranteed by every Scenario: the proposal, data involved, underlying data, reviewed scope, real use, access, purpose, evidence, and ownership. Content avoids real companies, real incidents, trademark bait, named products, and jurisdiction-specific claims that would turn the game into an answer key.

The six paired Core axes are retention, access, scope, purpose, operational ownership, and evidence quality. A Core Detail receives `scope: universal`. Future specialist Details may declare compatibility tags, but they are not admitted to the universal shuffle or represented as universal.

Durations use comparable units where a contrast is the point. The retention request says **365 days instead of 30 days**, not "a year instead of 30 days."

## Art system: AF After Dark linocut

Working art name: **Privacy aftermath still lifes**.

- Style selected by Ben: variation A, bold Victorian linocut and screenprint.
- Flat five-ink logic, chunky carved contours, broad shadow masses, expressive crosshatching, imperfect registration, and paper speckle.
- Near-black, deep forest, midnight teal, oxblood, parchment, and dull-brass ink.
- Zero human faces, bodies, hands, or silhouettes. Objects and empty rooms carry the story.
- No generated wording. HTML/CSS supplies every title, scenario, back label, border, chip, and accessible name.
- No letters, numbers, pseudo-writing, logos, real interfaces, or third-party game symbols inside the illustration files.
- Every face-art master is exact 1448 x 1086 (4:3), so the runtime no longer center-crops portrait art into its landscape window. Each browser-back master is exact 948 x 1659 (4:7); a future 5:7 physical back remains a separate print task. The table backdrop is 1672 x 941 with a deliberately quiet center.
- AI origin, prompts, source-output IDs, corrections, dimensions, hashes, and selection proofs are recorded in `ART-DIRECTION.md`.
- These are browser-alpha raster masters. They have not received print prepress or physical proofing.

## Interaction and accessibility

- Ship / Slow / Stop are equal-size buttons with text, distinct icons, and color. Color is never the only signal.
- Each hidden turn identifies the current numbered player and shows only which seats have completed a vote, never their choices.
- Full keyboard path. Focus moves to the new phase heading after each action.
- The current player, result, and phase changes are announced in a polite live region.
- Every completed vote reveals the strict-majority or No-majority result, all player selections, and the Ship/Slow/Stop totals.
- Card art has scenario-specific alt text; decorative table art is CSS background imagery.
- No drag, hover-only instruction, countdown pressure, or required animation.
- Motion is limited to transform/opacity. The top Missing Detail turns in place over 620 ms when motion is allowed; reduced-motion users receive the revealed face immediately.
- Desktop uses three fixed lanes: face-up Scenario at left, face-down/revealed IT DEPENDS stack in the middle, and the standard cream choice or first-vote rail at right. The three lanes fit in one 1440 x 1100 viewport after the table is brought to the top.
- Before reveal, the IT DEPENDS back occupies exactly the same 308 x 540 CSS-pixel footprint as the Scenario card. Its 4:7 artwork fills that geometry without stretching. After reveal, Scenario and Missing Detail faces remain equal size. Mobile stacks Scenario, Missing Detail, and rail in DOM order.
- Thin brass table outlines, privacy-lock motifs, and separate forest/oxblood deck systems provide the casino-table geometry without suits, chips, gambling copy, or copied game language.
- Topic, axis, and polarity chips are bottom-right aligned on both card faces.

## Acceptance

- A new visitor can understand the loop, choose 2-8 players, and start without a manual.
- No trained facilitator is required.
- Every configured player gets exactly one hidden numbered choice per vote.
- A result appears only after the final choice, includes every selection, and uses a strict majority.
- The app reveals the independently dealt Missing Detail only after the first vote and discussion gate.
- Scenario and IT DEPENDS backs are visibly distinct, and the face-down Missing Detail remains hidden through the first-vote discussion.
- Activating **Reveal the Missing Detail** replaces the top back with the paired face in the same card slot. The remaining stack stays visibly present behind it.
- The debrief accurately compares the majority result and every player before and after the fact.
- Six rounds consume six unique Scenarios and six unique Missing Details without repetition inside either deck.
- Every one of the 144 Universal Core Scenario/Missing Detail pairings passes the authored semantic review.
- No answer key, score, legal conclusion, or best vote appears.
- All twenty-four face illustrations, both deck-back illustrations, and the table backdrop load as separate local files.
- The built page works both over local HTTP and when `index.html` is opened directly at 1440 px and 390 px, with no horizontal overflow, console/page errors, external requests, or storage writes.
- The Scenario and IT DEPENDS back PNGs in the standalone folder and ZIP are byte-for-byte identical to the approved masters.
- The Pages workflow publishes the exact standalone folder only after an explicit manual dispatch from the public repository.
- Exact runtime art is directly inspected at native size, 308 x 540 card size, desktop context, and mobile context before promotion.

## Named verification

- Unit tests cover distinct dealing, full deck exhaustion, complete-vote reveal gates, numbered selection recording, strict majority, split outcomes, result shifts, player-count bounds, card schema, asset presence, pairing compatibility, and absence of answer-key fields.
- Browser harness covers multiplayer tallying, unique card-back identity, hidden/revealed Missing Detail state, in-place flip structure and timing, equal card height, cream-rail geometry, bottom-right chips, desktop/mobile overflow, keyboard completion, image loading, network isolation, console/page errors, and zero storage writes.
- Offline harness opens the exact built `index.html` through `file://`, completes desktop and mobile rounds, and checks the Scenario back, hidden IT DEPENDS stack, flip rear face, local-only requests, overflow, and runtime errors.
- Standalone verifier checks the manifest file set, byte counts, SHA-256 values, ZIP inventory, classic-script loading, CSP, and byte-exact back-art copies.
- `harness/capture-art.mjs` deliberately renders all twenty-four Core faces and captures them at literal 308 x 540 CSS-pixel size.
- `harness/capture-flip.mjs` freezes the 620 ms transform at five points so the back, edge turn, revealed face, remaining deck, and final fallback can be inspected directly.

## Out of scope

- Ghost companion post or AF navigation link.
- Physical-card imposition, print-vendor templates, packaging, sales, or marketplace listing.
- Full 34-card copy and illustration production.
- Networked multiplayer, remote phones, player identity, accounts, facilitator dashboard, leaderboards, or saved sessions.
- Law packs, topic filtering, purchased-deck unlocks, SaaS entitlements, and Epsilon migration.

## Expansion path

After the Universal Core survives real play, expansion happens in three layers:

1. Add universal Scenarios or Missing Details only after a fresh all-pairs semantic review.
2. Add specialist Details with explicit compatibility tags for AI, biometrics, workplace monitoring, incidents, public releases, children, and other domains. A tagged Detail should fit at least four Scenarios in its intended collection; one-off reveals belong in scripted case studies, not the random deck.
3. Add an optional Pressure deck for business constraints such as a promised launch date, an unavailable fallback, limited safeguard budget, or unavailable headcount. A Pressure is visible with the Scenario before the first vote so the two-vote loop remains unchanged.

A future browser edition may accept a selected deck manifest while keeping the same state machine and no-account default.
