# Manual visual QA — IT DEPENDS local alpha

Date: 2026-07-22

## Verdict

- Three provisional After Dark card-window masters: **PASS**
- Desktop runtime at 1440 px: **PASS**
- Mobile runtime at 390 px: **PASS**
- Keyboard and reduced-motion runtime: **PASS**
- Full 12-card art set: **PENDING / deliberately incomplete**
- Public release, Ghost integration, and physical print package: **NOT IN SCOPE**

## Reference inspection

The exact owned references listed in `ART-DIRECTION.md` were opened at original resolution before generation. The reference family established dark forest/teal/oxblood fields, parchment and dull-brass highlights, dense engraved texture, authoritative Victorian object design, and one immediate absurd privacy idea per image.

The alpha deliberately rejects the human-centered compositions in the GDPR card reference. The resulting visual rule is zero human faces and preferably no people at all.

## Exact native art inspected

1. `assets/art/support-inbox.png`, 1060 × 1484 — **PASS**. The packed pneumatic inbox is the first read; sealed correspondence, scribe arm, blank ledger, warning clock, and unlocked drawer remain distinct. The correction removed readable characters and Roman numerals. There is no person, face, logo, watermark, real product, or borrowed card frame.
2. `assets/art/trust-badge.png`, 1060 × 1484 — **PASS**. The blank brass rosette, locked cabinet, concealed listening horn, excessive key ring, and ajar profile drawer create one legible trust/surveillance joke. It does not reproduce a real police, military, vendor, or certification mark and contains no text or person.
3. `assets/art/incident-ledger.png`, 1060 × 1484 — **PASS**. The open gridded ledger, stopped unlabeled watch, scorched tray, evidence thread, keys, vial, and lens read as a coherent abandoned response desk. The watch correction removed Roman numerals. There is no readable text or human element.

All three exact workspace files were opened at original resolution after copying from the built-in generator output. Hashes are recorded in `ART-DIRECTION.md`.

## Exact runtime context inspected

The following generated browser screenshots were opened at original resolution:

- `shots/welcome-desktop-1440.png`
- `shots/request-desktop-1440.png`
- `shots/reveal-desktop-1440.png`
- `shots/debrief-desktop-1440.png`
- `shots/incident-request-desktop-1440.png`
- `shots/reveal-mobile-390.png`

Visible observations:

- **AF family parity:** the Anton masthead, Space Grotesk reading scale, Archivo labels, square 2px cards, paper ground, forest actions, and restrained amber read as the existing standalone-tool family.
- **Contained After Dark stage:** the black table is a distinct play surface without turning the whole publication chrome into a second theme. The original AF card frame uses live type and a generated art window; it does not reproduce another game's symbols or layout.
- **Literal card display:** support inbox, trust badge, and incident ledger retain their central object story at the roughly 360 px card width. No essential object is lost to the 4:3 art-window crop. Titles, scenario copy, action line, and topic pills remain readable and unclipped.
- **Reveal:** Request and Curveball read as one pair through shared anatomy while the red Curveball keyline supplies a clear second-state cue. The two columns align at desktop.
- **Debrief:** before/after calls and changed-call state are visible without naming a correct answer. The discussion prompts remain adjacent to the paired cards.
- **Mobile:** cards stack in DOM order at 390 px; each occupies the same width; voting controls follow the Curveball; no horizontal crop or overflow is visible. Phase state retains numbered markers when the long labels collapse.
- **Corrections caught by inspection:** initial Lucide markup rendered as black fills, and programmatic heading focus drew an unwanted outline. Both were corrected, the harness reran, and the exact replacement screenshots were reopened. The final Ship/Slow/Stop icons now use colored Lucide strokes; the welcome heading is clean.

## Mechanical checks after visual review

- Vitest: 10 of 10 tests pass.
- Pair enumeration: 132 of 132 non-self ordered alpha combinations pass the domain gate; human rationale is recorded in `PAIRING-REVIEW.md`.
- Browser harness: desktop and mobile art load, no horizontal overflow, cards stack at 390 px, keyboard completes a round, zero console/page errors, zero external requests, and local/session/IndexedDB counts remain zero.
- Build output is multi-file. HTML does not contain Base64 image or font payloads.

## Fail-closed boundary

The alpha is not a release candidate. Nine cards intentionally show authored specimen mats because their illustrations have not been generated or reviewed. No claim should say the 12-card art set, 34-card Core deck, print deck, or public AF tool is complete.
