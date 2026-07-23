# Manual visual QA: IT DEPENDS

## Universal Core review candidate

Date: 2026-07-23

### Verdict

- Twelve exact 4:3 Scenario masters: **PASS**
- Twelve exact 4:3 Missing Detail masters: **PASS**
- Both literal-size 12-face runtime sheets: **PASS**
- Illustrated Scenario and IT DEPENDS backs: **PASS**
- Shared table backdrop and three-lane layout: **PASS**
- Equal Scenario/Detail card geometry and bottom-right chips: **PASS**
- Five inspected Missing Detail turn frames: **PASS**
- Desktop, mobile, eight-player, keyboard, and reduced-motion states: **PASS**
- Standalone direct-file desktop and mobile rounds: **PASS**
- Semantic compatibility: **144/144 PASS**, separately recorded in `PAIRING-REVIEW.md`
- Publishing, versioned ZIP, physical cards, Ghost article, and AF navigation: **NOT IN THIS REVISION**

### References inspected

The following exact owned references were opened at original resolution before and during generation:

- `assets/art/risk-scales.png`
- `assets/art/incident-ledger.png`
- `proofs/style-variations/risk-scales-a-linocut.png`

They established the selected flat Victorian linocut/screenprint treatment, near-black/forest/teal/oxblood/parchment/brass palette, rough ink texture, object-first hierarchy, and face-free constraint. The new art carries the style system without copying either reference composition.

### Exact Missing Detail masters inspected

Every selected file below was opened from `assets/art/` at its native 1448 x 1086 resolution after promotion.

1. `detail-twenty-years.png`: **PASS**. A tiny spool disappears into an enormous clock-governed archive. Duration reads immediately; no calendar text is needed.
2. `detail-timer-real.png`: **PASS**. One hourglass releases matching copies through synchronized trapdoors. The enforcement idea remains clear at card size.
3. `detail-shared-key.png`: **PASS**. One giant key branches to many drawers while a recorder sits apart. Shared, untraceable access is a single visual sentence.
4. `detail-names-door.png`: **PASS**. Distinct key silhouettes map one-to-one to drawers around a central audit drum. It reads as the safeguard companion without written names.
5. `detail-default-everyone.png`: **PASS**. One launch lever turns a small input into a wall of destinations. The expansion remains visible after the landscape image is reduced.
6. `detail-fence-holds.png`: **PASS**. Tokens, gates, and an hourglass remain inside a compact perimeter. Nothing visually spills beyond the reviewed boundary.
7. `detail-future-use-drawer.png`: **PASS**. A neat green route diverts through an oxblood side branch into mismatched machines. The unrelated-use risk is both clear and appropriately absurd.
8. `detail-ask-again.png`: **PASS**. The same purpose-axis grammar is reversed: a secondary route is blocked by a double lock and isolated change key.
9. `detail-nobody-owns-tuesday.png`: **PASS**. Cobwebs, loose keys, tools, gears, and stalled lanes make neglected post-launch ownership legible without a person.
10. `detail-someone-owns-tuesday.png`: **PASS**. A clean service station aligns distinct keys, settings, gears, a timer, and blank ledger. It reads as maintained governance rather than a second neglect scene.
11. `detail-tested-elsewhere.png`: **PASS**. A pristine machine accepts identical blocks while irregular shapes, climates, and mechanisms pile up outside its case.
12. `detail-awkward-cases.png`: **PASS**. A rugged multi-lane machine deliberately accepts varied objects and conditions while one visible catch tray preserves the idea of recorded gaps.

No selected master contains a person, face, hand, readable generated text, logo, recognizable product UI, third-party game symbol, or copied trade dress. All gauges and paper surfaces are blank or use nonsemantic marks.

### Literal runtime sheets

`harness/capture-art.mjs` independently shuffled both decks across repeated deterministic sessions, collected all 24 unique card faces, rejected any card with internal overflow, waited for every image to reach a loaded native state, and captured:

- `shots/all-scenario-art-desktop.png`
- `shots/all-detail-art-desktop.png`

Both sheets were opened at original resolution. Every face is shown at the exact 308 x 540 CSS-pixel card size used on the desktop table.

Visible findings:

- all 24 landscape illustrations retain their full visual equation without portrait cropping;
- the two decks are coherent but not minor visual variations;
- every title and body remains readable and unclipped;
- Scenario proposal blocks remain separated from the request;
- every Missing Detail shows its axis plus Risk fact or Safeguard at bottom right;
- all card bottoms align despite different copy lengths; and
- no image is missing, black, pending, stretched, or duplicated.

An earlier contact-sheet capture taken before image decoding completed showed black art windows. It was rejected. The harness now explicitly waits for `complete`, non-zero-width images before capture, and the bad sheet was overwritten.

### Exact product context inspected

The following regenerated screenshots were opened at original resolution:

- `shots/welcome-desktop-1440.png`
- `shots/reveal-desktop-1440.png`
- `shots/debrief-desktop-1440.png`
- `shots/first-vote-8-player-desktop-1440.png`
- `shots/reveal-mobile-390.png`
- `shots/standalone-file-desktop-1440.png`
- `shots/standalone-file-mobile-390.png`
- `shots/standalone-file-debrief-mobile-390.png`

Visible findings:

- **Welcome:** the screen says Universal Core, names separate Scenarios and Missing Details, retains the two illustrated backs, explains the shared-screen handoff, and requires no referee.
- **Desktop reveal:** the Scenario, revealed Missing Detail, and cream decision rail share one row and one height. All three second-vote actions remain visible without page movement.
- **Debrief:** the before/after majority, all numbered player changes, the detail-specific question, and next-fact prompt remain readable below the equal card pair.
- **Eight players:** all eight selections, three totals, no-majority result, friendly discussion cue, and reveal button fit inside the 540 px rail without internal scrolling.
- **Mobile:** Scenario, IT DEPENDS deck or face, and cream rail stack in the intended order with no horizontal crop. The long debrief remains readable as a normal vertical page.
- **Standalone:** the generated `index.html` shows the same illustrated backs, card faces, flip, layout, and debrief when opened directly through `file://`.
- **AF family:** Anton masthead, Space Grotesk reading text, Archivo labels, square frames, cream paper, forest actions, amber accents, and object-first After Dark art remain consistent with the existing standalone tools.

### Missing Detail turn inspected frame by frame

The exact lane was captured at 0, 155, 310, 465, and 620 ms:

- `shots/curveball-flip-000ms.png`: complete illustrated IT DEPENDS back and stack.
- `shots/curveball-flip-155ms.png`: face turns in perspective while the complete back remains beneath it.
- `shots/curveball-flip-310ms.png`: face is readable, correctly oriented, and inside the slot.
- `shots/curveball-flip-465ms.png`: border, art, copy, and chips remain aligned as the face settles.
- `shots/curveball-flip-620ms.png`: final face exactly fills the 308 x 540 slot with no clipping or mirrored content.

Reduced-motion mode reveals the same face immediately; no information depends on animation.

### Mechanical evidence supporting the visual review

- Vitest: 3 files and 14 tests pass.
- Browser acceptance harness: all checks pass.
- Art harness: 24 unique faces captured; no compact-card overflow.
- Offline harness: desktop and mobile rounds reach debrief with only local file requests.
- Flip harness: all five deterministic checkpoints captured.
- Standalone build: 40 files, including all 27 runtime PNGs.
- Browser runs report no horizontal overflow, missing asset, failed response, console error, or page error.
- Runtime makes no external request and writes no localStorage, sessionStorage, or IndexedDB record.

### Fail-closed boundary

This review approves Universal Core v0.2.0 for the existing GitHub Pages release path. The deployment itself must still pass the clean-checkout workflow and a cache-busted live playthrough before it is called live.

Print prepress, physical proof, storefront packaging, Ghost publication, public AF navigation, and commercial licensing remain outside this release. The prior v0.1.1 evidence remains in Git history and describes the older twelve-card architecture only.
