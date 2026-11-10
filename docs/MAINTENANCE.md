# Content maintenance

Ordinary content is in JSON; templates control layout. A content edit needs a rebuild and check:

~~~sh
node scripts/build.mjs
node scripts/check.mjs
~~~

Review the affected page at desktop and mobile sizes, then commit the source. A push to main deploys through the included workflow after Pages is configured. Content edits can be reviewed in a pull request first.

## Add a publication

1. Add a record to **content/publications.json**, using an existing record as the schema. Give it a unique ID.
2. Transcribe the exact published title, ordered authors, year, venue, volume, issue, pages, DOI and DOI URL. Preserve accents and published author forms. A year embedded in a DOI is not the publication year.
3. Add its original or verified BibTeX entry as **public/citations/ID.bib**, with matching fields. Preserve final journal articles and conference versions as distinct records.
4. Add its ID to **publicationIds** in **content/home.json** if it should appear on the homepage, or to a research theme's **publications** list.
5. If changing the homepage selection, update **public/citations/selected-publications.bib** to contain that same selection.

The publications page discovers all records automatically and groups them by year. Set **kind** to Journal article, Conference paper, Book chapter, Preprint, Thesis, Poster, or Report & rulebook. Set **status** to published, accepted, preprint or archive. A missing DOI is allowed when an authoritative record or preprint URL is supplied. Keep a separate **preprint** link when there is also a published version. Add verified entries to **public/citations/all-publications.bib**.

Six older archive listings have **citationComplete: false** and link to their source without offering an unverified BibTeX entry. Confirm the complete citation before changing that field. Sources reviewed for the expanded bibliography are recorded per entry. Do not copy publisher PDFs into public media unless an appropriate author-approved public version is supplied.

## Add or update a person

1. Add an ID, preferred name, display context, research interest and optional profile URL to **content/people.json**.
2. For a portrait, copy the approved image into **public/media/people/** and add a matching **content/media.json** record. Use its media ID in the person's **portrait** field. Retain source provenance and a useful alt description.
3. If no verified portrait is supplied, set **portrait** to null and supply neutral **initials**.
4. Add the person's ID to **contributorIds** in **content/home.json**, or to the relevant project's **authorIds** in publication order.

The homepage displays selected research associations. Collaborator records use displayContext Key collaborator or Collaborator and an appointment field for their academic title. Rodrigo Ventura and Pedro U. Lima appear in a separate two-column collaborator row. A coauthor is not automatically a current member. The Miguel Pimentel portrait from the handoff remains withheld pending identity confirmation.

## Maintain the student directory

Edit **content/students.json**. Each supervision record has a unique **id**, stable **personId**, preferred **name**, **degree** (PhD, Master, Bachelor or Research project), **status** (current or previous), optional **period**, **topic**, supervision role and source reference. Optional **programmeLabel** can identify a visiting PhD student while preserving the PhD filter; **completionNote** can record graduation. Portraits use media IDs. The page groups records automatically; search and filters work without a service or database. A person can have distinct Master’s and PhD records. A linked **publicationId** displays the paper’s conference and year automatically.

The current roster combines the public CIÊNCIAVITAE supervision history, the supplied presentation and user corrections from 10 November 2026. The user will review possible omissions later. Inês Marques is listed under previous Bachelor’s supervision in 2026, as explicitly requested; her current Master’s abroad is not attributed to this group. Do not infer degrees from publication authorship. Records without a confirmed degree stay under research placements and projects. Update the source date and confirm current status each term.

## Add research media

Use the complete handoff's media manifest, slide-to-project map and curated shortlist first. The complete presentation has already been extracted; rerun its extraction script only when a newer or higher-resolution deck is supplied.

Copy only selected files and posters into **public/media/**. Add a media record with:

- Unique ID, title, path, type, intrinsic dimensions and optional poster.
- Alt text, caption, credit and experimentType.
- Original source ID, filename and source slides, or the date and authorization for directly supplied photographs or videos. Register each new user source in docs/source-index.json additionalSources with a matching ID and date.
- A SHA-256 for each copied supplied derivative in **sourceHashes**.

On Windows, **Get-FileHash -Algorithm SHA256 -LiteralPath PATH** can compute a digest. Lowercase the digest when recording it. The check script verifies file bytes against these records.

The two photographs supplied directly on 10 November 2026 are U01 (Meysam Basiri portrait) and U02 (custom UAV with onboard 3D LiDAR). Original bytes are retained; display crops are CSS only. The platform photograph links to the prioritization project but is not presented as evidence of that paper’s hardware configuration or results. Trimodal footage remains with the multimodal research direction.

Later that day, U03–U05 added Rafaela Chaffilla’s UAV/UGV platform composite and real following experiment from external and onboard views. Original PNG and MP4 bytes are retained; the video posters are frames at two seconds. These clips belong to the warehouse-inspection project and show following, not shelf imaging or landing. Their original audio is retained under native playback controls. The standalone moving-platform landing study remains separately attributed.

Use native video controls and an accurate visual description. Keep preload at none. The provided review derivatives are silent except the acoustic recordings; if later using audio, describe/caption the actual soundtrack and keep playback under visitor control. Label conceptual, explanatory, simulation and hardware material according to the manifest.

## Maintain the platforms page

The /platforms/ gallery is driven by content/platforms.json and media records with source S12. All 14 platform images from the user-supplied one-slide deck are represented once. The slide’s institutional header is excluded because it is branding, not a platform photograph. The gallery count refers to images/configurations, not verified distinct original airframe designs. Keep captions descriptive until preferred platform names and integration details are confirmed.

To add a platform view, register its image and source in content/media.json, then add mediaId and title to platforms.images. An optional projectSlug links the caption to an existing research project. relatedProjects controls the short research list below the gallery. Keep native image links usable without JavaScript, preserve aspect ratios and avoid clipping the platform. Small images should retain their native resolution; do not invent higher-resolution details.

S12 assets were extracted only from the newly supplied platforms.pptx. The original S11 inventory was not re-extracted. WebP derivatives use quality 90 with a maximum 1600 × 1200 image size; source digests, original dimensions and framing boxes are retained per media record. The 14 public images total about 1 MB. Original deck files remain outside deployable output.

## Add a project without changing layout

For an ordinary project, copy a type **catalogue** record in **content/projects/**, such as **tilting-wings.json** or **frontier-shepherding.json**. Supply its unique slug, title, themeId, summary/introduction, status, people names, exact publicationIds, problem, approach, evidence and selected media. Every media entry has its own scientific label, caption and visual description. The primaryMediaId must refer to one of those entries. Use relatedSlugs to connect existing project pages.

The builder discovers all project JSON files, creates **/research/SLUG/**, includes them in the research index and sitemap, and links homepage themes using projectSlugs. **content/research.json** controls research groups; use a valid themeId. Add a project to the relevant homepage theme if appropriate.

Stylesheet and enhancement-script URLs include a content hash query. The builder updates it automatically when either file changes, so returning visitors receive the matching assets after a GitHub Pages release.

Published research needs a verified publication record. A project in progress can have an empty publicationIds array; the page then offers research contact rather than a fabricated paper link. It can use a genuine prototype video or explanatory figure. A project without supplied media can be a text-led case study; leave primaryMediaId null and media empty rather than borrowing an unrelated experiment.

Evidence entries keep their kind: **hardware**, **simulation**, **benchmark**, **concept** or **context**. Separate different experiments and publications. Include a baseline, metric, environment, team size, trial count and source context with any numerical comparison. Keep unresolved details in editorQuestions and update **docs/PROJECT_CONTENT_REVIEW.md**.

The representative probabilistic-prioritization page retains its specialized metric/trial layout. Its content uses the original problem/method/results schema; do not copy that layout for unrelated evidence structures. Video assets always use native controls, preload none and their supplied poster. Index cards use still images or video posters without loading video files.

## Editorial safeguards and cadence

For the prioritization project, the approximately 14%/10% gains and 22.5–32.0% clustering ablation are simulation results. The separate two-UAV outdoor trials reached 95% coverage in 77, 83 and 85 seconds. Do not combine these into a hardware percentage speedup.

Prefer published-paper evidence over conflicting slide shorthand. Preserve the published first-author form **John Lewis** on FroShe and **John Lewis Devassy** on the prioritization article. Keep current membership separate from historical authorship.

After each accepted paper or major experiment: update its record, media and related project. Each term: confirm people and student-enquiry text. Before each release: check the contact email and DOI destinations, review mobile/keyboard behavior, and run build/check. Assign a named content maintainer before public launch; the owner is still an editorial decision.

## Validation scope

The check script covers internal destinations and anchors, media bytes, citation-field consistency, scientific evidence categories, document headings/language, alt text, ARIA references and controlled video loading. It is not a certification of accessibility, independent identity verification or a new reading of the original research papers. Browser review remains useful after layout/media changes.
