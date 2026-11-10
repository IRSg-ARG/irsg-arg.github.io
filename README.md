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

Open **http://127.0.0.1:4173/**. Stop the preview with Ctrl+C.

No package installation is required. The builder uses only Node's standard library. There are no runtime dependencies, third-party analytics, external fonts, application backend or account system. An npm lockfile is unnecessary because no dependencies are installed. Optional npm scripts mirror the commands above.

## Included pages and behavior

- Homepage: real trimodal-UAV photography, a controllable field-test film, featured exploration project, seven research directions with expandable details, four selected publications, research contributors and contact.
- **/research/probabilistic-frontier-prioritization/**: overview, method, two explanatory animations, experimental footage, separately labelled simulation and hardware results, complete authorship, paper and supplementary-video links, and BibTeX download/copy.
- A useful 404 page, robots.txt and sitemap.xml.
- Responsive layouts, keyboard navigation, visible focus, a skip link, native video controls, silent-video descriptions, and reduced-motion support.

Research, publications, people, join and contact navigation uses functioning homepage sections while the wider sitemap is developed. There are no empty project destinations.

## Structure

| Location | Purpose |
| --- | --- |
| content/site.json | Group identity, contact, navigation and publication origin/base path |
| content/home.json | Homepage copy, themes, selected publication/person IDs |
| content/projects/*.json | Project narrative, evaluation context, results, researchers and related work |
| content/people.json | Names, portraits and research associations |
| content/publications.json | Exact selected metadata and ordered authors |
| content/media.json | Selected assets, descriptions, scientific labels, source slides and source-file hashes |
| public/media/ | Only the research media used by this version |
| public/citations/ | Unmodified original BibTeX entries selected from the handoff |
| src/templates/ | Shared semantic page templates |
| src/styles.css and src/site.js | Layout and small progressive enhancements |
| scripts/ | Build, validation and local preview |
| .github/workflows/pages.yml | PR validation and GitHub Pages deployment |
| dist/ | Generated output; ignored by Git |
| docs/ | Deployment, maintenance and compact source index |

The separate **CONTENT_AUDIT.md** delivery records editorial decisions, unresolved content questions and the expansion plan. It remains outside the website repository.

## Publish and maintain

Follow [deployment](docs/DEPLOYMENT.md) for the selected organization repository, including the Pages setting required before the first workflow run. Follow [maintenance](docs/MAINTENANCE.md) to add a paper, person or project without editing the page layout.

Do not copy the original PPTX, handoff ZIP, CV or research-source PDFs into this repository. This version selects compact media derivatives from the supplied handoff and preserves their hashes. Research media remain credited to their respective work; this delivery does not assign a new license to them.
