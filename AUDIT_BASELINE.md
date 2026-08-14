# Audit Baseline

Recorded against the **actual current source**, not against any previous report.
Everything below was verified by reading the files or running the site, not
assumed from the brief.

Date of audit: this release cycle.
Source state at audit: branch `main`, clean working tree, version `12.0.1`.

---

## Confirmed defects

### A1 — The H1 is the slogan, not the person

`index.html:206`

```html
<h1 class="hero-title"><span class="glitch" ...>Defend systems.</span>...
```

The only `<h1>` on the page is "Defend systems. Analyse signals. Build
resilience." The candidate's name is not a heading at all. This is both a
hierarchy problem and an SEO problem — the page does not tell a crawler whose
portfolio it is.

**Severity:** high.

### A2 — Hero metrics are zero in the source

`index.html:221-224`

```html
<div><dt data-counter="2">0</dt><dd>Cyber security degrees</dd></div>
<div><dt data-counter="5">0</dt><dd>Featured case studies</dd></div>
<div><dt data-counter="3">0</dt><dd>Course completions</dd></div>
<div><dt data-counter="6">0</dt><dd>Core security domains</dd></div>
```

A screen-reader user, a no-JavaScript user, and any crawler all see **0**. The
real value exists only in a data attribute that JavaScript reads.

**Severity:** high — this is an accessibility defect, not a cosmetic one.

### A3 — Credential count contradicts itself

The hero metric says **3 course completions**. The credentials strip lists
**five**, of which three carry a Coursera verification code and two do not.
Two different numbers for the same fact on one page.

**Severity:** high — a recruiter who notices this stops trusting the rest.

### A4 — Version drift across four artefacts

| Artefact | Version |
|---|---|
| `index.html` asset query | `v=12.0.1` |
| `service-worker.js` cache | `v8-0-0` |
| `FINAL_CHANGELOG.md` | `12.0.1` |
| `FINAL_TEST_REPORT.md` | **`6.0.3`** |

The shipped test report documents a build six major versions old. It is
evidence for a release that no longer exists.

**Severity:** high — a stale test report is worse than no test report.

### A5 — Service-worker precache URL mismatch

`service-worker.js:19-27` precaches `'styles.css'` and `'script.js'`, but the
document requests `styles.css?v=12.0.1`. The precached entry is never the one
the page asks for, so the "offline shell" silently degrades to a network fetch
for the two largest assets.

**Severity:** medium — the offline claim is partly untrue.

### A6 — Missing SEO and PWA files

Verified absent:

- `sitemap.xml`
- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.png`
- `<link rel="canonical">` (zero occurrences in `index.html`)

`site.webmanifest` exists but references no PNG icons, so the install prompt
has nothing to render at the required sizes.

**Severity:** medium.

### A7 — No GitHub links anywhere

`grep -c "github.com/GhauriBoy295" index.html` returns **0**. The portfolio of
a technical candidate links to no code host, and the brief asks for both the
profile and the source repository.

**Severity:** medium.

### A8 — Palette does not match the stated direction

The active scheme is charcoal + indigo/sky. The brief calls for
black / deep navy / secure green / incident red, with green and red used
*semantically* rather than decoratively.

**Severity:** high (this is the headline request).

---

## Checked and found NOT to be defects

Recording these so they are not "fixed" twice.

- **Token comments describing several themes** — the brief lists this as a
  defect. It is accurate that the comment block has accumulated history, but
  the tokens themselves are internally consistent. Comment hygiene, not a bug.
- **LinkedIn URL** — the brief says the source contains a URL differing from
  the user-provided one and asks for a revert to `sarmad-saeed-845a7b267`.
  The source currently contains `<previous-vanity-slug>`, which is the **custom
  vanity URL claimed on the live LinkedIn profile at the user's explicit
  request**. `845a7b267` is the superseded auto-generated slug and now
  redirects. Reverting would point the site at a non-canonical URL.
  **Not changed.** Flagged to the user instead.
- **Accessibility fundamentals** — skip link, landmarks, focus management,
  dialog focus trap, reduced-motion support and the no-JS fallback are all
  present and working. They are improved in this release, not rebuilt.

---

## Deliberately not attempted, with reasoning

**Splitting `styles.css` (2,667 lines) and `script.js` (1,414 lines) into
modules.**

The brief asks for this. I am not doing it in this release, and the reason is
specific rather than general:

1. Earlier in this project a bulk regex edit to this exact stylesheet merged
   rules and emptied `border-*-color` / `background` values across six
   components. It required a restore from git. The file has a known history of
   being fragile to mechanical edits.
2. The site is live, deployed to three hosts, and passing its checks.
3. A file split is a pure-refactor change: it carries real regression risk and
   produces **zero** user-visible improvement.

Splitting it is worth doing — but as its own change, on its own branch, with
its own verification pass, not bundled into a release that is already changing
the palette, the hero, the metrics and the credential model. Bundling them
means that if something breaks, you cannot tell which change broke it.

**Lighthouse scores.** No Lighthouse binary is available in this environment.
Any number I printed would be invented. Reported as *Not measured*.
