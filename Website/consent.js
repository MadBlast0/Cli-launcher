/* Cookie consent — required on every page (loaded in <head>).
   Shows a banner on first visit with Accept all / Reject all / Customize.
   Customize exposes per-category toggles; "Strictly necessary" is always on,
   so Reject all = necessary-only. Choice is cached in localStorage and can be
   re-opened via window.CLLAConsent.open(). Other scripts (main.js) read the
   saved categories to decide what they may persist or fetch. */
(function () {
  var KEY = 'clla_consent';

  var CATS = [
    { id: 'necessary',   label: 'Strictly necessary', locked: true,
      desc: 'Required for the site to work and to remember your choices. Always on.' },
    { id: 'preferences', label: 'Preferences',
      desc: 'Remembers your theme (light/dark) and UI settings across visits.' },
    { id: 'analytics',   label: 'Analytics',
      desc: 'Anonymous usage stats, such as the live GitHub star count, to help improve the product.' }
  ];

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
  function read() {
    // Primary: a real HTTP cookie. Fallback: localStorage mirror.
    var raw = getCookie(KEY);
    if (raw) { try { return JSON.parse(raw); } catch (e) {} }
    try { var ls = localStorage.getItem(KEY); if (ls) return JSON.parse(ls); } catch (e) {}
    return null;
  }
  function write(val) {
    var str = JSON.stringify(val);
    // Actual working cookie sent with every request to the site.
    setCookie(KEY, str);
    // Mirror in localStorage so the banner still works without cookie access.
    try { localStorage.setItem(KEY, str); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('clla-consent-change', { detail: val })); } catch (e) {}
  }
  function fresh() {
    var v = { ts: Date.now() };
    CATS.forEach(function (c) { v[c.id] = c.locked ? true : false; });
    return v;
  }
  function has() { var v = read(); return !!(v && v.ts); }

  window.CLLAConsent = {
    get: read,
    has: has,
    open: showBanner
  };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function makeSwitch(checked, disabled, onChange) {
    var sw = el('button', 'relative w-10 h-5 border border-border-strong flex-shrink-0 ' +
      (checked ? 'bg-foreground' : 'bg-secondary') + (disabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer'));
    sw.type = 'button';
    sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', checked ? 'true' : 'false');
    sw.style.cssText += 'transition:background-color .15s ease;';
    var knob = el('span', 'block w-3.5 h-3.5 ' + (checked ? 'bg-background' : 'bg-foreground'));
    knob.style.cssText = 'position:absolute;top:2px;left:2px;transition:transform .15s ease;' + (checked ? 'transform:translateX(20px);' : '');
    sw.appendChild(knob);
    if (!disabled) {
      sw.addEventListener('click', function () {
        checked = !checked;
        sw.setAttribute('aria-checked', checked ? 'true' : 'false');
        sw.className = 'relative w-10 h-5 border border-border-strong flex-shrink-0 ' +
          (checked ? 'bg-foreground' : 'bg-secondary') + ' cursor-pointer';
        knob.className = 'block w-3.5 h-3.5 ' + (checked ? 'bg-background' : 'bg-foreground');
        knob.style.cssText = 'position:absolute;top:2px;left:2px;transition:transform .15s ease;' + (checked ? 'transform:translateX(20px);' : '');
        if (onChange) onChange(checked);
      });
    }
    return sw;
  }

  function showBanner() {
    if (document.getElementById('clla-consent')) return;
    var existing = read();
    var draft = existing ? JSON.parse(JSON.stringify(existing)) : fresh();

    var root = el('div', 'fixed inset-x-0 bottom-0 z-[60] p-4 flex justify-end pointer-events-none');
    root.id = 'clla-consent';
    var card = el('div', 'pointer-events-auto w-full max-w-sm mac-surface border border-border-strong p-4 sm:p-5');
    root.appendChild(card);
    document.body.appendChild(root);

    function renderCollapsed() {
      card.innerHTML = '';
      var row = el('div', 'flex flex-col sm:flex-row sm:items-center gap-4');
      var info = el('div', 'flex-1');
      info.appendChild(el('div', 'text-sm font-bold font-mono uppercase tracking-wider text-foreground mb-1', 'Cookies'));
      info.appendChild(el('p', 'text-xs text-muted-foreground leading-relaxed',
        'We use cookies to remember your preferences (like theme) and to understand anonymous usage. ' +
        'Choose what to allow — you can change this any time.'));
      var learn = el('a', 'text-xs text-primary hover:underline mt-1 inline-block', 'Read our Privacy Policy');
      learn.href = 'privacy.html';
      info.appendChild(learn);
      row.appendChild(info);
      var actions = el('div', 'flex flex-wrap gap-2 sm:flex-col sm:items-stretch');
      var accept = el('button', 'mac-btn mac-btn-primary px-3 py-2 text-xs', 'Accept all'); accept.id = 'clla-accept';
      var reject = el('button', 'mac-btn mac-btn-soft px-3 py-2 text-xs', 'Reject all'); reject.id = 'clla-reject';
      var custom = el('button', 'mac-btn mac-btn-soft px-3 py-2 text-xs', 'Customize'); custom.id = 'clla-custom';
      actions.appendChild(accept); actions.appendChild(reject); actions.appendChild(custom);
      row.appendChild(actions);
      card.appendChild(row);

      accept.addEventListener('click', function () { saveAll(true); });
      reject.addEventListener('click', function () { saveAll(false); });
      custom.addEventListener('click', renderCustom);
    }

    function renderCustom() {
      card.innerHTML = '';
      card.appendChild(el('div', 'text-sm font-bold font-mono uppercase tracking-wider text-foreground', 'Customize cookies'));
      card.appendChild(el('p', 'text-xs text-muted-foreground mt-1 mb-3',
        'Toggle each category. "Strictly necessary" is always required.'));
      var list = el('div', 'flex flex-col gap-3');
      CATS.forEach(function (c) {
        var item = el('div', 'flex items-start justify-between gap-4 border border-border p-3');
        var text = el('div', 'min-w-0');
        text.appendChild(el('div', 'text-sm font-semibold text-foreground', c.label + (c.locked ? ' <span class="text-[10px] font-mono uppercase text-muted-foreground">(always on)</span>' : '')));
        text.appendChild(el('p', 'text-xs text-muted-foreground leading-relaxed mt-0.5', c.desc));
        item.appendChild(text);
        var sw = makeSwitch(draft[c.id], !!c.locked, function (val) { draft[c.id] = val; });
        item.appendChild(sw);
        list.appendChild(item);
      });
      card.appendChild(list);
      var actions = el('div', 'flex flex-wrap gap-2 justify-end mt-4');
      var save = el('button', 'mac-btn mac-btn-primary px-3 py-2 text-xs', 'Save preferences'); save.id = 'clla-save';
      var accept2 = el('button', 'mac-btn mac-btn-soft px-3 py-2 text-xs', 'Accept all'); accept2.id = 'clla-accept2';
      var reject2 = el('button', 'mac-btn mac-btn-soft px-3 py-2 text-xs', 'Reject all'); reject2.id = 'clla-reject2';
      actions.appendChild(save); actions.appendChild(accept2); actions.appendChild(reject2);
      card.appendChild(actions);
      save.addEventListener('click', function () { persist(draft); });
      accept2.addEventListener('click', function () { saveAll(true); });
      reject2.addEventListener('click', function () { saveAll(false); });
    }

    function saveAll(on) {
      var v = { ts: Date.now() };
      CATS.forEach(function (c) { v[c.id] = c.locked ? true : on; });
      persist(v);
    }
    function persist(v) {
      write(v);
      if (root && root.parentNode) root.parentNode.removeChild(root);
    }

    renderCollapsed();
  }

  function init() {
    if (!has()) showBanner();
    // Allow re-opening from any "Cookie settings" link on the page.
    var reopener = document.getElementById('clla-reopen');
    if (reopener) {
      reopener.addEventListener('click', function (e) { e.preventDefault(); showBanner(); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
