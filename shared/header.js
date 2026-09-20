// Общая шапка; работает и при открытии файла с диска.
(function () {
  var mount = document.querySelector('[data-include="header"]');
  if (!mount || !window.SITE) return;
  var root = mount.getAttribute('data-root') || '.';
  var site = window.SITE;
  function safeUrl(value) {
    var raw = String(value || '').trim();
    if (!raw || /[\u0000-\u0020]/.test(raw)) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^(https?:|mailto:|tel:)/i.test(raw)) return '';
    if (/^(?:https?:|mailto:|tel:|#|\/)/i.test(raw)) return raw;
    return root + '/' + raw;
  }
  function link(text, href, className) {
    var a = document.createElement('a');
    a.textContent = text || '';
    var url = safeUrl(href);
    if (url) a.setAttribute('href', url);
    if (className) a.className = className;
    return a;
  }
  var header = document.createElement('header'); header.className = 'site-header';
  header.append(link(site.name, 'index.html', 'site-header__name'));
  var nav = document.createElement('nav'); nav.className = 'site-header__nav'; nav.setAttribute('aria-label', 'Основное меню');
  (site.menu || []).forEach(function (item) { nav.append(link(item.title, item.href)); });
  header.append(nav);
  if (safeUrl(site.contactUrl)) header.append(link(site.contactLabel, site.contactUrl, 'button button--small'));
  mount.replaceChildren(header);
})();
