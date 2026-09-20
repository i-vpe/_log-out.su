(function () {
  var mount = document.querySelector('[data-include="footer"]');
  if (!mount || !window.SITE) return;
  var footer = document.createElement('footer'); footer.className = 'site-footer';
  var name = document.createElement('span'); name.textContent = window.SITE.name || ''; footer.append(name);
  var phone = String(window.SITE.phone || '').replace(/[^\d+]/g, '');
  if (phone) {
    var a = document.createElement('a'); a.href = 'tel:' + phone; a.textContent = window.SITE.phone; footer.append(a);
  }
  var year = document.createElement('span'); year.textContent = String(new Date().getFullYear()); footer.append(year);
  mount.replaceChildren(footer);
})();
