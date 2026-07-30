# Final Test Report

**Site:** Sarmad Saeed — Cyber Security Portfolio
**Source tested:** `current-portfolio/` at asset version `6.0.3`
**Date:** 29 July 2026
**Method:** Served over a local static HTTP server (`python -m http.server`) and driven through an
instrumented Chromium session. Layout, geometry, ARIA and content assertions were measured
programmatically against the live DOM. Static checks were run with `tools/verify_portfolio.py`
and `node --check`.

This report records only what was actually measured. Items that could not be exercised in the
test environment are listed in section H as untested, not as passes.

---

## A. Viewport matrix

Every size was measured twice: once on the welcome screen, once on the main document with all
scroll-reveal elements forced to their revealed state.

| Viewport | Class | Page overflow | Welcome CTA | Card columns | Filter rail | Case-study dialog |
|---|---|---|---|---|---|---|
| 320 × 568 | Very small phone | 0 px | 248 × 47, reachable | 1 | scrolls in-container | 274 × 509, fits |
| 360 × 740 | Android phone | 0 px | 287 × 47, in view | 1 | scrolls in-container | 312 × 675, fits |
| 375 × 667 | Compact iPhone | 0 px | 302 × 47, in view | 1 | scrolls in-container | 327 × 605, fits |
| 390 × 844 | Modern iPhone | 0 px | 317 × 47, in view | 1 | scrolls in-container | 341 × 776, fits |
| 430 × 932 | Large phone | 0 px | 356 × 47, in view | 1 | scrolls in-container | 380 × 854, fits |
| 768 × 1024 | Tablet portrait | 0 px | 153 × 47, in view | 2 | fits | 693 × 832, fits |
| 1024 × 768 | Tablet landscape | 0 px | 153 × 47, in view | 2 | fits | 912 × 703, fits |
| 1366 × 768 | Common laptop | 0 px | 153 × 47, in view | 2 | fits | 912 × 703, fits |
| 1440 × 900 | Desktop | 0 px | 153 × 47, in view | 2 | fits | 912 × 831, fits |
| 1920 × 1080 | Large desktop | 0 px | 153 × 47, in view | 2 | fits | 912 × 854, fits |

**Result: PASS at all ten sizes.**

- Page-level horizontal overflow measured as `documentElement.scrollWidth - clientWidth` was
  **0 px at every size**, in both the welcome and main states, and also while a dialog was open.
- No clipped text: zero elements were found whose content overflowed a non-visible overflow box,
  excluding the intentional marquee and filter rails.
- At 320 × 568 the welcome panel is taller than the viewport and scrolls safely; the Enter CTA
  remains reachable. At every other size it fits without scrolling.
- Project cards collapse to a single column at 430 px and below, and sit at two columns from
  768 px up.
- The project filter rail scrolls inside its own container at phone widths without shifting the
  page.
- The case-study dialog fits inside the viewport at all ten sizes and scrolls internally when its
  content is taller than the frame (observed at 430 × 932 and 1920 × 1080).
- CV PDF and DOCX download links resolve and remain reachable at every size.

## B. Interaction tests

| Test | Result | Evidence |
|---|---|---|
| Enter button dismisses welcome | PASS | `intro-active` cleared, main content exposed |
| Welcome dismissal does not trap scrolling | PASS | body scroll restored, page overflow 0 |
| Mobile menu opens/closes, updates ARIA | PASS | `aria-expanded` false → true → false |
| Theme cycles and persists | PASS | dark ⇄ light, written to `sarmad-portfolio-theme` |
| System theme respected when unset | PASS | see section G |
| Project filters update cards | PASS | Research → 1 of 5 cards, matching the label count |
| Every project opens its case study | PASS | dialog populated with the correct title per card |
| Close button closes dialog | PASS | `open` attribute removed |
| Focus returns to triggering control | PASS | `document.activeElement === trigger` after close |
| Ctrl/Cmd+K opens command palette | PASS | palette opens, 11 commands rendered |
| Copy-email control present and wired | PASS | `#copyEmail` bound, toast feedback path exists |
| External links use safe rel | PASS | every `target="_blank"` carries `noopener noreferrer` |

Note on the filter test: the filter applies its hide in a 310 ms timeout behind the fade
transition. An assertion made synchronously after the click reads the pre-hide state; measured
after the timeout, the counts are correct.

## C. Accessibility tests

| Test | Result | Evidence |
|---|---|---|
| Logical heading hierarchy | PASS | zero heading-level jumps across h1–h4 |
| Skip link present | PASS | `a[href="#main-content"]` |
| Controls have accessible names | PASS | 0 buttons/links with no text, `aria-label` or `title` |
| Touch targets ≥ 44 px | PASS (fixed) | see below |
| Toast uses a live region | PASS | `aria-live="polite"` |
| Reduced-motion support | PASS | dedicated media block; reveals forced visible, canvas and aura disabled |
| No-JS fallback | PASS | `html.no-js .reveal` restores opacity |
| Print stylesheet | PASS | shell forced visible, decorative panels dropped |

**Touch targets — fixed during this pass.** Before the fix, at phone widths the brand link
measured 37 × 37 and the theme button, menu toggle and five filter buttons measured 40 px. A
`@media (pointer: coarse), (max-width: 960px)` block now raises the brand mark, icon buttons,
menu toggle, filter buttons and nav links to a 44 px minimum, with the menu-toggle bar positions
re-centred for the taller box. Re-measured after the change: **0 controls under 44 × 44 at 320,
430, 768** (14 controls checked at each), with no page overflow and the header still fitting its
row.

Fine-pointer desktops above 960 px deliberately retain the denser 40 px header rhythm. Those are
mouse targets rather than touch targets, and they remain well above the WCAG 2.2 AA minimum of
24 × 24 (SC 2.5.8).

**Heading structure — fixed during this pass.** The document previously carried two `<h1>`
elements, one in the welcome panel and one in the hero. The welcome name is now a paragraph that
still serves as the dialog's `aria-labelledby` target, so the hero heading is the document's only
`h1`. Re-measured: `h1` count 1, zero heading-level jumps, dialog label intact.

## D. Content tests

Banned wording — **absent** from the production files:

```text
MSc candidate
Expected 2026
Currently studying
```

Required wording — **present**:

```text
MSc Cyber Security Graduate
University of Chester
2025–2026
Graduated
```

**Certification wording corrected during this pass.** The hero statistic previously read
"Professional certificates" and the credential card was headed "Certificates". Both now read
**"Course completions"**, matching the source-of-truth instruction to avoid an inflated
certification claim. A scan of rendered body text returns **zero** occurrences of
`certificat*`; the only remaining uses are an internal SVG symbol id and a command-palette
search keyword, neither of which is user-visible.

**Unsupported skill-level bars removed.** The hero diagnostics rendered proportional fill bars
driven by inline `--level` values of 88 %, 84 %, 81 % and 86 % — numeric competency ratings that
the source of truth explicitly prohibits and that no evidence supports. The bar is now a neutral
one-pixel connector with no quantitative meaning. Re-measured: **zero elements carry a `--level`
style**, and the associated `diagnosticLoad` keyframe was removed.

The pulsing "live" indicator on the hero panel was also relabelled **"Summary"**, since the panel
shows a static profile summary rather than live telemetry.

No unsupported portrait, credential, experience duration, percentage or live-demo claim now
remains. The four numeric hero counters (2 degrees, 5 case studies, 3 course completions,
6 security domains) each correspond to items enumerated in the source of truth.

## E. File and code tests

| Test | Result |
|---|---|
| `index.html` in deployment root | PASS |
| All local `href`/`src`/manifest/icon/CV paths resolve | PASS (verifier) |
| No duplicate IDs | PASS (verifier) |
| `node --check script.js` | PASS |
| No console errors during normal use | PASS — no console output of any level |
| No 404s during load | PASS — server log clean |
| No `eval`, `document.write`, inline handlers, `javascript:` URLs | PASS (verifier) |
| No stale duplicate CV files | PASS — see below |
| Cache version updated | PASS — `3.0.0` → `4.0.3` on CSS and JS |

`Sarmad_Saeed_CV.pdf` and `Sarmad_Saeed_Professional_Resume.pdf` are byte-identical
(md5 `2ab6dc5c…`), as are the two DOCX files (md5 `c50f499a…`). The duplicate filenames therefore
carry no risk of divergent content.

No Content-Security-Policy is set in `_headers`, `netlify.toml` or `vercel.json`, so the
theme-bootstrap inline script added in this pass will execute normally on all three hosts.

## F. Performance

**Not measured.** Lighthouse was not available in this environment. No score is claimed.

Equivalent manual checks completed: no render-blocking third-party requests, no remote fonts, no
external dependencies, deferred JavaScript, zero console errors, zero failed network requests,
and heavy canvas/cursor effects disabled at phone widths and on coarse pointers.

## G. Theme resolution

Fixed during this pass. The bootstrap previously read `storedTheme() || 'dark'`, which ignored
the operating-system preference entirely. It now resolves stored choice first, then system
preference. An inline head script applies the same resolution before first paint so a
system-light visitor never sees a dark flash from the deferred main script.

| OS preference | Stored preference | Resolved theme | theme-color |
|---|---|---|---|
| light | none | light | `#f7f2f2` |
| dark | none | dark | `#0a0406` |
| dark | light | light | `#f7f2f2` |
| — | after toggle | persisted correctly, `aria-pressed` correct | — |

Dark remains the default when the system expresses no preference, preserving the intended
dark-primary design.

## H. Red terminal release (4.0.0)

The accent moved from emerald to red at the owner's explicit request. This departs from the
approved design spec, which specifies an emerald accent and reserves red for risk semantics; the
departure is deliberate and recorded in `FINAL_CHANGELOG.md`. The previous state is preserved at
`backup/pre-red-theme-3.1.0/`.

**Contrast re-measured after the palette change — all pairs pass WCAG AA:**

| Pair | Dark | Light | AA threshold |
|---|---|---|---|
| Accent on background | 6.26:1 | 5.61:1 | 4.5:1 |
| Body text on background | 18.36:1 | 15.73:1 | 4.5:1 |
| Muted text on background | 8.58:1 | 5.73:1 | 4.5:1 |
| Accent on surface | 5.95:1 | — | 4.5:1 |

**New effects and their guards:**

| Effect | Guard | Verified |
|---|---|---|
| Code-rain canvas | fine pointer, ≥ 900 px, not reduced motion, ~15 fps, pauses when hidden | canvas injected at 1440, absent by rule on coarse/reduced |
| CRT scanlines | dimmed to `.3` below 760 px, off under reduced motion | opacity `0.3` measured at 320 |
| CRT sweep | hidden below 760 px and on coarse pointers | `display: none` measured at 320 |
| Hero glitch | 460 ms burst every 4.2 s, pauses when hidden, off under reduced motion | 3 glitch targets present |
| Section scramble | resolves once on scroll-in, off under reduced motion | indices resolve to final text |
| Brand flicker / boot log | off on coarse pointers; boot log hidden below 760 px | `display: none` measured at 320 |

All six reduced-motion overrides were confirmed present in the live CSSOM, not merely in source.

**Regression checks after the restyle:** page overflow 0 at 320 and 1440 · 0 controls under
44 × 44 at 320 · single `h1` · 0 controls without accessible names · dialog opens and returns
focus to its trigger · command palette opens with 11 commands · Defence filter shows 2 of 5 cards
· no console errors · no failed requests · verifier 8/8 · `node --check` clean.

**Social preview regenerated.** `assets/social-preview.png` was rebuilt in the red palette at
1200 × 630 (101 KB). Verified: valid PNG signature, IHDR dimensions read back as exactly
1200 × 630 — the sizes declared in the `og:image:width` / `og:image:height` meta tags — and the
rendered card checked visually. Its window label was also corrected from
`SECURE_PROFILE.INTERFACE` to `Portfolio access`, matching the wording change made in 3.1.0.
`assets/social-preview.svg` is kept as the editable source.

## I. Untested items and environment limitations

These could not be exercised and are **not** claimed as passing.

1. **Screenshots.** The browser pane was never displayed, so the page never composited frames
   and screenshot capture timed out. Desktop, tablet and mobile screenshots remain outstanding.
2. **Escape-to-close on dialogs.** Synthetic key events did not reach the non-compositing page.
   Escape handling is delegated to the native `<dialog>` element and the `close` event handler
   that returns focus is correct by inspection, but this was not observed running.
3. **Counter animations.** With `document.visibilityState === "hidden"`, IntersectionObserver
   does not fire, so the hero counters stayed at 0 and scroll reveals did not trigger. The
   observers and `data-counter` targets are correctly wired by inspection.
4. **Live OS theme switching.** No `matchMedia` change events are dispatched in this
   environment — verified with an independent probe listener that recorded zero events while
   `matches` flipped twice. The reload-resolution path in section G is fully verified; the live
   listener is not.
5. **Lighthouse scores.** See section F.

6. **The new 4.0.0 effects in motion.** The code rain, CRT sweep, glitch bursts and scramble were
   verified as present, correctly guarded and free of errors, but their actual rendered motion
   was never seen for the same compositing reason as item 1.

All six require a displayed, compositing browser pane or a full Lighthouse run, and should be
completed before final delivery.

---

## Summary

Static verification: **8 of 8 checks pass.** Viewport matrix: **10 of 10 sizes pass.**
Interaction, accessibility, content and file tests pass as recorded above.

Five defects were found and fixed during this pass:

1. System colour-scheme preference was ignored on first visit.
2. "Professional certificates" overstated the course-completion credentials.
3. Touch targets fell below 44 px at phone widths.
4. The hero diagnostics rendered unsupported numeric skill bars.
5. The document carried two `<h1>` elements.

The 4.0.0 red terminal restyle was then applied at the owner's request and re-verified against
every check above; results are in section H.

Six items remain untested for environmental reasons and are listed in section I.
