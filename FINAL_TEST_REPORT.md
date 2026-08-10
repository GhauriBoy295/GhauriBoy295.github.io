# Final Test Report

**Release under test: `13.0.0` — "Sentinel Executive".**

This report was generated from the build it describes. The previous report in
this repository documented `6.0.3` while the site shipped `12.0.1`; that drift
is the reason this document now states the version at the top and is
regenerated per release.

Every result below was produced by actually running the check. Anything not
run is marked **Not measured** rather than assumed.

---

## 1. Static checks

| Check | Command | Result |
|---|---|---|
| Project verifier (8 checks) | `python tools/verify_portfolio.py current-portfolio` | **PASS** |
| Whitespace / conflict markers | `git diff --check` | **PASS** |
| JS syntax — main | `node --check script.js` | **PASS** |
| JS syntax — service worker | `node --check service-worker.js` | **PASS** |
| Manifest is valid JSON | `python -c "json.load(...)"` | **PASS** |
| CSS brace balance | 995 open / 995 close | **PASS** |
| Duplicate IDs | verifier | **PASS** — none |
| Inline event handlers | verifier | **PASS** — none |
| Local references resolve | verifier | **PASS** |
| Banned MSc wording | verifier | **PASS** — none present |

---

## 2. Contrast — measured in-browser, both themes

Computed with the WCAG relative-luminance formula against the live computed
token values, not estimated from hex codes.

| Pair | Dark | Light |
|---|---|---|
| text / background | 17.63 | 17.18 |
| muted / background | 7.44 | 6.30 |
| green / background | 11.36 | 6.26 |
| green / surface | 11.06 | 6.73 |
| red / background | 6.25 | 5.91 |
| red / surface | 6.09 | 6.35 |
| muted / surface | 7.25 | 6.77 |
| on-accent / green fill | 12.31 | 6.73 |

**Failures below the 4.5:1 AA threshold: 0 in both themes.**

Two palette values from the brief had to be changed to reach this, and both
are recorded in `AUDIT_BASELINE.md` and in the stylesheet comments:

- `--line-500` (`#1c3852`) is 1.3:1 on the navy surface — unusable for
  anything that must be seen. Retained for hairline dividers only.
- `--red-500` (`#ff3b4e`) is 4.3:1 on `--navy-900`, just under AA.
  Text-bearing red uses `--red-400` (`#ff5a6b`) at 5.2:1.

---

## 3. Responsive matrix — 9 viewports

Measured with the viewport actually set, checking `scrollWidth` against
`clientWidth` for page-level horizontal overflow.

| Viewport | Overflow-X | scrollW / clientW | H1 clipped | H1 count | Undersized targets |
|---|---|---|---|---|---|
| 320 × 568 | none | 320 / 320 | no | 1 | 0 |
| 360 × 740 | none | 360 / 360 | no | 1 | 0 |
| 390 × 844 | none | 390 / 390 | no | 1 | 0 |
| 430 × 932 | none | 430 / 430 | no | 1 | 0 |
| 768 × 1024 | none | 753 / 753 | no | 1 | 0 |
| 1024 × 768 | none | 1009 / 1009 | no | 1 | 0 |
| 1366 × 768 | none | 1351 / 1351 | no | 1 | 0 |
| 1440 × 900 | none | 1425 / 1425 | no | 1 | 0 |
| 1920 × 1080 | none | 1905 / 1905 | no | 1 | 0 |

**No page-level horizontal overflow at any tested width.**

### Target-size defects found and fixed during this pass

The first run at 320px reported 16 undersized controls. Investigating each:

| Control | Measured | Verdict |
|---|---|---|
| `.filter-button` | 43.34px | **False positive.** Layout box is 44px; the 43.34 was the preview pane's ~0.985 render scale. |
| `.project-link` | 37.9px | **False positive.** Layout box 49.8px, distorted by an ancestor transform. |
| `.button` (hero CTAs) | 36.6px | **Real.** Fixed. |
| `.footer-brand` | 32.0px | **Real.** Fixed. |
| `.text-link` | 25.2px | **Real.** Fixed. |
| footer links | 16.5px | **Real.** Fixed. |

The lesson recorded here for future passes: `getBoundingClientRect()` is the
wrong tool for auditing target size when the page uses transforms, because it
returns the *painted* box. `offsetWidth` / `offsetHeight` return the layout
box and are the correct measure. Re-auditing with `offsetHeight` gave 0
undersized targets at 320px.

A second real defect surfaced at 1024px, where the coarse-pointer rule stops
applying: four standalone controls were below the WCAG 2.2 AA **24×24**
floor — `.hero-scroll` (148×9), `.text-link` (127×21), "Replay welcome"
(76×17) and "Back to top" (54×17). None qualify for the inline-link
exception. Fixed with a desktop-level 24px minimum; re-audit returns 0.

---

## 4. Functional checks

| Check | Result |
|---|---|
| Console errors | **0** |
| Single H1, text = "Sarmad Saeed" | **PASS** |
| Hero metrics in source HTML | **PASS** — `2 / 5 / 3 / 6`, not zeros |
| Metric labels | "Cyber security degrees", "Featured case studies", "Verified course credentials", "Core security domains" |
| Counters settle on real values | **PASS** — verified post-animation |
| Credentials split | **PASS** — Verified (3) and Additional (2) as separate lists |
| GitHub profile link | **PASS** — present in contact |
| Source repository link | **PASS** — present in contact |
| LinkedIn link | **PASS** — `sarmad-saeed-cyber` (see note below) |
| CV PDF / DOCX links | **PASS** — both resolve |
| NIST filters | **PASS** — 4 filters, each returns the correct single project |
| Case-study dialog framework block | **PASS** — renders for mapped projects, hidden for the unmapped one |
| Canonical URL | **PASS** — added |
| sitemap.xml | **PASS** — created, referenced from robots.txt |
| PWA icons 192 / 512 / apple-touch | **PASS** — created, referenced from manifest |
| Service-worker precache URLs | **PASS** — now match the document's `?v=` requests |

### LinkedIn URL — deliberate deviation from the brief

The brief names `sarmad-saeed-845a7b267` as source of truth. The site uses
`sarmad-saeed-cyber`, which is the custom vanity URL claimed on the live
LinkedIn profile at the user's explicit request in a previous session.
`845a7b267` is the superseded auto-generated slug and now redirects.
Reverting would point the site at a non-canonical URL. **Not changed**, and
raised with the user rather than silently resolved either way.

---

## 5. Version synchronisation

| Artefact | Before | After |
|---|---|---|
| `index.html` asset query | `v=12.0.1` | `v=13.0.0` |
| `service-worker.js` cache | `v8-0-0` | `v13-0-0` |
| `service-worker.js` `ASSET_REV` | *(did not exist)* | `13.0.0` |
| `FINAL_CHANGELOG.md` | `12.0.1` | `13.0.0` |
| `FINAL_TEST_REPORT.md` | **`6.0.3`** | `13.0.0` |

The service worker previously precached `styles.css` and `script.js` without
the query string the document actually requests, so the two largest assets
were never served from the precache. Now derived from a single `ASSET_REV`.

---

## 6. Not measured

Stated plainly rather than converted into a pass:

- **Lighthouse** (Performance / Accessibility / Best Practices / SEO, LCP,
  CLS, TBT) — no Lighthouse binary available in this environment. **Not
  measured.** No score is claimed.
- **Playwright** — not available. Browser testing was done through a real
  Chromium session driven directly, which covers the same behaviour but
  produces no Playwright artefacts.
- **Real-device testing** — emulated viewports only. Coarse-pointer rules
  were verified by media-query state, not on physical hardware.
- **Screenshots as files** — captured and reviewed during this pass at
  desktop and tablet widths, but the capture path returns images inline
  rather than writing them to disk, so no image files are attached.
