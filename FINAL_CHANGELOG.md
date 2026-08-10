# Final Changelog

## 13.0.0 — "Sentinel Executive"

Palette rebuilt around black, deep navy, secure green and incident red, with
colour used semantically rather than decoratively: green means secure /
confirmed / active, red means risk / incident. Neither is alternated for
variety.

### Correctness fixes

- **The H1 is now the person.** It was the slogan "Defend systems. Analyse
  signals. Build resilience."; the candidate's name was not a heading at all.
  Name -> role -> institution -> tagline -> lead is now the hierarchy.
- **Hero metrics carry real values in the HTML.** They were hard-coded `0`
  with the true value in a data attribute, so screen-reader users, no-JS
  users and crawlers all saw zero. JavaScript now animates presentation only.
- **The credential count no longer contradicts itself.** The hero said three
  course completions while the credentials strip listed five. Now split into
  "Verified credentials (3)" — those with a public verification link — and
  "Additional course completions (2)", labelled *Unverified*.
- **`Ghauri_Boy` removed from the welcome-screen identity block**, where it
  sat beside degree status. It remains only as `alternateName` in structured
  data, which is what a handle is for.
- **Service-worker precache actually works.** It precached `styles.css` and
  `script.js` while the document requested `styles.css?v=...`, so the two
  largest assets never came from the precache. Both now derive from a single
  `ASSET_REV` constant.
- **Version drift resolved.** HTML assets, service-worker cache, changelog
  and test report were on four different versions — the shipped test report
  documented `6.0.3` against a `12.0.1` build. All now `13.0.0`.

### Accessibility

Target sizes audited at 320px and 1024px and fixed in two passes:

- Coarse pointer / narrow: hero CTAs (36.6px), footer brand (32px), text
  links (25.2px) and footer links (16.5px) were under the 44px minimum.
- Fine pointer: `.hero-scroll` (9px tall), `.text-link` (21px), "Replay
  welcome" (17px) and "Back to top" (17px) were under the WCAG 2.2 AA 24x24
  floor. None qualify for the inline-link exception.

Contrast measured in-browser across both themes: **zero failures**. Two
supplied palette values had to change to get there — `--line-500` is 1.3:1 on
navy and is now hairlines only; `--red-500` is 4.3:1 and text-bearing red
uses `--red-400` at 5.2:1.

### Added

Canonical URL, `sitemap.xml`, updated `robots.txt`, PWA icons at 192/512 plus
an Apple touch icon and a maskable entry, GitHub profile and source-repository
links in contact and structured data.

### Not done

The brief asked for `styles.css` and `script.js` to be split into modules.
Deferred deliberately — reasoning in `AUDIT_BASELINE.md`. Lighthouse is
reported as *Not measured* because no Lighthouse binary is available here.


## 12.0.1 — "Premium Sleek" redesign

A hybrid of the dark developer aesthetic and the corporate/GRC register, plus
two structural additions that answer the "certification matrix" and "framework
alignment" brief.

### Palette

Retuned from the flat monochrome scheme to deep matte charcoal with electric
indigo as the primary signal and cyber teal as the secondary. The token
architecture meant this was a single block change, not a rewrite.

Two contrast corrections were needed and are worth recording, because both
would have shipped as accessibility failures:

- The brief specified `#6366F1` as the accent. On this charcoal it measures
  **4.10:1** — below the 4.5:1 AA threshold for body text. The accent used for
  text is `#818CF8` (6.27:1); `#6366F1` survives only as a solid fill, where
  the label sits on it in near-black.
- In the light theme the secondary accent was `#0284C7` (sky-600), measuring
  **4.10:1** on white. Corrected to `#0369A1` (sky-700) at **5.93:1**.

Every text/background pair now clears AA in both themes. Measured in-browser,
not estimated.

### Glassmorphism, bounded

Frosted-glass panels replace the flat fills. This site previously shipped a
performance fix that removed exactly this feature, so the treatment is capped:

- A single 14px radius on every panel and on the sticky header. The base rules
  declare a 16–24px mix; those are all overridden.
- Disabled entirely on coarse pointers and under
  `prefers-reduced-transparency`, where the cost is highest and the effect is
  least visible.
- Structure still comes from a hairline border, not from the blur.

### Verified credentials strip

Five real course completions. The three with a Coursera verification code link
out to it; the two with no supplied certificate file are shown unlinked and
labelled "Course completion", so a reader can tell the difference at a glance.

No industry certifications are claimed. The brief suggested displaying
Security+, CEH and CISSP — none of which Sarmad holds — and that was not done.

### NIST CSF mapping

Each project carries a badge for the one CSF function it genuinely serves, and
the case-study dialog expands this into a short justification:

| Project | Function |
|---|---|
| Integrated Randomness Testing Suite | Protect |
| Intrusion Detection for ICS | Detect |
| DFIR Labs | Respond |
| Security Assessment & Active Defence Labs | Identify |
| Blood Bank Database System | *(unmapped)* |

The database project is deliberately unmapped. It is a data-modelling
exercise, not a security control, and forcing it into a function would be
dishonest. The dialog renders nothing for it.

Four new filters were added alongside the discipline filters. All four were
tested and return the correct single project each.

### Also fixed

`404.html` was still carrying the neon-green palette from three themes ago.
It, `favicon.svg` and `site.webmanifest` now match the current scheme, as does
the regenerated social preview image.

### Not done, and why

The source brief recommended rebuilding on Astro, Next.js or Hugo. This site
is a working, tested, deployed static build with a no-build constraint in
`CLAUDE.md`; switching stacks would discard that for no user-visible gain.


## 6.0.3 — 30 July 2026

Performance fix, black and neon green theme, matrix code-rain background, and directional scroll
entrances. Previous state at `backup/pre-neon-green-5.3.1/`.

### Why it was lagging

Measured rather than guessed. The page was running, simultaneously and permanently:

| Cost | Before | After |
|---|---|---|
| Full-screen canvases with their own rAF loops | 2 | **1** |
| CSS blur layers | 14 | **1** |
| Infinite animations running on screen | 32 | **8** |

The single worst offender was the animated gradient mesh: a **2133 × 1348 px layer with
`blur(46px)` animating its transform forever** — roughly 2.9 megapixels of blurred surface
recomposited every frame. Behind it sat two more `blur(105px)` aurora layers, also animating, plus
a full-viewport CRT sweep and a second particle canvas.

Removed outright: the gradient mesh, both auroras, the CRT sweep, and the network-particle canvas.
The scanline texture stayed but lost its infinite `background-position` animation, which was
repainting the whole viewport for a static-looking effect.

**Off-screen sections now pause.** An observer marks any section outside the viewport
`.section-idle`, which sets `animation-play-state: paused` on everything inside it. Radars, signal
bars, marquees and pulses stop the moment they scroll away. At rest only 8 infinite animations run,
and only in the section you are actually looking at.

### Theme

Black base with neon green. All 12 contrast measurements pass WCAG AA, most of them comfortably:

| Pair | Dark | Light |
|---|---|---|
| Accent on background | 15.12:1 | 6.25:1 |
| Body text | 17.96:1 | 16.01:1 |
| Muted text | 8.40:1 | 6.11:1 |
| Label on accent fill | 14.47:1 | 6.70:1 |

Base `#050806`, accent `#00FF9C`, secondary lime `#B4FF39`. `404.html`, `favicon.svg` and the web
manifest were retuned in the same pass.

### Matrix code-rain background

The one remaining full-screen animation, and now the page's actual backdrop. Budgeted throughout:
a single canvas and rAF loop, a fixed ~14 fps step rather than every frame, device pixel ratio
clamped to 1.5, column count capped at 110, suspended entirely when the tab is hidden, and never
started at all on touch devices, screens under 900 px, or under reduced motion.

### Directional entrances

Sections and cards now arrive from different edges instead of every block sliding up: `left`,
`right`, `up`, `down`, `back` (recedes in depth and scales in), and `tilt-left` / `tilt-right`
(enters on a slight Y-axis rotation). Assigned so adjacent cards alternate. All are transform and
opacity only, so they stay on the compositor and add nothing to the main thread.

### Two bugs I introduced and fixed

Both were mine, from doing the CSS removals with regex:

1. **Four orphan braces** left behind by the keyframe deletions. CSS parsing broke at the first one,
   which silently killed every rule after it — including `.rain-canvas`. The canvas lost
   `position: fixed`, became an in-flow block, and pushed the hero **985 px down the page** with no
   content visible. Repaired, and brace balance is now verified programmatically (802 open, 802
   close, never dipping below zero).
2. **Sections pre-marked idle.** The first version added `.section-idle` to every section up front
   and relied on the observer to clear it. If that first callback were ever delayed or dropped, the
   whole page would sit frozen. Now the observer sets idle only for sections it has actually seen
   leave the viewport.

### Verification

12/12 contrast pass · overflow 0 · single `h1` · no console errors · verifier 8/8 · `node --check`
clean · canvas confirmed `position: fixed` at `z-index: -4` with the hero back at its correct
offset · 6 of 9 sections idle at rest · all 7 reveal directions present in the markup.


## 5.3.0 — 30 July 2026

Dark red "ethical hacker" scheme, and the social preview regenerated to match. Previous state
preserved at `backup/pre-red-cyber-5.2.0/`.

### Theme

This is what the token architecture was built for: the retheme is a **20-value edit to one
block**, not another find-and-replace sweep across the stylesheet. No component rule changed.

| Token | Dark | Light |
|---|---|---|
| Background | `#080506` | `#F8F5F5` |
| Surface | `#140C0E` | `#FFFFFF` |
| Primary accent | `#FF4D5A` | `#BA1220` |
| Secondary accent | `#FF9A3C` | `#9E4A0A` |
| Text | `#F5EEEF` | `#1E1618` |

A near-black base carrying a faint red cast, signal red as primary, amber as the informational
secondary. Every ambient effect — scanlines, sweep, code rain, glitch, gradient mesh, radar —
recoloured automatically, because they all read from the tokens rather than from literals.

Contrast measured across both themes, six pairs each: **12 measurements, zero failures.** Lowest
is 5.63:1 against a 4.5:1 requirement.

### Also synced

A sweep for literals from earlier revisions found five assets that would have shipped mismatched.
Four of them predate the token refactor, so no amount of retheming the stylesheet would have
caught them:

- `favicon.svg` — backdrop was still the indigo-era `#0B0E1A`.
- `site.webmanifest` — `background_color` was still the **emerald-era** `#050b13` and
  `theme_color` the 4.x red `#0a0406`. Both now `#080506`.
- `404.html` — a standalone page with its own inlined styles, still **entirely emerald**:
  background, grid, accent, button and body text. Retuned to the dark red scheme, with a comment
  noting it must be kept in step manually.
- `script.js` network canvas — the particle field's connection lines were hardcoded
  `rgba(103,245,195,.13)` emerald with an emerald fallback for the node colour. Both now read
  from `--accent-rgb`, so the field retints with the theme like the code rain already did.
- `assets/social-preview.png` — regenerated from `social-preview.svg` at 1200 × 630 (102 KB),
  retuned to the exact new token values.

A DOM sweep for green- or blue-dominant computed colours across `backgroundImage`,
`backgroundColor`, `boxShadow`, `borderColor` and `color` on every element now returns **zero**
matches, and a source grep for every emerald- and indigo-era literal returns nothing.

### Verification

12/12 contrast pass · overflow 0 at 320 and 1440 · 0 controls under 44 × 44 · single `h1` ·
0 controls without accessible names · counters resolve to 2/5/3/6 · deep-link, shortcuts overlay,
local time, code rain and gradient mesh all working · no console errors · verifier 8/8 ·
`node --check` clean on both scripts · PNG verified as valid 1200 × 630 matching the declared
`og:image` dimensions.


## 5.2.0 — 29 July 2026

One deep dark theme, and five new features. The four-palette switcher added in 5.1.1 is removed.
Previous state preserved at `backup/pre-single-dark-5.1.1/`.

### Theme

The token architecture is kept — it is what makes the scheme retunable from one block — but it
now declares a single dark theme plus the light variant the accessibility spec requires. The base
is deeper than before: `#06070A`, with surfaces stepping up in measured increments
(bg → surface → raised → overlay) so depth reads as structure rather than as arbitrary panels.

Measured contrast, dark theme:

| Pair | Ratio |
|---|---|
| Accent on background | 8.10:1 |
| Body text on background | 17.65:1 |
| Muted text on background | 7.31:1 |
| Secondary on background | 11.50:1 |
| Button label on accent fill | 8.04:1 |

Removed with the switcher: the palette button, its swatch styles, the four command-palette
entries, the `portfolio:palettechange` event and the three extra palette blocks. Zero references
to `palette` remain in either the stylesheet or the markup.

### New features

All five are drawn from the "optional if cleanly implemented" list in the project's own design
spec, rather than invented.

1. **Deep-linkable case studies.** The open case study is mirrored into the URL as `#case-<id>`.
   Arriving on such a link skips the welcome panel and opens that case study directly. History is
   replaced rather than pushed, so Back never walks through every dialog the visitor opened, and
   the hash is cleared on close.
2. **Copy link to case study.** A clipboard action inside the dialog, with a toast on success and
   an honest fallback message on failure.
3. **Print a single case study.** A print action that collapses the page to just the open dialog.
   This also fixed two real bugs in the existing print stylesheet: `dialog { display:none }` meant
   printing a case study produced a blank page, and `--accent: var(--accent)` was a
   self-referencing declaration left behind by an earlier find-and-replace, which made the token
   invalid at computed-value time.
4. **UK local time.** Clearly labelled, computed in the browser from the `Europe/London` zone via
   `Intl.DateTimeFormat`, refreshed every 30 s, with an "usually available / outside usual hours"
   note. Nothing about the visitor's own location or clock is read or transmitted. If the runtime
   has no zone support the block stays hidden rather than showing a guess.
5. **Keyboard shortcuts overlay.** `?` opens an accessible dialog listing all eight controls, also
   reachable from the command palette. Adds `T` to toggle theme and `G` then a letter to jump to a
   section. All single-key shortcuts are suppressed while typing, while a dialog is open, and
   during the welcome panel.
6. **Offline shell.** `service-worker.js` precaches the static shell. Navigations are
   network-first with the cached shell as the offline fallback, so deployed updates stay visible
   instead of being masked by cache; assets are stale-while-revalidate. The cache is versioned and
   old caches are deleted on activate. Registration is skipped on `file://`, and failure is
   silent because offline support is an enhancement.

### Verification

Dark-theme contrast 5/5 pass · overflow 0 at 320 and 1440 · 0 controls under 44 × 44 · single
`h1` · 0 controls without accessible names · deep-link opens the correct case study and clears on
close · `?` opens the shortcuts dialog with 8 rows · `T` toggles theme · local time renders ·
service worker registers and takes control · no console errors · verifier 8/8 · `node --check`
clean on both scripts.


## 5.1.1 — 29 July 2026

Rebuilt the colour layer as a real design system and added an art-directed motion layer. The red
theme is gone. Requested as "all of them, in a proper way", which is delivered as **one token
architecture with four selectable dark palettes** rather than four looks competing on one screen.

The previous state is preserved at `backup/pre-palette-system-4.0.3/`.

### Colour architecture

Colour was previously scattered across ~136 distinct hardcoded literals, which is why each
retheme leaked stragglers. It is now a token system:

- Palettes define **channel triplets only** (`--accent-rgb: 109 124 255`), space separated so any
  rule can compose its own alpha with `rgb(var(--accent-rgb) / .3)`.
- Every other token is derived once from those triplets.
- Switching palette is a single `data-palette` attribute change; nothing else moves.
- Legacy aliases (`--blue`, `--blue-soft`) are retained so existing rules keep resolving.

After the refactor the only colour literals left in the stylesheet are the two semantic tokens
(`--warning`, `--danger`) and the three macOS-style window dots, all deliberate.

### The four palettes

| Palette | Base | Primary | Secondary |
|---|---|---|---|
| **Indigo** (default) | `#0B0E1A` | indigo `#6D7CFF` | cyan `#38E0F0` |
| **Monochrome** | `#0A0A0B` | electric blue `#4F7DFF` | neutral steel |
| **Emerald** | `#070D12` | emerald `#4FE3B0` | blue `#5AB9FF` |
| **Aurora** | `#0C0A12` | violet `#A78BFA` | magenta `#EC4899` |

Each has a light variant. **All 8 palette/theme combinations were contrast-measured across five
pairs each — 40 measurements, zero failures against WCAG AA.** One did fail on the first pass
(indigo light secondary at 4.01:1) and was darkened to 5.24:1.

### Palette switcher

- Header control cycling the four palettes, with a live two-tone swatch and an `aria-label` that
  announces the current palette.
- Four explicit entries in the ⌘K command palette for direct selection.
- Persisted to `localStorage` and resolved before first paint alongside the theme, so there is no
  flash of the wrong palette.
- `theme-color` browser-bar colour tracks the active palette and theme.

### Designed motion layer

Added on top of the existing effects, which were kept as requested:

- **Animated gradient mesh** — three counter-drifting accent fields on a 26 s cycle.
- **Stagger choreography** — grids resolve child-by-child on a 40 ms cascade instead of as one
  block. Applied to 6 groups.
- **Scroll-linked parallax** — writes a custom property only, so the compositor sees a plain
  transform. Fine-pointer devices only.
- **Spring hover physics** on 16 cards, plus wipe-in accent underlines on 10 links.
- **Self-drawing SVG strokes** — path lengths measured at runtime and drawn on scroll-in.
- **Page-load sequence** — header, hero copy and hero panel settle in on a staged cascade.
- **Section index rules** — an accent rule grows out from each section number.

All seven have `prefers-reduced-motion` overrides, verified present in the live CSSOM rather than
just in source.

### Verification

40/40 contrast measurements pass · overflow 0 at 320 and 1440 · all touch targets ≥ 44 × 44
including the new palette button · single `h1` · 0 controls without accessible names · palette
cycles and persists correctly · dialog opens and returns focus · command palette at 15 entries ·
no console errors · verifier 8/8 · `node --check` clean.


## 4.0.3 — 29 July 2026

Red terminal restyle, requested directly by the site owner. This reverses the restraint pass in
3.1.0 and moves the accent from emerald to red. Recorded plainly: the approved design spec calls
for an emerald accent and reserves red for risk semantics, and asks that the site not read as a
"noisy hacker template". This release departs from that on the owner's explicit instruction.

The previous state is preserved at `backup/pre-red-theme-3.1.0/` and can be restored by copying
those three files back over `index.html`, `styles.css` and `script.js`.

### Palette

Emerald and blue replaced throughout — variables, hardcoded literals, favicon, `theme-color`
metas and the web manifest.

| Role | Before | After |
|---|---|---|
| Accent (dark) | `#67f5c3` | `#ff4d5a` |
| Accent strong | `#27dba0` | `#ff2233` |
| Secondary | `#70b8ff` | `#ff9a3c` |
| Accent (light) | `#087e61` | `#c1121f` |
| Background | `#050b13` | `#0a0406` |
| Danger | `#ff7c8f` | `#ffb648` |

Danger moved to amber so it stays distinguishable now that red is the brand colour.

Measured contrast, all passing WCAG AA:

| Pair | Dark | Light |
|---|---|---|
| Accent on background | 6.26:1 | 5.61:1 |
| Body text on background | 18.36:1 | 15.73:1 |
| Muted text on background | 8.58:1 | 5.73:1 |
| Accent on surface | 5.95:1 | — |
| Primary button label on fill | 5.80:1 | 6.22:1 |

**Primary button label fixed (4.0.1).** The emerald palette used a near-black label on a bright
mint fill. Carrying that label straight over to the light theme's deep red left the primary
buttons at **3.03:1**, which fails AA for normal text. The light theme now flips the label to
white, reaching 6.22:1. The dark theme keeps the near-black label on bright red at 5.80:1.

**Leftover emerald literals swept (4.0.2 – 4.0.3).** The first conversion pass missed a set of
hardcoded colours that a variable rename could not reach: the welcome-panel scan gradient and
orbit borders, the selection highlight, project-visual backdrops, the evidence tag, several
mint-tinted text colours and four blue-black surfaces. These left a visible green cast on the
welcome screen. A DOM sweep for green-dominant computed colours now returns **zero** matches
across `backgroundImage`, `backgroundColor`, `boxShadow`, `borderColor` and `color` on every
element.

### Added — motion and visuals

- **Code-rain canvas.** Injected by script only on fine-pointer devices at 900 px and wider,
  never under reduced motion. Throttled to ~15 fps, capped column count, DPR clamped to 2, and
  cancelled whenever the tab is hidden.
- **CRT scanlines** across the page, with a slow refresh-band sweep.
- **RGB-split glitch** on the hero headline, fired as a 460 ms burst every 4.2 s rather than as a
  permanent animation, so the headline stays readable. Pauses when the tab is hidden.
- **Text scramble** resolving each section index the first time it scrolls into view.
- **Brand-mark flicker** and a red glow pulse on the status indicators.
- **Terminal boot lines** on the welcome panel.

### Restored to bolder values

Background grid `.28` → `.5`; aurora `.08` → `.16` and `26s` → `14s`; radar sweep alpha `.22` →
`.5` and `8s` → `3.4s`; marquees `48s` → `26s` and `55s` → `30s`; marquee dots re-glowed.

### Preserved

Everything load-bearing from earlier passes survives this restyle:

- 44 px touch targets, single `h1`, accessible names on every control.
- No numeric skill bars, no certification overclaim, no invented facts.
- Reduced-motion, touch-first and print all switch every new effect off — verified in the CSSOM.
- Static, no-build, no external dependency.

### Social preview regenerated

`assets/social-preview.png` was the last emerald artefact — a raster image that no variable
rename could reach, so anyone sharing the link got a green card against a red site. It has been
rebuilt at 1200 × 630 in the red palette (101 KB, down from an intermediate 325 KB by flattening
the full-canvas gradients that PNG compresses poorly).

The card was also brought back in line with the current interface: its window label read
`SECURE_PROFILE.INTERFACE`, wording removed from the site itself in 3.1.0, and now reads
**Portfolio access**.

`assets/social-preview.svg` is kept alongside it as the editable source, so the image can be
regenerated rather than hand-patched. To rebuild the PNG: open the SVG at 1200 × 630 in a
browser, draw it to a canvas of the same size, and export via `toDataURL('image/png')`.

## 3.1.0 — 29 July 2026

Professional polish pass. Three defects fixed, visible copy rewritten, cyber visual layer
calmed, documentation brought back in line with the actual files.

### Fixed

- **System colour scheme was ignored on first visit.** `script.js` resolved the theme as
  `storedTheme() || 'dark'`, so a visitor whose operating system asked for light always got dark.
  Resolution is now stored choice → system preference, and the site follows live OS changes while
  no explicit choice has been made. Dark remains the default when the system states no
  preference, preserving the intended dark-primary design.
- **Dark flash on system-light devices.** Because `script.js` is deferred, the theme was applied
  after first paint. An inline head script now resolves the theme before paint using the same
  order, and syncs the `theme-color` meta. No Content-Security-Policy is configured on any of the
  three host configs, so this executes normally in production.
- **Touch targets below 44 px.** At phone widths the brand link measured 37 × 37 and the theme
  button, menu toggle and five filter buttons measured 40 px. A
  `@media (pointer: coarse), (max-width: 960px)` block raises the brand mark, icon buttons, menu
  toggle, filter buttons and nav links to a 44 px minimum, with the menu-toggle bars re-centred
  for the taller box. Fine-pointer desktops above 960 px keep the denser 40 px header rhythm.
- **Unsupported skill-level bars.** The hero diagnostics rendered proportional fill bars at
  88 %, 84 %, 81 % and 86 % — numeric skill ratings that the content source of truth prohibits
  and that no evidence supports. The bar is now a neutral one-pixel connector carrying no
  quantitative meaning; the qualifier beside it (Core, Applied, Project, MSc) is the only claim.
- **Two `<h1>` elements.** The welcome panel's name is now a paragraph carrying the dialog's
  `aria-labelledby` target, leaving the hero heading as the document's only `h1`.

### Changed — content and tone

- "Professional certificates" (hero statistic) and "Certificates" (credential card) now both read
  **"Course completions"**, matching the source-of-truth instruction to avoid an inflated
  certification claim. No occurrence of `certificat*` remains in rendered text.
- Terminal-style interface labels replaced with plain professional wording:

  | Before | After |
  |---|---|
  | `secure_profile.interface` | Portfolio access |
  | `security_profile.monitor` | Security profile |
  | `live` (pulsing indicator) | Summary |
  | `Signal map` / `6 domains active` | Focus areas / 6 security domains |
  | `sarmad@portfolio:~$ profile --status` | Current focus |
  | `entropy_score` / `analysis_running` | Entropy analysis / Statistical testing |
  | `EVIDENCE_04` | Evidence handling |
  | `SCOPED LAB` | Authorised lab |

  The "live" indicator was removed specifically because the panel shows a static summary, not
  live telemetry.

- The rotating status line was rewritten from lowercase command output into complete sentences.

### Changed — visual restraint

Motion and decoration were calmed without altering layout, spacing or structure:

- Background grid opacity `.42` → `.28`.
- Aurora opacity `.11` → `.08`; drift `18s` → `26s`.
- Radar sweep peak alpha `.38` → `.22`; rotation `5s` → `8s`.
- Technical-areas marquee `33s` → `48s`; tool marquee `38s` → `55s`.
- Marquee separator dots reduced and de-glowed.

### Documentation

- Added `FINAL_TEST_REPORT.md` with the full ten-size viewport matrix and honest coverage notes.
- Added this changelog.
- Rewrote `UPGRADE_REPORT.md`, which described work and QA that no longer matched the code.
- Corrected the `README.md` file listing and feature descriptions.

### Housekeeping

- Asset cache version `3.0.0` → `3.1.0` on both `styles.css` and `script.js`.
- Removed the now-unused `diagnosticLoad` keyframe and its reduced-motion override.

### Verification

`tools/verify_portfolio.py` 8/8 pass · `node --check script.js` pass · viewport matrix 10/10 pass ·
no console errors · no failed requests.

Five items remain untested for environmental reasons and are listed in section H of
`FINAL_TEST_REPORT.md`: screenshots, Escape-to-close, counter animations, live OS theme
switching, and Lighthouse scores.

### Not changed, deliberately

- All four CV files are preserved as required. `Sarmad_Saeed_CV.pdf` and
  `Sarmad_Saeed_Professional_Resume.pdf` are byte-identical, as are the two DOCX files; the
  duplication is intentional and the pairs must not be allowed to diverge.
- No factual content was altered. Names, dates, degrees, modules, employers, projects and
  recognition remain exactly as stated in the content source of truth.
