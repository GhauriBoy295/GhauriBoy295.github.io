# Sarmad Saeed — Cyber Security Portfolio

**AEGIS NEXUS** — a responsive, accessible static portfolio for **Sarmad
Saeed**, an **MSc Cyber Security Graduate from the University of Chester**. It
puts documented work, not interface effects, at the centre, and gives four
design influences distinct jobs:

| Layer | Responsibility |
|---|---|
| Sentinel X Executive | Global shell, hierarchy, typography, spacing, recruiter clarity |
| BlackICE Operator | Restrained dark atmosphere and the command palette — no simulated operations |
| Red Cell / Blue Team | Strict red/green meaning; paired assessment-stage vs defensive-control comparison |
| Neo-Forensics | Evidence Dossier, static case studies, work-sequence timelines, light theme, print |

**Current release: `31.1.0`** (`CACHE_VERSION = 'v31-1-0'`, `ASSET_REV = '31.1.0'`).

## Where it is published

| Host | URL | How it deploys |
|---|---|---|
| GitHub Pages | <https://ghauriboy295.github.io/> | Native — `main` is the Pages source, so every push rebuilds it |
| Vercel | <https://ghauri-boy295-github-io.vercel.app/> | Native — repo linked to the Vercel project, `main` is the production branch |
| Netlify | <https://sarmad-saeed-portfolio.netlify.app/> | GitHub Actions (`.github/workflows/deploy.yml`), once the two Netlify secrets are set |

All three serve the same static files from the repository root. There is no
build step and no server-side component: **merging to `main` is the deploy.**

## Profile details used

- **Name:** Sarmad Saeed · **Alias:** Ghauri_Boy
- **Qualification:** MSc Cyber Security — University of Chester, 2025–2026, **Graduated**
- **Undergraduate:** Bachelor of Cyber Security, Air University, 2020–2024
- **Current base:** United Kingdom
- **Opportunity availability:** Worldwide — remote, hybrid, on-site and relocation
- **LinkedIn:** <https://www.linkedin.com/in/sarmad-saeed-845a7b267>
- **GitHub:** <https://github.com/GhauriBoy295>

Nothing on the site claims a certification, employer, client, measured result,
live telemetry or statistic that is not supported by the list above. Three
verified course credentials are kept separate from two additional completions
that have no public verification link. These rules are enforced in CI — see
`CLAUDE.md` for the full content contract.

## Main features

- Loads straight into an identity-first hero — no welcome gate or loading screen
- **Evidence Dossier**: a linked index of the documented case studies beside the hero
- Project cards built around each report: verified context, problem, documented contribution, and a cover showing the report's own work phases
- **Static case studies** (`#case-<id>`) — complete and deep-linkable without JavaScript
- Case-study navigator: a sticky "On this page" index that tracks the article in view, plus copy-link and next-case on every case study
- Career timeline in About: degrees, roles and projects in date order, each linking to its section or case study
- Tool evidence: each tool in Skills links to the case study whose recorded stack names it; tools no case study lists stay unlinked
- Hero facts strip with the verified degree, base, availability and documented-work facts
- Documented-work table mapping each case study to the NIST CSF function its write-up names ("Mapped", or a dash meaning not documented here — never a skill score)
- Red Cell / Blue Team as three paired stages, with the authorised-lab note alongside
- Three-state theme control: **System**, **Dark (BlackICE Night)**, **Light (Forensic Daylight)**
- Three-state motion control: **Full**, **Calm**, **Off**; the OS reduced-motion setting always wins
- Project filters and a command palette (`Ctrl+K` / `⌘K`) as enhancements, never the only route to content
- Native `<details>` navigation menu at narrow widths that works without JavaScript
- PDF and DOCX CV downloads, reachable from the header at every width
- Offline shell via a versioned service worker; install-app support
- Custom 404, sitemap, robots, Open Graph, Twitter card and JSON-LD structured data
- No framework, package manager or build step

## File structure

```text
index.html                 single-page site
service-worker.js          offline shell; holds CACHE_VERSION + ASSET_REV
site.webmanifest robots.txt sitemap.xml 404.html .nojekyll _headers
netlify.toml vercel.json   per-host config
favicon.svg icon-192.png icon-512.png apple-touch-icon.png
assets/
  css/  tokens · base · shell · hero · sections · missions · overlays · motion · print
  js/   app · core · project-data · charts
  fonts/ Space Grotesk 500/700, JetBrains Mono 400 — SIL OFL, latin subsets
  social-preview.png/.svg
  linkedin-banner.png/.svg  1584 x 396 profile banner
  icon-source.svg
Sarmad_Saeed_CV.pdf        linked from the site
Sarmad_Saeed_CV.docx       linked from the site
README.md                  this file
CLAUDE.md                  content + engineering + git contract
```

## Editing the site

- **Text and profile facts** live in `index.html`. The facts in the Profile
  details section above must read identically everywhere they appear — the
  hero, the "About this portfolio" disclosure, the JSON-LD block and the footer.
  CI fails the build if the LinkedIn URL or the worldwide-availability wording
  drifts, or if a forbidden status phrase (`candidate`, `expected 2026`,
  `currently studying`) appears.
- **Case studies** are static `<article class="case" id="case-<id>">` elements
  in `index.html` — that is the single source of each report. Case-study counts
  on the page are computed from these articles.
- **Adding a project** touches these places, all in `index.html` except the last:
  1. a card in `#missions` (with `data-categories` for the filters),
  2. a `case-<id>` article in `#cases`, and its entry in the "On this page"
     case index; update the previous article's "Next" link,
  3. a row in the hero dossier,
  4. a row in the static coverage table (the no-JS fallback),
  5. an entry in the About timeline, if the project is dated,
  6. an entry in `assets/js/project-data.js` (title, `short` label, kicker,
     classification, stack, and `framework.fn` only if the write-up names a
     NIST CSF function).
  Filter counts, case counts, tool-evidence links and the JS-built coverage
  table update themselves.
- **Colours and tokens** are in `assets/css/tokens.css`, defined once per theme.
  Breakpoints are in `em` and type in `rem`, so layout follows the browser's
  text-size setting — keep new ones that way.
- **CV:** replace `Sarmad_Saeed_CV.pdf` and `Sarmad_Saeed_CV.docx` in place,
  keeping the filenames (they are linked from the markup).

## Asset revision

Every CSS/JS request carries `?v=<release>`, the JS module-graph imports carry
the same string, and the service worker holds `ASSET_REV` and `CACHE_VERSION`.
**All of these must be bumped together** or the service worker precaches URLs
the page never requests. `.github/workflows/verify.yml` fails the build if they
drift.

## Deploying an update

1. Work on a `redesign/*` branch; commit there.
2. Push the branch — `verify.yml` runs on every push and must be green.
3. Merge to `main` (fast-forward `origin/main` first, then `--no-ff` the branch,
   then `git push origin main`). That single push publishes to all three hosts:
   GitHub Pages and Vercel rebuild natively; `deploy.yml` pushes to Netlify.
4. The service worker is network-first for navigations and bumps its cache on
   the new `CACHE_VERSION`, so a new release is visible on next load without a
   manual cache clear.

Netlify deploys once these repo secrets exist (Settings → Secrets and variables
→ Actions): `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`. The Vercel job uses
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` if you prefer CI over the
native integration. Each job skips cleanly until its secrets are set.

## Local preview

```bash
python -m http.server 8123
```

Then open <http://localhost:8123>. Opening `index.html` directly works too, but
the service worker and the module graph behave more realistically over HTTP.

While editing, the service worker and browser cache can keep serving an older
copy of a file whose `?v=` has not changed. Hard-reload, or unregister the
worker in DevTools → Application, before judging a change.

## Keyboard controls

- `Esc` — close a dialog or the menu (in the command palette, the first press clears the search)
- `Ctrl+K` / `⌘K` — command palette · `↑` `↓` move, `Enter` runs · `?` — shortcuts sheet
- `T` — dark ⇄ light · `M` — cycle motion full → calm → off
- `G` then `A`/`D`/`E`/`P`/`S`/`V`/`C` — jump to About / Education / Experience / Projects / Skills / Certifications / Contact

## Accessibility and performance

Semantic landmarks, skip link, a 2px focus ring on every control (including
disclosure summaries), native dialog focus handling with `Escape` to close,
44px minimum targets, safe-area support, and a complete no-JavaScript fallback
in which JS-only controls are hidden rather than left dead. Motion is limited to
a short fade on reveal and colour/border hover feedback; content is never left
hidden if a reveal does not fire. With JavaScript off the page renders in
BlackICE Night regardless of the OS colour preference.

## Custom-domain note

`og:image` and `twitter:image` use absolute `https://ghauriboy295.github.io/`
URLs. If a custom domain is added, update those two tags, `og:url`, the
canonical link, `sitemap.xml` and `robots.txt` together.
