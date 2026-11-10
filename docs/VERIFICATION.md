# Verification of the project expansion

Date: 10 November 2026. Runtime: Node.js v24.22.1. Target: IRSg-ARG/irsg-arg.github.io, organization root https://irsg-arg.github.io/ with base path /.

## Build and content checks

Run node scripts/build.mjs and node scripts/check.mjs. Repeat with --base-path /path-check --out-dir .qa/subpath. Both builds pass.

- 27 content pages plus the custom 404: homepage, 23 project pages, research index, students and publications.
- 1,307 internal links, anchors and assets resolve in both configurations.
- All 23 project records are linked from the research index and included in the sitemap; every project has a valid research group.
- The 65 publication records retain their existing metadata, with 59 matching citation exports and six linked archive records.
- 47 supervision records for 46 people retain the user’s corrections.
- 77 selected media records: 40 playable videos/animations and 37 images, all with source provenance and matching SHA-256 hashes.
- Videos have native controls, no autoplay and preload none. Research-index cards load still images/posters, not video files.
- Simulation and concept media require explicit labels. Every generic project includes source references, evidence context and captions/descriptions for selected media.
- The original probabilistic-prioritization simulation categories, ordered citation and separate outdoor trial values remain unchanged.
- Source PPTX, original CV, research-paper PDF and ZIP files remain outside the deployable output. Static output is approximately 89.59 MiB.

## Browser checks

Reviewed the local preview at desktop 1280-pixel width and mobile widths 390 and 320. The research index, long project headings, ongoing-work page, mixed-reality page, tilting-wing prototype and text-led warehouse case study showed no document overflow. The project section navigation scrolls within its own horizontal container on narrow screens.

Search by researcher and combined research theme/status filters return the expected projects. The ongoing filter shows the tilting-wing and marginal-gain projects; the empty state and mobile navigation behave correctly. The existing representative project links back to the complete research index.

The Frontier Shepherding hardware video played through more than 22 seconds of its 61.083-second duration with readyState 4 and no media error. Its outdoor footage is separately labelled from the simulation comparison. The SpArC animation is labelled Concept animation, and the mixed-reality waypoint clip is labelled as ongoing hardware work with the published velocity-command interface distinguished in the evidence text. The ongoing marginal-gain page omits provisional quantitative claims and has no fabricated publication link.

Text-led case studies do not borrow unrelated experimental imagery. The expanded project pages preserve exact citation author order and use project-contributor labels without claiming current group membership.

## Limits and release evidence

These checks assess the implementation and the supplied source mapping. They are not an independent re-review of every original research paper, identity check or accessibility certification. docs/PROJECT_CONTENT_REVIEW.md records source decisions and remaining scientific/content questions. No deck extraction was run.

The GitHub Actions run and hosted release checks are recorded in the separate delivery report after publication. Temporary viewport overrides are reset, and the owned preview process is stopped during delivery cleanup.
