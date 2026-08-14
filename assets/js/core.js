/* AEGIS NEXUS — shared primitives.

   Everything in here is used by at least two other modules: DOM helpers, the
   toast region, clipboard, and the two central preferences (theme and motion).
   Both preferences are resolved here and published as attributes on <html>,
   so CSS is the only thing that ever needs to know what they mean. */

export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const root = document.documentElement;

export function el(tag, options = {}) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) node.setAttribute(key, value);
  }
  return node;
}

export function svgIcon(symbolId) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${symbolId}`);
  svg.append(use);
  return svg;
}

export const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
export const lightSchemeQuery = window.matchMedia('(prefers-color-scheme: light)');

/* Two capability signals used to decide whether continuous decorative motion
   is affordable at all. Neither is treated as a proxy for screen size alone. */
export const lowPower = (() => {
  const cores = navigator.hardwareConcurrency;
  const memory = navigator.deviceMemory;
  return (typeof cores === 'number' && cores <= 4) || (typeof memory === 'number' && memory <= 4);
})();

export function coarseOrSmall() {
  return !finePointerQuery.matches || window.innerWidth < 720;
}

/* ---------- Storage ---------- */
function read(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function write(key, value) {
  try { localStorage.setItem(key, value); } catch { /* private mode: choice is session-only */ }
}

/* ---------- Toast ---------- */
let toastTimer = 0;

export function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

/* ---------- Clipboard ---------- */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = el('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.append(field);
    field.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    field.remove();
    return ok;
  }
}

/* ---------- Theme: System / Dark / Light ---------- */
const THEME_KEY = 'aegis-theme';
const LEGACY_THEME_KEY = 'sarmad-portfolio-theme';
const BAR_COLOUR = { dark: '#04090E', light: '#EDF2F6' };

export function storedTheme() {
  const value = read(THEME_KEY);
  if (value === 'dark' || value === 'light' || value === 'system') return value;
  // A visitor who chose dark or light under the previous release keeps it.
  const legacy = read(LEGACY_THEME_KEY);
  return legacy === 'dark' || legacy === 'light' ? legacy : null;
}

export function resolveTheme(choice) {
  if (choice === 'dark' || choice === 'light') return choice;
  return lightSchemeQuery.matches ? 'light' : 'dark';
}

export function applyTheme(choice, persist = false) {
  const next = choice === 'dark' || choice === 'light' || choice === 'system' ? choice : 'system';
  const resolved = resolveTheme(next);
  root.dataset.theme = resolved;
  root.dataset.themeChoice = next;
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', BAR_COLOUR[resolved]);
  if (persist) write(THEME_KEY, next);
  document.dispatchEvent(new CustomEvent('aegis:theme', { detail: { choice: next, theme: resolved } }));
}

/* ---------- Motion: Full / Calm / Off ---------- */
const MOTION_KEY = 'aegis-motion';
export const MOTION_LEVELS = ['full', 'calm', 'off'];

export function storedMotion() {
  const value = read(MOTION_KEY);
  return MOTION_LEVELS.includes(value) ? value : null;
}

export function defaultMotion() {
  if (reducedMotionQuery.matches) return 'off';
  // Continuous decorative motion is not affordable on a small, touch-first or
  // low-core device, so those start at calm rather than full.
  if (coarseOrSmall() || lowPower) return 'calm';
  return 'full';
}

export function motionLevel() {
  return root.dataset.motion || 'full';
}

export function motionReduced() {
  return motionLevel() !== 'full';
}

export function applyMotion(level, persist = false) {
  const next = MOTION_LEVELS.includes(level) ? level : 'full';
  root.dataset.motion = next;
  root.style.scrollBehavior = next === 'off' ? 'auto' : 'smooth';
  if (persist) write(MOTION_KEY, next);
  document.dispatchEvent(new CustomEvent('aegis:motion', { detail: { motion: next } }));
}

export function scrollBehaviour() {
  return motionLevel() === 'off' ? 'auto' : 'smooth';
}

/* ---------- Preference menu ---------- */
/* A small disclosure menu with roving focus. Used for both theme and motion,
   so the two controls behave identically for keyboard and screen-reader use. */
export function initPrefMenu({ trigger, menu, onSelect, current, label }) {
  if (!trigger || !menu) return { sync: () => {} };

  const items = $$('button', menu);

  function sync() {
    const value = current();
    items.forEach((item) => {
      const active = item.dataset.value === value;
      item.setAttribute('aria-checked', String(active));
    });
    const activeItem = items.find((item) => item.dataset.value === value);
    trigger.setAttribute('aria-label', `${label}: ${activeItem ? activeItem.dataset.name : value}. Activate to change.`);
  }

  function open() {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    (items.find((item) => item.getAttribute('aria-checked') === 'true') || items[0])?.focus();
  }

  function close(restoreFocus = true) {
    if (menu.hidden) return;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  trigger.addEventListener('click', () => (menu.hidden ? open() : close()));

  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      onSelect(item.dataset.value);
      sync();
      close();
    });
    item.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        items[(index + step + items.length) % items.length].focus();
      }
    });
  });

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (menu.hidden) return;
    if (!menu.contains(event.target) && !trigger.contains(event.target)) close(false);
  });

  sync();
  return { sync, close };
}

/* ---------- Focus trap ---------- */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  const items = $$(FOCUSABLE, container).filter((item) => item.offsetParent !== null || item === document.activeElement);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
