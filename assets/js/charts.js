/* AEGIS NEXUS — documented-work mapping (R07).

   Not a chart, not telemetry, no animated fills. This rebuilds the coverage
   table from the same project records the cards, dossier and reports use, so
   the mapping can never drift from the case studies. The static table in the
   markup is the no-JS fallback; when JS runs, this regenerates an identical,
   data-derived table in its place.

   A cell reads "Mapped" only where a project's own write-up names that NIST CSF
   function. Everything else is an em dash meaning "not documented here", never
   "no ability". No framework version is asserted beyond the five core function
   labels the source work already uses. */

import { $, el } from './core.js?v=31.0.0';
import { projectData, order } from './project-data.js?v=31.0.0';

const FUNCTIONS = ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'];

export function initCoverage() {
  const mount = $('#coverageTable');
  if (!mount) return;

  const scroll = el('div', { className: 'coverage-scroll' });
  scroll.setAttribute('role', 'region');
  scroll.setAttribute('aria-label', 'Documented work mapped to NIST CSF functions');
  scroll.tabIndex = 0;

  const table = el('table', { className: 'coverage-map' });
  const caption = el('caption', { className: 'sr-only',
    text: 'Each documented case study mapped to the NIST Cybersecurity Framework function its write-up aligns to. A dash means the function is not documented in this portfolio, not a statement of ability.' });
  table.append(caption);

  const thead = el('thead');
  const hrow = el('tr');
  hrow.append(el('th', { text: 'Case study', attrs: { scope: 'col' } }));
  FUNCTIONS.forEach((fn) => hrow.append(el('th', { text: fn, attrs: { scope: 'col' } })));
  thead.append(hrow);
  table.append(thead);

  const tbody = el('tbody');
  order.forEach((id) => {
    const project = projectData[id];
    if (!project) return;
    const row = el('tr');
    const th = el('th', { attrs: { scope: 'row' } });
    const link = el('a', { text: project.title, attrs: { href: `#case-${id}` } });
    th.append(link);
    row.append(th);

    const mappedFn = project.framework?.fn || null;
    FUNCTIONS.forEach((fn) => {
      const mapped = fn === mappedFn;
      const cell = el('td', { text: mapped ? 'Mapped' : '—' });
      if (mapped) cell.classList.add('is-mapped');
      cell.setAttribute('aria-label', `${fn}: ${mapped ? 'mapped' : 'not documented'}`);
      row.append(cell);
    });
    tbody.append(row);
  });
  table.append(tbody);
  scroll.append(table);

  // Replace the static fallback with the data-derived equivalent.
  mount.replaceChildren(scroll);
}
