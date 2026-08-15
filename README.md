# Sarmad Saeed — Cyber Security Portfolio

**AEGIS NEXUS** — a premium, responsive and accessible static portfolio for **Sarmad Saeed**, an **MSc Cyber Security Graduate from the University of Chester**.

The portfolio is designed as a professional security-operations interface rather than a generic “hacker” template. It fuses four systems into one:

| Layer | Responsibility |
|---|---|
| Sentinel X Executive | Global shell, hierarchy, typography, spacing, recruiter clarity |
| BlackICE Operator | Secure welcome, command-centre hero, cyber globe, terminal, command palette |
| Red Cell / Blue Team | Offensive vs defensive semantics, mission classification, attack-path diagram |
| Neo-Forensics | Evidence-led case-study reports, work-sequence timelines, light theme, print layouts |

Live site: <https://ghauriboy295.github.io/>

## Profile details used

- **Name:** Sarmad Saeed
- **Alias:** Ghauri_Boy
- **Qualification:** MSc Cyber Security
- **University:** University of Chester
- **Academic year:** 2025–2026
- **Status:** Graduated
- **Undergraduate:** Bachelor of Cyber Security, Air University, 2020–2024
- **Current base:** United Kingdom
- **Opportunity availability:** Worldwide — remote, hybrid, on-site and relocation
- **LinkedIn:** <https://www.linkedin.com/in/sarmad-saeed-845a7b267>
- **GitHub:** <https://github.com/GhauriBoy295>

Nothing on the site claims a certification, employer, client, measured result, live
telemetry or statistic that is not supported by the list above. Three verified course
credentials are kept separate from two additional completions that have no public
verification link.

## Main features

- Skippable secure-profile welcome sequence with an operator-style verification checklist
- Command-centre hero with an original canvas cyber globe and a static SVG fallback
- Recruiter Quick View panel: status, base, availability, work modes, target roles, CV downloads
- Three-state theme control: **System**, **Dark (BlackICE Night)** and **Light (Forensic Daylight)**
- Three-state motion control: **Full**, **Calm** and **Off**, defaulting from the OS preference
- Capability map placed on the NIST Cybersecurity Framework lifecycle
- Red Cell / Blue Team module with an attack path drawn against defensive controls
- Five missions with original per-subject SVG artwork and discipline / NIST filters
- Forensic case-study reports: section rail, work-sequence timeline, working-material list
- Deep-linkable case studies with copy-link, Web Share (where supported) and print
- Command palette (`Ctrl+K` / `⌘K`) and a keyboard shortcuts sheet (`?`)
- Global availability map, contact directory, copy-email and copy-link actions
- PDF and DOCX CV downloads
- Offline shell via a versioned service worker, online/offline status and install-app support
- Custom 404 page, sitemap, robots, Open Graph, Twitter card and JSON-LD structured data
- Accessibility: skip link, focus management, focus trapping, `Escape` handling, `aria-live` status
- No-JavaScript fallback that still exposes every piece of content
- No framework, package manager or build step required

## File structure

```text
index.html
service-worker.js
site.webmanifest
robots.txt
sitemap.xml
404.html
.nojekyll
_headers
netlify.toml
vercel.json
favicon.svg
icon-192.png
icon-512.png
apple-touch-icon.png
assets/
  css/  tokens · base · shell · hero · sections · missions · overlays · motion · print
  js/   app · core · boot · globe · report · project-data
  social-preview.png
  social-preview.svg
  icon-source.svg
Sarmad_Saeed_CV.pdf
Sarmad_Saeed_CV.docx
Sarmad_Saeed_Professional_Resume.pdf
Sarmad_Saeed_Professional_Resume.docx
README.md
DEPLOYMENT_STEPS.md
CONTENT_UPDATE_GUIDE.md
FINAL_CHANGELOG.md
FINAL_TEST_REPORT.md
```

The two CV name pairs hold identical files and are both kept deliberately. If either
document is ever updated, update both copies so they cannot diverge.

## Asset revision

Every CSS and JS request carries `?v=<release>`, the JS module graph imports carry the
same string, and the service worker holds `ASSET_REV` and `CACHE_VERSION`. All three must
be bumped together — `tools/verify_live_workspace.py` fails the build if they drift.

Current release: **18.0.0** (`CACHE_VERSION = 'v18-0-0'`).

## Continuous integration and deployment

- `.github/workflows/verify.yml` — runs on every push and pull request: JS
  syntax, asset-revision synchronisation, required files, and the content rules
  (worldwide wording, correct LinkedIn URL, one H1, no forbidden status phrasing).
- `.github/workflows/deploy.yml` — runs on every push to `main` and publishes to
  Vercel and Netlify. Each job skips cleanly until its secrets are added:
  `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NETLIFY_AUTH_TOKEN`,
  `NETLIFY_SITE_ID`, under Settings → Secrets and variables → Actions.
- GitHub Pages is not in that workflow — this repository publishes straight from
  `main`, so Pages already rebuilds on every push.

## Local preview

```bash
python -m http.server 8123
```

Then open `http://localhost:8123`. Opening `index.html` directly also works, but the
service worker and the module graph behave more realistically over HTTP.

## Keyboard controls

- `Enter` — continue from the secure welcome
- `Esc` — skip the welcome, or close a dialog or menu
- `Ctrl+K` / `⌘K` — open the command palette
- `↑` `↓` — move through command-palette results, `Enter` runs the selection
- `?` — open the keyboard shortcuts sheet
- `T` — switch between dark and light
- `M` — cycle motion: full → calm → off
- `G` then `P` / `C` / `R` / `M` / `E` / `V` / `A` — jump to a section

## Accessibility and performance

Semantic landmarks, a skip link, visible focus states, focus trapping in the welcome and
dialogs, `Escape` to close, `aria-live` status regions, 44px-class tap targets, safe-area
support and a no-JavaScript fallback. Motion respects `prefers-reduced-motion` and drops to
Calm automatically on touch-first, small-screen or low-core devices. The canvas globe is
skipped entirely on those devices, pauses when the hero scrolls away or the tab is hidden,
and never runs below the Full motion level.

## Deployment note

`og:image` and `twitter:image` already use absolute `https://ghauriboy295.github.io/`
URLs. If a custom domain is added later, update those two tags, `og:url`, the canonical
link, `sitemap.xml` and `robots.txt` together.

See `DEPLOYMENT_STEPS.md` for exact publishing instructions.
