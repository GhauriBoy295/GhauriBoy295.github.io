# Design and Implementation Notes

This document describes what the portfolio actually is and why it is built the way it is. For the
history of changes see `FINAL_CHANGELOG.md`; for test evidence see `FINAL_TEST_REPORT.md`.

## Concept

A static, no-build portfolio for a cyber security graduate, aimed primarily at recruiters and
hiring managers. The design is a deliberate hybrid: an Apple-like premium product layer carries
the hierarchy, typography and spacing, and a restrained cyber-security interface layer supplies
differentiation. The product layer is primary. Cyber visuals are supporting texture and are
never allowed to compete with readability.

## Content integrity

Every factual claim on the site traces to the project's content source of truth. The site
deliberately contains **no**:

- portrait or personal photograph,
- invented certifications, employers, clients or GitHub links,
- years-of-experience, project-count or percentage claims,
- skill-level bars or numeric ratings,
- live-demo buttons that do not lead anywhere real.

The four numeric hero counters (2 degrees, 5 case studies, 3 course completions, 6 security
domains) each count items enumerated on the page itself. Learning credentials are described as
"course completions" rather than certifications, because that is what they are.

The hero profile panel shows qualitative context only — a focus-area radar and four labelled
domains marked Core, Applied, Project and MSc. It previously rendered proportional fill bars,
which implied measured competency scores that nothing supports; those were removed.

## Structure

```text
Welcome / access panel  →  dialog, dismissible, session-persistent
Sticky header           →  brand, nav, command palette, theme, mobile menu
Hero                    →  positioning, CTAs, counters, security profile panel
About                   →  bento layout: profile, snapshot, working method
Expertise               →  six capability cards plus tool marquee
Projects                →  five filterable case studies with native dialog
Education               →  two degrees
Experience              →  two roles plus learning and recognition
Contact                 →  email, LinkedIn, CV downloads, phone disclosure
```

## Interface behaviour

- **Theme.** Resolution order is stored choice, then operating-system preference, then dark. An
  inline head script applies it before first paint so deferred JavaScript cannot cause a flash.
  The site follows live OS changes until the visitor makes an explicit choice.
- **Welcome panel.** A real dialog with `aria-modal`, dismissible by button or Enter, persisted
  for the session and replayable from the command palette. It never blocks scrolling and never
  delays access behind an animation.
- **Case studies.** Native `<dialog>` with `showModal()`, so Escape and the top layer come from
  the platform rather than from script. Focus returns to the triggering card control on close.
- **Filters.** Cards fade, then hide behind a 310 ms timeout so the transition is visible.
  Under reduced motion the timeout collapses to zero.
- **Motion.** Tiered. Button, dialog, filter and theme transitions always run. Cursor aura,
  card tilt, spotlight and the network canvas are desktop and fine-pointer only. Everything
  non-essential is disabled under `prefers-reduced-motion`, and the canvas pauses when the
  document is hidden.

## Accessibility

Semantic landmarks, a working skip link, one `h1` per document with no heading-level jumps,
accessible names on every control, `aria-live` status messaging, visible focus states, and a
no-JavaScript fallback that restores all scroll-reveal content. Touch targets reach 44 × 44 on
coarse pointers and phone widths; fine-pointer desktops use a denser 40 px header, comfortably
above the WCAG 2.2 AA minimum of 24 × 24.

## Engineering constraints

No framework, no package manager, no build step, no remote fonts and no third-party requests.
Icons are local SVG symbols. JavaScript is deferred and wrapped in an IIFE. The stylesheet and
script carry a cache-busting version query that must be incremented whenever either changes.

Deployment configuration is included for GitHub Pages (`.nojekyll`), Netlify (`netlify.toml`,
`_headers`) and Vercel (`vercel.json`). None of them set a Content-Security-Policy, which is why
the inline theme-bootstrap script is safe to ship.

## Known limitations

- Lighthouse has never been run against this build in a measured environment; no score is
  claimed anywhere in this repository.
- The Open Graph image path is relative. When a custom domain is connected it should become an
  absolute URL, as described in `DEPLOYMENT_STEPS.md`.
- `Sarmad_Saeed_CV.*` and `Sarmad_Saeed_Professional_Resume.*` are duplicate copies of the same
  two documents, retained deliberately. Any future edit must be applied to both pairs.

## Suggested next content improvements

The design and interaction systems are in good shape. The most valuable remaining improvements
are evidential rather than visual:

1. A public GitHub profile and repository links.
2. Architecture diagrams or sanitised screenshots for each case study.
3. A published dissertation abstract or technical summary.
4. Verifiable credential links for the three course completions.
