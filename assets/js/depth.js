/* AEGIS NEXUS — depth (3D) layer.

   Two effects, one budget:

   1. Card tilt. A card rotates towards the pointer, its inner layers separate
      in Z, and a specular highlight tracks the cursor.
   2. Hero parallax. The hero's depth layers drift against pointer movement, so
      the identity block and the globe sit at visibly different distances.

   Design decisions worth stating, because they are the difference between
   depth and a novelty:

   - The tilt is written as an *inline* transform. The reveal system owns the
     stylesheet transform on the same elements; inline beats stylesheet, and
     clearing it hands control straight back. Neither system has to know the
     other exists.
   - Every pointer event only records coordinates. The transform is written in
     a rAF frame, so a burst of pointermove events still costs one write per
     frame rather than one per event.
   - Tilt is capped by --tilt-max (7deg dark, 6deg light). Past roughly 8deg a
     rectangular panel stops reading as a card on a desk and starts reading as
     a game menu, which the brief rules out.
   - It runs only at the full motion level, only with a fine pointer, and never
     on a low-power device. Nothing here is content: if it never runs, the page
     is unchanged apart from a flat shadow. */

import { $$, root, motionLevel, finePointerQuery, lowPower } from './core.js?v=25.0.0';

const CARD_SELECTOR = '.depth-card';

/* One shared frame for every card and the hero, rather than a rAF per element:
   with five project cards, four education cards and the hero all reacting to
   the same pointer, per-element loops would schedule ten callbacks a frame to
   do one frame of work. */
let frameId = 0;
const pending = new Set();

function schedule(job) {
  pending.add(job);
  if (frameId) return;
  frameId = requestAnimationFrame(() => {
    frameId = 0;
    const jobs = Array.from(pending);
    pending.clear();
    jobs.forEach((run) => run());
  });
}

function affordable() {
  return motionLevel() === 'full' && finePointerQuery.matches && !lowPower;
}

/* ---------- Card tilt ---------- */
function initCard(card) {
  let rect = null;
  let px = 0;
  let py = 0;
  let active = false;

  const styles = getComputedStyle(card);
  const maxTilt = parseFloat(styles.getPropertyValue('--tilt-max')) || 7;

  function write() {
    if (!active || !rect) return;
    // Normalised to -1..1 from the card's own centre, so the rotation is the
    // same at every card size.
    const nx = ((px - rect.left) / rect.width) * 2 - 1;
    const ny = ((py - rect.top) / rect.height) * 2 - 1;
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    // Y follows horizontal travel, X is inverted: pushing the pointer up must
    // tip the top of the card away, not towards.
    const ry = clamp(nx) * maxTilt;
    const rx = clamp(ny) * -maxTilt;
    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    card.style.setProperty('--sheen-x', `${(clamp(nx) * 50 + 50).toFixed(1)}%`);
    card.style.setProperty('--sheen-y', `${(clamp(ny) * 50 + 50).toFixed(1)}%`);
  }

  function enter(event) {
    if (!affordable()) return;
    // Measured once per entry rather than per move: reading getBoundingClientRect
    // inside a pointermove is a forced synchronous layout on every event.
    rect = card.getBoundingClientRect();
    active = true;
    card.classList.add('is-tilting');
    px = event.clientX;
    py = event.clientY;
    schedule(write);
  }

  function move(event) {
    if (!active) return;
    px = event.clientX;
    py = event.clientY;
    schedule(write);
  }

  function leave() {
    if (!active) return;
    active = false;
    rect = null;
    card.classList.remove('is-tilting');
    // Clearing rather than zeroing: this is what returns the element to the
    // stylesheet, so the reveal and filter systems keep working normally.
    card.style.transform = '';
    card.style.removeProperty('--sheen-x');
    card.style.removeProperty('--sheen-y');
  }

  card.addEventListener('pointerenter', enter);
  card.addEventListener('pointermove', move);
  card.addEventListener('pointerleave', leave);
  // A card can be tabbed to while the pointer sits elsewhere, and a filter can
  // hide a card mid-tilt; both must not leave a card frozen at an angle.
  card.addEventListener('blur', leave, true);
  window.addEventListener('pagehide', leave, { once: true });

  return leave;
}

/* ---------- Hero parallax ---------- */
/* The hero moves against the pointer rather than with it. Moving with it reads
   as the page sliding; moving against it reads as looking around a scene. */
function initHeroParallax(hero) {
  const layers = $$('[data-depth]', hero);
  if (!layers.length) return () => {};

  let px = 0;
  let py = 0;

  function write() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const nx = (px - cx) / cx;
    const ny = (py - cy) / cy;
    layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth) || 0;
      const x = (-nx * depth * 14).toFixed(2);
      const y = (-ny * depth * 10).toFixed(2);
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }

  function reset() {
    layers.forEach((layer) => { layer.style.transform = ''; });
  }

  function move(event) {
    if (!affordable()) return;
    px = event.clientX;
    py = event.clientY;
    schedule(write);
  }

  window.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('aegis:motion', () => { if (!affordable()) reset(); });
  window.addEventListener('pagehide', reset, { once: true });

  return reset;
}

export function initDepth() {
  const resets = [];

  // Marked in the markup rather than guessed here, so a component opts into
  // depth deliberately instead of inheriting it by matching a layout selector.
  $$(CARD_SELECTOR).forEach((card) => resets.push(initCard(card)));

  const hero = document.querySelector('.hero');
  if (hero) resets.push(initHeroParallax(hero));

  // Dropping to calm or off mid-session must clear anything mid-flight, not
  // just stop new movement.
  document.addEventListener('aegis:motion', () => {
    if (!affordable()) resets.forEach((reset) => reset());
  });

  root.dataset.depth = 'on';
}
