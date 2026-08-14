# Portfolio Content and Design Update Guide

This guide explains where to change the most important content without rebuilding
the entire site. The site is static — no npm, no framework, no build step.

## Personal details

Most visible personal details are in `index.html`.

Search for:

```text
Sarmad Saeed
Ghauri_Boy
University of Chester
sarmadsaeed2002@gmail.com
sarmad-saeed-845a7b267
```

Update every relevant occurrence consistently, including the JSON-LD structured
profile in the `<head>`, the Open Graph and Twitter tags, `site.webmanifest` and
`assets/social-preview.svg`.

### Facts that must stay consistent everywhere

| Fact | Value |
|---|---|
| Title | MSc Cyber Security Graduate |
| University | University of Chester |
| Academic year | 2025–2026 |
| Status | Graduated |
| Current base | United Kingdom |
| Opportunity availability | Worldwide |
| Work modes | Remote, hybrid, on-site, relocation |

Never write `candidate`, `expected 2026`, `currently studying`, `pursuing MSc`, or
UK-only opportunity wording. `tools/verify_portfolio.py` in the parent workspace
fails the build on any of them.

## CV files

The website buttons use:

```text
Sarmad_Saeed_CV.pdf
Sarmad_Saeed_CV.docx
```

When replacing a CV, keep the same file names to avoid changing every link. The two
`Professional_Resume` files are identical copies retained for compatibility with
previous portfolio links — update both pairs together.

## Missions (projects)

A mission exists in two places:

1. The card in the `#missions-section` section of `index.html`, including its
   original inline SVG artwork.
2. The case-study content in `assets/js/project-data.js`.

Both use the same ID:

```html
<article class="mission" data-class="defence" data-categories="defence nist-detect">
  …
  <button class="mission-open" data-open-mission="ics-ids">
```

```javascript
'ics-ids': {
  title: 'Intrusion Detection for Industrial Control Systems',
  classification: 'defence',
  side: 'blue',
  panels: [ … ],
  timeline: [ … ],
  artefacts: [ … ]
}
```

Keep these IDs identical, and keep the ID in the `order` array at the top of
`project-data.js` — that array drives the Previous/Next buttons inside a report.

### Case-study structure

- `panels` — the tabs in the report's left rail. Each needs `id`, `label`, `title`,
  `body`, and optionally `list`.
- `timeline` — the "Evidence timeline" tab. Describes process, never a measured result.
- `artefacts` — the "Working material" panel. Describes the *kind* of material the
  work involved, never a quantity or an outcome.
- `framework` — optional. Omit it entirely when there is no genuine NIST mapping;
  the block hides itself.

## Mission filters

A card can belong to one or more categories:

```html
data-categories="research nist-protect"
```

Available categories:

```text
research  defence  offensive  development
nist-identify  nist-protect  nist-detect  nist-respond
```

When adding or removing cards, update the count in each filter button (`<b>5</b>`)
and the mission count in the section heading and the Recruiter Quick View.

## Colours

All design tokens are in `assets/css/tokens.css`.

- `:root, :root[data-theme="dark"]` — BlackICE Night
- `:root[data-theme="light"]` — Forensic Daylight

The two themes are defined independently, not derived from each other. Key tokens:

```css
--canvas --obsidian --surface-1..4      /* structure: black and navy */
--border --border-soft --border-strong
--secure --secure-hover --secure-deep   /* secure states, primary actions */
--incident --incident-hover             /* incidents, offensive, risk only */
--evidence                              /* forensic artefact labels */
--text-1 --text-2 --text-3
--glow-secure --glow-incident           /* flat in the light theme by design */
```

Semantic rule: red is only ever used for incident, offensive and risk states. Green
is a signal, not a background wash. Never introduce purple.

After changing any colour, re-run the contrast audit — every text/background pair
must clear WCAG AA (4.5:1, or 3:1 for large text).

## Motion

Motion is driven by one attribute, `html[data-motion]`, with values `full`, `calm`
and `off`. All motion rules live in `assets/css/motion.css` and are nested under
that attribute, so the base stylesheet describes a completely static page.

To add an effect, add it under the appropriate `:root[data-motion="…"]` block. Never
put a hiding rule (`opacity: 0`) outside those blocks — that is what would leave
content invisible when motion is off.

JavaScript-enhanced behaviour lives in:

- `assets/js/app.js` — preferences, welcome, navigation, reveals, filters, palette
- `assets/js/globe.js` — the canvas cyber globe
- `assets/js/report.js` — the case-study report dialog
- `assets/js/core.js` — shared helpers, theme and motion resolution

## Asset revision

Every CSS and JS request in `index.html` carries `?v=<release>`, the JS imports in
`app.js`, `globe.js` and `report.js` carry the same string, and `service-worker.js`
holds `ASSET_REV` and `CACHE_VERSION`.

Bump all of them together:

```html
<link rel="stylesheet" href="assets/css/tokens.css?v=16.0.0">
```

```javascript
import { … } from './core.js?v=16.0.0';
```

```javascript
const CACHE_VERSION = 'v16-0-0';
const ASSET_REV = '16.0.0';
```

`tools/verify_live_workspace.py` fails if the HTML carries more than one distinct
version string, or if the HTML and the service worker disagree.

## Social preview

The source is `assets/social-preview.svg`; the published image is
`assets/social-preview.png` at exactly 1200 × 630.

To regenerate after editing the SVG:

```bash
chrome --headless --disable-gpu --hide-scrollbars --window-size=1200,630 --screenshot=assets/social-preview.png wrapper.html
```

where `wrapper.html` is a minimal page embedding the SVG at 1200 × 630 with zero
margin. Keep both files in step.
