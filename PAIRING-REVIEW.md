# Alpha pairing review

Reviewed: 2026-07-22

## Result

**PASS for the 12-card mechanics alpha.** Every Request is a proposed data-processing change. Every Curveball is a cross-cutting implementation fact that can coherently enter any of the other eleven Requests. The 132 non-self ordered pairings therefore remain playable without a compatibility filter or a second deck.

This is a narrative-coherence review, not a claim that every combination creates the same legal issue or should produce the same room call.

## Universal Curveball gate

| Card | Curveball axis | Why it travels across the deck |
|---|---|---|
| CORE-01 | Vendor defaults | Any proposed workflow can reveal a vendor or hosted component whose default creates another copy or retention period. |
| CORE-02 | Unknown contents | Every proposal receives source records or signals; the tidy inventory can fail to describe what those records actually contain. |
| CORE-03 | Purpose and record | Every proposal has an approved description of why the data exists; the revealed use can exceed that description. |
| CORE-04 | Scope drift | Every pilot or launch can be reviewed for one region or population while its actual switch reaches farther. |
| CORE-05 | Deletion gaps | Every new processing system can create a copy that is disconnected from an existing lifecycle workflow. |
| CORE-06 | Access and accountability | Every system has an access model, and any of them can hide activity behind a shared group with no audit trail. |
| CORE-07 | Evidence quality | Every proposal can be piloted in a cleaner environment than the people, devices, languages, locations, or edge cases it will meet live. |
| CORE-08 | Operational ownership | Every shipped workflow needs an owner after implementation, not only a person who gets it through launch. |
| CORE-09 | Unreviewed workaround | Every planned system can lose a dependency and quietly become a manual process the review never examined. |
| CORE-10 | Approval theatre | Every proposal can be called approved in a timeline while the actual privacy/security review remains incomplete. |
| CORE-11 | Reversibility | Every data use can be disabled without retrieving its exports, caches, or downstream copies. |
| CORE-12 | Retention and future use | Every proposal can accumulate source data and outputs “just in case” after its present purpose is complete. |

## Pairing rule in code

Each Request declares `pairingDomain: data-processing-proposal`. Each Curveball declares that it applies to that domain. Tests enumerate all 132 non-self ordered pairs and fail if any leaves the domain.

The domain gate is necessary but not sufficient. The table above is the human content review. Any new card must pass both before joining the shuffled deck.

