# GitHub Pages deployment

## Selected destination

- Organization: IRSg-ARG
- Repository: irsg-arg.github.io
- Intended address: https://irsg-arg.github.io/
- Source branch in the supplied workflow: main
- Publishing source: GitHub Actions
- Static artifact folder: dist

The dedicated public repository was created by the group and its main branch was inspected on 9 November 2026. The initial commit contains a short group README. This website is added on top of that history; the robotics software repositories are separate.

## First publication

1. Use **IRSg-ARG/irsg-arg.github.io**, with **main** as the source branch.
2. Copy this website folder's source into the dedicated repository, including **.github**, **.gitignore** and **.gitattributes**. Generated **dist** and **.qa** folders are ignored by Git.
3. In repository **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.
4. Push the source to **main**, or run **Validate and deploy research website** from the Actions tab.
5. The workflow builds the static files, checks source attribution/citations and links, checks a repository subpath, uploads **dist**, and deploys through the **github-pages** environment.
6. Read the actual deployment URL from the completed workflow. Confirm the homepage, project, media playback and paper links there. The configured intended URL is not a deployment confirmation.

Pull requests run validation without deploying. Repository/environment protection rules and organization policies still apply. The latest authenticated deployment and its result are recorded in the [Actions history](https://github.com/IRSg-ARG/irsg-arg.github.io/actions/workflows/pages.yml).

## Origin, repository subpath and custom domains

For this organization site, **content/site.json** contains the root path **/**. The builder normalizes it when joining URLs so canonical URLs never contain a doubled slash:

~~~json
{
  "origin": "https://irsg-arg.github.io",
  "basePath": "/",
  "indexable": true
}
~~~

For a project repository, keep the origin and set **basePath** to the repository name prefixed by a slash, for example **/research-website**. Relative internal links and assets also work under a nested mount.

For a custom domain, change **origin** to that HTTPS origin and use an empty basePath unless deliberately serving a subdirectory. Configure the domain and DNS using GitHub's Pages settings. No custom domain or CNAME is included in this delivery.

Command-line overrides are available:

~~~sh
node scripts/build.mjs --origin https://irsg-arg.github.io --base-path /research-website
node scripts/check.mjs --origin https://irsg-arg.github.io --base-path /research-website
~~~

The builder also accepts SITE_ORIGIN and SITE_BASE_PATH environment variables. Use the same settings for checks. The workflow uses the tracked content/site.json configuration by default.

To exercise a subpath without changing the main build:

~~~sh
node scripts/build.mjs --base-path /path-check --out-dir .qa/subpath
node scripts/check.mjs --base-path /path-check --out-dir .qa/subpath
node scripts/serve.mjs --dir .qa/subpath --base-path /path-check --port 4174
~~~

Then open http://127.0.0.1:4174/path-check/.

Set **indexable** to false for an intentionally private or prelaunch export. The 404 page always has noindex. Sitemap URLs and social metadata follow the configured origin and base path. Only implemented content pages enter the sitemap.

## Primary references

The organization repository naming and default URL follow [GitHub's Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). The deployment uses the official [custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) actions. The checkout/setup versions were checked against the official [checkout](https://github.com/actions/checkout) and [setup-node](https://github.com/actions/setup-node) repositories on 9 November 2026.
