# Portfolio Content and Design Update Guide

This guide explains where to change the most important content without rebuilding the entire site.

## Personal details

Most visible personal details are in `index.html`.

Search for:

```text
Sarmad Saeed
Ghauri_Boy
University of Chester
sarmadsaeed2002@gmail.com
```

Update every relevant occurrence consistently, including the structured profile data in the `<head>`.

## CV files

The primary website buttons use:

```text
Sarmad_Saeed_CV.pdf
Sarmad_Saeed_CV.docx
```

When replacing a CV, keep the same file names to avoid changing every link. The two `Professional_Resume` files are retained for compatibility with previous portfolio links.

## Projects

Project cards are written in the `#projects` section of `index.html`.

The detailed case-study content is stored in the `projectData` object inside `script.js`. Each project uses the same ID in both places, for example:

```html
data-project="randomness"
data-open-project="randomness"
```

and:

```javascript
randomness: {
  title: 'Integrated Randomness Testing Suite',
  ...
}
```

Keep these IDs identical.

## Project filters

A card can belong to one or more categories:

```html
data-categories="research development"
```

Available categories are:

```text
research
defence
offensive
development
```

When adding or removing cards, update the numbers shown inside the filter buttons.

## Colours

The global design colours are at the top of `styles.css`.

Key variables:

```css
--bg
--surface
--text
--muted
--accent
--blue
--line
```

Dark-theme variables are under `:root`. Light-theme values are under:

```css
html[data-theme="light"]
```

## Motion

Animation keyframes are near the end of `styles.css`. JavaScript-enhanced effects are in `script.js`:

- Reveal animations
- Counter animations
- Terminal typing
- Project filtering
- Command palette
- Card spotlight and tilt
- Magnetic buttons
- Cursor aura
- Network canvas

Do not remove the reduced-motion media query. It protects accessibility and mobile performance.

## Cache version

The main files are linked as:

```html
styles.css?v=3.0.0
script.js?v=3.0.0
```

After a future major update, change `3.0.0` to a new version such as `3.1.0`. This helps browsers request the latest CSS and JavaScript.

## Social preview

The LinkedIn/social preview image is:

```text
assets/social-preview.png
```

Keep it at 1200 × 630 pixels. After connecting a custom domain, use the full public image URL in the Open Graph and Twitter metadata.

## Safe content rules

- Keep the MSc wording as **Graduate** and **Graduated**.
- Keep the University of Chester academic year as **2025–2026**.
- Do not use “candidate”, “expected 2026” or “currently studying”.
- Do not add unsupported scores, employment claims or project outcomes.
- Describe penetration testing only in authorised or controlled contexts.
