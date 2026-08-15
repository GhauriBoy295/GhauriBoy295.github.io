/* AEGIS NEXUS — Neo-Forensics case-study report.

   One <dialog> is reused for every mission. The rail is a tablist over the
   mission's panels plus an evidence timeline; the aside carries the
   classification, framework alignment, technology and artefact list.

   The open report is mirrored into the URL hash so it can be linked,
   bookmarked and restored on load. History is replaced rather than pushed, so
   Back never has to walk through every report the visitor opened. */

import { $, el, svgIcon, showToast, copyText, motionLevel } from './core.js?v=21.0.0';
import { projectData, order } from './project-data.js?v=21.0.0';

const HASH_PREFIX = '#case-';

const CLASS_LABEL = {
  research: 'Research',
  defence: 'Blue Team · Defensive',
  offensive: 'Red Cell · Offensive',
  development: 'Development'
};

let dialog;
let currentId = null;
let lastTrigger = null;
let activePanel = 'overview';

export function hashForProject(id) {
  return `${HASH_PREFIX}${id}`;
}

export function projectFromHash() {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const id = hash.slice(HASH_PREFIX.length);
  return projectData[id] ? id : null;
}

function clearHash() {
  if (!window.location.hash.startsWith(HASH_PREFIX)) return;
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

function sections(project) {
  return [
    ...project.panels,
    { id: 'evidence', label: 'Evidence timeline', timeline: true }
  ];
}

function buildPanel(project, section) {
  const panel = el('div', { className: 'report-panel' });
  panel.id = `report-panel-${section.id}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', `report-tab-${section.id}`);
  panel.tabIndex = 0;

  if (section.timeline) {
    panel.append(el('h3', { text: 'Work sequence' }));
    panel.append(el('p', {
      text: 'The order in which the work was carried out. Each step describes process, not a measured result.'
    }));
    const list = el('ol', { className: 'evidence-timeline' });
    project.timeline.forEach((entry) => {
      const item = el('li');
      item.append(
        el('b', { text: entry.stamp }),
        el('strong', { text: entry.title }),
        el('p', { text: entry.body })
      );
      list.append(item);
    });
    panel.append(list);
    return panel;
  }

  panel.append(el('h3', { text: section.title }));
  panel.append(el('p', { text: section.body }));

  if (Array.isArray(section.list) && section.list.length) {
    const list = el('ul');
    section.list.forEach((item) => list.append(el('li', { text: item })));
    panel.append(list);
  }

  if (section.id === 'overview') {
    panel.append(el('p', { className: 'report-summary', text: project.summary }));
  }

  return panel;
}

function selectPanel(id) {
  activePanel = id;
  const rail = $('#reportRail');
  const main = $('#reportMain');
  if (!rail || !main) return;

  Array.from(rail.children).forEach((tab) => {
    const active = tab.dataset.panel === id;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  // Only the panels toggle; the banner above them stays for every section.
  main.querySelectorAll('.report-panel').forEach((panel) => {
    panel.hidden = panel.id !== `report-panel-${id}`;
  });

  main.scrollTop = 0;
}

/* The report opens on the same artwork the card showed, so moving from card to
   report is continuous. The SVG is cloned from the card rather than duplicated
   in the data, which keeps one source for each illustration.

   The banner element is held here because render() replaces the whole of
   #reportMain; it is put back at the top of the fresh panel list. */
function buildBanner(id) {
  const card = document.querySelector(`[data-open-mission="${id}"]`)?.closest('.mission');
  const artwork = card?.querySelector('.mission-art svg');
  if (!artwork) return null;

  const banner = el('div', { className: 'report-banner' });
  const copy = artwork.cloneNode(true);
  // The card artwork is already labelled; inside the report it sits beside a
  // full written account, so it is decoration and hidden from assistive tech.
  copy.removeAttribute('role');
  copy.removeAttribute('aria-label');
  copy.setAttribute('aria-hidden', 'true');
  copy.querySelector('.art-scan')?.remove();
  banner.append(copy);
  return banner;
}

function render(project) {
  $('#reportKicker').textContent = project.kicker;
  $('#reportTitle').textContent = project.title;
  $('#reportMeta').textContent = project.meta;

  const classSlot = $('#reportClass');
  classSlot.replaceChildren();
  const badge = el('span', {
    className: `badge ${project.side === 'red' ? 'badge-incident' : 'badge-secure'} badge-dot`,
    text: CLASS_LABEL[project.classification] || project.classification
  });
  classSlot.append(badge);

  const frameworkSlot = $('#reportFrameworkBlock');
  if (project.framework) {
    frameworkSlot.hidden = false;
    $('#reportFramework').replaceChildren(
      el('strong', { text: `NIST CSF · ${project.framework.fn}` }),
      el('p', { text: project.framework.note })
    );
  } else {
    frameworkSlot.hidden = true;
    $('#reportFramework').replaceChildren();
  }

  $('#reportStack').replaceChildren(...project.stack.map((item) => el('span', { text: item })));

  $('#reportArtefacts').replaceChildren(...project.artefacts.map((artefact) => {
    const item = el('li');
    item.append(el('b', { text: artefact.label }), el('span', { text: artefact.value }));
    return item;
  }));

  const list = sections(project);
  const rail = $('#reportRail');
  const main = $('#reportMain');

  rail.replaceChildren(...list.map((section) => {
    const tab = el('button', { text: section.label });
    tab.type = 'button';
    tab.id = `report-tab-${section.id}`;
    tab.dataset.panel = section.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `report-panel-${section.id}`);
    tab.addEventListener('click', () => selectPanel(section.id));
    return tab;
  }));

  const banner = buildBanner(currentId);
  const panels = list.map((section) => buildPanel(project, section));
  main.replaceChildren(...(banner ? [banner, ...panels] : panels));

  selectPanel(list[0].id);

  const index = order.indexOf(currentId);
  const prev = $('#reportPrev');
  const next = $('#reportNext');
  prev.disabled = index <= 0;
  next.disabled = index < 0 || index >= order.length - 1;
}

export function openReport(id, trigger) {
  const project = projectData[id];
  if (!project || !dialog) return;
  lastTrigger = trigger || lastTrigger;
  currentId = id;
  render(project);
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  history.replaceState(null, '', hashForProject(id));
}

function step(delta) {
  const index = order.indexOf(currentId);
  const nextId = order[index + delta];
  if (nextId) openReport(nextId, lastTrigger);
}

export function initReport() {
  dialog = $('#report');
  if (!dialog) return;

  $('#reportClose')?.addEventListener('click', () => dialog.close());
  $('#reportPrev')?.addEventListener('click', () => step(-1));
  $('#reportNext')?.addEventListener('click', () => step(1));

  dialog.addEventListener('click', (event) => {
    // Only a click on the backdrop itself closes; the shell fills the dialog.
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    currentId = null;
    clearHash();
    lastTrigger?.focus?.();
  });

  // Arrow-key movement along the rail, as expected of a tablist.
  $('#reportRail')?.addEventListener('keydown', (event) => {
    const keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const tabs = Array.from(event.currentTarget.children);
    const index = tabs.findIndex((tab) => tab.dataset.panel === activePanel);
    let nextIndex = index;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else nextIndex = (index - 1 + tabs.length) % tabs.length;
    event.preventDefault();
    selectPanel(tabs[nextIndex].dataset.panel);
    tabs[nextIndex].focus();
  });

  $('#reportCopy')?.addEventListener('click', async () => {
    if (!currentId) return;
    const url = `${window.location.origin}${window.location.pathname}${hashForProject(currentId)}`;
    showToast(await copyText(url) ? 'Case-study link copied' : 'Copy failed — the link is in the address bar');
  });

  const shareButton = $('#reportShare');
  if (shareButton) {
    if (typeof navigator.share === 'function') {
      shareButton.hidden = false;
      shareButton.addEventListener('click', async () => {
        if (!currentId) return;
        const project = projectData[currentId];
        try {
          await navigator.share({
            title: `${project.title} — Sarmad Saeed`,
            text: project.summary,
            url: `${window.location.origin}${window.location.pathname}${hashForProject(currentId)}`
          });
        } catch { /* dismissing the share sheet is not an error */ }
      });
    }
  }

  $('#reportPrint')?.addEventListener('click', () => {
    document.body.classList.add('printing-case');
    const cleanup = () => {
      document.body.classList.remove('printing-case');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  });

  document.querySelectorAll('[data-open-mission]').forEach((button) => {
    button.addEventListener('click', () => openReport(button.dataset.openMission, button));
  });

  // Report icons are built once here rather than repeated in markup.
  $('#reportClose')?.append(svgIcon('icon-close'));

  if (motionLevel() === 'off') dialog.classList.add('no-scene');
}
