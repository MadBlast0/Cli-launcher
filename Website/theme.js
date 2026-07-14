/* Global site bootstrap — required on every page.
   Loaded synchronously in <head> so it runs before first paint.
   1) Trailing-slash normalization for clean URLs (e.g. /Website/downloads).
   2) Resolve saved/system theme before paint to prevent a flash.
      Theme preference is persisted in a real cookie (clla_theme) so it
      survives navigation across pages; localStorage is a fallback. */
(function () {
  try {
    var p = location.pathname;
    if (p && !p.endsWith('/') && p.lastIndexOf('.') <= p.lastIndexOf('/')) {
      location.replace(p + '/');
    }
  } catch (e) {}

  function getCookie(name) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }
  function setCookie(name, value, days) {
    var maxAge = (days || 365) * 24 * 3600;
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + maxAge + '; SameSite=Lax' + secure;
  }
  // Exposed so main.js can persist the choice when the toggle is clicked.
  window.CLLASetThemeCookie = function (val) { setCookie('clla_theme', val); };

  var saved = getCookie('clla_theme');
  if (!saved) {
    try { saved = localStorage.getItem('theme'); } catch (e) { saved = null; }
  }
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = saved === 'dark' || (!saved && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
})();
