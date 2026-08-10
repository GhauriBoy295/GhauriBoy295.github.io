# Implementation Plan — 13.0.0 "Sentinel Executive"

Written after the audit in `AUDIT_BASELINE.md`, before the build.

## Preserve

- All four CV files (`Sarmad_Saeed_CV.pdf/.docx`, `..._Professional_Resume.pdf/.docx`)
- Command palette, project filters, case-study dialogs, deep links
- Motion controller (full / calm / off) and reduced-motion handling
- Service worker, offline shell, theme bootstrap
- No-JS fallback, skip link, landmarks, focus management
- Deployment config: `netlify.toml`, `vercel.json`, `_headers`

## Refactor

| Target | Change |
|---|---|
| Token block | Charcoal+indigo -> black / navy / green / red, semantic state tokens |
| Hero | H1 becomes the person; slogan demoted to tagline |
| Hero metrics | Real values into HTML; JS animates presentation only |
| Credentials | One list of 5 -> Verified (3) + Additional (2) |
| Welcome screen | `Ghauri_Boy` out of the identity block |
| Service worker | Precache URLs derived from a single `ASSET_REV` |

## Add

- `sitemap.xml`, canonical link, updated `robots.txt`
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` + manifest entries
- GitHub profile and source-repository links
- Semantic state tokens (`--state-secure-rgb`, `--state-incident-rgb`)
- Target-size rules for coarse pointer (44px) and fine pointer (24px)

## Testing matrix

9 viewports from 320x568 to 1920x1080. Per viewport: horizontal overflow,
H1 clipping, H1 count, undersized targets. Plus contrast in both themes,
console errors, filters, dialogs, links, version sync.

## Deliberately deferred

**Splitting `styles.css` / `script.js` into modules.** Reasoning is in
`AUDIT_BASELINE.md`: this stylesheet has a documented history of breaking
under mechanical edits, the site is live and passing, and a pure refactor
bundled into a release that already changes palette, hero, metrics and the
credential model makes any regression impossible to attribute. Worth doing
as its own change on its own branch.

## Deployment risk

- Stale CSS from the `?v=` query — mitigated by bumping to 13.0.0 and
  bumping `CACHE_VERSION` so old caches are dropped on activate.
- LinkedIn Open Graph cache will keep serving the old preview image until
  the URL is run through LinkedIn's Post Inspector.
