/* AEGIS NEXUS — portfolio coverage charts.

   Two original SVG charts, both derived from projectData at runtime rather
   than from numbers typed into the markup. That is the whole point: the charts
   count what the portfolio actually documents, so they cannot drift away from
   the case studies as those change, and nothing here is a measurement of
   anything outside this page.

   They are not telemetry. There is no live data, no traffic, no SOC metric and
   no outcome claim — a bar of height 2 means two case studies on this page are
   classified that way, and the captions say so.

   Budget: drawn once, animated by CSS on reveal, no loop, no canvas. At Calm
   and Off the final state is painted immediately. */

import { $, el, root, motionReduced } from './core.js?v=30.0.0';
import { projectData, order } from './project-data.js?v=30.0.0';

const SVG_NS = 'http://www.w3.org/2000/svg';

/* NIST CSF, in the order the framework states them. Recover is listed even
   though it holds nothing: an absent function is information, and silently
   dropping the axis would overstate the coverage. */
const CSF_FUNCTIONS = ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'];

const CLASS_META = {
  defence: { label: 'Blue Team · Defensive', tone: 'secure' },
  research: { label: 'Research', tone: 'cyan' },
  offensive: { label: 'Red Cell · Offensive', tone: 'incident' },
  development: { label: 'Development', tone: 'violet' }
};

function svg(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

/* ---------- Counts ---------- */
function countByFramework() {
  const counts = Object.fromEntries(CSF_FUNCTIONS.map((fn) => [fn, 0]));
  order.forEach((id) => {
    const fn = projectData[id]?.framework?.fn;
    if (fn && fn in counts) counts[fn] += 1;
  });
  return counts;
}

function countByClassification() {
  const counts = new Map();
  order.forEach((id) => {
    const key = projectData[id]?.classification;
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  // Largest first, so the chart reads as a ranking rather than an arbitrary
  // object order.
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
}

/* ---------- Radar ----------
   A five-axis polar plot. The outer ring is the highest count on the chart
   with a minimum of 1, so a portfolio where every function holds one case
   study still draws a full pentagon instead of a dot. */
function buildRadar(mount, counts) {
  const size = 320;
  const centre = size / 2;
  const radius = 108;
  const values = CSF_FUNCTIONS.map((fn) => counts[fn]);
  const max = Math.max(1, ...values);

  const chart = svg('svg', {
    viewBox: `0 0 ${size} ${size}`,
    role: 'img',
    'aria-labelledby': 'csfRadarTitle csfRadarDesc'
  });
  chart.classList.add('coverage-radar');

  const title = svg('title', { id: 'csfRadarTitle' });
  title.textContent = 'NIST CSF coverage of the documented case studies';
  const desc = svg('desc', { id: 'csfRadarDesc' });
  desc.textContent = `${CSF_FUNCTIONS
    .map((fn) => `${fn}: ${counts[fn]} ${counts[fn] === 1 ? 'case study' : 'case studies'}`)
    .join('. ')}.`;
  chart.append(title, desc);

  const point = (index, scale) => {
    // Start at twelve o'clock and run clockwise, which is how the framework is
    // usually drawn.
    const angle = (Math.PI * 2 * index) / CSF_FUNCTIONS.length - Math.PI / 2;
    return [
      centre + Math.cos(angle) * radius * scale,
      centre + Math.sin(angle) * radius * scale
    ];
  };

  // Web rings.
  const rings = svg('g', { class: 'radar-rings', fill: 'none' });
  [0.25, 0.5, 0.75, 1].forEach((scale) => {
    const points = CSF_FUNCTIONS.map((_, index) => point(index, scale).join(',')).join(' ');
    rings.append(svg('polygon', { points }));
  });
  chart.append(rings);

  // Spokes.
  const spokes = svg('g', { class: 'radar-spokes' });
  CSF_FUNCTIONS.forEach((_, index) => {
    const [x, y] = point(index, 1);
    spokes.append(svg('line', { x1: centre, y1: centre, x2: x, y2: y }));
  });
  chart.append(spokes);

  // The plotted area.
  const area = CSF_FUNCTIONS
    .map((_, index) => point(index, values[index] / max).join(','))
    .join(' ');
  chart.append(svg('polygon', { class: 'radar-area', points: area }));

  // Vertex markers. An empty function is drawn hollow at the centre, so the
  // gap is visible rather than implied.
  const dots = svg('g', { class: 'radar-dots' });
  CSF_FUNCTIONS.forEach((fn, index) => {
    const [x, y] = point(index, values[index] / max);
    const dot = svg('circle', { cx: x, cy: y, r: values[index] ? 4.5 : 3 });
    if (!values[index]) dot.classList.add('is-empty');
    dots.append(dot);
  });
  chart.append(dots);

  // Axis labels, nudged outside the web.
  const labels = svg('g', { class: 'radar-labels' });
  CSF_FUNCTIONS.forEach((fn, index) => {
    const [x, y] = point(index, 1.28);
    const text = svg('text', {
      x,
      y,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle'
    });
    if (!counts[fn]) text.classList.add('is-empty');
    text.textContent = fn;
    labels.append(text);

    const value = svg('text', {
      x,
      y: y + 14,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      class: 'radar-value'
    });
    value.textContent = counts[fn] || '—';
    labels.append(value);
  });
  chart.append(labels);

  mount.append(chart);
}

/* ---------- Classification bars ----------
   Horizontal bars with the count as the label. Widths are set as a custom
   property and grown by CSS on reveal, matching how the skill bars behave. */
function buildBars(mount, entries) {
  const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;
  const list = el('ul', { className: 'coverage-bars' });
  list.setAttribute('aria-label', 'Documented case studies by classification');

  entries.forEach(([key, count]) => {
    const meta = CLASS_META[key] || { label: key, tone: 'secure' };
    const item = el('li');
    item.dataset.tone = meta.tone;

    const head = el('div', { className: 'coverage-bar-head' });
    head.append(
      el('span', { className: 'coverage-bar-name', text: meta.label }),
      el('b', { className: 'coverage-bar-count', text: String(count) })
    );

    const track = el('div', { className: 'coverage-bar-track' });
    const fill = el('span');
    fill.style.setProperty('--fill', `${Math.round((count / total) * 100)}%`);
    track.append(fill);

    item.append(head, track);
    list.append(item);
  });

  mount.append(list);
}

export function initCharts() {
  const section = $('#coverage');
  if (!section) return;

  const radarMount = $('#coverageRadar');
  const barsMount = $('#coverageBars');
  const totalSlot = $('#coverageTotal');

  const csf = countByFramework();
  const classes = countByClassification();

  if (radarMount) buildRadar(radarMount, csf);
  if (barsMount) buildBars(barsMount, classes);

  if (totalSlot) {
    const total = classes.reduce((sum, [, count]) => sum + count, 0);
    totalSlot.textContent = String(total);
    totalSlot.dataset.count = String(total);
  }

  // At reduced motion the charts are simply present; the reveal class is what
  // CSS keys the growth animations off, so it is added immediately.
  if (motionReduced() || !('IntersectionObserver' in window)) {
    section.classList.add('is-charted');
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-charted');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
  observer.observe(section);

  // Dropping to Off mid-session must leave the charts drawn, not mid-grow.
  document.addEventListener('aegis:motion', () => {
    if (motionReduced()) section.classList.add('is-charted');
  });

  // The radar strokes read from computed tokens via CSS, so a theme change
  // needs nothing here — this is only a guard for the root reference staying
  // live in the module graph.
  void root;
}
