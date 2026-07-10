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
    fetchLatestRelease();
  } catch (e) {
    console.error('Error fetching latest release:', e);
  }

  try {
    initAppDemo();
  } catch (e) {
    console.error('Error initializing app demo:', e);
  }
});

/**
 * Interactive replica of the actual app window shown in the hero.
 * Search, launch counters, update flow, and theme all work for real.
 */
function initAppDemo() {
  const demo = document.getElementById('app-demo');
  const rowsEl = document.getElementById('demo-rows');
  if (!demo || !rowsEl) return;

  const clis = [
    { id: 'claude', name: 'Claude Code', version: '2.1.202 (Claude Code)', logo: 'media/cli/claude.svg' },
    { id: 'opencode', name: 'OpenCode', version: '1.17.15', logo: 'media/cli/opencode.svg' },
    { id: 'gemini', name: 'Gemini CLI', version: '0.21.3', logo: 'media/cli/gemini.svg', update: '0.22.0' },
    { id: 'copilot', name: 'GitHub Copilot CLI', version: '1.8.0', logo: 'media/cli/copilot.svg' },
    { id: 'kilo', name: 'Kilo CLI', version: 'installed', logo: 'media/cli/kilo.png' },
    { id: 'aider', name: 'Aider', version: '0.86.1', logo: 'media/cli/aider.png' },
  ];

  const ICONS = {
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="5" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="19" r="1.4"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>',
    spinner: '<svg class="demo-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.56"/></svg>',
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
  clis.forEach((cli) => {
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
  });

  // --- Search filter ----------------------------------------------------
  const searchInput = document.getElementById('demo-search-input');
  const installedCount = document.getElementById('demo-installed-count');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      let visible = 0;
      rowsEl.querySelectorAll('.demo-row').forEach((row) => {
        const match = row.dataset.name.indexOf(q) !== -1;
        row.classList.toggle('demo-hidden', !match);
        if (match) visible++;
      });
      if (installedCount) installedCount.textContent = String(visible);
    });
  }

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
  
  const primaryText = document.getElementById('primary-download-text');
  
  if (userAgent.indexOf('Win') !== -1 || platform.indexOf('Win') !== -1) {
    detectedOS = 'Windows';
    if (primaryText) primaryText.textContent = 'Download for Windows';
  } else if (userAgent.indexOf('Mac') !== -1 || platform.indexOf('Mac') !== -1) {
    detectedOS = 'macOS';
    if (primaryText) primaryText.textContent = 'Download for macOS';
  } else if (userAgent.indexOf('Linux') !== -1 || platform.indexOf('Linux') !== -1) {
    detectedOS = 'Linux';
    if (primaryText) primaryText.textContent = 'Download for Linux';
  }
}

/**
 * Fetch latest releases from GitHub API to populate direct download URLs
 */
function fetchLatestRelease() {
  const repoOwner = 'MadBlast0';
  const repoName = 'Cli-launcher';
  const apiURL = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;
  const defaultReleasePage = `https://github.com/${repoOwner}/${repoName}/releases/latest`;

  fetch(apiURL)
    .then(response => {
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    })
    .then(data => {
      const assets = data.assets || [];
      
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

      // Update primary CTA button based on detected OS
      const primaryBtn = document.getElementById('primary-download');
      if (primaryBtn) {
        if (detectedOS === 'Windows') {
          primaryBtn.href = winURL;
        } else if (detectedOS === 'macOS') {
          primaryBtn.href = macURL;
        } else if (detectedOS === 'Linux') {
          primaryBtn.href = linuxURL;
        }
      }
    })
    .catch(err => {
      console.warn('Could not fetch direct download links, falling back to release page.', err);
    });
}
