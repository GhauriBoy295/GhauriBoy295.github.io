/* AEGIS NEXUS — application orchestrator.

   Composition, in order: preferences, the secure welcome scene, the shell
   (header, navigation, scroll state), the choreographed reveal system, the
   interactive modules (Red/Blue, project filters), the command surface, and
   finally the progressive extras (globe, service worker, install, deep
   links).

   Every module degrades to visible, usable content if it never runs: the
   markup ships complete and script only ever hides or enhances. */

import {
  $, $$, el, root, svgIcon, showToast, copyText,
  applyTheme, storedTheme, resolveTheme, lightSchemeQuery,
  applyMotion, storedMotion, defaultMotion, motionLevel, motionReduced, MOTION_LEVELS,
  initPrefMenu, trapFocus, scrollBehaviour, reducedMotionQuery, coarseOrSmall
} from './core.js?v=25.0.0';
import { initGlobe } from './globe.js?v=25.0.0';
import { initDepth } from './depth.js?v=25.0.0';
import { initBoot } from './boot.js?v=25.0.0';
import { initReport, openReport, projectFromHash } from './report.js?v=25.0.0';
import { projectData } from './project-data.js?v=25.0.0';

root.classList.remove('no-js');
root.classList.add('js');

const body = document.body;

const state = {
  menuOpen: false,
  commandSelection: 0,
  filteredCommands: [],
  awaitingJump: false,
  bootTimer: 0
};

/* ================= Preferences ================= */
applyTheme(storedTheme() || 'system');
applyMotion(storedMotion() || defaultMotion());

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

// An OS reduced-motion change only moves the page if no explicit choice exists.
reducedMotionQuery.addEventListener?.('change', () => {
  if (storedMotion()) return;
  applyMotion(defaultMotion());
  motionMenu.sync();
  revealAll(motionLevel() === 'off');
});

/* ================= Secure welcome ================= */
const boot = $('#boot');
// The rain canvas and the verification sequence live in their own module; this
// keeps a handle so both can be stopped the moment the visitor moves on.
const bootScene = initBoot();
const siteShell = $('#siteShell');
const mainContent = $('#main');
const bootEnter = $('#bootEnter');

function setShellInert(value) {
  if (!siteShell) return;
  try { siteShell.inert = value; } catch { /* older engines: aria-hidden below */ }
  siteShell.setAttribute('aria-hidden', value ? 'true' : 'false');
}

function completeBoot({ focusMain = true } = {}) {
  if (!boot || !body.classList.contains('boot-active')) return;
  window.clearTimeout(state.bootTimer);
  bootScene.stop();
  body.classList.remove('boot-active');
  boot.setAttribute('aria-hidden', 'true');
  setShellInert(false);
  if (focusMain) mainContent?.focus({ preventScroll: true });
}

function replayBoot() {
  if (!boot) return;
  closeMenu();
  $('#command')?.close();
  $('#shortcuts')?.close();
  $('#report')?.close();
  window.scrollTo({ top: 0, behavior: scrollBehaviour() });
  body.classList.add('boot-active');
  boot.setAttribute('aria-hidden', 'false');
  setShellInert(true);
  requestAnimationFrame(() => bootEnter?.focus({ preventScroll: true }));
}

if (boot && bootEnter) {
  setShellInert(true);
  bootEnter.addEventListener('click', () => completeBoot());
  $('#bootSkip')?.addEventListener('click', () => completeBoot());

  boot.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target === boot) {
      event.preventDefault();
      completeBoot();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      completeBoot();
    }
    trapFocus(boot, event);
  });

  document.addEventListener('keydown', (event) => {
    if (!body.classList.contains('boot-active')) return;
    if (event.key === 'Enter' && !(event.target instanceof HTMLAnchorElement)) {
      event.preventDefault();
      completeBoot();
    }
  });

  // The welcome is a scene, not a gate: it self-clears if the visitor never
  // interacts with it, so nothing can strand the page behind it.
  state.bootTimer = window.setTimeout(() => completeBoot({ focusMain: false }), 14000);
} else {
  body.classList.remove('boot-active');
  setShellInert(false);
}

$$('[data-replay-boot]').forEach((button) => button.addEventListener('click', replayBoot));

/* ================= Header and navigation ================= */
const header = $('#siteHeader');
const primaryNav = $('#primaryNav');
const menuToggle = $('#menuToggle');

function openMenu() {
  if (!primaryNav || !menuToggle) return;
  state.menuOpen = true;
  primaryNav.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Close navigation menu');
  primaryNav.querySelector('a')?.focus();
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!primaryNav || !menuToggle || !state.menuOpen) return;
  state.menuOpen = false;
  primaryNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  if (restoreFocus) menuToggle.focus();
}

menuToggle?.addEventListener('click', () => (state.menuOpen ? closeMenu({ restoreFocus: true }) : openMenu()));
$$('#primaryNav a').forEach((link) => link.addEventListener('click', () => closeMenu()));

primaryNav?.addEventListener('keydown', (event) => {
  if (!state.menuOpen) return;
  if (event.key === 'Escape') {
    closeMenu({ restoreFocus: true });
    return;
  }
  // While open as an overlay the menu keeps focus between itself and its
  // toggle; on desktop it is inline and this never engages.
  if (window.matchMedia('(max-width: 1279px)').matches) {
    const scope = { contains: (node) => primaryNav.contains(node) || menuToggle.contains(node) };
    if (!scope.contains(document.activeElement)) return;
    trapFocus(primaryNav, event);
  }
});

document.addEventListener('pointerdown', (event) => {
  if (!state.menuOpen) return;
  if (!primaryNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1279) closeMenu();
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
const navLinks = $$('#primaryNav a');
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
}

/* ---------- Idle offscreen sections ---------- */
if ('IntersectionObserver' in window) {
  const idleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-idle', !entry.isIntersecting));
  }, { rootMargin: '140px 0px' });
  $$('[data-ambient]').forEach((section) => idleObserver.observe(section));
}

/* ================= Operator terminal ================= */
const terminalOutput = $('#terminalLine');

const TERMINAL_LINES = [
  'Open to cyber security opportunities worldwide.',
  'Base: United Kingdom. Work modes: remote, hybrid, on-site, relocation.',
  'Focus: SOC operations, DFIR, ICS/OT and vulnerability assessment.',
  'Method: investigate, validate, then communicate clearly.'
];

function runTerminal() {
  if (!terminalOutput) return;
  if (motionReduced()) {
    terminalOutput.textContent = TERMINAL_LINES[0];
    return;
  }

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let timer = 0;

  const tick = () => {
    if (document.hidden) {
      timer = window.setTimeout(tick, 600);
      return;
    }
    const line = TERMINAL_LINES[lineIndex];
    if (!deleting) {
      charIndex += 1;
      terminalOutput.textContent = line.slice(0, charIndex);
      if (charIndex >= line.length) {
        deleting = true;
        timer = window.setTimeout(tick, 2600);
        return;
      }
      timer = window.setTimeout(tick, 32 + Math.random() * 22);
    } else {
      charIndex -= 1;
      terminalOutput.textContent = line.slice(0, Math.max(0, charIndex));
      if (charIndex <= 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % TERMINAL_LINES.length;
        timer = window.setTimeout(tick, 420);
        return;
      }
      timer = window.setTimeout(tick, 16);
    }
  };

  timer = window.setTimeout(tick, 700);
  window.addEventListener('pagehide', () => window.clearTimeout(timer), { once: true });
  document.addEventListener('aegis:motion', () => {
    if (!motionReduced()) return;
    window.clearTimeout(timer);
    terminalOutput.textContent = TERMINAL_LINES[0];
  });
}
runTerminal();

/* ================= Red Cell / Blue Team ================= */
function initRedBlue() {
  const module = $('#redblue');
  if (!module) return;
  const buttons = $$('button', $('#redblueSwitch'));
  if (!buttons.length) return;

  function select(side) {
    module.dataset.side = side;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.side === side)));
    $$('.redblue-column', module).forEach((column) => {
      // Dimmed rather than removed: the comparison is the point, and hiding
      // one half would make the diagram meaningless.
      column.setAttribute('aria-hidden', 'false');
    });
  }

  buttons.forEach((button) => button.addEventListener('click', () => select(button.dataset.side)));
  select('both');
}
initRedBlue();

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

    if (!motionReduced()) {
      grid.classList.add('is-filtering');
      window.setTimeout(() => grid.classList.remove('is-filtering'), 400);
    }
  }

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
    keywords: `case study mission ${project.title} ${project.classification} ${project.stack.join(' ')}`,
    run: () => openReport(id, commandTrigger)
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
  { label: 'Keyboard shortcuts', description: 'Every keyboard control', hint: '?', icon: 'icon-command', keywords: 'keyboard shortcuts help keys', run: openShortcuts },
  { label: 'Replay secure welcome', description: 'Return to the access sequence', hint: 'Replay', icon: 'icon-arrow-right', keywords: 'welcome intro replay boot', run: replayBoot }
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
    if (body.classList.contains('boot-active')) return;
    event.preventDefault();
    if (commandDialog?.open) commandDialog.close();
    else openCommand();
    return;
  }

  if (event.key === 'Escape' && state.menuOpen) closeMenu({ restoreFocus: true });

  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (body.classList.contains('boot-active')) return;

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
initReport();

// Depth is decorative and self-gating: it checks motion level, pointer type
// and device power itself, and does nothing at all when any of those say no.
initDepth();

// The globe is decorative: it is skipped entirely on touch-first or small
// screens, where its cost is highest and its value lowest.
if (!coarseOrSmall()) {
  initGlobe($('#globe'));
} else {
  $('#globe')?.querySelector('canvas')?.remove();
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {
      /* Offline support is an enhancement; failure stays silent. */
    });
  });
}

window.addEventListener('hashchange', () => closeMenu());

// A visitor arriving on a case-study link skips the welcome and lands on the
// report itself.
if (projectFromHash()) {
  completeBoot({ focusMain: false });
  requestAnimationFrame(() => {
    const id = projectFromHash();
    if (id) openReport(id, $(`[data-open-mission="${id}"]`));
  });
}
