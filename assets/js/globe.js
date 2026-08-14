/* AEGIS NEXUS — cyber globe.

   An original canvas rendering: a dot-matrix sphere with a light graticule,
   regional network nodes and routed links. The dots are an even grid over the
   whole sphere — they are a digital-globe motif, not a map of coastlines, and
   nothing about them encodes real geography beyond the node positions.

   It illustrates one truthful fact and nothing more: the base is the United
   Kingdom and the opportunity availability is worldwide. There are no
   counters, no traffic figures and no live telemetry.

   Budget: one canvas, one rAF loop, ~24fps, DPR clamped to 1.5, suspended
   when the tab is hidden or the hero scrolls away, and never started at all
   on motion levels below "full". At "calm" a single static frame is painted,
   which costs one paint and no loop. */

import { motionLevel, root } from './core.js?v=17.0.0';

const NODES = [
  { name: 'United Kingdom', lat: 52.5, lon: -1.5, base: true },
  { name: 'Ireland', lat: 53.3, lon: -6.3 },
  { name: 'Northern Europe', lat: 59.3, lon: 18.1 },
  { name: 'Central Europe', lat: 52.5, lon: 13.4 },
  { name: 'Southern Europe', lat: 40.4, lon: -3.7 },
  { name: 'North America East', lat: 40.7, lon: -74.0 },
  { name: 'North America West', lat: 47.6, lon: -122.3 },
  { name: 'Canada', lat: 43.7, lon: -79.4 },
  { name: 'South America', lat: -23.5, lon: -46.6 },
  { name: 'Middle East', lat: 25.2, lon: 55.3 },
  { name: 'South Asia', lat: 33.7, lon: 73.0 },
  { name: 'East Asia', lat: 35.7, lon: 139.7 },
  { name: 'South East Asia', lat: 1.35, lon: 103.8 },
  { name: 'Africa', lat: -1.3, lon: 36.8 },
  { name: 'Oceania', lat: -33.9, lon: 151.2 }
];

const RAD = Math.PI / 180;

function vector(lat, lon) {
  const phi = lat * RAD;
  const theta = lon * RAD;
  return {
    x: Math.cos(phi) * Math.cos(theta),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.sin(theta)
  };
}

/* Spherical interpolation, so a route follows the surface rather than cutting
   through the sphere. */
function slerp(a, b, t) {
  let dot = a.x * b.x + a.y * b.y + a.z * b.z;
  dot = Math.min(1, Math.max(-1, dot));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const s = Math.sin(omega);
  const w1 = Math.sin((1 - t) * omega) / s;
  const w2 = Math.sin(t * omega) / s;
  return { x: a.x * w1 + b.x * w2, y: a.y * w1 + b.y * w2, z: a.z * w1 + b.z * w2 };
}

export function initGlobe(frame) {
  if (!frame) return;
  const canvas = frame.querySelector('canvas');
  if (!canvas) return;

  const level = motionLevel();
  if (level === 'off') {
    canvas.remove();
    return;
  }

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    canvas.remove();
    return;
  }

  frame.classList.add('has-canvas');

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const STEP_MS = 42;
  const base = NODES.find((node) => node.base) || NODES[0];
  const baseVector = vector(base.lat, base.lon);

  let size = 0;
  let radius = 0;
  let spin = 0;
  let frameId = 0;
  let last = 0;
  let onScreen = true;
  let colours = { secure: '#22E58B', line: '#1B405A', text: '#91A6B7' };
  /* Forensic Daylight needs more ink: the same alphas that read as a restrained
     glow on near-black disappear against white. */
  let alpha = { graticule: 0.28, parallel: 0.24, route: 0.5, limb: 0.4, dotMin: 0.16, dotRange: 0.5 };

  function readColours() {
    const styles = getComputedStyle(root);
    const pick = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
    colours = {
      secure: pick('--secure', '#22E58B'),
      line: pick('--border-strong', '#1B405A'),
      text: pick('--text-3', '#91A6B7')
    };
    alpha = root.dataset.theme === 'light'
      ? { graticule: 0.5, parallel: 0.45, route: 0.6, limb: 0.7, dotMin: 0.22, dotRange: 0.55 }
      : { graticule: 0.28, parallel: 0.24, route: 0.5, limb: 0.4, dotMin: 0.16, dotRange: 0.5 };
  }

  function resize() {
    const rect = frame.getBoundingClientRect();
    size = Math.max(120, Math.min(rect.width, rect.height));
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = size * 0.42;
  }

  function project(v) {
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);
    const x = v.x * cos - v.z * sin;
    const z = v.x * sin + v.z * cos;
    return {
      sx: size / 2 + x * radius,
      sy: size / 2 - v.y * radius,
      depth: z
    };
  }

  function strokeArcPath(points, colour, opacity, width) {
    context.beginPath();
    let drawing = false;
    for (const point of points) {
      if (point.depth <= 0.02) {
        drawing = false;
        continue;
      }
      if (!drawing) {
        context.moveTo(point.sx, point.sy);
        drawing = true;
      } else {
        context.lineTo(point.sx, point.sy);
      }
    }
    context.globalAlpha = opacity;
    context.strokeStyle = colour;
    context.lineWidth = width;
    context.stroke();
    context.globalAlpha = 1;
  }

  /* The surface is a dot matrix rather than a wireframe. Longitude spacing is
     divided by cos(latitude) so the dots stay evenly spaced on the sphere
     instead of bunching at the poles, and each dot fades with its depth so the
     far hemisphere reads as distance rather than clutter. */
  const DOT_STEP = 4;

  function drawSurface() {
    const dotRadius = Math.max(0.7, size / 380);
    context.fillStyle = colours.secure;

    for (let lat = -84; lat <= 84; lat += DOT_STEP) {
      const cos = Math.cos(lat * RAD);
      if (cos < 0.05) continue;
      const step = DOT_STEP / cos;
      for (let lon = -180; lon < 180; lon += step) {
        const point = project(vector(lat, lon));
        if (point.depth <= 0.02) continue;
        context.globalAlpha = alpha.dotMin + point.depth * alpha.dotRange;
        context.beginPath();
        context.arc(point.sx, point.sy, dotRadius, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.globalAlpha = 1;
  }

  /* A few meridians and parallels sit under the dots: they are what makes the
     shape read as a globe rather than a cloud of points. */
  function drawGraticule() {
    for (let lon = -180; lon < 180; lon += 30) {
      const points = [];
      for (let lat = -90; lat <= 90; lat += 6) points.push(project(vector(lat, lon)));
      strokeArcPath(points, colours.line, alpha.graticule, 1);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 6) points.push(project(vector(lat, lon)));
      strokeArcPath(points, colours.line, alpha.parallel, 1);
    }
  }

  function drawRoutes(time) {
    for (let i = 1; i < NODES.length; i += 1) {
      const target = vector(NODES[i].lat, NODES[i].lon);
      const points = [];
      for (let t = 0; t <= 1.0001; t += 1 / 24) points.push(project(slerp(baseVector, target, t)));
      strokeArcPath(points, colours.secure, alpha.route, 1);

      // One travelling marker per route, phase-offset so they never pulse in
      // unison. Position only — no glow, no shadow blur.
      const phase = ((time / 3600) + i / NODES.length) % 1;
      const marker = project(slerp(baseVector, target, phase));
      if (marker.depth > 0.02) {
        context.beginPath();
        context.globalAlpha = 0.85;
        context.fillStyle = colours.secure;
        context.arc(marker.sx, marker.sy, 2.2, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      }
    }
  }

  function drawNodes() {
    NODES.forEach((node) => {
      const point = project(vector(node.lat, node.lon));
      if (point.depth <= 0.02) return;
      const fade = Math.min(1, 0.5 + point.depth);
      context.beginPath();
      context.globalAlpha = fade;
      context.fillStyle = node.base ? colours.secure : colours.text;
      context.arc(point.sx, point.sy, node.base ? 5 : 2.6, 0, Math.PI * 2);
      context.fill();

      if (node.base) {
        context.beginPath();
        context.globalAlpha = 0.5;
        context.strokeStyle = colours.secure;
        context.lineWidth = 1;
        context.arc(point.sx, point.sy, 9, 0, Math.PI * 2);
        context.stroke();
      }
      context.globalAlpha = 1;
    });
  }

  function render(time) {
    context.clearRect(0, 0, size, size);

    context.beginPath();
    context.globalAlpha = alpha.limb;
    context.strokeStyle = colours.line;
    context.lineWidth = 1;
    context.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 1;

    drawGraticule();
    drawSurface();
    drawRoutes(time);
    drawNodes();
  }

  function loop(now) {
    if (document.hidden || !onScreen) {
      frameId = 0;
      return;
    }
    frameId = requestAnimationFrame(loop);
    if (now - last < STEP_MS) return;
    const delta = last ? now - last : STEP_MS;
    last = now;
    spin += delta * 0.00006;
    render(now);
  }

  function start() {
    if (frameId || motionLevel() !== 'full') return;
    last = 0;
    frameId = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  readColours();
  resize();
  render(0);

  if (level === 'full') start();

  const resizeObserver = new ResizeObserver(() => {
    resize();
    render(performance.now());
  });
  resizeObserver.observe(frame);

  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      if (onScreen) start(); else stop();
    }, { rootMargin: '80px' });
    visibility.observe(frame);
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  document.addEventListener('aegis:theme', () => {
    readColours();
    render(performance.now());
  });
  document.addEventListener('aegis:motion', () => {
    if (motionLevel() === 'full') {
      start();
    } else {
      stop();
      readColours();
      render(performance.now());
    }
  });
  window.addEventListener('pagehide', stop, { once: true });
}
