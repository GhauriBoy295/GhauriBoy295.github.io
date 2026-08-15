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

import { motionLevel, coarseOrSmall, reducedMotionQuery } from './core.js?v=20.0.0';

/* ---------- Data tunnel ----------

   A cylinder of points flown toward the camera, projected by hand — the same
   technique globe.js uses, so the welcome gains a 3D backdrop without the site
   taking on a 3D library. Three.js would be ~600KB from a third-party CDN
   against a 175KB page that ships no framework and works offline; that trade is
   not worth one background.

   Budget matches every other canvas here: DPR clamped to 1.5, a fixed ~30fps
   step, a hard point cap, stopped when the tab is hidden, and never created
   below the "full" motion level or on a touch-first or small screen. */
function initTunnel(canvas) {
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
  const STEP_MS = 33;
  const RINGS = 52;
  const PER_RING = 54;          // 2,808 points before culling — the cap, not a target
  const NEAR = 0.5;             // recycle depth
  const FAR = 9;                // shorter range so depth ramps fast and the wall stays lit
  const FOCAL = 0.62;           // projection strength, in half-heights
  // The panel is centred and ~820px wide, so a centred vanishing point puts the
  // throat exactly where the content sits. Pushing it into the upper-left
  // quadrant lets the walls sweep the margins diagonally instead of hiding
  // behind the card.
  const VP_X = 0.13, VP_Y = 0.42;

  let width = 0, height = 0, half = 0, cx = 0, cy = 0;
  let frame = 0, last = 0, t = 0;
  let secure = '#22E58B', structure = '#24567A';
  let sprite = null;

  // One pre-rendered soft dot, drawn per point. Cheaper than a per-point arc()
  // and it gives the additive bloom the demo got from blending.
  function buildSprite(colour) {
    const size = 32;
    const off = document.createElement('canvas');
    off.width = off.height = size;
    const c = off.getContext('2d');
    const grd = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, colour);
    grd.addColorStop(0.35, colour);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = grd;
    c.beginPath();
    c.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    c.fill();
    return off;
  }

  const rings = Array.from({ length: RINGS }, (_, i) => ({
    z: NEAR + (i / RINGS) * (FAR - NEAR),
    phase: Math.random() * Math.PI * 2,
    wobble: 0.6 + Math.random() * 0.8
  }));

  function readColours() {
    const styles = getComputedStyle(document.documentElement);
    secure = styles.getPropertyValue('--secure').trim() || '#22E58B';
    structure = styles.getPropertyValue('--border-strong').trim() || '#24567A';
    sprite = buildSprite(secure);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    half = height / 2;
    cx = width * VP_X;
    cy = height * VP_Y;
  }

  function draw(now) {
    if (document.hidden) { frame = 0; return; }
    frame = requestAnimationFrame(draw);
    if (now - last < STEP_MS) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    t += dt;

    context.clearRect(0, 0, width, height);
    // Additive, so overlapping points build the glow themselves rather than
    // needing a bloom pass.
    context.globalCompositeOperation = 'lighter';

    for (let r = 0; r < RINGS; r += 1) {
      const ring = rings[r];
      ring.z -= dt * 1.9;
      if (ring.z <= NEAR) { ring.z += FAR - NEAR; ring.phase = Math.random() * Math.PI * 2; }

      const z = ring.z;
      const scale = FOCAL * half / z;
      // Depth cues: far rings are dim navy, near rings resolve to secure green.
      const depth = 1 - (z - NEAR) / (FAR - NEAR);
      const fade = Math.min(1, depth * 2.2) * Math.min(1, (z - NEAR) / 0.25);
      if (fade <= 0.01) continue;

      // The whole ring twists with depth and time — the swirl.
      const twist = ring.phase + t * 0.22 + z * 0.28;
      const radius = 1 + Math.sin(t * 0.7 + z * 0.5) * 0.05 * ring.wobble;

      for (let i = 0; i < PER_RING; i += 1) {
        const a = (i / PER_RING) * Math.PI * 2 + twist;
        // A little per-point ripple so the wall is not a clean cylinder.
        const rr = radius + Math.sin(a * 3 + t * 1.3 + z) * 0.06;
        const sx = cx + Math.cos(a) * rr * scale;
        const sy = cy + Math.sin(a) * rr * scale;
        if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) continue;

        const size = Math.max(1.1, 3.4 * (1.4 / z));
        context.globalAlpha = fade * (0.35 + depth * 0.65);
        context.drawImage(sprite, sx - size, sy - size, size * 2, size * 2);
      }
    }

    // A faint structural rim at the throat, in navy, to seat the tunnel.
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 0.5;
    context.strokeStyle = structure;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(cx, cy, FOCAL * half / FAR, 0, Math.PI * 2);
    context.stroke();

    context.globalAlpha = 1;
  }

  readColours();
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
  const onTheme = () => readColours();

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('aegis:theme', onTheme);

  return function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener('resize', onResize);
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

  const stopTunnel = initTunnel(panel.querySelector('#bootTunnel'));
  const sequence = initSequence(panel);

  return {
    finish: sequence.finish,
    stop() {
      sequence.finish();
      stopTunnel();
    }
  };
}
