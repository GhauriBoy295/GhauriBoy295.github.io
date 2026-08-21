# FINAL TEST REPORT — AEGIS NEXUS 25.0.0

Branch `redesign/aegis-nexus-v15-live` · repository `GhauriBoy295/GhauriBoy295.github.io`

Everything below was executed. Nothing is marked passed that was not run.
Checks that could not be executed are named, with the reason.

## Release 25.0.0 — 3D depth layer

| Check | Result |
|---|---|
| `tools/verify_portfolio.py` | **22 / 22 passed** |
| `tools/verify_live_workspace.py` | **13 / 13 passed**, asset revision `25.0.0` matched across HTML and service worker |
| `node --check` on every JS module + service worker (incl. new `depth.js`) | clean |
| `depth.js` served | 200 OK at `?v=25.0.0` |
| Console errors on load | 0 |
| Depth wiring | 9 `.depth-card`, 9 `.depth-sheen`, `perspective: 1100px` on each `.depth-scene` |
| `transform-style` on cards | `preserve-3d` (not flattened) |
| Card tilt at full motion | `rotateX(4.9deg) rotateY(-4.9deg)` at a 15%/15% pointer position |
| Layer separation | artwork `translateZ(26px)`, body `translateZ(11.7px)` — genuine parallax |
| Specular sheen | tracks pointer (`15% 15%`), reaches opacity 1, lift shadow applied |
| Pointer-leave cleanup | inline transform and both sheen variables cleared; control returns to the stylesheet |
| Motion `calm` | tilt does not engage, layers flatten to `none` |
| Motion `off` | tilt does not engage, layers flatten to `none` |
| Coarse pointer / touch | `perspective: none` confirmed at 320px |
| WCAG AA contrast, dark | **477 text nodes, 0 below threshold** |
| WCAG AA contrast, light | **477 text nodes, 0 below threshold** |
| Horizontal overflow at 1440×900, at rest | none |
| Horizontal overflow at 1440×900, **every card forced to maximum tilt** | none |

### Defect found and fixed during this release

The Z-lift was first applied at rest rather than only while tilting.
`translateZ` under perspective also scales — a layer 26px nearer the camera
projects about 2.4% larger — so each card's artwork overhung its own edges
while idle (art left `25.5px` against card left `34.1px`). Gating the lift
behind `.is-tilting` fixed it: at rest the artwork measures `380.2px` inside a
`381.6px` card, `transform: none`.

### Not executed

**Live 60fps frame-time profiling of the tilt.** The preview pane was not
compositing during the final pass, so `requestAnimationFrame` did not fire and
frame timings could not be sampled. The tilt engine itself was verified earlier
in the same session while the pane was live (the rotation, sheen, elevation and
cleanup rows above are from that run). The per-frame cost is bounded by design
— one shared rAF for all elements, one `getBoundingClientRect` per pointer
entry rather than per move, and no layout read inside the write path — but it
was not measured on this hardware and is not claimed to be.

---

# FINAL TEST REPORT — AEGIS NEXUS 24.0.0

Branch `redesign/aegis-nexus-v15-live` · repository `GhauriBoy295/GhauriBoy295.github.io`

Everything below was executed. Nothing is marked passed that was not run. Checks
that could not be executed in this environment are listed in **Not executed** at
the end, with the reason.

## Method

| | |
|---|---|
| Browser | Chrome 151.0.7922.109, headless, driven over the DevTools Protocol |
| Server | `python -m http.server 8123 --directory current-portfolio` (port moved off 8080, which is in use by another project) |
| Isolation | Local storage and cache storage cleared per test page; HTTP cache disabled; service worker bypassed, so every run measures the files on disk |
| Themes | Emulated `prefers-color-scheme`, both values |
| Touch | Touch emulation with 5 contact points below 768px |
| Static checks | `tools/verify_portfolio.py`, `tools/verify_live_workspace.py`, `node --check` |

Totals: **73 / 73** functional, keyboard, accessibility, contrast and content
checks passed. **18 / 18** viewport sweeps (9 viewports × 2 themes) passed.
**35 / 35** static checks passed.

Release 24.0.0 moves the palette to navy-blue structure on a near-black ground
with one bright green signal, and extends glass to the project cards. The blur
cost was measured rather than assumed: 4.2ms median with and without, so it
ships — with the filter dropped on small and touch-first screens.

Release 23.0.0 cooled the palette from green to teal-cyan, self-hosts a display
and mono face, introduces glass surfaces over the default matte, and puts a
full-bleed Operations Deck banner above the hero. Both themes were re-checked
for contrast against the new palette: 426 text nodes each, zero below AA.

Release 22.0.0 rebuilt the Experience section as incident tickets: a
classification chip and reference, an architecture flow showing where the work
sat, a labelled work sequence and the notes. Three defects the suite caught
during the build are recorded in the changelog.

Release 21.0.0 docks the access panel and flies the camera *inside* the tunnel:
the vanishing point is placed in the widest free space beside the panel, so the
throat and its converging rings are visible rather than hidden behind the card.
A guard removes the canvas entirely when that free space is under 320px, because
below it the flight degrades to stray dots in a margin.

Release 20.0.0 replaced the welcome glyph rain with a data tunnel — a cylinder of
points flown at the camera, projected by hand on a 2D canvas so the site takes on
no 3D library. It also fixes a live sizing bug: a canvas is a replaced element, so
`inset: 0` never stretched it and the 19.0.0 rain was rendering into a 300x150 box
in the corner. The suite is unchanged and still passes in full.

---

## 1. Static integrity — `tools/verify_portfolio.py`

**Result: 22 passed, 0 failed.** Previous baseline was 18 passed, 4 failed.

| Check | Result |
|---|---|
| `index.html` at deployment root | PASS |
| Exactly one H1 | PASS |
| H1 identifies Sarmad Saeed | PASS |
| No duplicate IDs | PASS |
| Every local `href` / `src` resolves | PASS |
| `MSc Cyber Security Graduate` present | PASS |
| `University of Chester` present | PASS |
| `Graduated` present | PASS |
| **`Worldwide` present** | **PASS** (was FAIL) |
| **UK-only opportunity wording absent** | **PASS** (was FAIL) |
| **Stale LinkedIn URL absent** | **PASS** (was FAIL) |
| **Correct LinkedIn URL present** | **PASS** (was FAIL) |
| `msc candidate` absent | PASS |
| `expected 2026` absent | PASS |
| `currently studying` absent | PASS |
| `pursuing msc` absent | PASS |
| `Sarmad_Saeed_CV.pdf` present | PASS |
| `Sarmad_Saeed_CV.docx` present | PASS |
| Verified credentials section present | PASS |
| Additional completions section present | PASS |
| No `eval(` | PASS |
| No `document.write(` | PASS |
| No `javascript:` URL | PASS |

## 2. Workspace integrity — `tools/verify_live_workspace.py`

**Result: 13 passed, 0 failed.**

Live repository folder, `.git` metadata, all five required files, branch
`redesign/aegis-nexus-v15-live`, correct GitHub remote, readable status, exactly
one HTML asset revision (`24.0.0`), and HTML / service-worker revisions matching.

## 3. JavaScript syntax

`node --check` clean on `app.js`, `core.js`, `globe.js`, `report.js`, `boot.js`,
`project-data.js` and `service-worker.js`.

---

## 4. Responsive sweep — 9 viewports × 2 themes

At each size the welcome was dismissed the way a visitor dismisses it, then the
page was measured. **Page-level horizontal overflow: zero everywhere.**

| Viewport | Theme | `scrollWidth` / `clientWidth` | Overflow | Elements past the viewport | Clipped text | Targets < 24px | Console errors | Failed local requests |
|---|---|---|---|---|---|---|---|---|
| 320 × 568 | dark / light | 320 / 320 | none | 0 | 0 | 0 | 0 | 0 |
| 360 × 740 | dark / light | 360 / 360 | none | 0 | 0 | 0 | 0 | 0 |
| 390 × 844 | dark / light | 390 / 390 | none | 0 | 0 | 0 | 0 | 0 |
| 430 × 932 | dark / light | 430 / 430 | none | 0 | 0 | 0 | 0 | 0 |
| 768 × 1024 | dark / light | 768 / 768 | none | 0 | 0 | 0 | 0 | 0 |
| 1024 × 768 | dark / light | 1024 / 1024 | none | 0 | 0 | 0 | 0 | 0 |
| 1366 × 768 | dark / light | 1366 / 1366 | none | 0 | 0 | 0 | 0 | 0 |
| 1440 × 900 | dark / light | 1440 / 1440 | none | 0 | 0 | 0 | 0 | 0 |
| 1920 × 1080 | dark / light | 1920 / 1920 | none | 0 | 0 | 0 | 0 | 0 |

"Elements past the viewport" counts every element whose border box crosses the
viewport edge, excluding descendants of a scroll container, which are clipped by
that container and cannot push the page.

Also verified at every size: exactly one H1, five missions rendered, and navigation
usable (inline nav above 1119px, hamburger below).

**Welcome controls** at 390 × 844: the Enter button is fully inside the viewport
with a non-zero box. At 320 × 568 the welcome panel scrolls vertically inside its
own container.

**Case study** at 390 × 844: the report shell fits within the viewport width and
scrolls as one document.

## 5. Themes

| Check | Result |
|---|---|
| System mode follows the OS | PASS — resolves to light under emulated light, dark under emulated dark, with `data-theme-choice="system"` |
| Explicit dark applies and persists | PASS — `localStorage.aegis-theme = "dark"` |
| Explicit choice survives reload | PASS |
| No flash of the wrong theme before first paint | PASS — resolved in the pre-paint inline script; the post-reload sample already reads `dark` |
| `theme-color` metadata updates | PASS — `#EDF2F6` light, `#04090E` dark |
| Theme menu exposes current state | PASS — `role="menuitemradio"` with `aria-checked`, `aria-expanded` on the trigger |
| Light is not an inversion | PASS — canvas and green tokens are independently authored, not derived |
| **WCAG AA contrast, dark** | **PASS — 411 text nodes, 0 below threshold** |
| **WCAG AA contrast, light** | **PASS — 411 text nodes, 0 below threshold** |

Contrast method: for every element with its own visible text, the computed colour
was composited over the resolved backdrop stack, and the ratio checked against 4.5:1,
or 3:1 for large text (≥24px, or ≥18.66px at weight ≥700).

## 6. Motion

| Check | Result |
|---|---|
| Full works | PASS |
| Calm works | PASS |
| Off works | PASS |
| Each level persists | PASS — `localStorage.aegis-motion` |
| Default on a capable desktop | PASS — `full` |
| Default on a small touch device | PASS — `calm` at 390 × 844 with touch emulation |
| `prefers-reduced-motion` default | PASS — `off` |
| All content visible with motion off | PASS — every `.reveal` and every `.stagger` child at opacity 1 with no transform |
| No continuous animation with motion off | PASS — zero running infinite-iteration animations |
| No heavy continuous motion on small/touch devices | PASS — the canvas globe is not created; the static SVG is served instead |
| Dot-matrix globe renders at Calm as one static frame, with no loop | PASS |
| Animation pauses offscreen / when hidden | PASS — `.is-idle` on `data-ambient` sections; the globe loop returns on `document.hidden` and on leaving the viewport |
| Core-skill bars fill on scroll at Full, static at Calm and Off | PASS |
| Welcome verification sequence runs at Full | PASS — sampled 0% → 25% → 75% → 100% over ~2.3s, state label `Verifying` → `Ready` |
| Welcome sequence completes instantly at Calm and Off | PASS — checklist painted complete on first frame, no rain canvas created |
| Welcome tunnel is skipped on touch-first / small screens | PASS — at 390x844 with touch emulation the canvas is removed and the panel is unaffected |
| Welcome tunnel is skipped under prefers-reduced-motion | PASS — motion resolves to `off`, canvas removed, checklist still completes |
| Welcome tunnel canvas is full-bleed | PASS — backing store and CSS box both 1440x900 at 1440x900 |
| Welcome tunnel frame budget | PASS — median 33.4ms (its 30fps cap), p95 50.0ms, on a ~3s scene gated to Full motion |
| Welcome tunnel appears only where it can converge | PASS — present at 1440 and 1280, removed at 1100, 1024 and 390 by the 320px free-space guard |
| Docked panel keeps every control on screen | PASS — Enter, Skip and Download CV all inside the viewport at 1440, 1920, 1100 and 1024 |
| Skipping mid-sequence completes it immediately | PASS — `finish()` is idempotent and called by Enter, Esc, Skip and the safety timer |

## 7. Keyboard and accessibility

| Check | Result |
|---|---|
| Skip link targets a focusable `main` | PASS |
| Welcome traps focus | PASS |
| `Enter` dismisses the welcome and focuses main | PASS |
| `Esc` skips the welcome | PASS |
| Replay welcome restores the sequence | PASS |
| Mobile menu opens and moves focus into itself | PASS |
| `Esc` closes the mobile menu and restores focus to the toggle | PASS |
| Report dialog opens modally | PASS |
| `Esc` closes the report and clears the hash | PASS |
| Focus returns to the mission trigger on close | PASS |
| `Ctrl+K` opens the palette with focus in the field | PASS |
| `Esc` closes the palette and restores focus to its trigger | PASS |
| `↑` `↓` move the command selection | PASS |
| `?` opens the shortcuts sheet | PASS |
| `T` toggles the theme | PASS |
| `M` cycles motion | PASS |
| `G` then `P` jumps to projects | PASS |
| Report rail supports arrow-key navigation | PASS |
| Every icon-only control has an accessible name | PASS — zero controls without text or a label |
| Status regions use `aria-live` | PASS — toast, filter status, operator terminal |
| Decorative SVG hidden or labelled | PASS |
| Preference menus expose `menuitemradio` state | PASS |
| No essential hover-only content | PASS |

## 8. Functional

| Check | Result |
|---|---|
| Five missions render | PASS |
| Discipline filter narrows correctly and announces the count | PASS — "Showing 1 mission in offensive security." |
| NIST filter works independently | PASS |
| Reset restores all five | PASS |
| Placeholder card is excluded from counts and hidden under any filter | PASS |
| Lifecycle shows exactly one panel | PASS |
| Lifecycle tab switches panels | PASS |
| Red Cell / Blue Team control works | PASS |
| Report populates title, rail, five panels and artefacts | PASS |
| Evidence timeline renders the work sequence | PASS — four steps |
| Previous / Next moves between missions | PASS |
| Offensive mission classified as Red Cell | PASS |
| Report mirrors into the URL | PASS — `#case-dfir` |
| Deep link opens the report and skips the welcome | PASS |
| Every case study reachable from the palette | PASS — 5 entries |
| LinkedIn command uses the correct URL | PASS |
| Copy link, copy email, print | PASS |
| CV downloads resolve | PASS — all 6 `download` links return HTTP 200 |
| Every local asset request succeeds | PASS — no response ≥ 400 |
| Online / offline state is truthful | PASS — bound to `navigator.onLine` and the online/offline events |
| Install action appears only when supported | PASS — `hidden` until `beforeinstallprompt` fires |
| Service worker updates without stale-cache lock-in | PASS by inspection — navigations are network-first with `cache: 'no-store'`; the cache version bump deletes every older cache on activate |

## 9. Print

| Check | Result |
|---|---|
| Whole page prints on white | PASS — body background `rgb(255,255,255)`, text `rgb(28,42,54)` |
| Header, globe and filters removed from print | PASS |
| External link destinations printed | PASS |
| Single case study prints as a report | PASS — site shell and rail hidden |
| All five report panels print, not just the selected tab | PASS |

Generated PDFs: `print-profile.pdf`, `print-case-study.pdf`.

## 10. No-JavaScript fallback

Script execution disabled at the engine level:

| Check | Result |
|---|---|
| Welcome removed | PASS |
| Page scrolls normally | PASS |
| All five missions visible | PASS |
| All six skill rows visible | PASS |
| Every `.reveal` at full opacity | PASS |
| CV download links present | PASS — 5 (PDF and DOCX both reachable) |
| Correct LinkedIn URL present | PASS |
| Worldwide wording present | PASS |
| Navigation visible | PASS |
| Readable content | PASS — 10,665 characters of text |

## 11. Content truth

| Check | Result |
|---|---|
| Hero reads exactly "Open to cyber security opportunities worldwide" | PASS |
| Work modes: remote, hybrid, on-site, relocation | PASS |
| Base remains the United Kingdom | PASS |
| No stale LinkedIn URL in the DOM | PASS |
| Correct LinkedIn URL present | PASS |
| No candidate / expected / currently-studying wording | PASS |
| Graduated, 2025–2026, University of Chester | PASS |
| Three verified credentials and two additional completions kept separate | PASS — two `.register-group` blocks, 3 linked rows and 2 unlinked rows |
| No percentage skill claims | PASS — no `\d+%` anywhere in the rendered text |

## 12. Performance — measured, not scored

HTTP cache disabled and service worker bypassed, so these are cold-load figures.

| Metric | Desktop 1440 × 900 | Mobile 390 × 844 |
|---|---|---|
| Requests (same origin) | 17 | 17 |
| Transferred | 175 KB | 175 KB |
| DOM nodes | 1,577 | 1,575 |
| Long tasks (> 50 ms) | 0 | 0 |
| **Cumulative Layout Shift** | **0** | **0** |

No raster images are requested by the page at all: every illustration is inline SVG
or canvas. `assets/social-preview.png` is referenced only by metadata. Mission
artwork reserves a 16:9 box before it paints, which is why CLS is zero rather than
merely small.

## 13. Version synchronisation

| Location | Value |
|---|---|
| Nine `<link>` tags in `index.html` | `?v=17.0.0` |
| Module `<script>` tag | `?v=17.0.0` |
| Import specifiers in `app.js`, `globe.js`, `report.js` | `?v=17.0.0` |
| `service-worker.js` `ASSET_REV` | `17.0.0` |
| `service-worker.js` `CACHE_VERSION` | `v17-0-0` |
| Footer status line | `Release 17.0.0` |
| `README.md`, `FINAL_CHANGELOG.md`, this report | `17.0.0` |

Verified by `verify_live_workspace.py`: exactly one distinct HTML revision, matching
the service worker.

## 14. Social preview

`assets/social-preview.png` regenerated from `assets/social-preview.svg` at exactly
**1200 × 630**. Content: availability pill, name, title, university and status,
Current base / Availability status cards, focus tags, globe, work modes. No
percentages, no certification marks, no portrait.

---

## 15. Continuous verification

`.github/workflows/verify.yml` re-runs a subset of these checks inside GitHub on
every push and pull request: JavaScript syntax on all five modules and the
service worker, asset-revision synchronisation, required-file presence, exactly
one H1, and every content rule (worldwide wording present, correct LinkedIn URL
present, stale URL and forbidden status wording absent). A change that breaks any
of them fails the build rather than reaching the live site.

`.github/workflows/deploy.yml` publishes `main` to Vercel and Netlify once their
secrets exist, and skips cleanly until then. GitHub Pages is left to its existing
branch-based publish.

---

## Not executed

| Item | Reason |
|---|---|
| Lighthouse | No Lighthouse binary in this environment. Section 12 reports directly measured values instead. |
| Manual screen-reader pass (NVDA / JAWS / VoiceOver) | Not available here. Roles, names, states, live regions and focus behaviour were verified programmatically. |
| Real-device testing | Not available. All nine viewports used Chrome device emulation, with touch emulation below 768px. |
| OS-level reduced-motion and colour-scheme toggles | Emulated through Chrome media emulation rather than changed in an operating system. |
| Live GitHub Pages verification | The redesign has not been pushed. Nothing is deployed without explicit approval. |
