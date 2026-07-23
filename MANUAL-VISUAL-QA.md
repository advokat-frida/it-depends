# Manual visual QA: IT DEPENDS private alpha

Date: 2026-07-22

## Verdict

- Twelve selected linocut/screenprint card-window masters: **PASS**
- Shared illustrated table backdrop: **PASS**
- All-card runtime sheet at literal 360 x 650 CSS-pixel card size: **PASS**
- Desktop runtime at 1440 px: **PASS**
- Mobile runtime at 390 px: **PASS**
- Equal Request/Curveball geometry and bottom-right chips: **PASS**
- Keyboard, reduced-motion, network, and storage checks: **PASS**
- New private hosted Sites version 3: **PASS**
- Public release, Ghost integration, and physical print package: **NOT IN SCOPE**

## Reference and style inspection

The exact owned references in `ART-DIRECTION.md` were opened at original resolution before generation. They established the AF After Dark palette, printed texture, authoritative object design, and attractive-first absurdity. Human-centered compositions were explicitly rejected.

Three exact Risk Scales proofs were opened at 1060 x 1484. Ben selected A, the bold Victorian linocut/screenprint treatment. It has the clearest graphic silhouette, least photographic material rendering, and strongest fit with a tabletop game. B was softer and more storybook-like; C was energetic but visually louder and more poster-like than the desired deck.

## Exact native masters inspected

Every file below was opened from `assets/art/` at original resolution after final copying or normalization.

1. `support-inbox.png`: **PASS**. Three tubes, the avalanche of blank envelopes, dark inbox, mechanical scribe, blank ledger, tick-only clock, and open drawer remain distinct. No characters, numerals, person, logo, watermark, or recognizable product appears.
2. `risk-scales.png`: **PASS**. The oversized lens, three-pan balance, sealed tokens, and green/teal/oxblood chutes form one immediate visual equation. The five-ink print texture is strong and no realistic gloss or text remains.
3. `clockwork-floor.png`: **PASS**. Five tick-only clocks, three empty chairs, two observation lenses, and a central blank-token conveyor read cleanly after the center normalization crop. No numeral, worker, silhouette, or pseudo-writing appears.
4. `trust-badge.png`: **PASS**. The blank rosette, lock, listening horn, mismatched keys, and abstract profile tiles survive normalization. The rosette is generic, not a real police, military, vendor, or certification mark.
5. `voice-vault.png`: **PASS**. Speaking horn, blank recording cylinder, vault, unused key, and hourglass retain clear hierarchy after normalization. There is no mouth, ear, face, waveform, or writing.
6. `occupancy-lens.png`: **PASS**. The large ceiling lens, falling colored beads, hourglass, three empty chairs, three trays, and cleaning bell remain balanced after normalization. The chairs are visibly empty and contain no body trace.
7. `endless-archive.png`: **PASS**. The red recorder, blank paper stream, one open drawer, short stack, and receding wall of blank drawers make the retention joke legible without labels or calendar text.
8. `intake-switchboard.png`: **PASS**. Red, teal, and green envelope paths converge on an unlabeled switchboard while the old mailbox slot remains open. The correction removed the generated dial-like glyph; every plate and control is blank.
9. `preference-organ.png`: **PASS**. One large lever, colored preference cylinders, and the letter, speaking-tube, and blank-device routes read as three channels. The dial uses ticks only and contains no interface or word.
10. `incident-ledger.png`: **PASS**. The blank grid, tick-only stopped clock, scorched tray, cracked vial, keys, fragments, and oxblood thread form a coherent response desk without generated writing.
11. `specimen-export.png`: **PASS**. Rows of flat teal specimen tiles contrast with distinctive oxblood, black, and brass fragments in the straw and second compartment. The nearby folio has broad blank rule lines only.
12. `age-alchemy.png`: **PASS**. The gate, anonymous circular token, unequal weights, lenses, hourglass, and empty proof trays remain object-only and diagrammatic. The token does not resemble a person or identity document.
13. `table-backdrop.png`, 1672 x 941: **PASS**. The quiet forest center supports overlays while the perimeter tube, blank envelopes, three lamps, lens, keys, book, hourglass, and corrected blank ledger remain visible. No card, dice, poker object, person, logo, or readable mark appears.

The exact dimensions and SHA-256 hashes are in `ART-DIRECTION.md`.

## Literal runtime card inspection

`harness/capture-art.mjs` played all six rounds with deterministic randomness, cloned the exact card DOM after each reveal, verified twelve unique art keys, and captured `shots/all-card-art-desktop.png`.

The screenshot was opened at original 1440 x 2832 resolution. It displays every card at the actual 360 x 650 CSS-pixel runtime size in three columns.

Visible findings:

- All twelve 4:3 art-window crops preserve the subject's first read.
- The selected linocut system is coherent across the full set without collapsing the scenarios into minor variations.
- Request and Curveball cards have exactly the same height and art-window geometry.
- Titles, body copy, proposals, and Curveball facts remain readable and unclipped.
- Multi-topic and single-axis chip rows sit at the bottom right on both card faces.
- No art contains human imagery, generated text, logo-like brand bait, or visible third-party trade dress.
- No card shows a broken image, pending specimen mat, content overflow, or missing chip.

## Exact product context inspected

The following browser captures were reopened at original resolution after the final art promotion:

- `shots/welcome-desktop-1440.png`
- `shots/request-desktop-1440.png`
- `shots/reveal-desktop-1440.png`
- `shots/debrief-desktop-1440.png`
- `shots/incident-request-desktop-1440.png`
- `shots/reveal-mobile-390.png`

Visible findings:

- **AF family parity:** Anton masthead, Space Grotesk reading text, Archivo labels, square 2px frames, paper ground, forest actions, and restrained amber remain consistent with the AF standalone-tool family.
- **Illustrated table:** the flat linocut table backdrop is clearly visible around the interface. The dark overlay protects white text and card contrast without erasing the art.
- **Setup clarity:** the welcome state says no referee is required, explains the shared-screen handoff, and presents a clear 2-8 player stepper with three players as the default.
- **Hidden turns:** the active numbered player is prominent; completed seats reveal only that a vote occurred, not which choice was made.
- **Desktop vote state:** the Request is centered above a three-choice panel. Ship, Slow, and Stop are equal controls with icon, color, and text.
- **Debrief:** equal-size Request and Curveball cards remain aligned above majority before/after results and player-by-player changes. The full tallies are available without overwhelming the main debrief.
- **Mobile:** both equal-height cards stack at the same x-position, the first-vote recap remains available, the next numbered player is clear, and no horizontal crop or overflow is visible at 390 px.
- **Table continuity:** table art remains visible at welcome, vote, reveal, and debrief states and never competes with legal boundary text below the play surface.

## Mechanical checks after visual review

- Vitest: 3 files and 12 tests pass.
- Card assets: twelve ready card files plus the table backdrop exist and load.
- Pair enumeration: 132 of 132 non-self ordered combinations pass the domain gate; human rationale remains in `PAIRING-REVIEW.md`.
- Strict majority: 2-1-1 and 2-2 among four players return No majority; 3-1 returns the selected majority.
- Browser harness: all multiplayer tally, equal-height, chip alignment, desktop, mobile, keyboard, network, console, page-error, and storage checks pass.
- Runtime writes zero localStorage, sessionStorage, or IndexedDB records.
- Runtime makes zero external requests. All HTML, modules, CSS, fonts, and art are separate same-origin files.
- Build output contains no Base64 image or font payloads.

## Hosted verification

Sites version 3 was saved from commit `f711f9a7524a41c04df26a0f8fa67716550c577f`, deployed with owner-only access, and opened at `https://it-depends-demo.tanjamin-ben.chatgpt.site/demo/?release=f711f9a`.

Live findings:

- The cache-busted URL loaded the new no-facilitator setup, 2-8 player control, proposal terminology, and numbered hidden-vote instructions.
- A three-player hosted round dealt a Request, recorded Ship / Ship / Slow, and revealed every player's selection with the exact result `The majority chose Ship.`
- Revealing the missing fact produced a same-size Request/Curveball pair and a fresh numbered second vote. Both hosted card images reported complete at their exact 1060 x 1484 source dimensions.
- Before the temporary responsive-test override, the hosted card reported the intended 360 x 650 CSS-pixel geometry with zero horizontal overflow. The override was reset and the deliverable tab was reloaded at a normal 1280 x 800 viewport.
- The hosted `table-backdrop.png` and a freshly dealt `occupancy-lens.png` were downloaded through the rendered page's asset inventory and matched the exact local masters byte-for-byte by SHA-256 (`43a2a6dd...` and `14c020ea...`). The approved local visual inspection therefore covers the exact raster files served in production.
- The live console returned no warnings or errors.

The deterministic browser harness remains the full six-round, desktop, mobile, keyboard, and debrief check. The owner-only live readback verifies that the same validated build and selected raster masters reached the hosted demo.

## Fail-closed boundary

The private alpha is visually complete for browser play. It is not a public or physical release candidate. The 34-card Core deck, print imposition, physical proofing, storefront package, public AF navigation, and legal/product review remain separately gated.
