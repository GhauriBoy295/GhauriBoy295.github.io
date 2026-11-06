/* AEGIS NEXUS — application orchestrator.

   Composition, in order: preferences, the shell (header, compact menu,
   scroll state), the reveal system, project filters, the command surface,
   and finally the progressive extras (coverage table, case-link focus,
   service worker, install).

   Every module degrades to visible, usable content if it never runs: the
   markup ships complete and script only ever hides or enhances. */

import {
  $, $$, el, root, svgIcon, showToast, copyText,
  applyTheme, storedTheme, resolveTheme, lightSchemeQuery,
  applyMotion, storedMotion, defaultMotion, motionLevel, motionReduced, MOTION_LEVELS,
  initPrefMenu, scrollBehaviour, reducedMotionQuery
} from './core.js?v=31.0.0';
import { projectData } from './project-data.js?v=31.0.0';
import { initCoverage } from './charts.js?v=31.0.0';

root.classList.remove('no-js');
root.classList.add('js');

const body = document.body;

const state = {
  commandSelection: 0,
  filteredCommands: [],
  awaitingJump: false,
  bootTimer: 0
};

/* ================= Preferences ================= */
applyTheme(storedTheme() || 'system');
/* The operating system's reduced-motion setting outranks a saved choice: a
   stored "full" from an earlier visit must never override it on load. An
   explicit choice made in this session still applies until the next load. */
const resolvedMotion = () => (reducedMotionQuery.matches ? 'off' : (storedMotion() || defaultMotion()));
applyMotion(resolvedMotion());

const themeMenu = initPrefMenu({
  trigger: $('#themeTrigger'),
  menu: $('#themeMenu'),
  label: 'Theme',
  current: () => root.dataset.themeChoice || 'system',
  onSelect: (value) => {
    applyTheme(value, true);
    showToast(value === 'system'
      ? `Theme: system (${resolveTheme('system') === 'light' ? 'Forensic Daylight' : 'BlackICE Night'})`
      : `Theme: ${value === 'light' ? 'Forensic Daylight' : 'BlackICE Night'}`);
  }
});

const motionMenu = initPrefMenu({
  trigger: $('#motionTrigger'),
  menu: $('#motionMenu'),
  label: 'Motion',
  current: () => motionLevel(),
  onSelect: (value) => {
    applyMotion(value, true);
    revealAll(value === 'off');
    showToast(`Motion: ${value}`);
  }
});

// While the visitor is on "system", the page keeps following the OS.
const onScheme = () => {
  if ((root.dataset.themeChoice || 'system') !== 'system') return;
  applyTheme('system');
};
lightSchemeQuery.addEventListener?.('change', onScheme);

// An OS reduced-motion change takes effect immediately, saved choice or not.
reducedMotionQuery.addEventListener?.('change', () => {
  applyMotion(resolvedMotion());
  motionMenu.sync();
  revealAll();
});

/* The secure-welcome overlay was removed in v31 (R01). The site loads
   directly into the portfolio; there is no gate, inert shell or timer. */

/* ================= Header and navigation ================= */
const header = $('#siteHeader');
const navMenu = $('#navMenu');
const navMenuToggle = navMenu?.querySelector('summary');

/* The compact menu is a native <details>: it opens, closes and stays keyboard
   operable with no script at all. Everything below is enhancement — Escape,
   closing on outside click or after choosing a destination, and closing when
   the viewport widens back to the inline nav. None of it traps focus. */
function closeMenu({ restoreFocus = false } = {}) {
  if (!navMenu?.open) return;
  navMenu.open = false;
  if (restoreFocus) navMenuToggle?.focus();
}

$$('a', navMenu).forEach((link) => link.addEventListener('click', () => closeMenu()));

navMenu?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navMenu.open) {
    event.preventDefault();
    closeMenu({ restoreFocus: true });
  }
});

document.addEventListener('pointerdown', (event) => {
  if (navMenu?.open && !navMenu.contains(event.target)) closeMenu();
});

window.addEventListener('resize', () => {
  if (navMenu && getComputedStyle(navMenu).display === 'none') closeMenu();
}, { passive: true });

/* ---------- Scroll state ---------- */
const scrollProgress = $('#scrollProgress');
const backToTop = $('#backToTop');
let scrollTicking = false;

function updateScroll() {
  const y = window.scrollY;
  header?.classList.toggle('is-scrolled', y > 12);
  backToTop?.classList.toggle('is-visible', y > 700);
  if (scrollProgress) {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = range > 0 ? Math.min(1, Math.max(0, y / range)) : 0;
    scrollProgress.style.transform = `scaleX(${ratio})`;
  }
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScroll);
}, { passive: true });
updateScroll();

backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehaviour() }));

/* ---------- Active section ---------- */
const navLinks = $$('#primaryNav a, #navMenu nav a:not(.nav-menu-cv)');
const navTargets = navLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window && navTargets.length) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.01, 0.2, 0.5] });
  navTargets.forEach((section) => observer.observe(section));
}

/* ================= Reveal choreography ================= */
const revealItems = $$('.reveal');
const staggerGroups = $$('.stagger');

revealItems.forEach((item) => {
  const delay = Number(item.dataset.delay || 0);
  item.style.setProperty('--reveal-delay', String(Number.isFinite(delay) ? delay : 0));
});

function revealAll() {
  revealItems.forEach((item) => item.classList.add('is-visible'));
  staggerGroups.forEach((group) => group.classList.add('is-visible'));
}

if (!('IntersectionObserver' in window)) {
  revealAll();
} else {
  // One observer, one direction, one class. Elements resolve once and stay
  // resolved — nothing re-hides content the visitor has already read.
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

  revealItems.forEach((item) => revealObserver.observe(item));
  staggerGroups.forEach((group) => revealObserver.observe(group));

  // Failsafe (R09): reveal content is a progressive enhancement and must never
  // leave text stuck invisible. If the observer has not fired for an element
  // shortly after load, on a restored page, or when a tab that loaded while
  // hidden becomes visible (both of which throttle the observer and timers),
  // reveal everything so no essential content stays hidden or dim.
  window.setTimeout(revealAll, 1200);
  window.addEventListener('pageshow', revealAll);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) revealAll(); });
}

/* ---------- Idle offscreen sections ---------- */
if ('IntersectionObserver' in window) {
  const idleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-idle', !entry.isIntersecting));
  }, { rootMargin: '140px 0px' });
  $$('[data-ambient]').forEach((section) => idleObserver.observe(section));
}

/* The Red Cell / Blue Team block is now static paired stages plus two columns
   (R08) — no emphasis switch, so it needs no JavaScript at all. */

/* ================= Mission filters ================= */
function initFilters() {
  const grid = $('#missions');
  if (!grid) return;
  const buttons = $$('.filter-btn');
  const cards = $$('.mission:not([data-placeholder])', grid);
  const placeholder = $('.mission[data-placeholder]', grid);
  const status = $('#filterStatus');
  const empty = $('#missionsEmpty');

  function apply(filter, label) {
    let shown = 0;
    cards.forEach((card) => {
      const categories = (card.dataset.categories || '').split(/\s+/);
      const visible = filter === 'all' || categories.includes(filter);
      card.hidden = !visible;
      if (visible) shown += 1;
    });

    // The placeholder belongs to the unfiltered view only.
    if (placeholder) placeholder.hidden = filter !== 'all';
    if (empty) empty.hidden = shown > 0;
    if (status) {
      status.textContent = filter === 'all'
        ? `Showing all ${shown} projects.`
        : `Showing ${shown} ${shown === 1 ? 'project' : 'projects'} in ${label}.`;
    }

  }

  // Counts come from the cards themselves, so a filter badge can never claim a
  // number the grid does not show. The markup carries the same values as the
  // no-JS default; this keeps them honest if a project is added or removed.
  buttons.forEach((button) => {
    const filter = button.dataset.filter || 'all';
    const count = filter === 'all'
      ? cards.length
      : cards.filter((card) => (card.dataset.categories || '').split(/\s+/).includes(filter)).length;
    const badge = button.querySelector('b');
    if (badge) badge.textContent = String(count);
  });

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      apply(button.dataset.filter || 'all', button.dataset.label || button.textContent.trim());
    });
  });

  apply('all', 'all work');
}
initFilters();

/* ================= Command palette ================= */
const commandDialog = $('#command');
const commandInput = $('#commandInput');
const commandResults = $('#commandResults');
const commandTrigger = $('#commandTrigger');
const shortcutsDialog = $('#shortcuts');

function goTo(selector) {
  const target = $(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: scrollBehaviour(), block: 'start' });
}

function downloadFile(href) {
  const link = el('a');
  link.href = href;
  link.download = '';
  document.body.append(link);
  link.click();
  link.remove();
}

function openShortcuts() {
  if (!shortcutsDialog || shortcutsDialog.open) return;
  shortcutsDialog.showModal();
  body.classList.add('dialog-open');
}

const commands = [
  { label: 'Go to About', description: 'Profile, approach and working philosophy', hint: '01', icon: 'icon-user-shield', keywords: 'about profile summary me', run: () => goTo('#about') },
  { label: 'Go to Education', description: 'MSc Cyber Security and BSc Cyber Security', hint: '02', icon: 'icon-graduation', keywords: 'education degree university chester air', run: () => goTo('#education') },
  { label: 'Go to Experience', description: 'ICS internship and current operations role', hint: '03', icon: 'icon-briefcase', keywords: 'experience work trezlon phi-tech internship', run: () => goTo('#experience') },
  { label: 'Go to Projects', description: 'Projects and case studies', hint: '04', icon: 'icon-code', keywords: 'projects work case studies portfolio', run: () => goTo('#projects') },
  { label: 'Go to Skills', description: 'Capabilities, tooling and Red Cell / Blue Team', hint: '05', icon: 'icon-radar', keywords: 'skills tools technologies red blue nist', run: () => goTo('#skills') },
  { label: 'Go to Certifications', description: 'Verified credentials and course completions', hint: '06', icon: 'icon-certificate', keywords: 'certifications credentials courses coursera', run: () => goTo('#certifications') },
  { label: 'Go to Contact', description: 'Worldwide availability and contact details', hint: '07', icon: 'icon-globe', keywords: 'contact availability worldwide email hire', run: () => goTo('#contact') },
  ...Object.entries(projectData).map(([id, project]) => ({
    label: `Open: ${project.title}`,
    description: project.kicker,
    hint: 'Case',
    icon: 'icon-file',
    keywords: `case study mission ${id.replace('-', ' ')} ${id} ${project.title} ${project.kicker} ${project.classification} ${project.stack.join(' ')}`,
    run: () => goTo(`#case-${id}`)
  })),
  { label: 'Theme: System', description: 'Follow the operating system', hint: 'Theme', icon: 'icon-monitor', keywords: 'theme system auto', run: () => { applyTheme('system', true); themeMenu.sync(); showToast('Theme: system'); } },
  { label: 'Theme: BlackICE Night', description: 'Dark operations theme', hint: 'Theme', icon: 'icon-moon', keywords: 'theme dark blackice night', run: () => { applyTheme('dark', true); themeMenu.sync(); showToast('Theme: BlackICE Night'); } },
  { label: 'Theme: Forensic Daylight', description: 'Light forensic laboratory theme', hint: 'Theme', icon: 'icon-sun', keywords: 'theme light forensic daylight', run: () => { applyTheme('light', true); themeMenu.sync(); showToast('Theme: Forensic Daylight'); } },
  ...MOTION_LEVELS.map((level) => ({
    label: `Motion: ${level}`,
    description: level === 'full' ? 'Full choreography and ambient motion'
      : level === 'calm' ? 'Short fades only, ambient loops stopped'
        : 'No motion at all',
    hint: 'Motion',
    icon: 'icon-activity',
    keywords: `motion animation ${level} reduce accessibility`,
    run: () => { applyMotion(level, true); motionMenu.sync(); revealAll(); showToast(`Motion: ${level}`); }
  })),
  { label: 'Download CV (PDF)', description: 'Sarmad_Saeed_CV.pdf', hint: 'PDF', icon: 'icon-download', keywords: 'cv resume curriculum vitae pdf download', run: () => downloadFile('Sarmad_Saeed_CV.pdf') },
  { label: 'Download CV (DOCX)', description: 'Sarmad_Saeed_CV.docx', hint: 'DOCX', icon: 'icon-download', keywords: 'cv resume curriculum vitae docx word download', run: () => downloadFile('Sarmad_Saeed_CV.docx') },
  { label: 'Copy email address', description: 'sarmadsaeed2002@gmail.com', hint: 'Copy', icon: 'icon-copy', keywords: 'email copy clipboard contact', run: async () => showToast(await copyText('sarmadsaeed2002@gmail.com') ? 'Email copied to clipboard' : 'Unable to copy email') },
  { label: 'Copy link to this page', description: 'Share the portfolio', hint: 'Copy', icon: 'icon-link', keywords: 'share copy link url', run: async () => showToast(await copyText(window.location.href) ? 'Link copied to clipboard' : 'Unable to copy link') },
  { label: 'Print this page', description: 'Forensic print layout', hint: 'Print', icon: 'icon-print', keywords: 'print pdf export report', run: () => window.print() },
  { label: 'Open LinkedIn', description: 'linkedin.com/in/sarmad-saeed-845a7b267', hint: 'External', icon: 'icon-arrow-up-right', keywords: 'linkedin social profile', run: () => window.open('https://www.linkedin.com/in/sarmad-saeed-845a7b267', '_blank', 'noopener,noreferrer') },
  { label: 'Open GitHub', description: 'github.com/GhauriBoy295', hint: 'External', icon: 'icon-arrow-up-right', keywords: 'github code repository', run: () => window.open('https://github.com/GhauriBoy295', '_blank', 'noopener,noreferrer') },
  { label: 'Keyboard shortcuts', description: 'Every keyboard control', hint: '?', icon: 'icon-command', keywords: 'keyboard shortcuts help keys', run: openShortcuts }
];

function renderCommands(query = '') {
  if (!commandResults) return;
  const needle = query.trim().toLowerCase();
  state.filteredCommands = commands.filter((command) =>
    `${command.label} ${command.description} ${command.keywords}`.toLowerCase().includes(needle));
  state.commandSelection = Math.min(state.commandSelection, Math.max(0, state.filteredCommands.length - 1));

  if (!state.filteredCommands.length) {
    commandResults.replaceChildren(el('p', { className: 'command-empty', text: 'No matching command found.' }));
    return;
  }

  commandResults.replaceChildren(...state.filteredCommands.map((command, index) => {
    const button = el('button', { className: `command-item${index === state.commandSelection ? ' is-selected' : ''}` });
    button.type = 'button';
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(index === state.commandSelection));

    const iconWrap = el('span', { className: 'command-item-icon' });
    iconWrap.append(svgIcon(command.icon));
    const copy = el('span');
    copy.append(el('strong', { text: command.label }), el('small', { text: command.description }));
    button.append(iconWrap, copy, el('span', { className: 'command-hint', text: command.hint }));
    button.addEventListener('click', () => runCommand(index));
    button.addEventListener('pointermove', () => {
      state.commandSelection = index;
      syncCommandSelection();
    });
    return button;
  }));
}

function syncCommandSelection() {
  $$('.command-item', commandResults).forEach((item, index) => {
    const selected = index === state.commandSelection;
    item.classList.toggle('is-selected', selected);
    item.setAttribute('aria-selected', String(selected));
    if (selected) item.scrollIntoView({ block: 'nearest' });
  });
}

function runCommand(index) {
  const command = state.filteredCommands[index];
  if (!command) return;
  commandDialog?.close();
  window.setTimeout(() => command.run(), motionReduced() ? 0 : 60);
}

function openCommand() {
  if (!commandDialog) return;
  closeMenu();
  state.commandSelection = 0;
  if (commandInput) commandInput.value = '';
  renderCommands('');
  commandDialog.showModal();
  body.classList.add('dialog-open');
  requestAnimationFrame(() => commandInput?.focus());
}

commandTrigger?.addEventListener('click', openCommand);
commandDialog?.addEventListener('click', (event) => {
  if (event.target === commandDialog) commandDialog.close();
});
commandDialog?.addEventListener('close', () => {
  if (!$('#report')?.open && !shortcutsDialog?.open) body.classList.remove('dialog-open');
  commandTrigger?.focus();
});

commandInput?.addEventListener('input', () => {
  state.commandSelection = 0;
  renderCommands(commandInput.value);
});

commandInput?.addEventListener('keydown', (event) => {
  const count = Math.max(1, state.filteredCommands.length);
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    state.commandSelection = (state.commandSelection + 1) % count;
    syncCommandSelection();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    state.commandSelection = (state.commandSelection - 1 + count) % count;
    syncCommandSelection();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    runCommand(state.commandSelection);
  }
});

$('#shortcutsClose')?.addEventListener('click', () => shortcutsDialog?.close());
shortcutsDialog?.addEventListener('click', (event) => {
  if (event.target === shortcutsDialog) shortcutsDialog.close();
});
shortcutsDialog?.addEventListener('close', () => {
  if (!$('#report')?.open && !commandDialog?.open) body.classList.remove('dialog-open');
  commandTrigger?.focus();
});

/* ---------- Global keys ---------- */
const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
const commandKbd = $('#commandTrigger kbd');
if (commandKbd) commandKbd.textContent = isApple ? '⌘K' : 'Ctrl K';

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (commandDialog?.open) commandDialog.close();
    else openCommand();
    return;
  }


  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const target = event.target;
  const typing = target instanceof HTMLElement
    && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
  if (typing) return;
  if ($('#report')?.open || commandDialog?.open) return;

  if (event.key === '?') {
    event.preventDefault();
    if (shortcutsDialog?.open) shortcutsDialog.close();
    else openShortcuts();
    return;
  }
  if (shortcutsDialog?.open) return;

  const key = event.key.toLowerCase();

  // A pending "g" prefix owns the next keystroke. This has to be tested first:
  // otherwise "g" then "m" is swallowed by the motion shortcut below and the
  // documented jump sequence silently does something else.
  if (state.awaitingJump) {
    const jumps = {
      a: '#about', d: '#education', e: '#experience', p: '#projects',
      s: '#skills', v: '#certifications', c: '#contact'
    };
    const destination = jumps[key];
    state.awaitingJump = false;
    if (destination) {
      event.preventDefault();
      goTo(destination);
      return;
    }
  }

  if (key === 't') {
    event.preventDefault();
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
    themeMenu.sync();
    showToast(`Theme: ${next === 'light' ? 'Forensic Daylight' : 'BlackICE Night'}`);
    return;
  }

  if (key === 'm') {
    event.preventDefault();
    const next = MOTION_LEVELS[(MOTION_LEVELS.indexOf(motionLevel()) + 1) % MOTION_LEVELS.length];
    applyMotion(next, true);
    motionMenu.sync();
    revealAll();
    showToast(`Motion: ${next}`);
    return;
  }

  if (key === 'g') {
    state.awaitingJump = true;
    window.setTimeout(() => { state.awaitingJump = false; }, 1200);
  }
});

/* ================= Copy actions ================= */
$$('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy === 'page-url' ? window.location.href : button.dataset.copy;
    const ok = value ? await copyText(value) : false;
    showToast(ok ? (button.dataset.copyMessage || 'Copied to clipboard') : 'Unable to copy');
  });
});

$('#printPage')?.addEventListener('click', () => window.print());

/* A closed <details> does not print its contents in every browser, so the
   About disclosure is opened for the print job and restored afterwards. */
const heroAbout = $('.hero-about');
let heroAboutWasOpen = false;
window.addEventListener('beforeprint', () => {
  if (!heroAbout) return;
  heroAboutWasOpen = heroAbout.open;
  heroAbout.open = true;
});
window.addEventListener('afterprint', () => {
  if (heroAbout) heroAbout.open = heroAboutWasOpen;
});

/* Every "number of case studies" on the page is reconciled against the
   static case-study articles, the single source of the reports. */
const caseCount = $$('.case').length;
$$('[data-case-count]').forEach((node) => { node.textContent = String(caseCount); });

/* ================= UK local time ================= */
function initLocalTime() {
  const wrapper = $('#localTime');
  const value = $('#localTimeValue');
  const note = $('#localTimeNote');
  if (!wrapper || !value) return;

  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false
    });
  } catch {
    return; // Without zone support the block stays hidden rather than guessing.
  }

  const tick = () => {
    const now = new Date();
    const text = formatter.format(now);
    value.textContent = text;
    value.setAttribute('datetime', now.toISOString());
    if (note) {
      const hour = Number(text.slice(0, 2));
      note.textContent = hour >= 9 && hour < 18 ? 'Usually available' : 'Outside usual hours';
    }
  };

  tick();
  wrapper.hidden = false;
  const timer = window.setInterval(tick, 30000);
  window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true });
}
initLocalTime();

/* ================= Connection state ================= */
function initConnection() {
  const indicator = $('#connectionState');
  if (!indicator) return;
  const sync = () => {
    const online = navigator.onLine !== false;
    indicator.textContent = online ? 'Online' : 'Offline — cached copy';
    indicator.className = online ? 'is-online' : 'is-offline';
  };
  sync();
  window.addEventListener('online', sync);
  window.addEventListener('offline', sync);
}
initConnection();

/* ================= Install app ================= */
function initInstall() {
  const button = $('#installApp');
  if (!button) return;
  let deferred = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event;
    button.hidden = false;
  });

  button.addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    button.hidden = true;
    showToast(outcome === 'accepted' ? 'Installing portfolio app' : 'Install dismissed');
  });

  window.addEventListener('appinstalled', () => {
    button.hidden = true;
    showToast('Portfolio installed');
  });
}
initInstall();

/* ================= Year ================= */
const yearSlot = $('#currentYear');
if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());

/* ================= Progressive extras ================= */

/* The coverage panel rebuilds a documented-work mapping table from projectData,
   so it stays in step with the case studies without a second copy of the
   numbers in the markup. No animated counts (R07/R09). */
initCoverage();

/* Case studies are substantive static articles (#case-<id>), reachable without
   JS. The project cards are real anchors to them; this only smooths the jump
   and moves focus to the opened article for keyboard users. */
$$('a.mission-open[href^="#case-"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: scrollBehaviour(), block: 'start' });
    history.replaceState(null, '', `#${id}`);
    // The article is focusable (tabindex -1) so the next Tab continues inside it.
    target.focus({ preventScroll: true });
  });
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {
      /* Offline support is an enhancement; failure stays silent. */
    });
  });
}

window.addEventListener('hashchange', () => closeMenu());
