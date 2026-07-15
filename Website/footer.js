(function () {
  var product = [
    { href: 'index.html', label: 'Home' },
    { href: 'docs/', label: 'Documentation' },
    { href: 'docs/installation.html', label: 'Installation' },
    { href: 'docs/quick-start.html', label: 'Quick Start' },
    { href: 'docs/agents.html', label: 'Supported Agents' },
    { href: 'docs/yolo-mode.html', label: 'YOLO Mode' },
    { href: 'docs/theming.html', label: 'Theming' },
    { href: 'docs/troubleshooting.html', label: 'Troubleshooting' },
    { href: 'docs/faq.html', label: 'FAQ' }
  ];
  var resources = [
    { href: 'downloads.html', label: 'Downloads' },
    { href: 'privacy.html', label: 'Privacy Policy' },
    { href: 'https://github.com/MadBlast0/Cli-launcher', label: 'GitHub' },
    { href: 'https://github.com/MadBlast0/Cli-launcher/releases/latest', label: 'Releases' },
    { href: 'https://github.com/MadBlast0/Cli-launcher/issues', label: 'Report an Issue' }
  ];

  function col(title, items) {
    var out = '<div><div class="flex items-center gap-2 mb-4">' +
      '<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>' +
      '<span class="text-[11px] font-mono uppercase tracking-widest text-foreground/70">' + title + '</span>' +
      '</div><ul class="flex flex-col gap-2.5">';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var ext = it.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
      out += '<li>' +
        '<a href="' + it.href + '"' + ext + ' class="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200">' +
          '<span class="w-1 h-1 rounded-full bg-border group-hover:bg-primary group-hover:scale-125 transition-all duration-200"></span>' +
          '<span class="group-hover:translate-x-0.5 transition-transform duration-200">' + it.label + '</span>' +
        '</a></li>';
    }
    return out + '</ul></div>';
  }

  var ghIcon = '<svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z"/></svg>';

  var html = '' +
    '<footer class="mt-auto relative border-t border-border bg-gradient-to-b from-card/30 to-card/60">' +
      '<div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>' +
      '<div class="mx-auto max-w-6xl px-4 sm:px-6 py-12">' +
        '<div class="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">' +
          '<div class="col-span-2">' +
            '<div class="flex items-center gap-2.5 mb-4">' +
              '<span class="grid place-items-center w-9 h-9 rounded-lg bg-muted/60">' +
                '<img src="media/app-logo.png" alt="" class="w-6 h-6 object-contain">' +
              '</span>' +
              '<span class="text-sm font-bold font-mono tracking-widest uppercase text-foreground">CLI Launcher</span>' +
            '</div>' +
            '<p class="text-sm text-muted-foreground leading-relaxed max-w-[42ch]">The native desktop panel for 32+ terminal AI coding agents &mdash; install, launch, and manage them all from one place.</p>' +
            '<div class="mt-5 flex flex-wrap gap-2">' +
              '<span class="text-[11px] font-mono px-2.5 py-1 rounded-md border border-border bg-background/50 text-muted-foreground">32+ Agents</span>' +
              '<span class="text-[11px] font-mono px-2.5 py-1 rounded-md border border-border bg-background/50 text-muted-foreground">MIT License</span>' +
              '<span class="text-[11px] font-mono px-2.5 py-1 rounded-md border border-border bg-background/50 text-muted-foreground">Cross-platform</span>' +
            '</div>' +
          '</div>' +
          col('Explore', product) +
          col('Resources', resources) +
        '</div>' +
        '<div class="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">' +
          '<span>&copy; 2026 CLI Launcher. Built for developers.</span>' +
          '<div class="flex items-center gap-5">' +
            '<a href="#" id="clla-reopen" class="hover:text-foreground transition-colors cursor-pointer">Cookie settings</a>' +
            '<a href="https://github.com/MadBlast0/Cli-launcher" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">' + ghIcon + '<span>GitHub</span></a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</footer>';

  document.write(html);
})();
