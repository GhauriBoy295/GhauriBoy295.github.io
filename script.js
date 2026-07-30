(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const body = document.body;
  const welcomeScreen = $('#welcomeScreen');
  const enterPortfolio = $('#enterPortfolio');
  const replayIntro = $('#replayIntro');
  const siteShell = $('#siteShell');
  const mainContent = $('#main-content');
  const header = $('#siteHeader');
  const primaryNav = $('#primaryNav');
  const menuToggle = $('#menuToggle');
  const themeToggle = $('#themeToggle');
  const commandTrigger = $('#commandTrigger');
  const commandDialog = $('#commandDialog');
  const commandInput = $('#commandInput');
  const commandResults = $('#commandResults');
  const projectDialog = $('#projectDialog');
  const projectDialogClose = $('#projectDialogClose');
  const scrollProgress = $('#scrollProgress');
  const backToTop = $('#backToTop');
  const terminalOutput = $('#terminalOutput');
  const copyEmailButton = $('#copyEmail');
  const toast = $('#toast');
  const cursorAura = $('#cursorAura');

  const state = {
    menuOpen: false,
    commandSelection: 0,
    filteredCommands: [],
    lastProjectTrigger: null,
    toastTimer: null,
    introTimer: null,
    currentProject: null,
    awaitingJump: false
  };

  // ---------- Theme ----------
  const THEME_KEY = 'sarmad-portfolio-theme';

  const lightScheme = window.matchMedia('(prefers-color-scheme: light)');

  function storedTheme() {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  // Dark stays the default when the system expresses no preference.
  function systemTheme() {
    return lightScheme.matches ? 'light' : 'dark';
  }

  // Browser-bar colour tracks the active theme.
  const BAR_COLOUR = { dark: '#050806', light: '#F4F8F5' };

  function syncBrowserBar() {
    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', BAR_COLOUR[root.dataset.theme === 'light' ? 'light' : 'dark']);
  }

  function applyTheme(theme, persist = false) {
    const next = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = next;
    if (themeToggle) {
      const isLight = next === 'light';
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    }
    syncBrowserBar();
    if (persist) {
      try { localStorage.setItem(THEME_KEY, next); } catch { /* storage can be unavailable */ }
    }
    document.dispatchEvent(new CustomEvent('portfolio:themechange', { detail: { theme: next } }));
  }

  applyTheme(storedTheme() || systemTheme());

  // Follow the system while the visitor has not chosen a theme themselves.
  const onSchemeChange = () => {
    if (storedTheme()) return;
    applyTheme(systemTheme());
  };
  if (typeof lightScheme.addEventListener === 'function') {
    lightScheme.addEventListener('change', onSchemeChange);
  } else if (typeof lightScheme.addListener === 'function') {
    lightScheme.addListener(onSchemeChange);
  }

  themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
    showToast(`${next[0].toUpperCase()}${next.slice(1)} theme enabled`);
  });

  // ---------- Welcome screen ----------
  function setSiteInert(value) {
    if (!siteShell) return;
    try { siteShell.inert = value; } catch { /* inert fallback below */ }
    siteShell.setAttribute('aria-hidden', value ? 'true' : 'false');
  }

  function completeIntro({ focusMain = true } = {}) {
    if (!welcomeScreen || !body.classList.contains('intro-active')) return;
    window.clearTimeout(state.introTimer);
    body.classList.add('intro-leaving');
    body.classList.remove('intro-active');
    setSiteInert(false);
    welcomeScreen.setAttribute('aria-hidden', 'true');

    const finish = () => {
      body.classList.remove('intro-leaving');
      body.classList.add('intro-complete');
      if (focusMain) mainContent?.focus({ preventScroll: true });
    };

    if (reducedMotion.matches) finish();
    else state.introTimer = window.setTimeout(finish, 820);
  }

  function showIntro() {
    if (!welcomeScreen) return;
    window.clearTimeout(state.introTimer);
    closeMenu();
    if (commandDialog?.open) commandDialog.close();
    if (projectDialog?.open) projectDialog.close();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    body.classList.remove('intro-complete', 'intro-leaving');
    body.classList.add('intro-active');
    welcomeScreen.setAttribute('aria-hidden', 'false');
    setSiteInert(true);
    requestAnimationFrame(() => enterPortfolio?.focus({ preventScroll: true }));
  }

  if (welcomeScreen && enterPortfolio) {
    setSiteInert(true);
    enterPortfolio.addEventListener('click', () => completeIntro());
    document.addEventListener('keydown', (event) => {
      if (body.classList.contains('intro-active') && event.key === 'Enter') {
        event.preventDefault();
        completeIntro();
      }
    });
  } else {
    body.classList.remove('intro-active');
    body.classList.add('intro-complete');
    setSiteInert(false);
  }

  replayIntro?.addEventListener('click', showIntro);

  // ---------- Header and mobile navigation ----------
  function openMenu() {
    if (!primaryNav || !menuToggle) return;
    state.menuOpen = true;
    primaryNav.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
  }

  function closeMenu() {
    if (!primaryNav || !menuToggle) return;
    state.menuOpen = false;
    primaryNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  menuToggle?.addEventListener('click', () => state.menuOpen ? closeMenu() : openMenu());
  $$('#primaryNav a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('pointerdown', (event) => {
    if (!state.menuOpen || !primaryNav || !menuToggle) return;
    if (!primaryNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) closeMenu();
  }, { passive: true });

  // ---------- Scroll state ----------
  let scrollTicking = false;

  function updateScrollState() {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 18);
    backToTop?.classList.toggle('is-visible', y > 650);

    if (scrollProgress) {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = documentHeight > 0 ? Math.min(1, Math.max(0, y / documentHeight)) : 0;
      scrollProgress.style.transform = `scaleX(${ratio})`;
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });
  updateScrollState();

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));

  // ---------- Active navigation ----------
  const navLinks = $$('#primaryNav a');
  const navSections = navLinks
    .map((link) => $(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0.01, 0.2, 0.5] });
    navSections.forEach((section) => navObserver.observe(section));
  }

  // ---------- Reveal animations ----------
  const revealItems = $$('.reveal');
  revealItems.forEach((item) => {
    const delay = Number(item.dataset.delay || 0);
    item.style.setProperty('--reveal-delay', String(Number.isFinite(delay) ? delay : 0));
  });

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // ---------- Animated counters ----------
  const counterItems = $$('[data-counter]');

  function animateCounter(element) {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    const target = Number(element.dataset.counter || 0);
    if (!Number.isFinite(target)) return;
    if (reducedMotion.matches) {
      element.textContent = String(target);
      return;
    }
    const duration = 1150;
    const start = performance.now();
    const frame = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      element.textContent = String(Math.round(target * eased));
      if (elapsed < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counterItems.forEach((counter) => counterObserver.observe(counter));
  } else {
    counterItems.forEach(animateCounter);
  }

  // ---------- Terminal typing ----------
  const terminalMessages = [
    'Graduated and open to UK cyber security opportunities.',
    'Focus: SOC operations, DFIR, ICS/OT and vulnerability assessment.',
    'Method: investigate, validate, then communicate clearly.'
  ];

  function runTerminalTyping() {
    if (!terminalOutput) return;
    if (reducedMotion.matches) {
      terminalOutput.textContent = terminalMessages[0];
      return;
    }
    let messageIndex = 0;
    let characterIndex = 0;
    let deleting = false;

    const tick = () => {
      if (document.hidden) {
        window.setTimeout(tick, 500);
        return;
      }
      const message = terminalMessages[messageIndex];
      if (!deleting) {
        characterIndex += 1;
        terminalOutput.textContent = message.slice(0, characterIndex);
        if (characterIndex >= message.length) {
          deleting = true;
          window.setTimeout(tick, 2400);
          return;
        }
        window.setTimeout(tick, 34 + Math.random() * 24);
      } else {
        characterIndex -= 1;
        terminalOutput.textContent = message.slice(0, Math.max(0, characterIndex));
        if (characterIndex <= 0) {
          deleting = false;
          messageIndex = (messageIndex + 1) % terminalMessages.length;
          window.setTimeout(tick, 420);
          return;
        }
        window.setTimeout(tick, 18);
      }
    };
    window.setTimeout(tick, 850);
  }
  runTerminalTyping();

  // ---------- Project filtering ----------
  const filterButtons = $$('.filter-button');
  const projectCards = $$('.project-card');
  let filterTimer = null;

  function filterProjects(filter) {
    window.clearTimeout(filterTimer);
    projectCards.forEach((card) => {
      const categories = (card.dataset.categories || '').split(/\s+/);
      const shouldShow = filter === 'all' || categories.includes(filter);
      if (shouldShow) {
        card.hidden = false;
        requestAnimationFrame(() => card.classList.remove('is-filtering'));
      } else {
        card.classList.add('is-filtering');
      }
    });
    filterTimer = window.setTimeout(() => {
      projectCards.forEach((card) => {
        const categories = (card.dataset.categories || '').split(/\s+/);
        const shouldShow = filter === 'all' || categories.includes(filter);
        card.hidden = !shouldShow;
      });
    }, reducedMotion.matches ? 0 : 310);
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      filterProjects(button.dataset.filter || 'all');
    });
  });

  // ---------- Project case studies ----------
  const projectData = {
    randomness: {
      kicker: 'Research case study',
      meta: 'MSc Dissertation · University of Chester · 2025–2026',
      title: 'Integrated Randomness Testing Suite',
      summary: 'A research-led project exploring how a consolidated testing workflow can help evaluate PRNG/TRNG output, identify statistical weaknesses and support more informed security assessment of randomness used in cryptographic contexts.',
      stack: ['Python', 'PRNG / TRNG', 'Statistical testing', 'Entropy analysis', 'Security research'],
      details: [
        { label: '01 / Context', title: 'The challenge', body: 'Randomness quality is fundamental to cryptographic reliability. The project focused on bringing multiple testing perspectives into a clearer, repeatable evaluation workflow.' },
        { label: '02 / Method', title: 'The approach', body: 'Structured the work around test orchestration, result interpretation and indicators associated with weak or suspicious generator behaviour.', list: ['Review relevant randomness-testing principles', 'Design an integrated analysis workflow', 'Assess output quality and interpret statistical signals'] },
        { label: '03 / Technical focus', title: 'What was examined', body: 'Randomness quality, entropy concerns, statistical behaviour, weak generator patterns and the security implications of unreliable output.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Strengthened research design, Python-based analysis, technical documentation and the ability to connect statistical results to cyber security risk.' }
      ]
    },
    'ics-ids': {
      kicker: 'Defensive security case study',
      meta: 'Final Year Project · Air University · 2023–2024',
      title: 'Intrusion Detection for Industrial Control Systems',
      summary: 'An intrusion-detection concept focused on industrial environments, where availability, safety and legacy technology make monitoring and response fundamentally different from conventional IT networks.',
      stack: ['ICS / OT security', 'Intrusion detection', 'Anomaly awareness', 'Network monitoring', 'Alert logic'],
      details: [
        { label: '01 / Context', title: 'The challenge', body: 'Industrial networks require visibility without disrupting critical processes. The project explored detection thinking suited to cyber-physical environments.' },
        { label: '02 / Design', title: 'The approach', body: 'Developed and tested a concept centred on suspicious activity monitoring, vulnerability awareness and alert generation.', list: ['Map ICS-specific security concerns', 'Define detection and alerting logic', 'Consider operational constraints and defensive controls'] },
        { label: '03 / Recognition', title: 'Entrepreneur Gala', body: 'The project idea was presented at Air University and achieved 2nd position at the Entrepreneur Gala.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Built deeper awareness of ICS/OT risk, anomaly detection, industrial network defence and the importance of context-aware monitoring.' }
      ]
    },
    dfir: {
      kicker: 'Investigation case study',
      meta: 'Academic Labs · University of Chester · 2025–2026',
      title: 'Digital Forensics & Incident Response Labs',
      summary: 'A collection of structured academic exercises covering evidence acquisition, artefact review, forensic workflow and incident-response reasoning using recognised forensic tools.',
      stack: ['Autopsy', 'FTK Imager', 'OS Forensics', 'Evidence handling', 'Incident response'],
      details: [
        { label: '01 / Objective', title: 'The challenge', body: 'Investigations depend on preserving evidence, following repeatable processes and separating observable facts from unsupported assumptions.' },
        { label: '02 / Workflow', title: 'The approach', body: 'Applied investigation steps from acquisition and review through interpretation and reporting.', list: ['Acquire and preserve relevant evidence', 'Review forensic artefacts systematically', 'Document findings and response considerations'] },
        { label: '03 / Tooling', title: 'Technical environment', body: 'Used tools including Autopsy and FTK Imager to practise forensic examination and evidence-led analysis.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Improved forensic reasoning, attention to chain-of-custody principles, incident workflow knowledge and technical reporting.' }
      ]
    },
    assessment: {
      kicker: 'Offensive security case study',
      meta: 'Authorised Academic Labs · 2025–2026',
      title: 'Security Assessment & Active Defence Labs',
      summary: 'Controlled, authorised lab work covering reconnaissance, vulnerability identification, validation and the translation of technical findings into practical defensive recommendations.',
      stack: ['Nmap', 'Burp Suite', 'Metasploit', 'Nessus', 'OpenVAS', 'Wireshark'],
      details: [
        { label: '01 / Scope', title: 'The challenge', body: 'Security testing must be deliberate, authorised and evidence-based. The exercises focused on identifying exposure without losing sight of remediation.' },
        { label: '02 / Method', title: 'The approach', body: 'Followed a structured assessment path in isolated lab environments.', list: ['Reconnaissance and service discovery', 'Vulnerability identification and prioritisation', 'Controlled validation and defensive recommendations'] },
        { label: '03 / Tooling', title: 'Technical environment', body: 'Worked with network, web and vulnerability-assessment tools including Nmap, Burp Suite, Nessus, OpenVAS and Wireshark.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Developed stronger scoping discipline, technical validation skills and the ability to communicate findings in remediation-focused language.' }
      ]
    },
    'blood-bank': {
      kicker: 'Development case study',
      meta: 'Semester Project · Air University · 2022',
      title: 'Blood Bank Database System',
      summary: 'A relational database project designed to organise donor records, blood inventory and distribution data through a clearer and more maintainable information structure.',
      stack: ['SQL', 'Relational modelling', 'Data integrity', 'System analysis'],
      details: [
        { label: '01 / Context', title: 'The challenge', body: 'Blood-bank information involves multiple connected records that need accuracy, traceability and efficient retrieval.' },
        { label: '02 / Design', title: 'The approach', body: 'Modelled core entities and relationships around donors, inventory and distribution activity.', list: ['Identify data entities and relationships', 'Design a normalised relational structure', 'Support practical queries and record management'] },
        { label: '03 / Technical focus', title: 'What was built', body: 'A structured SQL database concept supporting organised storage and retrieval of operational information.' },
        { label: '04 / Learning', title: 'Practical outcome', body: 'Strengthened database design, system analysis, data-integrity thinking and SQL fundamentals.' }
      ]
    }
  };

  function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    if (options.className) element.className = options.className;
    if (options.text !== undefined) element.textContent = options.text;
    return element;
  }

  function populateProjectDialog(project) {
    const kicker = $('#projectDialogKicker');
    const meta = $('#projectDialogMeta');
    const title = $('#projectDialogTitle');
    const summary = $('#projectDialogSummary');
    const stack = $('#projectDialogStack');
    const details = $('#projectDialogDetails');
    if (!kicker || !meta || !title || !summary || !stack || !details) return;

    kicker.textContent = project.kicker;
    meta.textContent = project.meta;
    title.textContent = project.title;
    summary.textContent = project.summary;
    stack.replaceChildren(...project.stack.map((item) => createElement('span', { text: item })));

    const detailBlocks = project.details.map((detail) => {
      const block = createElement('article', { className: 'case-study-block' });
      block.append(
        createElement('span', { text: detail.label }),
        createElement('h3', { text: detail.title }),
        createElement('p', { text: detail.body })
      );
      if (Array.isArray(detail.list) && detail.list.length) {
        const list = createElement('ul');
        detail.list.forEach((item) => list.append(createElement('li', { text: item })));
        block.append(list);
      }
      return block;
    });
    details.replaceChildren(...detailBlocks);
  }

  function openProjectDialog(projectId, trigger) {
    const project = projectData[projectId];
    if (!project || !projectDialog) return;
    state.lastProjectTrigger = trigger || null;
    state.currentProject = projectId;
    populateProjectDialog(project);
    projectDialog.showModal();
    body.classList.add('dialog-open');
    // Mirror the open case study into the URL without growing the history stack.
    history.replaceState(null, '', hashForProject(projectId));
  }

  $$('[data-open-project]').forEach((button) => {
    button.addEventListener('click', () => openProjectDialog(button.dataset.openProject, button));
  });

  projectDialogClose?.addEventListener('click', () => projectDialog?.close());
  projectDialog?.addEventListener('click', (event) => {
    if (event.target === projectDialog) projectDialog.close();
  });
  projectDialog?.addEventListener('close', () => {
    if (!commandDialog?.open) body.classList.remove('dialog-open');
    state.currentProject = null;
    clearProjectHash();
    state.lastProjectTrigger?.focus?.();
  });

  // ---------- Command palette ----------
  function iconMarkup(symbolId) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${symbolId}`);
    svg.append(use);
    return svg;
  }

  function goToSection(selector) {
    const target = $(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      let success = false;
      try { success = document.execCommand('copy'); } catch { success = false; }
      textarea.remove();
      return success;
    }
  }

  const commands = [
    { label: 'Go to About', description: 'Professional profile and working principles', hint: '01', icon: 'icon-user-shield', keywords: 'profile summary about', run: () => goToSection('#about') },
    { label: 'Go to Expertise', description: 'Security capabilities and toolset', hint: '02', icon: 'icon-radar', keywords: 'skills tools expertise focus', run: () => goToSection('#expertise') },
    { label: 'Go to Projects', description: 'Open the selected work and case studies', hint: '03', icon: 'icon-code', keywords: 'projects case studies portfolio work', run: () => goToSection('#projects') },
    { label: 'Go to Education', description: 'University of Chester and Air University', hint: '04', icon: 'icon-graduation', keywords: 'education degree university graduate', run: () => goToSection('#education') },
    { label: 'Go to Experience', description: 'Professional experience and credentials', hint: '05', icon: 'icon-certificate', keywords: 'experience certificates work', run: () => goToSection('#experience') },
    { label: 'Go to Contact', description: 'Email, LinkedIn and CV downloads', hint: '06', icon: 'icon-mail', keywords: 'contact email linkedin', run: () => goToSection('#contact') },
    { label: 'Toggle colour theme', description: 'Switch between dark and light modes', hint: 'Theme', icon: 'icon-sun', keywords: 'dark light theme colour', run: () => themeToggle?.click() },
    { label: 'Keyboard shortcuts', description: 'List every keyboard control', hint: '?', icon: 'icon-code', keywords: 'keyboard shortcuts keys help', run: () => openShortcuts() },
    { label: 'Download CV', description: 'Open the professional CV as a PDF', hint: 'PDF', icon: 'icon-download', keywords: 'resume curriculum vitae pdf', run: () => {
      const link = createElement('a');
      link.href = 'Sarmad_Saeed_CV.pdf';
      link.download = '';
      document.body.append(link);
      link.click();
      link.remove();
    } },
    { label: 'Copy email address', description: 'Copy sarmadsaeed2002@gmail.com', hint: 'Copy', icon: 'icon-copy', keywords: 'email clipboard copy', run: async () => showToast(await copyText('sarmadsaeed2002@gmail.com') ? 'Email copied to clipboard' : 'Unable to copy email') },
    { label: 'Open LinkedIn', description: 'View Sarmad Saeed on LinkedIn', hint: 'External', icon: 'icon-arrow-up-right', keywords: 'linkedin social profile', run: () => window.open('https://www.linkedin.com/in/sarmad-saeed-845a7b267', '_blank', 'noopener,noreferrer') },
    { label: 'Replay welcome screen', description: 'Return to the portfolio access screen', hint: 'Replay', icon: 'icon-arrow-right', keywords: 'intro welcome opening', run: showIntro }
  ];

  function renderCommands(query = '') {
    if (!commandResults) return;
    const normalised = query.trim().toLowerCase();
    state.filteredCommands = commands.filter((command) => {
      const haystack = `${command.label} ${command.description} ${command.keywords}`.toLowerCase();
      return haystack.includes(normalised);
    });
    state.commandSelection = Math.min(state.commandSelection, Math.max(0, state.filteredCommands.length - 1));

    if (!state.filteredCommands.length) {
      commandResults.replaceChildren(createElement('p', { className: 'command-empty', text: 'No matching command found.' }));
      return;
    }

    const items = state.filteredCommands.map((command, index) => {
      const button = createElement('button', { className: `command-item${index === state.commandSelection ? ' is-selected' : ''}` });
      button.type = 'button';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === state.commandSelection));
      button.dataset.commandIndex = String(index);

      const iconWrap = createElement('span', { className: 'command-item-icon' });
      iconWrap.append(iconMarkup(command.icon));
      const copy = createElement('span');
      copy.append(createElement('strong', { text: command.label }), createElement('small', { text: command.description }));
      button.append(iconWrap, copy, createElement('span', { text: command.hint }));
      button.addEventListener('click', () => executeCommand(index));
      button.addEventListener('pointermove', () => {
        state.commandSelection = index;
        updateCommandSelection();
      });
      return button;
    });
    commandResults.replaceChildren(...items);
  }

  function updateCommandSelection() {
    $$('.command-item', commandResults).forEach((item, index) => {
      const selected = index === state.commandSelection;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', String(selected));
      if (selected) item.scrollIntoView({ block: 'nearest' });
    });
  }

  function executeCommand(index) {
    const command = state.filteredCommands[index];
    if (!command) return;
    commandDialog?.close();
    window.setTimeout(() => command.run(), reducedMotion.matches ? 0 : 70);
  }

  function openCommandDialog() {
    if (!commandDialog) return;
    closeMenu();
    state.commandSelection = 0;
    if (commandInput) commandInput.value = '';
    renderCommands('');
    commandDialog.showModal();
    body.classList.add('dialog-open');
    requestAnimationFrame(() => commandInput?.focus());
  }

  commandTrigger?.addEventListener('click', openCommandDialog);
  commandDialog?.addEventListener('click', (event) => {
    if (event.target === commandDialog) commandDialog.close();
  });
  commandDialog?.addEventListener('close', () => {
    if (!projectDialog?.open) body.classList.remove('dialog-open');
    commandTrigger?.focus();
  });
  commandInput?.addEventListener('input', () => {
    state.commandSelection = 0;
    renderCommands(commandInput.value);
  });
  commandInput?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      state.commandSelection = (state.commandSelection + 1) % Math.max(1, state.filteredCommands.length);
      updateCommandSelection();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      state.commandSelection = (state.commandSelection - 1 + Math.max(1, state.filteredCommands.length)) % Math.max(1, state.filteredCommands.length);
      updateCommandSelection();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      executeCommand(state.commandSelection);
    }
  });

  document.addEventListener('keydown', (event) => {
    const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (isShortcut && !body.classList.contains('intro-active')) {
      event.preventDefault();
      if (commandDialog?.open) commandDialog.close();
      else openCommandDialog();
    }
    if (event.key === 'Escape') closeMenu();
  });

  const commandKbd = $('.header-command kbd');
  if (commandKbd && !/Mac|iPhone|iPad/.test(navigator.platform || '')) commandKbd.textContent = 'Ctrl K';

  // ---------- Copy and toast ----------
  copyEmailButton?.addEventListener('click', async () => {
    const value = copyEmailButton.dataset.copy || '';
    const copied = value ? await copyText(value) : false;
    showToast(copied ? 'Email copied to clipboard' : 'Unable to copy email');
  });

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  // ---------- Card spotlight ----------
  if (finePointer.matches) {
    $$('.spotlight-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  // ---------- Subtle tilt ----------
  if (finePointer.matches && !reducedMotion.matches) {
    $$('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1100px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });

    $$('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
        button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  // ---------- Cursor aura ----------
  if (cursorAura && finePointer.matches && !reducedMotion.matches) {
    let cursorX = -400;
    let cursorY = -400;
    let auraX = -400;
    let auraY = -400;
    let auraFrame = 0;

    const animateAura = () => {
      auraX += (cursorX - auraX) * 0.14;
      auraY += (cursorY - auraY) * 0.14;
      cursorAura.style.transform = `translate3d(${auraX - 150}px, ${auraY - 150}px, 0)`;
      auraFrame = requestAnimationFrame(animateAura);
    };

    window.addEventListener('pointermove', (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      cursorAura.style.opacity = '.45';
    }, { passive: true });
    document.addEventListener('mouseleave', () => { cursorAura.style.opacity = '0'; });
    auraFrame = requestAnimationFrame(animateAura);
    window.addEventListener('pagehide', () => cancelAnimationFrame(auraFrame), { once: true });
  }

  // ---------- Lightweight network canvas ----------
  // ---------- Hacker background: matrix code rain ----------
  // Deliberately the ONLY full-screen animated layer on the page.
  // An earlier build ran two canvases plus a 2133x1348 blur(46px) gradient
  // mesh and two blur(105px) auroras, all animating at once; that is what made
  // the page lag. Everything below is budgeted:
  //   - one canvas, one rAF loop
  //   - fixed ~14fps step instead of every frame
  //   - device pixel ratio clamped to 1.5
  //   - column count capped
  //   - suspended entirely when the tab is hidden
  //   - never runs on touch, narrow screens or reduced motion
  function initHackerBackground() {
    const canvas = $('#rainCanvas');
    if (!canvas) return;

    if (reducedMotion.matches || !finePointer.matches || window.innerWidth < 900) {
      canvas.remove();
      return;
    }

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) { canvas.remove(); return; }

    const GLYPHS = '01<>[]{}/\|=+*#$%&@ABCDEF0123456789アイウエオカキクケコサシスセソ';
    const FONT_SIZE = 15;
    const COLUMN_GAP = FONT_SIZE * 1.55;
    const MAX_COLUMNS = 110;
    const STEP_MS = 70;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let columns = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let trail = 'rgb(5 8 6 / .10)';
    let glyphColour = 'rgb(0 255 156 / .45)';
    let leadColour = 'rgb(0 255 156 / .95)';

    function readColours() {
      const cs = getComputedStyle(root);
      const channel = (name, fallback) => (cs.getPropertyValue(name).trim() || fallback).replace(/\s+/g, ' ');
      const bg = channel('--bg-rgb', '5 8 6');
      const accent = channel('--accent-rgb', '0 255 156');
      trail = `rgb(${bg} / .10)`;
      glyphColour = `rgb(${accent} / .42)`;
      leadColour = `rgb(${accent} / .95)`;
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.font = `${FONT_SIZE}px ${getComputedStyle(root).getPropertyValue('--font-mono') || 'monospace'}`;
      context.textBaseline = 'top';
      const count = Math.min(MAX_COLUMNS, Math.ceil(width / COLUMN_GAP));
      columns = Array.from({ length: count }, () => Math.random() * -50);
    }

    function draw(now) {
      if (document.hidden) { frame = 0; return; }
      frame = requestAnimationFrame(draw);
      if (now - last < STEP_MS) return;
      last = now;

      context.fillStyle = trail;
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < columns.length; i += 1) {
        const x = i * COLUMN_GAP;
        const y = columns[i] * FONT_SIZE;

        if (y > -FONT_SIZE && y < height) {
          context.fillStyle = leadColour;
          context.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, y);
          context.fillStyle = glyphColour;
          context.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, y - FONT_SIZE * 2);
        }

        columns[i] = y > height && Math.random() > 0.97 ? 0 : columns[i] + 1;
      }
    }

    function pauseOrResume() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!frame) {
        last = 0;
        frame = requestAnimationFrame(draw);
      }
    }

    readColours();
    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', pauseOrResume);
    document.addEventListener('portfolio:themechange', readColours);
    window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
  }
  initHackerBackground();


  // ---------- Hero glitch bursts ----------
  // Short bursts on an interval rather than a permanent animation, so the
  // headline stays readable.
  function initGlitch() {
    const targets = $$('.hero-title .glitch');
    if (!targets.length || reducedMotion.matches) return;

    let timer = null;

    const burst = () => {
      if (document.hidden) return;
      const target = targets[Math.floor(Math.random() * targets.length)];
      target.classList.add('is-glitching');
      window.setTimeout(() => target.classList.remove('is-glitching'), 460);
    };

    const start = () => {
      if (timer) return;
      timer = window.setInterval(burst, 4200);
    };

    const stop = () => {
      window.clearInterval(timer);
      timer = null;
    };

    start();
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }
  initGlitch();

  // ---------- Section index scramble ----------
  // Resolves each section index into its final text the first time it scrolls
  // into view. Falls back to the plain label when observers are unavailable.
  function initScramble() {
    const targets = $$('.section-index');
    if (!targets.length) return;

    targets.forEach((element) => element.classList.add('scramble'));

    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const CHARS = '!<>-_\\/[]{}—=+*^?#01';

    function scramble(element) {
      const finalText = element.textContent;
      const total = 16;
      let step = 0;
      element.classList.add('is-scrambling');

      const tick = () => {
        const progress = step / total;
        const revealed = Math.floor(finalText.length * progress);
        let output = finalText.slice(0, revealed);
        for (let i = revealed; i < finalText.length; i += 1) {
          output += finalText[i] === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        element.textContent = output;
        step += 1;
        if (step <= total) {
          window.setTimeout(tick, 34);
        } else {
          element.textContent = finalText;
          element.classList.remove('is-scrambling');
        }
      };
      tick();
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        scramble(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.8 });

    targets.forEach((element) => observer.observe(element));
  }
  initScramble();

  // ---------- Deep-linkable case studies ----------
  // The open case study is mirrored into the URL hash so it can be linked,
  // bookmarked and restored on load. History is replaced rather than pushed
  // while open, so Back never walks through every dialog the visitor opened.
  const PROJECT_HASH = '#case-';

  function hashForProject(id) {
    return `${PROJECT_HASH}${id}`;
  }

  function projectFromHash() {
    const hash = window.location.hash;
    if (!hash.startsWith(PROJECT_HASH)) return null;
    const id = hash.slice(PROJECT_HASH.length);
    return projectData[id] ? id : null;
  }

  function clearProjectHash() {
    if (!window.location.hash.startsWith(PROJECT_HASH)) return;
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }

  function restoreProjectFromHash() {
    const id = projectFromHash();
    if (!id) return;
    const trigger = $(`[data-open-project="${id}"]`);
    openProjectDialog(id, trigger || null);
  }

  const projectCopyLink = $('#projectCopyLink');
  const projectPrint = $('#projectPrint');

  projectCopyLink?.addEventListener('click', async () => {
    const id = state.currentProject;
    if (!id) return;
    const url = `${window.location.origin}${window.location.pathname}${hashForProject(id)}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Case-study link copied');
    } catch {
      showToast('Copy failed — the link is in the address bar');
    }
  });

  // ---------- Print a single case study ----------
  projectPrint?.addEventListener('click', () => {
    body.classList.add('printing-case');
    const cleanup = () => {
      body.classList.remove('printing-case');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  });

  // ---------- UK local time ----------
  // Computed in the browser from the Europe/London zone. Nothing about the
  // visitor's own location or clock is read or transmitted.
  function initLocalTime() {
    const wrapper = $('#localTime');
    const value = $('#localTimeValue');
    const note = $('#localTimeNote');
    if (!wrapper || !value) return;

    let formatter;
    try {
      formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return; // Without zone support, leave the block hidden rather than guess.
    }

    const tick = () => {
      const now = new Date();
      value.textContent = formatter.format(now);
      value.setAttribute('datetime', now.toISOString());
      if (note) {
        const hour = Number(formatter.format(now).slice(0, 2));
        note.textContent = hour >= 9 && hour < 18 ? 'Usually available' : 'Outside usual hours';
      }
    };

    tick();
    wrapper.hidden = false;
    const timer = window.setInterval(tick, 30000);
    window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true });
  }
  initLocalTime();

  // ---------- Keyboard shortcuts overlay ----------
  const shortcutsDialog = $('#shortcutsDialog');
  const shortcutsClose = $('#shortcutsClose');

  function openShortcuts() {
    if (!shortcutsDialog || shortcutsDialog.open) return;
    shortcutsDialog.showModal();
    body.classList.add('dialog-open');
  }

  shortcutsClose?.addEventListener('click', () => shortcutsDialog?.close());
  shortcutsDialog?.addEventListener('click', (event) => {
    if (event.target === shortcutsDialog) shortcutsDialog.close();
  });
  shortcutsDialog?.addEventListener('close', () => {
    if (!projectDialog?.open && !commandDialog?.open) body.classList.remove('dialog-open');
    commandTrigger?.focus();
  });

  // "?" and a small set of single-key jumps. Suppressed while typing, while a
  // dialog is open and during the welcome panel.
  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (body.classList.contains('intro-active')) return;
    const target = event.target;
    const typing = target instanceof HTMLElement
      && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (typing) return;
    if (projectDialog?.open || commandDialog?.open) return;

    if (event.key === '?') {
      event.preventDefault();
      if (shortcutsDialog?.open) shortcutsDialog.close();
      else openShortcuts();
      return;
    }
    if (shortcutsDialog?.open) return;

    if (event.key.toLowerCase() === 't') {
      event.preventDefault();
      themeToggle?.click();
      return;
    }
    if (event.key.toLowerCase() === 'g') {
      state.awaitingJump = true;
      window.setTimeout(() => { state.awaitingJump = false; }, 1200);
      return;
    }
    if (state.awaitingJump) {
      const jumps = { p: '#projects', a: '#about', e: '#experience', c: '#contact', d: '#education', x: '#expertise' };
      const destination = jumps[event.key.toLowerCase()];
      state.awaitingJump = false;
      if (destination) {
        event.preventDefault();
        goToSection(destination);
      }
    }
  });

  // ---------- Pause animation outside the viewport ----------
  // The decorative loops (radar sweep, signal bars, marquees, pulses) are the
  // bulk of the animation budget. Anything scrolled out of view is paused, so
  // the page only ever animates what is actually on screen.
  function initIdleSections() {
    if (!('IntersectionObserver' in window)) return;
    const sections = $$('main > section, .proof-rail, .tool-marquee');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('section-idle', !entry.isIntersecting);
      });
    }, { rootMargin: '120px 0px' });

    // Deliberately not pre-marked idle: the observer's first callback arrives
    // within a frame or two, and starting from "paused" would leave content
    // frozen for good if that callback were ever delayed or dropped.
    sections.forEach((section) => observer.observe(section));
  }
  initIdleSections();

  // ---------- Designed motion: stagger choreography ----------
  // Grids and card rows resolve child-by-child instead of as one block.
  function initStagger() {
    const groups = $$('.projects-grid, .expertise-grid, .about-bento, .credentials-panel, .access-facts, .hero-metrics');
    if (!groups.length) return;

    groups.forEach((group) => group.classList.add('stagger'));

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      groups.forEach((group) => group.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    groups.forEach((group) => observer.observe(group));
  }
  initStagger();

  // ---------- Designed motion: scroll-linked parallax ----------
  // Writes a custom property only; the compositor sees a plain transform.
  function initParallax() {
    if (reducedMotion.matches || !finePointer.matches) return;

    const layers = [
      { el: $('.hero-console'), depth: 0.06 }
    ].filter((layer) => layer.el);
    if (!layers.length) return;

    layers.forEach((layer) => layer.el.classList.add('parallax'));

    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      layers.forEach((layer) => {
        layer.el.style.setProperty('--parallax-y', `${(-y * layer.depth).toFixed(2)}px`);
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }
  initParallax();

  // ---------- Designed motion: spring hover ----------
  function initSpring() {
    if (!finePointer.matches) return;
    $$('.project-card, .expertise-card, .credential-card, .timeline-card').forEach((card) => card.classList.add('spring'));
    $$('.primary-nav a, .contact-directory > a').forEach((link) => link.classList.add('wipe-link'));
  }
  initSpring();

  // ---------- Designed motion: self-drawing SVG strokes ----------
  function initDrawPaths() {
    // The project visuals are CSS-built shapes, so the only real inline SVG
    // artwork on the page is the identity mark on the welcome panel.
    const paths = $$('.identity-mark svg path, .project-visual svg path');
    if (!paths.length) return;

    paths.forEach((path) => {
      let length = 0;
      try { length = path.getTotalLength ? path.getTotalLength() : 0; } catch { length = 0; }
      if (!length || length > 4000) return;
      path.classList.add('draw-path');
      path.style.setProperty('--dash', String(Math.ceil(length)));
    });

    const drawable = $$('.draw-path');
    if (!drawable.length) return;

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      drawable.forEach((path) => path.classList.add('is-drawn'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-drawn');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    drawable.forEach((path) => observer.observe(path));
  }
  initDrawPaths();

  // ---------- Designed motion: section index rules ----------
  function initSectionRules() {
    const indices = $$('.section-index');
    if (!indices.length) return;

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      indices.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    indices.forEach((element) => observer.observe(element));
  }
  initSectionRules();

  // ---------- Year and safe fallback ----------
  const currentYear = $('#currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  // Ensure hash navigation closes menus and remains focusable.
  window.addEventListener('hashchange', closeMenu);

  // ---------- Offline shell ----------
  // Registered only over http(s); a file:// open has no service-worker scope.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {
        /* Offline support is an enhancement; failure must stay silent. */
      });
    });
  }

  // ---------- Restore a linked case study ----------
  // Runs last so the dialog and its data are fully wired first. A visitor
  // arriving on a case-study link skips the welcome panel.
  if (projectFromHash()) {
    completeIntro({ focusMain: false });
    requestAnimationFrame(restoreProjectFromHash);
  }
})();
