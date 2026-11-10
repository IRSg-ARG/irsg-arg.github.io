# Aerial Robotics and Multi Drone Systems

A working static research website for the Aerial Robotics and Multi Drone Systems Group at IRSG-ISR Lisboa, Instituto Superior Técnico, Universidade de Lisboa.

The selected destination is **IRSg-ARG/irsg-arg.github.io**, with the intended address **https://irsg-arg.github.io/**. The site uses the organization root URL with base path **/**. Deployments are built and published by the [GitHub Actions workflow](https://github.com/IRSg-ARG/irsg-arg.github.io/actions/workflows/pages.yml).

## Open the website

Open **dist/index.html** in a browser for a direct local preview. The links, research media and content work without an internet connection; paper and institutional links require connectivity. Local-file navigation is adapted by the small enhancement script.

For the normal HTTP preview, with Node.js 22 or later:

~~~sh
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
~~~

Open **http://localhost:4173/**. Stop the preview with Ctrl+C.

No package installation is required. The builder uses only Node's standard library. There are no runtime dependencies, third-party analytics, external fonts, application backend or account system. An npm lockfile is unnecessary because no dependencies are installed. Optional npm scripts mirror the commands above.

## Included pages and behavior

- Homepage: the group’s custom UAV with onboard 3D LiDAR, featured exploration project, seven research directions, four selected publications, Meysam Basiri’s portrait, selected research contributors including key collaborator Rodrigo Ventura and collaborator Pedro U. Lima, and contact. The trimodal field-test film is available within the multimodal research direction.
- **/research/probabilistic-frontier-prioritization/**: overview, method, two explanatory animations, experimental footage, separately labelled simulation and hardware results, complete authorship, paper and supplementary-video links, and BibTeX download/copy.
- **/students/**: current and previous supervision, including PhD, Master’s, Bachelor’s and research placements; search by name or topic and filter by status or programme.
- **/publications/**: bibliography grouped by year, with search, publication-type filters, publisher/preprint links, individual verified citations and a bibliography download.
- **/research/**: searchable project index grouped by research theme and publication status. All 23 catalogue projects have working pages, including two explicitly marked as research in progress.
- **/platforms/**: a compact showcase of the group’s aerial platform design, build and integration experience. All 14 platform images from the newly supplied slide are included, with descriptive captions, image links, related research and collaboration contact. It is linked from the main navigation and homepage introduction.
- The additional project pages explain their problem, approach, evidence, contributors and exact publications. The warehouse project includes the user-supplied UAV/UGV photograph and real following experiment from external and onboard views. Moving-platform landing remains a text-led case study where no dedicated media was supplied.
- A useful 404 page, robots.txt and sitemap.xml.
- Responsive layouts, keyboard navigation, visible focus, a skip link, native video controls, silent-video descriptions, and reduced-motion support.

Research navigation opens the complete project index; the homepage research directions link directly to their project pages. Publication navigation opens the bibliography, and people navigation reaches the homepage people section; students and alumni are linked from that section and every footer. There are no empty destinations.

## Structure

| Location | Purpose |
| --- | --- |
| content/site.json | Group identity, contact, navigation and publication origin/base path |
| content/home.json | Homepage copy, themes, selected publication/person IDs |
| content/projects/*.json | Project narrative, evidence categories, media, contributors, publications and related projects |
| content/research.json | Research groups for the searchable project index |
| content/platforms.json | Platform gallery, captions, research links and collaboration copy |
| content/people.json | Names, portraits and research associations |
| content/students.json | Individual supervision records, degree, status, period, topic and provenance |
| content/publications.json | Published metadata and ordered authors, plus clearly identified archive records |
| content/media.json | Selected assets, descriptions, scientific labels, source slides and source-file hashes |
| public/media/ | Only the research media used by this version |
| public/citations/ | Matching verified BibTeX entries, homepage selection and complete available citation export |
| src/templates/ | Shared semantic page templates |
| src/styles.css and src/site.js | Layout and small progressive enhancements |
| scripts/ | Build, validation and local preview |
| .github/workflows/pages.yml | PR validation and GitHub Pages deployment |
| dist/ | Generated output; ignored by Git |
| docs/ | Deployment, maintenance and compact source index |

The delivery’s separate **CONTENT_AUDIT.md** records the original extraction audit. Current unresolved questions are tracked in **docs/CONTENT_QUESTIONS.md**. The roster can be extended when the author reviews possible missing students.

## Publish and maintain

Follow [deployment](docs/DEPLOYMENT.md) for the selected organization repository, including the Pages setting required before the first workflow run. Follow [maintenance](docs/MAINTENANCE.md) to add a paper, person or project without editing the page layout.

Do not copy the original PPTX, handoff ZIP, CV or research-source PDFs into this repository. This version selects compact media derivatives from the supplied handoff and preserves their hashes. Research media remain credited to their respective work; this delivery does not assign a new license to them.
