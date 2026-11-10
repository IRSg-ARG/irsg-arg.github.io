# Verification of the project expansion and warehouse media update

Date: 10 November 2026. Runtime: Node.js v24.22.1. Target: IRSg-ARG/irsg-arg.github.io, organization root https://irsg-arg.github.io/ with base path /.

## Build and content checks

Run node scripts/build.mjs and node scripts/check.mjs. Repeat with --base-path /path-check --out-dir .qa/subpath. Both builds pass.

- 27 content pages plus the custom 404: homepage, 23 project pages, research index, students and publications.
- 1,317 internal links, anchors and assets resolve in both configurations.
- All 23 project records are linked from the research index and included in the sitemap; every project has a valid research group.
- The 65 publication records retain their existing metadata, with 59 matching citation exports and six linked archive records.
- 47 supervision records for 46 people retain the user’s corrections.
- 80 selected media records: 42 playable videos/animations and 38 images, all with source provenance and matching SHA-256 hashes.
- Videos have native controls, no autoplay and preload none. Research-index cards load still images/posters, not video files.
- Simulation and concept media require explicit labels. Every generic project includes source references, evidence context and captions/descriptions for selected media.
- The original probabilistic-prioritization simulation categories, ordered citation and separate outdoor trial values remain unchanged.
- Source PPTX, original CV, research-paper PDF and ZIP files remain outside the deployable output. Static output is approximately 103.43 MiB.

## Browser checks

Reviewed the local preview at desktop 1280-pixel width and mobile widths 390 and 320. The research index, long project headings, ongoing-work page, mixed-reality page, tilting-wing prototype and warehouse case study showed no document overflow. The project section navigation scrolls within its own horizontal container on narrow screens.

Search by researcher and combined research theme/status filters return the expected projects. The ongoing filter shows the tilting-wing and marginal-gain projects; the empty state and mobile navigation behave correctly. The existing representative project links back to the complete research index.

The Frontier Shepherding hardware video played through more than 22 seconds of its 61.083-second duration with readyState 4 and no media error. Its outdoor footage is separately labelled from the simulation comparison. The SpArC animation is labelled Concept animation, and the mixed-reality waypoint clip is labelled as ongoing hardware work with the published velocity-command interface distinguished in the evidence text. The ongoing marginal-gain page omits provisional quantitative claims and has no fabricated publication link.

Text-led case studies do not borrow unrelated experimental imagery. The expanded project pages preserve exact citation author order and use project-contributor labels without claiming current group membership.

## Warehouse media update

The user supplied one composite platform photograph and two real-world UAV-following-UGV recordings for Rafaela Chaffilla’s warehouse-inspection research. U03 is the UGV/UAV platform photograph; U04 is the external view; U05 is the UAV onboard camera view. Original PNG/MP4 bytes are retained and hash-verified. Video posters are genuine frames at two seconds, extracted from the new clips without running the deck extraction script.

The research-index card and warehouse project now use the platform photograph. Both video labels and captions identify their viewpoint and real hardware context. The clips document following; landing and shelf-capture statements remain attributed to the published paper rather than these recordings. No new media is assigned to the separate moving-platform landing study. Existing publication metadata remains unchanged.

Local browser checks passed at desktop width 1280 and mobile width 390. The photograph and captions fit without horizontal overflow or broken loaded images. Both 20-second clips reached readyState 4 with no media error; observed playback exceeded 11 seconds for the external view and 13 seconds for the onboard view. Native controls, preload none and the original audio remain under visitor control. The normal viewport was restored after testing.

## Limits and release evidence

These checks assess the implementation and the supplied source mapping. They are not an independent re-review of every original research paper, identity check or accessibility certification. docs/PROJECT_CONTENT_REVIEW.md records source decisions and remaining scientific/content questions. No deck extraction was run.

The GitHub Actions run and hosted release checks are recorded in the separate delivery report after publication. Temporary viewport overrides are reset, and the owned preview process is stopped during delivery cleanup.
