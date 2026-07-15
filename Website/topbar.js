/* Global topbar — identical on every page.
   Injected via document.write during parse so it appears in source order
   (no flash, no layout shift) and resolves relative assets against <base>.
   The active primary link (Docs / Downloads) is highlighted per URL. */
(function () {
  var path = location.pathname || '';
  var isDocs = path.indexOf('docs') !== -1;
  var isDl = path.indexOf('downloads') !== -1;

  function navLink(href, label, active) {
    var cls = 'hover:text-foreground transition-colors ' + (active ? 'text-foreground' : 'text-muted-foreground');
    return '<a href="' + href + '" class="' + cls + '">' + label + '</a>';
  }

  var sunSvg =
    '<svg id="sun-icon" class="hidden w-4 h-4 text-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="4"></circle>' +
      '<path d="M12 2v2"></path><path d="M12 20v2"></path>' +
      '<path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path>' +
      '<path d="M2 12h2"></path><path d="M20 12h2"></path>' +
      '<path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>' +
    '</svg>';

  var moonSvg =
    '<svg id="moon-icon" class="w-4 h-4 text-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>' +
    '</svg>';

  var html =
    '<header class="w-full border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40 h-14 flex items-center justify-between px-6 select-none">' +
      '<a href="index.html" class="flex items-center gap-2.5 focus-visible:outline-none">' +
        '<img src="media/app-logo.png" alt="CLI Launcher Logo" class="w-6 h-6 object-contain">' +
        '<span class="text-xs font-bold font-mono tracking-widest uppercase text-foreground">CLI Launcher</span>' +
      '</a>' +
      '<nav class="flex items-center gap-5 sm:gap-6 text-xs font-bold font-mono">' +
        navLink('docs/', 'Docs', isDocs) +
        navLink('downloads.html', 'Downloads', isDl) +
        '<a href="index.html#inventory" class="hidden sm:inline hover:text-foreground text-muted-foreground transition-colors">Agents</a>' +
        '<a href="docs/yolo-mode.html" class="hidden sm:inline hover:text-foreground text-muted-foreground transition-colors">YOLO</a>' +
        '<a href="https://github.com/MadBlast0/Cli-launcher" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 rounded-none bg-zinc-900 text-white px-2.5 py-1 border border-white/10 hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-900 dark:border-black/10 dark:hover:bg-zinc-100">' +
          '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>' +
          'GitHub' +
        '</a>' +
        '<button id="theme-toggle" class="mac-btn mac-btn-soft mac-btn-icon w-8 h-8 flex items-center justify-center border border-border focus-visible:outline-none" aria-label="Toggle theme">' +
          sunSvg + moonSvg +
        '</button>' +
      '</nav>' +
    '</header>';

  document.write(html);
})();
