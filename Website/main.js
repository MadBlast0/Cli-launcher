// Main JavaScript file for CLI Launcher website

document.addEventListener('DOMContentLoaded', () => {
  try {
    initTheme();
  } catch (e) {
    console.error('Error initializing theme:', e);
  }
  
  try {
    detectOS();
  } catch (e) {
    console.error('Error detecting OS:', e);
  }

  try {
    initInstallSnippet();
  } catch (e) {
    console.error('Error initializing install snippet:', e);
  }
  
  try {
    fetchLatestRelease();
  } catch (e) {
    console.error('Error fetching latest release:', e);
  }

  try {
    initStarCounter();
  } catch (e) {
    console.error('Error initializing star counter:', e);
  }

  try {
    initInventoryTabs();
  } catch (e) {
    console.error('Error initializing inventory tabs:', e);
  }

  try {
    initYoloToggle();
  } catch (e) {
    console.error('Error initializing YOLO toggle:', e);
  }

  try {
    initAppDemo();
  } catch (e) {
    console.error('Error initializing app demo:', e);
  }

  try {
    initInventoryCopy();
  } catch (e) {
    console.error('Error initializing inventory copy:', e);
  }
});

/**
 * Copy helper with a fallback for non-secure contexts (file://).
 * Resolves to true on success.
 */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }
}

/** Lightweight global toast for copy / action feedback. */
let _toastEl = null;
let _toastTimer = null;
function showToast(msg) {
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    _toastEl.setAttribute('role', 'status');
    _toastEl.setAttribute('aria-live', 'polite');
    _toastEl.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(8px);'
      + 'z-index:60;background:var(--popover,#222);color:var(--popover-foreground,#f4f4f5);'
      + 'border:1px solid var(--border,#333);border-radius:10px;padding:10px 16px;'
      + 'font:600 13px/1.2 var(--font-mono,monospace);box-shadow:0 8px 24px rgba(0,0,0,.35);'
      + 'opacity:0;transition:opacity .18s ease, transform .18s ease;pointer-events:none;max-width:90vw;';
    document.body.appendChild(_toastEl);
  }
  _toastEl.textContent = msg;
  requestAnimationFrame(() => {
    _toastEl.style.opacity = '1';
    _toastEl.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    _toastEl.style.opacity = '0';
    _toastEl.style.transform = 'translateX(-50%) translateY(8px)';
  }, 1600);
}

/**
 * Make the inventory install snippets copy-to-clipboard (they carry data-copy).
 */
function initInventoryCopy() {
  const snippets = Array.from(document.querySelectorAll('.inv-snippet'));
  if (!snippets.length) return;
  snippets.forEach((el) => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Copy install command: ' + (el.getAttribute('data-copy') || el.textContent));
    el.title = 'Click to copy';
    const doCopy = async () => {
      const text = el.getAttribute('data-copy') || el.textContent;
      const ok = await copyText(text);
      el.classList.add('copied');
      setTimeout(() => el.classList.remove('copied'), 1400);
      showToast(ok ? 'Copied: ' + text : 'Copy failed');
    };
    el.addEventListener('click', doCopy);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCopy(); }
    });
  });
}

/**
 * Interactive replica of the actual app window shown in the hero.
 * Search, launch counters, update flow, catalog installs, the
 * dependency panel, and theme all work for real.
 */
function initAppDemo() {
  const demo = document.getElementById('app-demo');
  const rowsEl = document.getElementById('demo-rows');
  if (!demo || !rowsEl) return;

  // The demo is authored at the app's native 1100x660 (5:3) window size and
  // scaled to fit its container, so proportions match the real app exactly.
  const scaleEl = document.getElementById('demo-scale');
  if (scaleEl && typeof ResizeObserver !== 'undefined') {
    const fit = () => {
      scaleEl.style.transform = 'scale(' + (demo.clientWidth / 1100) + ')';
    };
    new ResizeObserver(fit).observe(demo);
    fit();
  }

  const clis = [
    { id: 'claude', name: 'Claude Code', version: '2.1.202 (Claude Code)', logo: 'media/cli/claude.svg' },
    { id: 'opencode', name: 'OpenCode', version: '1.17.15', logo: 'media/cli/opencode.svg' },
    { id: 'gemini', name: 'Gemini CLI', version: '0.21.3', logo: 'media/cli/gemini.svg', update: '0.22.0' },
    { id: 'copilot', name: 'GitHub Copilot CLI', version: '1.8.0', logo: 'media/cli/copilot.svg' },
    { id: 'kilo', name: 'Kilo CLI', version: 'installed', logo: 'media/cli/kilo.svg' },
    { id: 'aider', name: 'Aider', version: '0.86.1', logo: 'media/cli/aider.svg' },
  ];

  // Everything in the app's registry that isn't in the installed list above,
  // grouped like the real catalog (npm / pip / standalone).
  const catalog = [
    { id: 'codex', name: 'Codex CLI', version: '0.48.0', pkg: '@openai/codex', group: 'npm (Node.js)', logo: 'media/cli/codex.svg' },
    { id: 'qwen', name: 'Qwen Code', version: '0.12.1', pkg: '@qwen-code/qwen-code', group: 'npm (Node.js)', logo: 'media/cli/qwen.svg' },
    { id: 'amp', name: 'Amp CLI', version: '0.9.4', pkg: '@ampcode/cli', group: 'npm (Node.js)', logo: 'media/cli/amp.svg' },
    { id: 'cline', name: 'Cline', version: '2.3.0', pkg: 'cline', group: 'npm (Node.js)', logo: 'media/cli/cline.svg' },
    { id: 'cody', name: 'Cody CLI', version: '5.5.14', pkg: '@sourcegraph/cody', group: 'npm (Node.js)', logo: 'media/cli/cody.svg' },
    { id: 'codebuff', name: 'Codebuff', version: '1.2.8', pkg: 'codebuff', group: 'npm (Node.js)', logo: 'media/cli/codebuff.svg' },
    { id: 'freebuff', name: 'Freebuff', version: '0.4.1', pkg: 'freebuff', group: 'npm (Node.js)', logo: 'media/cli/freebuff.svg' },
    { id: 'commandcode', name: 'Command Code', version: '1.0.6', pkg: 'command-code', group: 'npm (Node.js)', logo: 'media/cli/commandcode.svg' },
    { id: 'continue', name: 'Continue CLI', version: '1.5.2', pkg: '@continuedev/cli', group: 'npm (Node.js)', logo: 'media/cli/continue.svg' },
    { id: 'crush', name: 'Crush', version: '0.7.0', pkg: '@charmland/crush', group: 'npm (Node.js)', logo: 'media/cli/crush.svg' },
    { id: 'auggie', name: 'Auggie', version: '0.9.1', pkg: '@augmentcode/auggie', group: 'npm (Node.js)', logo: 'media/cli/auggie.svg' },
    { id: 'grok', name: 'Grok CLI', version: '0.2.5', pkg: '@vibe-kit/grok-cli', group: 'npm (Node.js)', logo: 'media/cli/grok.svg' },
    { id: 'pi', name: 'PI Coding Agent', version: '0.6.0', pkg: '@mariozechner/pi-coding-agent', group: 'npm (Node.js)', logo: 'media/cli/pi.svg' },
    { id: 'sgpt', name: 'Shell-GPT', version: '1.4.5', pkg: 'shell-gpt', group: 'pip (Python)', logo: 'media/cli/sgpt.svg' },
    { id: 'gptme', name: 'gptme', version: '0.28.0', pkg: 'gptme', group: 'pip (Python)', logo: 'media/cli/gptme.svg' },
    { id: 'interpreter', name: 'Open Interpreter', version: '0.4.3', pkg: 'open-interpreter', group: 'pip (Python)', logo: 'media/cli/interpreter.svg' },
    { id: 'openhands', name: 'OpenHands CLI', version: '0.19.0', pkg: 'openhands-ai', group: 'pip (Python)', logo: 'media/cli/openhands.svg' },
    { id: 'ra-aid', name: 'RA.Aid', version: '0.15.2', pkg: 'ra-aid', group: 'pip (Python)', logo: 'media/cli/ra-aid.svg' },
    { id: 'goose', name: 'Goose CLI', version: '1.4.0', pkg: 'block/goose', group: 'Standalone', logo: 'media/cli/goose.svg' },
    { id: 'cursor', name: 'Cursor CLI', version: '0.3.2', pkg: 'cursor-agent', group: 'Standalone', logo: 'media/cli/cursor.svg' },
    { id: 'amazonq', name: 'Amazon Q Developer CLI', version: '1.6.0', pkg: 'amazon-q', group: 'Standalone', logo: 'media/cli/amazonq.svg' },
    { id: 'droid', name: 'Droid (Factory)', version: '0.8.2', pkg: 'factory.ai', group: 'Standalone', logo: 'media/cli/droid.svg' },
    { id: 'plandex', name: 'Plandex', version: '2.1.0', pkg: 'plandex-ai', group: 'Standalone', logo: 'media/cli/plandex.svg' },
    { id: 'mods', name: 'Mods', version: '1.7.0', pkg: 'charmbracelet/mods', group: 'Standalone', logo: 'media/cli/mods.svg' },
    { id: 'aichat', name: 'aichat', version: '0.29.0', pkg: 'sigoden/aichat', group: 'Standalone', logo: 'media/cli/aichat.svg' },
    { id: 'fabric', name: 'Fabric', version: '1.4.130', pkg: 'danielmiessler/fabric', group: 'Standalone', logo: 'media/cli/fabric.svg' },
  ];

  const ICONS = {
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="5" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="19" r="1.4"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>',
    spinner: '<svg class="demo-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.56"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  };

  // --- In-window toast -------------------------------------------------
  const toastEl = document.getElementById('demo-toast');
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('demo-toast-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('demo-toast-show'), 2200);
  }

  // --- Build rows -------------------------------------------------------
  function buildRow(cli) {
    const row = document.createElement('div');
    row.className = 'demo-row';
    row.dataset.name = cli.name.toLowerCase();

    row.innerHTML =
      '<span class="demo-grip" aria-hidden="true">' + ICONS.grip + '</span>' +
      '<span class="demo-row-logo"><img src="' + cli.logo + '" alt="" draggable="false"></span>' +
      '<span class="demo-row-info">' +
        '<span class="demo-row-name">' + cli.name + '</span>' +
        '<span class="demo-row-status"><span class="demo-status-dot"></span>' +
        '<span class="demo-row-version">' + cli.version + '</span></span>' +
      '</span>' +
      (cli.update ? '<button class="demo-update-btn" title="Update to ' + cli.update + '">' + ICONS.up + ' Update</button>' : '') +
      '<button class="demo-icon-btn" data-act="repair" title="Repair">' + ICONS.wrench + '</button>' +
      '<button class="demo-icon-btn" data-act="uninstall" title="Uninstall">' + ICONS.trash + '</button>' +
      '<span class="demo-counter">' +
        '<button data-act="dec" aria-label="Fewer terminals" disabled>' + ICONS.minus + '</button>' +
        '<span class="demo-count">1</span>' +
        '<button data-act="inc" aria-label="More terminals">' + ICONS.plus + '</button>' +
      '</span>' +
      '<button class="demo-open-btn">Open</button>';

    // Counter
    let count = 1;
    const countEl = row.querySelector('.demo-count');
    const decBtn = row.querySelector('[data-act="dec"]');
    const incBtn = row.querySelector('[data-act="inc"]');
    function setCount(n) {
      count = Math.min(9, Math.max(1, n));
      countEl.textContent = String(count);
      decBtn.disabled = count <= 1;
      incBtn.disabled = count >= 9;
    }
    decBtn.addEventListener('click', () => setCount(count - 1));
    incBtn.addEventListener('click', () => setCount(count + 1));

    // Open
    row.querySelector('.demo-open-btn').addEventListener('click', () => {
      toast(count > 1
        ? 'Opened ' + count + ' ' + cli.name + ' terminals'
        : 'Opened ' + cli.name + ' in a new terminal');
    });

    // Repair / uninstall (demo-safe)
    row.querySelector('[data-act="repair"]').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const original = btn.innerHTML;
      btn.innerHTML = ICONS.spinner;
      setTimeout(() => { btn.innerHTML = original; toast(cli.name + ' repair complete'); }, 900);
    });
    row.querySelector('[data-act="uninstall"]').addEventListener('click', () => {
      toast('Relax — it’s a demo. ' + cli.name + ' is safe.');
    });

    // Update flow
    const updateBtn = row.querySelector('.demo-update-btn');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        updateBtn.innerHTML = ICONS.spinner + ' Updating';
        updateBtn.style.pointerEvents = 'none';
        setTimeout(() => {
          updateBtn.remove();
          row.querySelector('.demo-row-version').textContent = cli.update;
          toast(cli.name + ' updated to ' + cli.update);
        }, 1400);
      });
    }

    rowsEl.appendChild(row);
  }
  clis.forEach(buildRow);

  // --- Search filter ----------------------------------------------------
  const searchInput = document.getElementById('demo-search-input');
  const installedCount = document.getElementById('demo-installed-count');
  function applySearch() {
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visible = 0;
    rowsEl.querySelectorAll('.demo-row').forEach((row) => {
      const match = row.dataset.name.indexOf(q) !== -1;
      row.classList.toggle('demo-hidden', !match);
      if (match) visible++;
    });
    if (installedCount) installedCount.textContent = String(visible);
  }
  if (searchInput) searchInput.addEventListener('input', applySearch);

  // --- In-window modal shell ---------------------------------------------
  const overlay = document.getElementById('demo-modal-overlay');
  const modal = document.getElementById('demo-modal');
  function closeModal() {
    if (overlay) overlay.hidden = true;
    if (modal) modal.innerHTML = '';
  }
  function openModal(title, bodyEl) {
    if (!overlay || !modal) return;
    modal.innerHTML =
      '<div class="demo-modal-head">' +
        '<span class="demo-modal-title">' + title + '</span>' +
        '<button class="demo-modal-close" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>';
    modal.appendChild(bodyEl);
    overlay.hidden = false;
    modal.querySelector('.demo-modal-close').addEventListener('click', closeModal);
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  }

  // --- Dependencies modal (replica of the app's DependencyModal) ---------
  function openDepsModal() {
    const body = document.createElement('div');
    body.className = 'demo-modal-body';
    const deps = [
      { name: 'Node.js', ver: 'v22.14.0' },
      { name: 'Python', ver: '3.12.6' },
    ];
    deps.forEach((d) => {
      const row = document.createElement('div');
      row.className = 'demo-dep-row';
      row.innerHTML =
        '<span class="demo-dep-left">' +
          '<span class="demo-dep-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
          '<span><span class="demo-dep-name">' + d.name + '</span><br><span class="demo-dep-ver">' + d.ver + '</span></span>' +
        '</span>' +
        '<span class="demo-badge">OK</span>';
      body.appendChild(row);
    });
    const close = document.createElement('button');
    close.className = 'demo-modal-footer-btn';
    close.textContent = 'Close';
    close.addEventListener('click', closeModal);
    body.appendChild(close);
    openModal('Dependencies', body);
  }

  // --- Catalog modal (replica of the app's CliCatalog) --------------------
  const installedFromCatalog = new Set();
  function openCatalogModal() {
    const body = document.createElement('div');
    body.className = 'demo-modal-body';

    const searchBox = document.createElement('div');
    searchBox.className = 'demo-cat-search';
    searchBox.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<input type="text" placeholder="Search..." aria-label="Search available CLIs (demo)">';
    body.appendChild(searchBox);

    const listWrap = document.createElement('div');
    body.appendChild(listWrap);

    function renderList(q) {
      listWrap.innerHTML = '';
      const available = catalog.filter((c) => !installedFromCatalog.has(c.id));
      const filtered = available.filter((c) => c.name.toLowerCase().indexOf(q) !== -1);
      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'demo-cat-empty';
        empty.textContent = q ? 'No CLIs match' : 'All CLIs are installed';
        listWrap.appendChild(empty);
        return;
      }
      const groups = {};
      filtered.forEach((c) => { (groups[c.group] = groups[c.group] || []).push(c); });
      Object.keys(groups).forEach((g) => {
        const head = document.createElement('div');
        head.className = 'demo-cat-group';
        head.textContent = g + '  ·  ' + groups[g].length;
        listWrap.appendChild(head);
        groups[g].forEach((c) => {
          const row = document.createElement('div');
          row.className = 'demo-cat-row';
          row.innerHTML =
            '<span class="demo-cat-logo"><img src="' + c.logo + '" alt="" draggable="false"></span>' +
            '<span class="demo-cat-info">' +
              '<span class="demo-cat-name">' + c.name + '</span>' +
              '<span class="demo-cat-pkg">' + c.pkg + '</span>' +
            '</span>' +
            '<button class="demo-install-btn" title="Install ' + c.name + '" aria-label="Install ' + c.name + '">' + ICONS.down + '</button>';
          const btn = row.querySelector('.demo-install-btn');
          btn.addEventListener('click', () => {
            btn.innerHTML = ICONS.spinner;
            btn.style.pointerEvents = 'none';
            setTimeout(() => {
              btn.innerHTML = ICONS.check;
              installedFromCatalog.add(c.id);
              row.classList.add('demo-leaving');
              setTimeout(() => {
                row.remove();
                buildRow({ id: c.id, name: c.name, version: c.version, logo: c.logo });
                applySearch();
                toast(c.name + ' installed successfully');
                if (listWrap.querySelectorAll('.demo-cat-row').length === 0) {
                  renderList(searchBox.querySelector('input').value.trim().toLowerCase());
                }
              }, 260);
            }, 1100);
          });
          listWrap.appendChild(row);
        });
      });
    }
    renderList('');
    searchBox.querySelector('input').addEventListener('input', (e) => {
      renderList(e.target.value.trim().toLowerCase());
    });

    openModal('Catalog', body);
  }

  const depsBtn = document.getElementById('demo-deps-btn');
  const catalogBtn = document.getElementById('demo-catalog-btn');
  if (depsBtn) depsBtn.addEventListener('click', openDepsModal);
  if (catalogBtn) catalogBtn.addEventListener('click', openCatalogModal);

  // Deep links (also handy for testing): #demo-catalog / #demo-deps
  if (location.hash === '#demo-catalog') openCatalogModal();
  if (location.hash === '#demo-deps') openDepsModal();

  // --- Theme toggle mirrors the site toggle ------------------------------
  const demoTheme = document.getElementById('demo-theme-toggle');
  const siteTheme = document.getElementById('theme-toggle');
  if (demoTheme && siteTheme) {
    demoTheme.addEventListener('click', () => siteTheme.click());
  }

  // --- Generic toast buttons (close, deps, catalog) ----------------------
  demo.querySelectorAll('[data-demo-toast]').forEach((btn) => {
    btn.addEventListener('click', () => toast(btn.getAttribute('data-demo-toast')));
  });
}

/**
 * Theme initialization and toggling
 */
function initTheme() {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  if (!toggleBtn || !sunIcon || !moonIcon) {
    console.warn('Theme toggle elements not found in the DOM.');
    return;
  }

  // Retrieve saved theme or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  
  if (isDark) {
    html.classList.add('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    html.classList.remove('dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }

  // Toggle button click listener
  toggleBtn.addEventListener('click', () => {
    // Add temporary transition class for smooth visual switch
    html.classList.add('theme-transition');
    
    const wasDark = html.classList.contains('dark');
    if (wasDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }

    // Clean up transition class
    setTimeout(() => {
      html.classList.remove('theme-transition');
    }, 250);
  });
}

/**
 * Detect user's Operating System and update primary CTA button
 */
let detectedOS = 'Windows'; // Default fallback

function detectOS() {
  const userAgent = window.navigator.userAgent || '';
  const platform = window.navigator.platform || '';
  
  const macBtn = document.getElementById('btn-download-mac');
  const winBtn = document.getElementById('btn-download-win');
  const linuxBtn = document.getElementById('btn-download-linux');

  if (userAgent.indexOf('Win') !== -1 || platform.indexOf('Win') !== -1) {
    detectedOS = 'Windows';
    if (winBtn) winBtn.classList.add('os-current');
  } else if (userAgent.indexOf('Mac') !== -1 || platform.indexOf('Mac') !== -1) {
    detectedOS = 'macOS';
    if (macBtn) macBtn.classList.add('os-current');
  } else if (userAgent.indexOf('Linux') !== -1 || platform.indexOf('Linux') !== -1) {
    detectedOS = 'Linux';
    if (linuxBtn) linuxBtn.classList.add('os-current');
  }
}

/**
 * Platform-aware one-line install command shown near the CTAs.
 * macOS/Linux -> curl|sh, Windows -> PowerShell irm|iex.
 */
function initInstallSnippet() {
  const cmdEl = document.getElementById('install-cmd');
  const copyEl = document.getElementById('install-copy');
  if (!cmdEl) return;

  const COMMANDS = {
    macOS: 'curl -fsSL https://cli-launcher.veyl.in/install.sh | sh',
    Linux: 'curl -fsSL https://cli-launcher.veyl.in/install.sh | sh',
    Windows: 'powershell -ExecutionPolicy Bypass -c "irm https://cli-launcher.veyl.in/install.ps1 | iex"'
  };
  const command = COMMANDS[detectedOS] || COMMANDS.Linux;
  cmdEl.textContent = command;

  if (copyEl) {
    copyEl.addEventListener('click', async () => {
      const done = () => {
        const original = 'Copy';
        copyEl.textContent = 'Copied';
        setTimeout(() => { copyEl.textContent = original; }, 1400);
      };
      try {
        await navigator.clipboard.writeText(command);
        done();
      } catch (e) {
        // Fallback for non-secure contexts (file://)
        const ta = document.createElement('textarea');
        ta.value = command;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }
}

/**
 * Live GitHub star counter (real-time metric beside install actions).
 * Resilient: caches the count in localStorage (24h) and never flashes a
 * bogus "0" — the 60/hr unauthenticated GitHub rate limit means most
 * visitors would otherwise hit the fallback on every load.
 */
function initStarCounter() {
  const repoOwner = 'MadBlast0';
  const repoName = 'Cli-launcher';
  const apiURL = `https://api.github.com/repos/${repoOwner}/${repoName}`;
  // Honest static fallback (real count at build time); the per-visitor cache
  // keeps it fresh without hammering the unauthenticated GitHub API.
  const STATIC_FALLBACK = 10;
  const CACHE_KEY = 'clla_stars';
  const DAY = 86400000;
  const els = [
    document.getElementById('star-count'),
    document.getElementById('star-count-2'),
  ].filter(Boolean);

  function paint(n) {
    if (n == null || isNaN(n)) return;
    const pretty = n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
    els.forEach((el) => {
      if (el.id === 'star-count-2') {
        el.textContent = pretty + ' stars';
      } else {
        el.textContent = pretty;
      }
    });
  }

  // 1) Paint something sensible immediately: cached value, else the fallback.
  //    No layout shift, no flash of "0"/"?".
  let cached = null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && typeof o.n === 'number' && Date.now() - o.ts < DAY) cached = o.n;
    }
  } catch (e) {}
  paint(cached != null ? cached : STATIC_FALLBACK);

  // 2) Refresh in the background and re-cache.
  fetch(apiURL)
    .then((r) => { if (!r.ok) throw new Error('API failed'); return r.json(); })
    .then((data) => {
      if (typeof data.stargazers_count === 'number') {
        paint(data.stargazers_count);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ n: data.stargazers_count, ts: Date.now() })); } catch (e) {}
        const btn = document.getElementById('github-star-btn');
        if (btn) btn.setAttribute('aria-label', 'Star on GitHub — ' + data.stargazers_count + ' stars');
      }
    })
    .catch((err) => {
      console.warn('Could not fetch GitHub star count.', err);
    });
}

/**
 * Runtime-based filtering for the Live Inventory grid.
 */
function initInventoryTabs() {
  const tabs = Array.from(document.querySelectorAll('.inv-tab'));
  const cards = Array.from(document.querySelectorAll('.inv-card'));
  if (!tabs.length || !cards.length) return;

  const counts = { all: cards.length, node: 0, python: 0, standalone: 0 };
  cards.forEach((c) => {
    const rt = c.getAttribute('data-runtime');
    if (counts[rt] !== undefined) counts[rt]++;
  });
  tabs.forEach((t) => {
    const rt = t.getAttribute('data-runtime');
    const badge = t.querySelector('.inv-tab-count');
    if (badge && counts[rt] !== undefined) badge.textContent = String(counts[rt]);
  });

  function activate(runtime) {
    tabs.forEach((t) => {
      const active = t.getAttribute('data-runtime') === runtime;
      t.classList.toggle('inv-tab-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    cards.forEach((c) => {
      const show = runtime === 'all' || c.getAttribute('data-runtime') === runtime;
      c.classList.toggle('inv-card-hidden', !show);
    });
  }

  tabs.forEach((t) => {
    t.addEventListener('click', () => activate(t.getAttribute('data-runtime')));
  });
}

/**
 * Interactive YOLO Mode mock: flips the switch and rewrites the injected
 * launch command for Claude Code to show the skip-permissions flag.
 */
function initYoloToggle() {
  const toggle = document.getElementById('yolo-toggle');
  const cmd = document.getElementById('yolo-cmd');
  const status = document.getElementById('yolo-status');
  if (!toggle) return;

  const ON = 'claude --dangerously-skip-permissions';
  const OFF = 'claude';

  function render(on) {
    toggle.setAttribute('aria-checked', on ? 'true' : 'false');
    toggle.dataset.state = on ? 'on' : 'off';
    if (cmd) cmd.textContent = on ? ON : OFF;
    if (status) {
      status.textContent = on
        ? 'On — auto-approves every action (--dangerously-skip-permissions)'
        : 'Off — prompts every action';
    }
  }

  toggle.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-checked') !== 'true';
    render(on);
  });

  // Allow keyboard toggle via space/enter (native button handles this)
  render(false);
}

/**
 * Fetch latest releases from GitHub API to populate direct download URLs
 */
function fetchLatestRelease() {
  const repoOwner = 'MadBlast0';
  const repoName = 'Cli-launcher';
  const apiURL = `https://api.github.com/repos/${repoOwner}/${repoName}/releases?per_page=100`;
  const defaultReleasePage = `https://github.com/${repoOwner}/${repoName}/releases`;
  // Honest static fallback (current release at build time); the per-visitor
  // cache + live tag_name keep it fresh when the API is reachable.
  const STATIC_VERSION = 'v0.0.3';

  fetch(apiURL)
    .then(response => {
      if (!response.ok) throw new Error('API request failed: ' + response.status);
      return response.json();
    })
    .then(releases => {
      if (!Array.isArray(releases) || !releases.length) throw new Error('No releases');
      // Prefer the newest published (non-draft, non-prerelease) release; if every
      // release is a prerelease/draft, fall back to the newest overall.
      const published = releases.filter(r => !r.draft && !r.prerelease);
      const data = published[0] || releases[0];
      const assets = data.assets || [];

      // Latest-version badge (from the release tag_name)
      const badge = document.getElementById('version-badge');
      if (badge && data.tag_name) {
        const v = String(data.tag_name).replace(/^v/i, '');
        const label = 'v' + v;
        badge.textContent = label;
        try { localStorage.setItem('clla_version', JSON.stringify({ v: label, ts: Date.now() })); } catch (e) {}
      }

      let winURL = defaultReleasePage;
      let macURL = defaultReleasePage;
      let linuxURL = defaultReleasePage;

      // Get page-specific links (for downloads.html)
      const winMsi = document.getElementById('win-msi-link');
      const winExe = document.getElementById('win-exe-link');
      const winPortable = document.getElementById('win-portable-link');
      
      const macDmgUniversal = document.getElementById('mac-dmg-universal-link');
      const macDmgArm64 = document.getElementById('mac-dmg-arm64-link');
      const macDmgX64 = document.getElementById('mac-dmg-x64-link');
      const macZipUniversal = document.getElementById('mac-zip-universal-link');
      
      const linuxAppImage = document.getElementById('linux-appimage-link');
      const linuxDeb = document.getElementById('linux-deb-link');
      const linuxRpm = document.getElementById('linux-rpm-link');
      const linuxTar = document.getElementById('linux-tar-link');

      // Scan release assets for correct platform installers
      assets.forEach(asset => {
        const name = (asset.name || '').toLowerCase();
        const url = asset.browser_download_url;

        // Windows: installer, NSIS, or portable exe
        if (name.endsWith('.msi')) {
          if (winMsi) winMsi.href = url;
          if (winURL === defaultReleasePage) winURL = url;
        } else if (name.endsWith('.exe')) {
          if (name.includes('portable')) {
            if (winPortable) winPortable.href = url;
          } else {
            if (winExe) winExe.href = url;
            if (winURL === defaultReleasePage) winURL = url;
          }
        }

        // macOS: DMG universal, arm64, x64, or ZIP universal
        if (name.endsWith('.dmg')) {
          if (name.includes('universal')) {
            if (macDmgUniversal) macDmgUniversal.href = url;
            macURL = url; // preferred for main page CTA
          } else if (name.includes('arm64') || name.includes('silicon')) {
            if (macDmgArm64) macDmgArm64.href = url;
          } else if (name.includes('x64') || name.includes('intel')) {
            if (macDmgX64) macDmgX64.href = url;
          }
          if (macURL === defaultReleasePage) macURL = url;
        } else if (name.endsWith('.zip')) {
          if (name.includes('universal') || name.includes('mac')) {
            if (macZipUniversal) macZipUniversal.href = url;
          }
        }

        // Linux: AppImage, deb, rpm, or tarball
        if (name.endsWith('.appimage')) {
          if (linuxAppImage) linuxAppImage.href = url;
          if (linuxURL === defaultReleasePage) linuxURL = url;
        } else if (name.endsWith('.deb')) {
          if (linuxDeb) linuxDeb.href = url;
          if (linuxURL === defaultReleasePage) linuxURL = url;
        } else if (name.endsWith('.rpm')) {
          if (linuxRpm) linuxRpm.href = url;
        } else if (name.endsWith('.tar.gz')) {
          if (linuxTar) linuxTar.href = url;
        }
      });

      // Update specific index.html platform link elements
      const winEl = document.getElementById('win-download-link');
      const macEl = document.getElementById('mac-download-link');
      const linuxEl = document.getElementById('linux-download-link');

      if (winEl && winURL !== defaultReleasePage) winEl.href = winURL;
      if (macEl && macURL !== defaultReleasePage) macEl.href = macURL;
      if (linuxEl && linuxURL !== defaultReleasePage) linuxEl.href = linuxURL;

      // Update the three hero platform buttons
      const macBtn = document.getElementById('btn-download-mac');
      const winBtn = document.getElementById('btn-download-win');
      const linuxBtn = document.getElementById('btn-download-linux');

      if (macBtn && macURL !== defaultReleasePage) macBtn.href = macURL;
      if (winBtn && winURL !== defaultReleasePage) winBtn.href = winURL;
      if (linuxBtn && linuxURL !== defaultReleasePage) linuxBtn.href = linuxURL;

      // Point the current-platform button at its exact asset
      if (detectedOS === 'Windows' && winBtn && winURL !== defaultReleasePage) {
        winBtn.href = winURL;
      } else if (detectedOS === 'macOS' && macBtn && macURL !== defaultReleasePage) {
        macBtn.href = macURL;
      } else if (detectedOS === 'Linux' && linuxBtn && linuxURL !== defaultReleasePage) {
        linuxBtn.href = linuxURL;
      }
    })
    .catch(err => {
      console.warn('Could not fetch latest release, falling back to cached/static version.', err);
      const badge = document.getElementById('version-badge');
      if (badge) {
        let shown = false;
        try {
          const cached = JSON.parse(localStorage.getItem('clla_version') || 'null');
          if (cached && cached.v) { badge.textContent = cached.v; shown = true; }
        } catch (e) {}
        if (!shown) badge.textContent = STATIC_VERSION;
      }
    });
}
