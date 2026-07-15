/* Shared documentation navigation for every /docs/* page.
   Defines window.DocsNav with:
     - sidebar()  : desktop left nav (lg+)
     - mobileBar(): mobile sub-header + slide-in drawer (< lg)
     - prevNext() : previous/next page navigation
   All pages also include <script src="docs-nav.js"></script> so the
   DOMContentLoaded handler below can wire the mobile drawer toggle. */

window.DocsNav = (function () {
  // Order matters: drives the prev/next pager and the linear reading flow.
  var PAGES = [
    { id: 'index',          href: 'docs/',                       label: 'Overview',         group: 'Start here' },
    { id: 'installation',   href: 'docs/installation.html',      label: 'Installation',     group: 'Start here' },
    { id: 'quick-start',    href: 'docs/quick-start.html',       label: 'Quick Start',      group: 'Start here' },
    { id: 'agents',         href: 'docs/agents.html',            label: 'Supported Agents', group: 'Using CLI Launcher' },
    { id: 'yolo-mode',      href: 'docs/yolo-mode.html',         label: 'YOLO Mode',        group: 'Using CLI Launcher' },
    { id: 'theming',        href: 'docs/theming.html',           label: 'Theming',          group: 'Using CLI Launcher' },
    { id: 'troubleshooting',href: 'docs/troubleshooting.html',   label: 'Troubleshooting',  group: 'Help' },
    { id: 'faq',            href: 'docs/faq.html',               label: 'FAQ',              group: 'Help' }
  ];

  function currentId() {
    var base = (location.pathname || '').replace(/\/+$/, '');
    var seg = base.substring(base.lastIndexOf('/') + 1).replace(/\.html$/, '');
    if (seg === '' || seg === 'docs' || seg === 'index') return 'index';
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].id === seg) return seg;
    }
    return 'index';
  }

  var cur = currentId();
  var idx = 0;
  for (var i = 0; i < PAGES.length; i++) { if (PAGES[i].id === cur) { idx = i; break; } }

  function navList() {
    var groups = {};
    PAGES.forEach(function (p) { (groups[p.group] = groups[p.group] || []).push(p); });
    var html = '';
    Object.keys(groups).forEach(function (g) {
      html += '<div class="mb-6">';
      html += '<div class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 px-3 mb-2">' + g + '</div>';
      groups[g].forEach(function (p) {
        var active = p.id === cur;
        html += '<a href="' + p.href + '" class="block px-3 py-1.5 text-sm border-l-2 transition-colors ' +
          (active
            ? 'border-foreground text-foreground bg-accent-soft font-semibold'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent-soft/50') +
          '">' + p.label + '</a>';
      });
      html += '</div>';
    });
    html += '<div class="mb-2">' +
      '<div class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 px-3 mb-2">Legal</div>' +
      '<a href="privacy.html" class="block px-3 py-1.5 text-sm border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-accent-soft/50 transition-colors">Privacy Policy</a>' +
      '</div>';
    return html;
  }

  function sidebar() {
    document.write(
      '<aside class="hidden lg:block w-64 shrink-0 border-r border-border self-start sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-2">' +
        '<nav class="flex flex-col gap-1" aria-label="Documentation navigation">' + navList() + '</nav>' +
      '</aside>'
    );
  }

  function mobileBar() {
    var label = PAGES[idx] ? PAGES[idx].label : '';
    document.write(
      '<div class="lg:hidden sticky top-14 z-30 border-b border-border bg-card/90 backdrop-blur-md">' +
        '<div class="flex items-center justify-between px-4 h-12">' +
          '<button id="docs-menu-btn" type="button" class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" aria-expanded="false" aria-controls="docs-drawer">' +
            '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
            'Menu' +
          '</button>' +
          '<span class="text-[11px] font-mono text-muted-foreground">' + label + '</span>' +
        '</div>' +
      '</div>' +
      '<div id="docs-overlay" class="lg:hidden fixed inset-0 z-40 bg-black/50 hidden" aria-hidden="true"></div>' +
      '<aside id="docs-drawer" class="lg:hidden fixed top-0 left-0 z-50 h-full w-72 max-w-[82vw] bg-card border-r border-border overflow-y-auto py-6 px-2 -translate-x-full transition-transform duration-200" aria-label="Documentation navigation" aria-hidden="true">' +
        '<div class="flex items-center justify-between px-3 mb-5">' +
          '<span class="text-xs font-mono uppercase tracking-widest text-muted-foreground">Documentation</span>' +
          '<button id="docs-close-btn" type="button" class="text-muted-foreground hover:text-foreground p-1" aria-label="Close menu">' +
            '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<nav class="flex flex-col gap-1">' + navList() + '</nav>' +
      '</aside>'
    );
  }

  function prevNext() {
    var prev = PAGES[idx - 1];
    var next = PAGES[idx + 1];
    var html = '<nav class="mt-14 pt-6 border-t border-border flex items-stretch justify-between gap-4" aria-label="Pagination">';
    if (prev) {
      html += '<a href="' + prev.href + '" class="group flex flex-col items-start text-left min-w-0">' +
        '<span class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Previous</span>' +
        '<span class="text-sm font-semibold text-foreground group-hover:underline truncate">' + prev.label + '</span></a>';
    } else {
      html += '<span></span>';
    }
    if (next) {
      html += '<a href="' + next.href + '" class="group flex flex-col items-end text-right min-w-0">' +
        '<span class="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Next</span>' +
        '<span class="text-sm font-semibold text-foreground group-hover:underline truncate">' + next.label + '</span></a>';
    } else {
      html += '<span></span>';
    }
    html += '</nav>';
    document.write(html);
  }

  return { sidebar: sidebar, mobileBar: mobileBar, prevNext: prevNext, PAGES: PAGES };
})();

/* Wire the mobile drawer toggle once the DOM is parsed. */
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('docs-menu-btn');
  var close = document.getElementById('docs-close-btn');
  var drawer = document.getElementById('docs-drawer');
  var overlay = document.getElementById('docs-overlay');

  function open() {
    if (!drawer) return;
    drawer.classList.remove('-translate-x-full');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.remove('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function hide() {
    if (!drawer) return;
    drawer.classList.add('-translate-x-full');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (btn) btn.addEventListener('click', open);
  if (close) close.addEventListener('click', hide);
  if (overlay) overlay.addEventListener('click', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

  // Close the drawer after navigating via an in-drawer link.
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', hide);
    });
  }
});
