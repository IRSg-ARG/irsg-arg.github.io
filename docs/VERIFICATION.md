# Local verification report

Date: **9 November 2026**

Runtime used: **Node.js v24.22.1**

Target: **IRSg-ARG/irsg-arg.github.io**, GitHub Pages organization site  
Scope: **local baseline verification before first publication; current deployments are recorded in GitHub Actions**

## Reproducible checks

~~~sh
node scripts/build.mjs
node scripts/check.mjs
node scripts/build.mjs --base-path /path-check --out-dir .qa/subpath
node scripts/check.mjs --base-path /path-check --out-dir .qa/subpath
~~~

Both root and repository-subpath checks pass:

- 3 HTML documents: homepage, representative project and 404.
- 87 internal links, asset paths and anchors resolve.
- 12 selected publication records agree with the corresponding original BibTeX fields, including exact title, author order, year, volume/issue/pages and DOI.
- 16 selected media records carry source provenance; copied media and posters match the supplied-derivative SHA-256 values.
- Simulation evidence and outdoor hardware evidence retain their distinct source categories and hardware trial values.
- Every content page has one H1, an English language declaration, description, skip link, valid ARIA references and nonempty image alt text.
- Video elements have native controls, no autoplay and preload set to none.
- The sitemap follows the configured origin and base path.
- No PPTX, CV, source-paper PDF or archive enters the deployable output.
- Static export size: approximately **9.31 MiB**.

The subpath check caught an initial 404-path issue. It was corrected; the completed root and /path-check exports both pass.

## HTTP behavior checked locally

| Request | Observed result |
| --- | --- |
| Homepage | 200, text/html |
| Representative project | 200, text/html |
| Unknown nested URL | 404, custom HTML page |
| Featured article BibTeX | 200, text/plain |
| Main experiment video with Range: bytes=0-1023 | 206, Content-Range bytes 0-1023/3327971, 1024 returned bytes |

The loopback preview supports MP4 byte-range requests for seeking.

## Browser review

The website was inspected through the supported in-app browser.

| Surface | Observed outcome |
| --- | --- |
| Homepage at 1440-pixel viewport | Editorial two-column hero, correctly loaded genuine field photo and institutional context |
| Project at 1440-pixel viewport | Readable introduction, exact authorship, paper links and experimental media |
| Homepage at 390-pixel viewport | Responsive stacked layout, no document overflow, no broken loaded images |
| Project at 390-pixel viewport | Readable introduction, experiment and results; no document overflow |
| Homepage at 320-pixel viewport | Document width equals client width (305 pixels after browser scrollbar), no page overflow |

The project section navigation intentionally scrolls within its own horizontal container on narrow screens.

Interaction checks passed:

- The featured research link reaches the project page.
- The main 66.875-second experiment clip played to completion, with readyState 4 and no media error.
- The project results section displays the two simulation planner comparisons separately from the hardware evidence.
- BibTeX copy reports “Citation copied.”
- The mobile menu opens, updates aria-expanded, and closes on Escape.
- The field-test dialog opens, closes on Escape and returns focus to its trigger.
- The exploration research disclosure expands.
- No JavaScript errors were observed in the isolated verification tab.

## Limits and launch work

These checks do not constitute an independent new review of the original papers, identity verification, a screen-reader audit or an accessibility certification. Source-paper-supported summaries and portrait associations came from the supplied handoff.

The embedded browser allows HTTP/HTTPS navigation. Its policy blocked a direct file: preview, so that optional offline launch mode was not browser-tested. The supplied Node preview reproduces the HTTP behavior that was tested.

The group subsequently created the dedicated repository, and repository read/push access was confirmed. Production is configured for **https://irsg-arg.github.io/** with base path **/**.

The workflow YAML is supplied for the selected main branch, using the official Pages actions. Pages configuration executes in the deployment job, which has Pages and OIDC permissions. See the [deployment history](https://github.com/IRSg-ARG/irsg-arg.github.io/actions/workflows/pages.yml) for authenticated execution results. Hosted verification is recorded separately after publication.

Temporary responsive viewport overrides were reset after review. The local preview process is stopped during delivery cleanup.
