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
});

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
