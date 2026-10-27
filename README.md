# Ke Wang — academic homepage

Academic website for Ke Wang, Eberly Senior Postdoctoral Fellow at the University of Rochester.

Website: https://kernelw.github.io/

## Pages

- Home: biography, recent work, and activities.
- Research: superconductivity, 2D materials, quantum simulation, and quantum criticality.
- Publications: 21 papers and preprints, with year filters.
- About: academic background, talks, and contact details.

Content and portrait are migrated from https://sites.google.com/view/wang-k/home and its subpages. Primary publication links and migration notes are in `content-sources.json`. A CV PDF was not supplied, so no CV download is included.

## Update content

1. Edit `content.json` to update the biography, positions, publications, research descriptions, and activities.
2. Run `node build.mjs` and `node check.mjs`. No packages need to be installed.
3. Commit the updated content and generated HTML to `main`.

Publications are sorted by year. Add `"featured": true` to up to three publication records to choose the homepage highlights. Otherwise the first three recent papers are shown.

Edit `style.css` for the design, `site.js` for the menu and year filters, and `portrait.svg` for the photo. The website is fully static; its content and links are readable without JavaScript.

## Hosting

GitHub Settings → Pages → Build and deployment:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

`.nojekyll` keeps the site as plain HTML. GitHub Pages publishes commits automatically. No custom Actions workflow, server, or database is needed.

## Custom domain and Google Search Console

Set the domain in GitHub Settings → Pages → Custom domain and configure DNS using GitHub's current documentation:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

Set `siteUrl` in `site.config.json` to the final public URL, then rebuild and commit so canonical URLs, social metadata, and `sitemap.xml` use the new address. A custom domain does not guarantee indexing or ranking.

Verify the final domain or URL-prefix property in Search Console. For HTML-tag verification, put the supplied token in `googleSiteVerification` in `site.config.json`, rebuild, and commit. Submit `sitemap.xml` and inspect the homepage URL. Ask your department to link to this website from your institutional profile.

## Local preview

```sh
node build.mjs
node check.mjs
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. The site uses system fonts. Google Analytics 4 is configured through `googleAnalyticsMeasurementId` in `site.config.json`; rebuild and commit the generated HTML after changing the ID. Clear that setting and rebuild to remove the tracking tag. GitHub Pages may retain operational access logs under its own policies.
