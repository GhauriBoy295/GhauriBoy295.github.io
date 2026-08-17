# FINAL CHANGELOG — AEGIS NEXUS

**Release 24.0.0** — navy on black, bright green, glass on the project cards

## Palette

Near-black ground with **navy-blue structure** and **one bright green signal**,
red kept for incident and offensive states.

| Token | Value | Role |
|---|---|---|
| `--canvas` | `#000306` | Near-pure black ground |
| `--surface-1..4` | `#061426` -> `#173A66` | Genuinely navy, not desaturated slate |
| `--border-strong` | `#2D6BA8` | Navy blue that reads as a colour |
| `--secure` | `#29F58C` | Bright green — the one signal |
| `--incident` | `#FF4D5E` | Red: incident, offensive, risk only |

Green and red are the only two hues that ever appear at full strength. That is
deliberate and it is what keeps the red meaningful — if several things glowed,
an incident marker would stop being a signal.

Contrast re-measured across the new palette: **426 text nodes per theme, zero
below WCAG AA**.

## Glass on the project cards

Applied, after measuring rather than assuming. Scroll frame times across the
project grid at 1440x900, 150 frames:

| | median | p95 | worst frame |
|---|---|---|---|
| Without blur | 4.2ms | 8.4ms | 8.5ms |
| With blur | 4.2ms | 8.5ms | 16.7ms |

The filter is free at the median and only shows in the worst frame, so it
ships. The earlier caution against it was overstated for this hardware.

What did not change is the reasoning behind that caution — this is a fast
desktop, and it is not the machine that would struggle. So blur is dropped under
`(max-width: 899px), (hover: none)`, which is where the cards stack and the
device is most likely to be the weakest. Translucency, hairline border and top
sheen remain at every size, so the cards read as glass regardless; only the
filter pass is conditional.

`.mission-art` also became translucent, so the card's pane shows through the
artwork's own backdrop — without that, a card that is mostly image reads as
opaque no matter what the container does.

The two-tier `.glass` / `.glass-lite` split written while testing was collapsed
back to one class. Two names for one visual idea, distinguished only by whether
a filter is affordable, is a decision the media query already makes.

## Version

Asset revision **24.0.0** across the nine CSS links, the module script tag, every
import specifier, `ASSET_REV`, `CACHE_VERSION = 'v24-0-0'` and the footer.

---

**Release 23.0.0** — cooler palette, self-hosted type, glass surfaces, hero banner

## Palette

Cooled from green to **teal-cyan** (`--secure: #1FE9CE`), with the navy ramp
shifted bluer to match. Teal rather than a straight cyan on purpose: cyan on
navy is the most over-used pairing in the category, and the brief rules out
generic blue-neon. Teal reads cold without landing there, and it keeps red
unambiguous as the only warm signal on the page.

Forensic Daylight was cooled in step — a bluer grey ramp and a deep teal action
colour (`#06695C`) — and remains independently authored rather than an
inversion.

Every contrast pair was re-measured after the change: **426 text nodes per
theme, zero below WCAG AA**.

## Type

Two self-hosted faces, latin subsets, **47KB total**:

| Face | Use | Size |
|---|---|---|
| Space Grotesk 500 / 700 | Headings, display | 26KB |
| JetBrains Mono 400 | Labels, logs, technical text | 21KB |

Both are SIL OFL 1.1; the licence and provenance are in `assets/fonts/`. Body
copy deliberately stays on the system stack — it costs nothing and renders
natively. `font-display: swap` on all three, so text is readable before the
font arrives and layout never blocks on it. They are precached by the service
worker: a swap-in font that only appeared online would make the offline copy
look different.

## Glass and matte

**Matte is the default** — flat, opaque, no blur. **Glass is opt-in** and applied
to exactly five panels: the two hero status cards, the Recruiter Quick View, the
contact panel and the experience tickets. Those are the components that sit over
the page's own backdrop and gain something from letting it through.

It is deliberately *not* applied to anything that repeats in a grid — the six
project cards, the education cards, the twelve tool tiles — because
`backdrop-filter` is expensive and a page-wide film is what makes glass look
cheap. There is a `@supports not (backdrop-filter)` fallback to the opaque
surface, so the panel is never see-through-and-unreadable.

## Hero banner

The Operations Deck concept, full-bleed above the hero: a server-room skyline
with lit rack status lines, a network uplink across the top, and a shield at the
centre.

Inline SVG rather than an `<img>`, so every colour is a theme token — it
recolours with the theme instead of needing a second asset, and stays sharp at
any width. Height is capped in `vw` so it never eats the fold on a short laptop
screen, the artwork slices rather than distorting, and a bottom fade hands off
into the page instead of ending on a hard edge.

## Version

Asset revision **23.0.0** across the nine CSS links, the module script tag, every
import specifier, `ASSET_REV`, `CACHE_VERSION = 'v23-0-0'` and the footer.

---

**Release 22.0.0** — Experience as incident tickets

Each role is now an incident ticket: a classification chip and reference number,
a three-node architecture flow showing where the work actually sat, a labelled
work sequence, and the notes as chevron bullets.

## What is deliberately not copied from the reference

The supplied design showed a timestamped console log — `20:46:04 FLAGGED`,
`20:46:05 BLOCKED` — and named a commercial IDS product.

Neither is on the site:

- **No clock timestamps and no BLOCKED line.** That would present a captured
  incident record that never existed. The sequence is labelled `STEP 01..04`
  and describes how the work was done, which is true and still reads as an
  operations log.
- **No vendor name.** The internship notes say "industrial network monitoring
  and threat detection" rather than naming a product that cannot be verified
  from anything in this repository. If the product was genuinely used, the name
  goes back in with one edit.

The rest of the reference — chip, reference number, flow diagram, anomaly tag,
mono log panel, chevron notes — is implemented as drawn.

## Defects caught by the suite during this build

1. **Contrast failure.** `.lv-tag.is-analyse` used `--border-strong` on the
   near-black log panel: **2.56:1**, well under AA. Changed to `--text-2`,
   which keeps the three tags distinct as neutral -> amber -> green.
2. **A 1px element overflowing itself.** `.flow-link` was a 1px-wide rule with a
   7px absolutely-positioned dot, so the dot overflowed its own parent at every
   viewport. Line and dot are now both backgrounds on a 9px box.
3. **Page overflow at 320px.** "E-commerce Operations / eBay Account Management"
   has no break opportunity and pushed the page to 330px. The ticket head now
   stacks below 560px and the title breaks anywhere.

A fourth was caught before it shipped: `icon-factory` was referenced by the new
flow diagram but its `<symbol>` had been dropped from the sprite in an earlier
rewrite, so the field-devices node would have rendered empty.

## Version

Asset revision **22.0.0** across the nine CSS links, the module script tag, every
import specifier, `ASSET_REV`, `CACHE_VERSION = 'v22-0-0'` and the footer.

---

**Release 22.0.0** · branch `redesign/aegis-nexus-v15-live` · previous release 16.0.0

16.0.0 matched the reference's structure. 17.0.0 matches its *finish* — the parts
marked up on the supplied screens — and makes deployment automatic.

---

## 1. The marked areas

**Globe.** The sphere now has an atmosphere: one contained radial gradient behind
it, reaching full transparency inside its own box. Dots are brighter, nodes
larger, route arcs heavier. It reads as the lit globe on the reference rather
than a faint wireframe.

**Project artwork.** All five illustrations were redrawn as layered, lit scenes
instead of flat diagrams — a gradient sky, a depth grid, a radial glow behind the
focal element, and foreground detail:

| Project | Scene |
|---|---|
| Randomness suite | Entropy cell matrix, a filled distribution curve over a bitstream, a lit shield |
| ICS intrusion detection | Industrial plant with tanks, towers and pipe runs; segmented OT network; red anomaly node and path; shield |
| DFIR labs | Evidence disk with platter rings, a lit fingerprint under a magnifier, four-step custody timeline |
| Security assessment | Lit server racks with a red attack path crossing green control bars |
| Blood bank database | Lit vault, relational links, record rows, privacy shield |

**Case-study report.** The report now opens on the same artwork the card showed,
as a banner above the written account. The SVG is *cloned from the card* rather
than duplicated in the data, so each illustration still has exactly one source,
and the clone is marked `aria-hidden` because the report already states
everything in text.

**Tools & Technologies.** Monogram letters were replaced with twelve original
glyphs — a scan reticle, a packet waveform, an intercept gate, a payload target,
shields, a fingerprint, a disk, code braces, a database, a terminal, a rack.
They are tinted by purpose: red for offensive tooling, amber for forensic, green
for defensive, neutral for platforms and languages. **No vendor logo or
trademark is reproduced** — each glyph depicts what the tool does.

**About and Skills panels** keep the marked layout. The About visual remains an
original orbit diagram, since you asked for no photograph.

## 2. Automatic deployment

Two GitHub Actions workflows were added.

`verify.yml` runs on every push and pull request: JavaScript syntax on all five
modules and the service worker, asset-revision synchronisation between the HTML
and the worker, the presence of every required file, and the content rules — the
worldwide wording, the correct LinkedIn URL, exactly one H1, and the absence of
"candidate", "expected 2026", "currently studying" and UK-only phrasing. A future
edit that breaks any of those fails the build instead of reaching the live site.

`deploy.yml` runs on every push to `main` and publishes to **Vercel** and
**Netlify**. Each job checks for its secrets first and skips cleanly when they
are absent, so the workflow is green immediately and starts deploying the moment
the secrets are added. No secret is ever printed.

GitHub Pages is deliberately *not* in that workflow: this is a
`<user>.github.io` repository publishing straight from `main`, so Pages already
rebuilds on every push. Adding a Pages job would have required switching the
Pages source first and could have broken a deployment that already works.

## 3. Bugs fixed

1. **Technology chips lost their styling.** `.mission-stack` was dropped during
   the 16.0.0 rewrite while the report aside still used it, so the chips in the
   case-study report rendered as one run-on string of concatenated words.
2. **Wrapped metadata began with a stray separator.** The middot was drawn as a
   `::before` on the following item, so a wrapped line started with the
   separator. It is now an `::after` on the preceding item and wraps with it.
3. **The blood-bank shield glyph read as a letter "T".** Replaced with the same
   check mark the other shields use.
4. **The report banner was wiped and then hidden.** `render()` replaces the whole
   of `#reportMain`, and `selectPanel()` hid every child that was not the active
   panel. The banner is now built into the panel list, and the panel toggle is
   scoped to `.report-panel`.

## 4. Version

Asset revision **20.0.0** across the nine CSS links, the module script tag, every
import specifier, `ASSET_REV`, `CACHE_VERSION = 'v17-0-0'` and the footer.

---

## Release 16.0.0 — reference-matched composition

**Release 16.0.0** · branch `redesign/aegis-nexus-v15-live` · previous release 15.0.0

Release 15.0.0 built the AEGIS design system. Release 16.0.0 re-lays the page on
the supplied visual reference so the composition, section order and component
shapes match it, while keeping every engineering guarantee 15.0.0 earned.

---

## 1. Composition re-laid on the reference

| Reference element | Implemented as |
|---|---|
| Nav: Home · About · Education · Experience · Projects · Skills · Certifications · Contact | Same eight items, plus a persistent **Download CV** action in the header |
| "Hi, I'm SARMAD SAEED" | `.hero-greeting` + the single `<h1>`, surname in the secure green |
| Green dot-matrix globe | `globe.js` rewritten from a wireframe to a **dot-matrix sphere** — even angular grid, longitude spacing divided by cos(latitude), depth-faded dots, light graticule underneath, routed links and regional nodes on top |
| Right-hand status panel | **Profile status** card (see §2) |
| Location card with world map | **Location** card with UK local time and a dotted world map |
| Four-item stat bar | Education · Experience · Projects · Focus, single bordered strip |
| About Me with portrait | Same layout; the portrait slot holds an **original orbit diagram**, not a photo — as requested, no picture is used |
| Core Skills bars | Same bar component, driven by evidence counts (see §2) |
| Tools & Technologies tiles | 12 tiles with **original monogram marks** — no vendor logos are reproduced |
| Project cards with imagery | Five cards with original per-subject inline SVG artwork, title row with classification badge, "View Case Study" |
| Filter pills | Discipline row + NIST row, pill-shaped, filled when active |
| "More Projects" placeholder | Kept as an honest empty slot linking to GitHub |
| Case-study modal with left tab rail | The existing Neo-Forensics report — rail, panels, evidence timeline, artefacts |
| Certifications cards | Verified (3, with links) and Additional (2, unverified) kept visibly separate |
| Bottom feature strip | Six tiles describing how the site itself is built |

## 2. Where the reference was not copied, and why

The reference screens carry figures that are not backed by anything real. The
repository's own `CLAUDE.md` forbids inventing skill percentages, SOC metrics,
years of experience and certifications, so the **components were rebuilt and the
data replaced with facts**. Nothing was dropped; nothing false was added.

| Reference showed | This build shows |
|---|---|
| SYSTEM STATUS: Network Security 98%, Endpoint Protection 97%, Threat Detection 96%, Incident Response 94% | **Profile status**: Degree status *Graduated*, Current base *United Kingdom*, Availability *Worldwide*, Work modes *Remote · Hybrid · On-site* — same panel, same tick marks, real values |
| MONITORING line chart | **Lifecycle coverage**: the five NIST CSF functions with the number of documented case studies in each (1/1/1/1/—). Recover is shown empty rather than filled in |
| "Experience — 2+ Years" | **Experience — ICS internship & operations**, Phi-Tech · Trezlon Ltd |
| "Projects — 10+ Completed" | **Projects — 5 documented case studies** |
| Core skills at 90% / 85% / 80% / 75% | Same bars, filled by **evidence count out of the three sources listed underneath**, with an on-page legend stating exactly that. No proficiency score is implied |
| Cisco Cybersecurity Essentials, TryHackMe SOC Level 1, "Google Cybersecurity Professional Certificate" | The **three verified Coursera completions** with public verification links, and the **two unverified completions**, labelled as such |
| Portrait photograph | Original orbit diagram (no photo, as requested) |
| Vendor logos in the tools grid | Original monogram tiles |
| "Watch Introduction" / "View Live Demo" | Removed — neither exists |

## 3. Local preview port

The preview port moved from **8080 to 8123** throughout, because 8080 is in use by
another project: `.claude/launch.json` (both), `START_LOCAL_PREVIEW.bat`/`.sh`,
`WORKSPACE_MANIFEST.json`, the workspace and repository READMEs,
`DEPLOYMENT_STEPS.md`, `CONTENT_UPDATE_GUIDE.md` and every test script.

## 4. Engineering changes

- Asset revision **16.0.0** across all nine CSS links, the module script tag, every
  JS import specifier, `ASSET_REV`, `CACHE_VERSION = 'v16-0-0'` and the footer.
- `hero.css`, `sections.css` and `missions.css` rewritten for the new components;
  `tokens.css`, `base.css`, `shell.css`, `overlays.css`, `motion.css` and
  `print.css` carried forward.
- Header navigation breakpoint moved 1119px → **1279px** (eight items plus the CV
  action need the extra room); the CV action hides below that, the command label
  below 1440px. Both remain reachable from the palette.
- The capability-lifecycle tablist was replaced by the skills panel, so its
  controller was **removed from `app.js`** rather than left as dead code.
- Command palette, keyboard jumps and the shortcuts sheet retargeted to the new
  section IDs (`G` then `A`/`D`/`E`/`P`/`S`/`V`/`C`).
- Filters now exclude the placeholder card from counts and hide it under any
  active filter.
- `print.css` updated for the new component names; the stale `.quickview-panel`,
  `.lifecycle-detail` and `.register-row` rules were removed.

### Bugs fixed during this release

1. **`.is-secure-text` was never defined.** Every green inline highlight — "MSc
   Cyber Security *Graduate*", "Building *secure systems*", "*Case Studies*",
   "Open *worldwide*" — was rendering in plain body colour. Added as a real
   utility in the base layer.
2. **Red/Blue connectors ran through the box labels.** The attack-path segments
   were drawn from box centre to box edge, striking a line through
   "Reconnaissance" and "Validation". The boxes were re-spaced evenly and the
   connectors now run in the gaps between them.
3. **The scroll cue was below the minimum target size** at 19px tall; now 28px.

---

## Release 15.0.0 — the fused AEGIS system

**Release 15.0.0** · branch `redesign/aegis-nexus-v15-live` · previous release 14.0.1

This release replaces the visual architecture of the portfolio rather than
recolouring it. Every feature the previous release earned is preserved or
improved; the composition, the token system, the motion architecture and the
case-study presentation are new.

---

## 1. What this release is

Four approved systems were fused into one product, with deliberate,
non-overlapping responsibilities so they cannot fight each other:

| Layer | Owns | Where you see it |
|---|---|---|
| **Sentinel X Executive** | Global shell, hierarchy, typography, spacing, recruiter clarity | Header, section rhythm, Recruiter Quick View, evidence register |
| **BlackICE Operator** | Entry and command surfaces | Secure welcome, command-centre hero, cyber globe, operator terminal, command palette |
| **Red Cell / Blue Team** | Security semantics | Mission classification, attack-path diagram, offensive/defensive module |
| **Neo-Forensics** | Evidence and detail | Case-study reports, work-sequence timelines, working-material register, Forensic Daylight, print layouts |

---

## 2. Mandatory content corrections

All four baseline failures recorded in `CURRENT_BASELINE_REPORT.txt` are fixed.

| # | Was | Now |
|---|---|---|
| 1 | Hero pill: "Open to UK cyber security opportunities" | **"Open to cyber security opportunities worldwide"** |
| 2 | Contact copy limited opportunities to the United Kingdom | Base remains the United Kingdom; availability is **Worldwide**, with remote, hybrid, on-site and relocation stated explicitly |
| 3 | `linkedin.com/in/sarmad-saeed-cyber` in the contact directory, the JSON-LD `sameAs` array and the command palette | **`https://www.linkedin.com/in/sarmad-saeed-845a7b267`** in all three, plus the README |
| 4 | No "Worldwide" wording anywhere | Present in the hero pill, the hero status strip, the Quick View, the availability section, the operator terminal, the footer status line, the JSON-LD `seeks` block, the meta description and the social preview |

Work modes now appear as a labelled set — **Remote · Hybrid · On-site · Relocation** —
in the hero status strip, the Recruiter Quick View and the availability section.

`MSc Cyber Security Graduate`, `University of Chester`, `2025–2026` and `Graduated`
are unchanged. `candidate`, `expected 2026`, `currently studying` and `pursuing MSc`
appear nowhere. `Sarmad Saeed` is the single `<h1>`.

The stale LinkedIn slug was also removed from `AUDIT_BASELINE.md` and the previous
`FINAL_TEST_REPORT.md`, where it survived as a historical quotation. Those
references now read `<previous-vanity-slug>` so the dead URL exists nowhere in the
repository.

---

## 3. Page composition

The previous page was About / Expertise / Projects / Education / Experience /
Contact, built from repeated bordered cards. The new order is:

1. **Secure welcome** — BlackICE boot with a verification checklist, Enter / Skip / Download CV
2. **Sticky product header** — brand, seven-item nav, command trigger, motion menu, theme menu
3. **Command-centre hero** — single H1, availability pill, focus tags, canvas globe, operator terminal
4. **Hero status strip** — base, availability, degree status, focus
5. **Recruiter Quick View** — four metrics, six facts, CV downloads, copy email, print, install, UK local time
6. **Profile** — working philosophy, three principles, capability relationship map
7. **Capability lifecycle** — five NIST CSF functions as a tablist, each with the academic work that grounds it
8. **Red Cell / Blue Team** — attack path drawn against defensive controls, with a Both / Red / Blue control
9. **Missions** — five illustrated mission cards, discipline and NIST filters
10. **Route** — education and experience as a single sequenced timeline
11. **Credential evidence register** — three verified, two additional, kept visibly separate
12. **Global availability** — reach map, work modes, contact directory
13. **Footer** — navigation, system actions, release and connection status

Overlays: case-study report, command palette, keyboard shortcuts sheet, toast region.

### Replaced outright

- Repetitive expertise cards → the NIST lifecycle tablist
- Generic project cards → mission cards with per-subject original SVG artwork
- Flat project dialog → three-region forensic case-study report
- Bento "about" grid → a profile statement with an abstract capability map
- Two "robotic banner" lego scenes → removed; they carried no information
- Hero radar panel and diagnostics → the cyber globe and the honest status strip

---

## 4. Design system

### Tokens

`assets/css/tokens.css` was rebuilt from 64 KB of accreted, largely dead
declarations down to a single readable contract. Both themes are now defined
independently against the same token names.

**BlackICE Night** — `--canvas #020507`, surfaces `#06111D → #14364D`, borders
`#102B3F → #24567A`. Black and navy carry the structure. `--secure #22E58B` is a
solid signal, not an atmosphere. `--incident #FF4D5E` appears only for incident,
offensive and risk states. `--evidence #E9B949` labels forensic artefacts.

**Forensic Daylight** — a digital-forensics laboratory, not an inversion:
`--canvas #EDF2F6`, white and cool-grey surfaces, navy type `#08151F`, forest green
`#0A6E45`, controlled red `#B62537`. The two glow tokens collapse to flat elevation
in this theme, so anything that glows in the dark theme reads as a printed panel
here. Nothing neon survives the switch.

### Green discipline

The audit's complaint was that green was "repeatedly diluted through weak
transparent effects". The whole page now has exactly one ambient glow — a single
radial gradient behind the hero, at 9% of `--secure`, reaching full transparency
inside its own box. Everywhere else green is a solid fill, a 1px line, a `--secure-soft`
chip or a 2px left border. `--glow-secure` is used on precisely one component: the
primary button.

### No purple anywhere

`404.html` still carried `#818CF8` from an abandoned violet theme, including an
inline comment describing a scheme the site had already left. The page was rebuilt
on the AEGIS tokens with its own light-theme block. The starfield canvas in the
previous `app.js`, which read `--accent-rgb` / `--accent-2-rgb` and painted violet
defaults when those tokens were missing, is gone entirely.

### Typography and spacing

System-first stack; monospace reserved for technical labels, keys, terminal lines
and evidence identifiers. `H1 clamp(2.75rem, 8vw, 6.25rem)`, `H2 clamp(1.85rem,
3.6vw, 3.25rem)`. 8px spacing scale, `--section-gap clamp(3rem, 8vw, 7.5rem)`,
content max-width 1340px, radii 8 / 12 / 16 / 20px.

---

## 5. Motion architecture

One attribute drives everything: `html[data-motion]` = `full` | `calm` | `off`.

Every motion rule in `assets/css/motion.css` is nested under that attribute, so the
base stylesheet describes a completely static page and motion is only ever *added*.
That is what makes "off" trustworthy — there is nothing to undo, and no element can
be stranded mid-transition with its content hidden.

- **Full** — reveal choreography, staggered grids, boot verification sequence, globe
  rotation with routed packets, packet routes in the diagrams, mission scan on
  hover/focus, filter layout transition, restrained control micro-interactions.
- **Calm** — short opacity-only fades, no translation, no globe rotation, no
  ambient loops.
- **Off** — all durations 1ms, all content immediately visible, instant scrolling.

Default resolution, mirrored byte-for-byte between the pre-paint inline script and
`core.js`: `prefers-reduced-motion` → `off`; touch-first, under 720px, ≤4 cores or
≤4 GB → `calm`; otherwise `full`.

### Contention removed

The previous release ran two IntersectionObservers over the same `.reveal` class —
a one-shot reveal observer and a "reverse flow" observer that re-hid elements on
scroll-up. They fought each other. There is now one observer, one direction, one
class: elements resolve once and stay resolved.

### Offscreen and hidden

Sections marked `data-ambient` gain `.is-idle` when they leave the viewport, which
pauses every packet route, node pulse and scan animation inside them. The globe's
rAF loop stops on `document.hidden` and when the hero leaves the viewport, and is
never started below Full motion — at Calm it paints exactly one static frame.

---

## 6. The cyber globe

`assets/js/globe.js` is new and entirely original: a wireframe sphere with a
graticule, fifteen regional nodes, great-circle routes slerped from the UK base
node, and one travelling marker per route, phase-offset so they never pulse in
unison.

Budget: one canvas, one rAF loop, ~24fps, DPR clamped to 1.5, no shadow blur, no
filters. It is not created at all on touch-first or small screens — there, the
static SVG twin renders the same topology with no script and no animation, and it
is also what remains visible at motion off.

It illustrates one truthful fact: base United Kingdom, availability worldwide. No
counters, no traffic figures, no telemetry.

---

## 7. Case-study reports

The flat dialog became a three-region forensic report:

- **Desktop** — evidence navigation rail, report body, artefact panel
- **Tablet** — the rail becomes a horizontal tab strip
- **Mobile** — a full-screen sheet with a sticky title bar and a single scroller

Each mission gained a **work-sequence timeline** and a **working-material** list.
Both describe process and material type only — never a measured result, a quantity
or an outcome. Missions without a genuine NIST mapping omit the framework block
entirely rather than inventing one.

Added: Previous / Next navigation across missions, Web Share where the browser
supports it, and a print layout that renders *every* panel rather than the selected
tab — a report with four of its five sections missing would be a misleading document.

---

## 8. Features preserved and improved

| Feature | Change |
|---|---|
| Theme control | Two-state toggle → **three-state System / Dark / Light** disclosure menu with `menuitemradio` state |
| Motion control | Cycling button → **three-state menu** with descriptions and exposed state |
| Command palette | Now also opens all five case studies, both CV formats, copy-link, print, and each theme and motion level by name |
| Keyboard shortcuts | Added `M` for motion; jump targets remapped to the new sections |
| Project filters | Added NIST filters, a live `aria-live` result count and an empty state |
| Deep links | Unchanged behaviour, extended with Previous/Next |
| Share / copy / print | Added Web Share, copy-page-link and a full-page print layout |
| CV downloads | Both PDF and DOCX now surfaced in the Quick View and the palette |
| PWA | Added online/offline status and an install-app action that appears only when the browser offers it |
| Local time | Preserved, moved into the Quick View |
| No-JS fallback | Extended: hides the welcome, restores scrolling, reveals every lifecycle panel and mission, and explains what is unavailable |

---

## 9. Engineering

### File structure

CSS: 9 modules replaced by 9 modules, but along component lines rather than
historical accretion — `tokens`, `base`, `shell`, `hero`, `sections`, `missions`,
`overlays`, `motion`, `print`. Removed: `design`, `effects`, `flow`, `responsive`,
`sentinel`, `surfaces`, `terminal`.

JS: `app.js` (50 KB single closure) split into `core.js` (shared helpers, theme and
motion resolution), `globe.js`, `report.js`, `project-data.js` and a slimmer
`app.js` orchestrator.

### Version synchronisation

`15.0.0` across all nine CSS links, the module script tag, every JS import
specifier, `ASSET_REV`, `CACHE_VERSION = 'v15-0-0'`, the footer status line and this
document. The service worker's precache list is now generated from the module name
arrays, so a module can no longer be added to the site and forgotten in the cache.

### Bugs fixed during implementation

1. **`[hidden]` was not working.** The UA rule `[hidden] { display: none }` is a
   bare selector, so any component setting `display` beat it. All five lifecycle
   panels rendered at once, and the install-app button and local-time block showed
   before they had anything to show. Fixed with an explicit `[hidden] { display:
   none !important }` in the base layer.
2. **`M` shadowed the `G`-then-`M` jump.** The single-key motion shortcut was
   evaluated before the pending `g` prefix, so the documented "go to missions"
   sequence silently cycled the motion level instead. The prefix now claims the
   keystroke first.
3. **Page-level horizontal overflow at 320–430px.** The welcome panel used
   `width: min(760px, 100%)` inside a `place-items: center` grid, where the
   percentage resolved against a content-sized track and refused to shrink. Changed
   to flex centring.
4. **Overflow from scroll containers inside grids.** The availability map and the
   Red/Blue diagram carry `min-width` for legibility; as grid items their default
   `min-width: auto` propagated that to the column and pushed the page sideways.
   Fixed with explicit `min-width: 0`.
5. **Header overflow at 1024px.** Seven nav items plus four controls did not fit.
   The mobile-navigation breakpoint moved from 1023px to 1119px.
6. **A visible seam across the hero.** The ambient glow lived in an inset box whose
   gradient was still tinted at the box edge, drawing a hard rectangular line down
   the hero on narrow screens. The gradient now reaches full transparency inside
   its own box.
7. **Sticky action block covered the artefact list.** In the report aside, a sticky
   footer floated over the working-material list. Replaced with a flex column where
   the artefact list absorbs the remaining height and scrolls inside itself.
8. **Footer controls below the minimum target size.** Plain inline links measured
   23px high; they now carry `min-height: 28px`.

### Security and safety

No `eval`, no `document.write`, no `javascript:` URLs. All external links carry
`rel="noopener noreferrer"`. No new dependency, no build step, no remote asset —
every image on the page is inline SVG or a local file. `_headers`, `netlify.toml`
and `vercel.json` are unchanged.

---

## 10. Metadata and SEO

- Meta description rewritten around worldwide availability
- Open Graph: added `og:site_name` and `og:locale`, absolute image URL retained
- JSON-LD: `jobTitle` corrected to `MSc Cyber Security Graduate`, `addressCountry`
  changed to the ISO code `GB`, `url` added, a `seeks` / `Demand` block added
  stating worldwide availability, `knowsAbout` expanded, `sameAs` corrected
- `site.webmanifest`: theme colours retuned to `#04090E`, added `lang`,
  `orientation`, `categories` and two app shortcuts
- `404.html` rebuilt on the AEGIS palette with its own light-theme block
- `assets/social-preview.svg` redrawn and re-rendered to
  `assets/social-preview.png` at exactly 1200 × 630
- `robots.txt` and `sitemap.xml` verified unchanged and correct

---

## 11. Honest limitations

- **Lighthouse was not run.** No Lighthouse binary is available in this
  environment. Real measured navigation timings, transfer weight, layout shift,
  long-task counts and DOM size are reported instead in `FINAL_TEST_REPORT.md`. They
  are measurements, not a score.
- **Screen-reader testing was automated, not manual.** Roles, names, states,
  `aria-live` regions, focus management and focus restoration were verified
  programmatically. No NVDA, JAWS or VoiceOver session was run.
- **Contrast was computed, not sampled from rendered pixels.** Every visible text
  node's computed colour was composited against its resolved backdrop and checked
  against WCAG AA. Text over the canvas globe and over mission artwork is not
  measured this way, because there is none — all artwork is behind or beside text,
  never under it.
- **`prefers-reduced-motion` and colour-scheme were emulated** through Chrome's
  media emulation rather than toggled in an operating system.
- **Real-device testing was not possible.** All nine viewports were tested under
  Chrome device emulation with touch emulation enabled below 768px.
