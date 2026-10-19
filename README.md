# Sarmad Saeed — Cyber Security Portfolio

**AEGIS NEXUS** — a premium, responsive and accessible static portfolio for
**Sarmad Saeed**, an **MSc Cyber Security Graduate from the University of
Chester**. It presents as a professional security-operations interface, not a
generic template, and fuses four systems into one:

| Layer | Responsibility |
|---|---|
| Sentinel X Executive | Global shell, hierarchy, typography, spacing, recruiter clarity |
| BlackICE Operator | Secure welcome, command-centre hero, cyber globe, terminal, command palette |
| Red Cell / Blue Team | Offensive vs defensive semantics, mission classification, attack-path diagram |
| Neo-Forensics | Evidence-led case-study reports, work-sequence timelines, light theme, print layouts |

**Current release: `30.0.0`** (`CACHE_VERSION = 'v30-0-0'`, `ASSET_REV = '30.0.0'`).

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

- Skippable secure-profile welcome sequence with an operator-style verification checklist
- Command-centre hero with an original canvas cyber globe and a static SVG fallback
- Recruiter Quick View panel: status, base, availability, work modes, target roles, CV downloads
- Three-state theme control: **System**, **Dark (BlackICE Night)**, **Light (Forensic Daylight)**
- Three-state motion control: **Full**, **Calm**, **Off**, defaulting from the OS preference
- Capability map placed on the NIST Cybersecurity Framework lifecycle
- Red Cell / Blue Team module with an attack path drawn against defensive controls
- **Portfolio coverage charts** — a NIST CSF radar and classification bars, both generated at runtime from the case-study data so they can never drift from the work or invent a metric
- Five missions with original per-subject SVG artwork and discipline / NIST filters
- 3D depth layer: pointer-driven card tilt, Z-separated layers, specular sheen and hero parallax (full motion, fine pointers only)
- Forensic case-study reports: section rail, work-sequence timeline, working-material list
- Deep-linkable case studies with copy-link, Web Share (where supported) and print
- Command palette (`Ctrl+K` / `⌘K`) and a keyboard shortcuts sheet (`?`)
- Atmospheric backdrop: fixed starfield + aurora wash, lit gradient panel edges, floating section geometry (all dark-theme, Full-motion only, removed at reduced motion)
- PDF and DOCX CV downloads
- Offline shell via a versioned service worker, online/offline status and install-app support
- Custom 404, sitemap, robots, Open Graph, Twitter card and JSON-LD structured data
- Accessibility: skip link, focus management, focus trapping, `Escape` handling, `aria-live` status
- No-JavaScript fallback that still exposes every piece of content
- No framework, package manager or build step required

## File structure

```text
index.html                 single-page site
service-worker.js          offline shell; holds CACHE_VERSION + ASSET_REV
site.webmanifest robots.txt sitemap.xml 404.html .nojekyll _headers
netlify.toml vercel.json   per-host config
favicon.svg icon-192.png icon-512.png apple-touch-icon.png
assets/
  css/  tokens · base · shell · hero · sections · missions · overlays · motion · print
  js/   app · core · boot · globe · depth · report · project-data · charts
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
  hero, the welcome panel, the JSON-LD block and the footer. CI fails the build
  if the LinkedIn URL or the worldwide-availability wording drifts, or if a
  forbidden status phrase (`candidate`, `expected 2026`, `currently studying`)
  appears.
- **Projects** are objects in `assets/js/project-data.js`; the coverage charts
  and the command palette read from the same data, so adding a case study there
  updates them automatically.
- **Colours and tokens** are in `assets/css/tokens.css`, defined once per theme.
- **CV:** replace `Sarmad_Saeed_CV.pdf` and `Sarmad_Saeed_CV.docx` in place,
  keeping the filenames (they are linked from the markup).

## Asset revision

Every CSS/JS request carries `?v=<release>`, the JS module-graph imports carry
the same string, and the service worker holds `ASSET_REV` and `CACHE_VERSION`.
**All of these must be bumped together** or the service worker precaches URLs
the page never requests. `.github/workflows/verify.yml` fails the build if they
drift.

## Deploying an update

1. Work on `redesign/aegis-nexus-v15-live`; commit there.
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

## Keyboard controls

- `Enter` — continue from the secure welcome · `Esc` — skip the welcome, close a dialog/menu
- `Ctrl+K` / `⌘K` — command palette · `↑` `↓` move, `Enter` runs · `?` — shortcuts sheet
- `T` — dark ⇄ light · `M` — cycle motion full → calm → off
- `G` then `A`/`D`/`E`/`P`/`S`/`V`/`C` — jump to About / Education / Experience / Projects / Skills / Certifications / Contact

## Accessibility and performance

Semantic landmarks, skip link, visible focus, focus trapping in the welcome and
dialogs, `Escape` to close, `aria-live` status, 44px-class tap targets,
safe-area support and a no-JavaScript fallback. Motion respects
`prefers-reduced-motion` and drops to Calm on touch-first, small-screen or
low-core devices. The canvas globe is skipped on those devices, pauses when the
hero scrolls away or the tab is hidden, and never runs below Full motion.

## Custom-domain note

`og:image` and `twitter:image` use absolute `https://ghauriboy295.github.io/`
URLs. If a custom domain is added, update those two tags, `og:url`, the
canonical link, `sitemap.xml` and `robots.txt` together.
