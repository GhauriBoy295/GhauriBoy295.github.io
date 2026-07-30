# Sarmad Saeed — Cyber Security Portfolio

A premium, responsive and accessible static portfolio for **Sarmad Saeed**, an **MSc Cyber Security Graduate from the University of Chester**.

The portfolio is intentionally designed as a professional security-operations interface rather than a generic “hacker” template. It combines clear recruiter-facing content with controlled motion, interactive case studies and dependable mobile behaviour.

## Profile details used

- **Name:** Sarmad Saeed
- **Alias:** Ghauri_Boy
- **Qualification:** MSc Cyber Security
- **University:** University of Chester
- **Academic year:** 2025–2026
- **Status:** Graduated
- **Location:** United Kingdom
- **LinkedIn:** linkedin.com/in/sarmad-saeed-845a7b267

## Main features

- Professional welcome/access panel, dismissible and session-persistent
- Dark and light themes that follow the operating-system preference until you choose one
- Motion-aware network canvas on capable desktop devices
- Active sticky navigation and scroll progress indicator
- Mobile navigation designed for small screens and safe areas
- Hero security-profile panel with a focus-area radar and a rotating status line
- Scroll-reveal motion with reduced-motion support
- Project filtering and interactive case-study dialogs
- Keyboard command palette using `Ctrl+K` or `Command+K`
- Copy-email action, toast notifications and back-to-top control
- Recruiter-focused About, Expertise, Projects, Education, Experience and Contact sections
- Social sharing preview image
- Custom 404 page
- Deep-linkable case studies with copy-link and print actions
- Keyboard shortcuts overlay (`?`)
- UK local time, computed in the browser
- Offline shell via a versioned service worker
- GitHub Pages, Netlify and Vercel deployment files
- PDF and DOCX CV downloads
- No framework, package manager or build step required

## File structure

```text
index.html
styles.css
script.js
service-worker.js
favicon.svg
site.webmanifest
robots.txt
404.html
.nojekyll
_headers
netlify.toml
vercel.json
assets/
  social-preview.png
  social-preview.svg
Sarmad_Saeed_CV.pdf
Sarmad_Saeed_CV.docx
Sarmad_Saeed_Professional_Resume.pdf
Sarmad_Saeed_Professional_Resume.docx
CLAUDE.md
README.md
DEPLOYMENT_STEPS.md
CONTENT_UPDATE_GUIDE.md
UPGRADE_REPORT.md
FINAL_CHANGELOG.md
FINAL_TEST_REPORT.md
```

The two CV name pairs hold identical files and are both kept deliberately. If either document is
ever updated, update both copies so they cannot diverge.

## Local preview

The portfolio can be opened directly by double-clicking `index.html`. For a more realistic local test, run a simple local server from this folder:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## Keyboard controls

- `Enter` — continue from the welcome screen
- `Ctrl+K` or `Command+K` — open the command palette
- `Escape` — close the mobile menu or an open dialog
- Arrow keys — move through command-palette results
- `Enter` — run the selected command
- `?` — open the keyboard shortcuts list
- `T` — switch between dark and light
- `G` then `P` / `A` / `E` / `C` / `D` / `X` — jump to a section

## Accessibility and performance

The site includes keyboard focus states, semantic landmarks, accessible dialog controls, mobile tap targets, safe-area support and a no-JavaScript fallback. Motion is reduced automatically when the operating system requests reduced motion. The network canvas is disabled on small or touch-first devices to protect mobile performance and battery life.

## Important deployment note

After connecting a final custom domain, replace the relative Open Graph image path in `index.html` with the complete live URL for the strongest LinkedIn and social-sharing compatibility.

Example:

```html
<meta property="og:image" content="https://your-domain.com/assets/social-preview.png">
```

See `DEPLOYMENT_STEPS.md` for exact update and publishing instructions.
