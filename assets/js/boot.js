/* AEGIS NEXUS — the secure welcome scene.

   Two independent pieces:

   1. A glyph-rain canvas behind the panel. Budgeted like every other canvas on
      the site: DPR clamped, column count capped, a fixed ~15fps step, stopped
      when the tab is hidden, and never created below the "full" motion level or
      on a touch-first or small screen.

   2. A verification sequence that resolves the checklist line by line and fills
      a progress bar as it goes. It is a scene, not a gate — every control is
      live from the first frame, and skipping at any point completes the
      sequence immediately rather than waiting for it.

   At "calm" the checklist resolves in one step with no rain; at "off" it is
   already complete when the panel paints. */

import { motionLevel, coarseOrSmall, reducedMotionQuery } from './core.js?v=18.0.0';

const GLYPHS = '01<>[]{}/\\|=+*#$%&ABCDEFHKLMNPRSTVXZ';

/* ---------- Glyph rain ---------- */
function initRain(canvas) {
  if (!canvas) return () => {};
  if (motionLevel() !== 'full' || coarseOrSmall() || reducedMotionQuery.matches) {
    canvas.remove();
    return () => {};
  }

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    canvas.remove();
    return () => {};
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const STEP_MS = 66;
  const FONT_SIZE = 15;
  const MAX_COLUMNS = 90;

  let width = 0;
  let height = 0;
  let columns = [];
  let frame = 0;
  let last = 0;
  let colour = '#22E58B';

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.font = `${FONT_SIZE}px ui-monospace, monospace`;
    context.textBaseline = 'top';

    const count = Math.min(MAX_COLUMNS, Math.floor(width / FONT_SIZE));
    // Seeded across the full height, not above it: the welcome lasts a few
    // seconds, so a field that takes that long to fall into view would never
    // actually be seen.
    columns = Array.from({ length: count }, () => ({
      y: Math.random() * height,
      speed: 0.7 + Math.random() * 1.6,
      length: 6 + Math.floor(Math.random() * 14)
    }));

    colour = getComputedStyle(document.documentElement).getPropertyValue('--secure').trim() || '#22E58B';
  }

  function draw(now) {
    if (document.hidden) { frame = 0; return; }
    frame = requestAnimationFrame(draw);
    if (now - last < STEP_MS) return;
    last = now;

    context.clearRect(0, 0, width, height);

    columns.forEach((column, index) => {
      const x = index * FONT_SIZE;
      for (let i = 0; i < column.length; i += 1) {
        const y = column.y - i * FONT_SIZE;
        if (y < -FONT_SIZE || y > height) continue;
        // The leading glyph is brightest; the tail fades out behind it.
        const alpha = i === 0 ? 0.85 : Math.max(0, 0.4 * (1 - i / column.length));
        context.globalAlpha = alpha;
        context.fillStyle = colour;
        context.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x, y);
      }
      column.y += column.speed * FONT_SIZE * 0.55;
      if (column.y - column.length * FONT_SIZE > height) {
        column.y = -Math.random() * FONT_SIZE * 8;
        column.speed = 0.7 + Math.random() * 1.6;
      }
    });

    context.globalAlpha = 1;
  }

  resize();
  frame = requestAnimationFrame(draw);

  const onResize = () => resize();
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame) {
      last = 0;
      frame = requestAnimationFrame(draw);
    }
  };

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  return function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

/* ---------- Verification sequence ---------- */
function initSequence(panel) {
  const items = Array.from(panel.querySelectorAll('.boot-checks li'));
  const progress = panel.querySelector('#bootProgress');
  const percent = panel.querySelector('#bootPercent');
  const state = panel.querySelector('#bootState');
  if (!items.length) return { finish: () => {}, stop: () => {} };

  const timers = [];
  let settled = false;

  function paint(count) {
    items.forEach((item, index) => item.classList.toggle('is-done', index < count));
    const ratio = count / items.length;
    if (progress) progress.style.setProperty('--fill', `${(ratio * 100).toFixed(0)}%`);
    if (percent) percent.textContent = `${Math.round(ratio * 100)}%`;
    if (state) {
      state.textContent = count >= items.length ? 'Ready' : 'Verifying';
      state.classList.toggle('is-ready', count >= items.length);
    }
  }

  /* The finished state is a fact about the panel, so it must not depend on the
     animation completing. finish() is idempotent and is called by the skip
     controls, by the motion setting, and by a safety timer. */
  function finish() {
    if (settled) return;
    settled = true;
    timers.forEach(window.clearTimeout);
    timers.length = 0;
    paint(items.length);
  }

  if (motionLevel() !== 'full') {
    finish();
    return { finish, stop: finish };
  }

  paint(0);
  items.forEach((_, index) => {
    timers.push(window.setTimeout(() => {
      if (settled) return;
      paint(index + 1);
      if (index === items.length - 1) settled = true;
    }, 420 + index * 460));
  });

  // Whatever happens to the timers, the sequence is complete well before the
  // welcome auto-clears.
  timers.push(window.setTimeout(finish, 420 + items.length * 460 + 600));

  return { finish, stop: finish };
}

export function initBoot() {
  const panel = document.querySelector('#boot');
  if (!panel) return { finish: () => {}, stop: () => {} };

  const stopRain = initRain(panel.querySelector('#bootRain'));
  const sequence = initSequence(panel);

  return {
    finish: sequence.finish,
    stop() {
      sequence.finish();
      stopRain();
    }
  };
}
