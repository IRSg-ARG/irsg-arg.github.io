# Verification of the 10 November 2026 website update

Target: IRSg-ARG/irsg-arg.github.io, published at https://irsg-arg.github.io/ with base path /.
Runtime: Node.js v24.22.1. No dependencies were installed.

## Reproducible checks

Run node scripts/build.mjs and node scripts/check.mjs. Repeat with --base-path /path-check --out-dir .qa/subpath. Both configured builds pass.

- Five HTML documents: homepage, project, students, publications and custom 404.
- 225 internal links, anchors and media paths resolve.
- 65 publication records: 59 matching citation exports and six explicitly linked archive listings without unverified BibTeX.
- All 12 original publication citations retain their exact titles, ordered authors, year, venue, volume, issue, pages, DOI and URL.
- 47 supervision records for 46 people; unique IDs, degree/status fields and source references. Inês Marques is previous Bachelor’s supervision in 2026, per the user correction.
- 32 source-attributed media records. All supplied image/video/poster bytes match their recorded SHA-256 hashes.
- The featured paper’s simulation categories and separate two-UAV hardware times remain unchanged.
- H1, language, descriptions, skip links, alt text, ARIA references and native video controls pass. No autoplay; video preload remains none.
- New routes appear in the sitemap; canonical URLs retain the organization root.
- No source PPTX, CV, PDF or ZIP is deployed. Static output is approximately 9.98 MiB.

## Browser checks

Reviewed the local HTTP preview with the supported in-app browser at desktop width 1280 and mobile widths 390 and 320. No document overflow was observed on the affected pages, and the new images loaded correctly.

Verified the LiDAR hero image links to the featured project, Meysam’s portrait appears on the homepage and project authorship panel, Rodrigo Ventura appears as key collaborator, and students/publications links navigate correctly.

Student search handles accents; status and programme filters combine correctly. Inês’s Bachelor record appears under previous supervision in 2026 and links to her ICARSC paper. Publication search locates the featured DOI; filtering it to conference papers correctly shows the empty state. Clearing filters restores the full list. Mobile navigation opens, follows a link and closes.

The new directory links also work from a deeply nested unknown URL. The custom 404 uses absolute root paths, verified by following its Publications navigation back to the bibliography. The static check enforces this behavior for root and subpath builds.

These checks assess the implemented site. They do not independently certify enrollment, portrait identities or completeness beyond the supplied and public sources. See CONTENT_QUESTIONS.md for the remaining content review.

GitHub Actions records build and deployment results. Hosted checks and screenshots are saved with the separate delivery after publication.

## Follow-up content corrections

Verified the exact selected-contributors heading and generic platform caption. Rodrigo Ventura (key collaborator, Associate Professor, IST) and Pedro U. Lima (collaborator, Full Professor, IST) display side by side at desktop and mobile widths without document overflow. Sofia Simões appears only under previous Master’s students with graduation before summer 2026; Manuel Brito appears under current Master’s students with the exact supplied thesis title; Yu Tang Liu appears under previous doctoral students as a visiting PhD with the correct IROS 2025 paper link. Combined search/status/degree filters produce the expected records.
