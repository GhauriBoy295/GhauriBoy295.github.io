/* AEGIS NEXUS — the secure welcome scene.

   Two independent pieces:

   1. A data-tunnel canvas behind the panel. Budgeted like every other canvas on
      the site: DPR clamped, point count capped, a fixed ~30fps step, stopped
      when the tab is hidden, and never created below the "full" motion level or
      on a touch-first or small screen.

   2. A verification sequence that resolves the checklist line by line and fills
      a progress bar as it goes. It is a scene, not a gate — every control is
      live from the first frame, and skipping at any point completes the
      sequence immediately rather than waiting for it.

   At "calm" the checklist resolves in one step with no tunnel; at "off" it is
   already complete when the panel paints. */

import { motionLevel, coarseOrSmall, reducedMotionQuery } from './core.js?v=24.0.0';

/* ---------- Data tunnel ----------

   The camera sits inside a cylinder of rings and flies down it: the near wall
   sweeps past the frame edges, the throat recedes ahead, the field
   barrel-rolls, and the pointer banks the flight and parts the wall where it
   points.

   The vanishing point is placed in the widest free space beside the access
   panel rather than at the middle of the canvas. That is the whole trick: an
   inside-the-tube view needs its centre visible, and a centred panel would
   hide it — every ring would show only as a few stray dots in the margins.

   Projected by hand on a 2D canvas — the same technique globe.js uses — so the
   welcome gains a 3D flight without the site taking on a 3D library. Three.js
   would be ~600KB from a third-party CDN against a 175KB page that ships no
   framework and works offline; that trade is not worth one background.

   Budget: DPR clamped to 1.5, a fixed ~30fps step, rings rather than scatter
   (structure reads at a fraction of the point count), a fill-rate cap on near
   sprites, points behind the panel skipped rather than drawn, stopped when the
   tab is hidden, and never created below the "full" motion level or on a
   touch-first or small screen. */
function initTunnel(canvas, panel) {
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

  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  const STEP_MS = 33;
  const RINGS = 24;
  const PER_RING = 32;          // 768 points. Rings carry the structure, so the
                                // count can stay low; additive blits are the cost.
  const NEAR = 0.5;
  const FAR = 6.5;
  const FOCAL = 0.62;           // projection strength, in half-heights
  const SPEED = 1.5;            // depth units per second
  const ROLL = 0.10;            // barrel roll, radians per second
  const BANK = 0.07;            // how far the pointer pulls the vanishing point
  const PART = 140;             // wall-parting radius, px
  const PART_PUSH = 62;
  const MAX_SIZE = 4.6;         // fill-rate cap: near sprites dominate the cost
  const MIN_FREE = 320;         // narrower than this and the tube has nowhere to
                                // converge, so it is not drawn at all

  let width = 0, height = 0, half = 0, cx = 0, cy = 0, vpx = 0, vpy = 0, freeSpace = 0;
  let frame = 0, last = 0, t = 0, roll = 0;
  let sprites = null;
  let panelBox = null;

  const ptr = { x: 0, y: 0, tx: 0, ty: 0, active: 0, want: 0 };

  function buildSprite(colour) {
    const size = 32;
    const off = document.createElement('canvas');
    off.width = off.height = size;
    const c = off.getContext('2d');
    const grd = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, colour);
    grd.addColorStop(0.32, colour);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = grd;
    c.beginPath();
    c.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    c.fill();
    return off;
  }

  /* Depth reads as colour: deep navy far down the throat resolving to secure
     green as the wall reaches the camera. The AEGIS equivalent of the
     indigo-to-cyan ramp, with no violet anywhere. */
  function readColours() {
    const styles = getComputedStyle(document.documentElement);
    sprites = [
      buildSprite(styles.getPropertyValue('--border-strong').trim() || '#24567A'),
      buildSprite(styles.getPropertyValue('--secure-deep').trim() || '#0BA860'),
      buildSprite(styles.getPropertyValue('--secure').trim() || '#22E58B')
    ];
  }

  const rings = Array.from({ length: RINGS }, (_, i) => ({
    z: NEAR + (i / RINGS) * (FAR - NEAR),
    seed: Math.random() * Math.PI * 2
  }));

  /* The panel's own box decides where the tube goes: the vanishing point sits
     in the middle of whichever side has more room, so this adapts to the
     docked layout, a centred one, or any future arrangement without being
     told which is in play. */
  function measurePanel() {
    if (!panel) { panelBox = null; vpx = width / 2; vpy = height / 2; freeSpace = width; return; }
    const r = panel.getBoundingClientRect();
    if (r.width <= 0) { panelBox = null; vpx = width / 2; vpy = height / 2; freeSpace = width; return; }
    panelBox = { l: r.left + 10, rr: r.right - 10, t: r.top + 10, b: r.bottom - 10 };
    const rightFree = width - r.right;
    const leftFree = r.left;
    freeSpace = Math.max(rightFree, leftFree);
    vpx = rightFree >= leftFree ? r.right + rightFree / 2 : leftFree / 2;
    vpy = height / 2;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    half = height / 2;
    measurePanel();
  }

  function draw(now) {
    if (document.hidden) { frame = 0; return; }
    frame = requestAnimationFrame(draw);
    if (now - last < STEP_MS) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    t += dt;
    roll += dt * ROLL;

    ptr.x += (ptr.tx - ptr.x) * 0.06;
    ptr.y += (ptr.ty - ptr.y) * 0.06;
    ptr.active += (ptr.want - ptr.active) * 0.05;
    cx = vpx + (ptr.x - vpx) * BANK * ptr.active;
    cy = vpy + (ptr.y - vpy) * BANK * ptr.active;

    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';

    for (let ri = 0; ri < RINGS; ri += 1) {
      const ring = rings[ri];
      ring.z -= dt * SPEED;
      if (ring.z <= NEAR) { ring.z += FAR - NEAR; ring.seed = Math.random() * Math.PI * 2; }

      const z = ring.z;
      const scale = FOCAL * half / z;
      const depth = 1 - (z - NEAR) / (FAR - NEAR);
      const fade = Math.min(1, (z - NEAR) / 0.25);
      const size = Math.min(MAX_SIZE, Math.max(1, 3.0 * (1.3 / z)));
      const sprite = sprites[depth > 0.7 ? 2 : depth > 0.35 ? 1 : 0];
      context.globalAlpha = fade * (0.18 + depth * 0.82);

      // Twist grows with depth, plus the global barrel roll. The whole ring
      // shares it, which is what makes the rotation legible.
      const twist = z * 0.85 + roll + ring.seed;

      for (let i = 0; i < PER_RING; i += 1) {
        const a = (i / PER_RING) * Math.PI * 2 + twist;
        // Layered sines stand in for the noise ripple: the wall breathes
        // instead of being a clean cylinder.
        const rr = 1
          + Math.sin(a * 3 + z * 0.9 + t * 1.1 + ring.seed) * 0.09
          + Math.sin(a * 5 - z * 0.6 + t * 0.7) * 0.05;

        let sx = cx + Math.cos(a) * rr * scale;
        let sy = cy + Math.sin(a) * rr * scale;

        if (ptr.active > 0.01) {
          const dx = sx - ptr.x, dy = sy - ptr.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < PART * PART) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / PART) * PART_PUSH * ptr.active;
            sx += (dx / d) * push;
            sy += (dy / d) * push;
          }
        }

        if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) continue;
        if (panelBox && sx > panelBox.l && sx < panelBox.rr && sy > panelBox.t && sy < panelBox.b) continue;

        context.drawImage(sprite, sx - size, sy - size, size * 2, size * 2);
      }
    }

    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
  }

  readColours();
  resize();

  // The flight only reads if the tube has room to converge beside the panel.
  // Below that it degrades to stray dots in a margin, which is worse than no
  // backdrop at all — so there is no backdrop.
  if (freeSpace < MIN_FREE) {
    canvas.remove();
    return () => {};
  }

  ptr.x = ptr.tx = vpx;
  ptr.y = ptr.ty = vpy;
  frame = requestAnimationFrame(draw);

  const onResize = () => resize();
  const onMove = (e) => { ptr.tx = e.clientX; ptr.ty = e.clientY; ptr.want = 1; };
  const onLeave = () => { ptr.want = 0; };
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame) {
      last = 0;
      frame = requestAnimationFrame(draw);
    }
  };
  const onTheme = () => readColours();

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseout', onLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('aegis:theme', onTheme);

  return function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseout', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('aegis:theme', onTheme);
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

  const stopTunnel = initTunnel(panel.querySelector('#bootTunnel'), panel.querySelector('.boot-panel'));
  const sequence = initSequence(panel);

  return {
    finish: sequence.finish,
    stop() {
      sequence.finish();
      stopTunnel();
    }
  };
}
