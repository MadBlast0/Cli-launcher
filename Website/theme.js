/* Global site bootstrap — required on every page.
   Loaded synchronously in <head> so it runs before first paint.
   1) Trailing-slash normalization for clean URLs (e.g. /Website/downloads).
   2) Resolve saved/system theme before paint to prevent a flash. */
(function () {
  try {
    var p = location.pathname;
    if (p && !p.endsWith('/') && p.lastIndexOf('.') <= p.lastIndexOf('/')) {
      location.replace(p + '/');
    }
  } catch (e) {}

  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (!saved && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
