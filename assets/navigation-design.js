(function () {
  'use strict';
  const viewKey = 'seubme_navigation_view_v1';
  let view = 'cards';
  try { if (localStorage.getItem(viewKey) === 'tiles') view = 'tiles'; } catch {}
  document.documentElement.dataset.navView = view;
  const paths = {
    academic: '<path d="M4 4h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v15h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4z"/><path d="M12 5v15"/>',
    life: '<path d="M4 10h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 11h2a3 3 0 0 1 0 6h-2M8 3v3M13 3v3"/>',
    service: '<rect x="4" y="7" width="16" height="14" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 12a20 20 0 0 0 16 0M12 12v4"/>',
    resource: '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    favorite: '<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.5l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z"/>',
    link: '<path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0) scale(.92)"/>',
    campus: '<path d="m3 9 9-6 9 6M5 10v9M10 10v9M14 10v9M19 10v9M3 21h18"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3M14 15h3"/>',
    charging: '<path d="m13 2-8 12h6l-1 8 9-13h-7z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
    cloud: '<path d="M7 19a5 5 0 1 1 0-10 6 6 0 0 1 12-1 5.5 5.5 0 0 1 0 11z"/>',
    transport: '<rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 10h14M8 19v2M16 19v2M8 15h1M15 15h1"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'
  };
  paths.cards = '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 7.5h2M7 17.5h2"/>';
  function icon(kind, className) {
    const span = document.createElement('span');
    span.className = className;
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + (paths[kind] || paths.grid) + '</svg>';
    return span;
  }
  function decorateSection(section, kind) {
    const heading = section.querySelector('.sec-head');
    if (heading && !heading.querySelector('.sec-icon')) heading.prepend(icon(kind, 'sec-icon'));
  }
  function cardKind(card) {
    if (card.classList.contains('favorite-site')) return card.querySelector('.site-icon')?.dataset.kind || 'link';
    const title = card.querySelector('.link-title').textContent;
    if (/校历/.test(title)) return 'calendar';
    if (/充电/.test(title)) return 'charging';
    if (/接驳|校车/.test(title)) return 'transport';
    if (/邮箱/.test(title)) return 'mail';
    if (/云/.test(title)) return 'cloud';
    if (/大学|学院|研究生院/.test(title) && /官网|官方网站/.test(card.querySelector('.link-desc').textContent)) return 'campus';
    if (/图书|课程|课堂|MOOC|选课|讲座/.test(title)) return 'academic';
    return card.dataset.customSiteId ? 'link' : card.dataset.category;
  }
  function decorateCard(card) {
    if (card.dataset.sharedProject) return;
    const link = card.querySelector('a');
    const kind = cardKind(card);
    const existing = link.querySelector('.site-icon');
    if (existing?.dataset.kind !== kind) {
      const mark = icon(kind, 'site-icon');mark.dataset.kind = kind;
      if (existing) existing.replaceWith(mark); else link.prepend(mark);
    }
    let details = card.querySelector('.site-details');
    if (!details) {
      details = document.createElement('details');details.className = 'site-details';
      const summary = document.createElement('summary');summary.textContent = '查看详情';
      summary.setAttribute('aria-label', '查看' + link.querySelector('.link-title').textContent + '的详情');
      const description = document.createElement('p');description.className = 'site-detail-description';
      const domain = document.createElement('span');domain.className = 'site-detail-domain';
      details.append(summary, description, domain);card.append(details);
    }
    details.querySelector('summary').setAttribute('aria-label', '查看' + link.querySelector('.link-title').textContent + '的详情');
    details.querySelector('.site-detail-description').textContent = link.querySelector('.link-desc').textContent;
    details.querySelector('.site-detail-domain').textContent = new URL(link.href).hostname;
  }
  function setView(next) {
    if (!['cards', 'tiles'].includes(next)) return false;
    try { localStorage.setItem(viewKey, next); } catch {
      if (window.showToast) showToast('浏览器未能保存显示方式，请重试');
      return false;
    }
    view = next;document.documentElement.dataset.navView = view;
    syncControls();
    return true;
  }
  function syncControls() {
    document.querySelectorAll('[data-view-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.viewChoice === view));
      if (!button.querySelector('.view-icon')) button.prepend(icon(button.dataset.viewChoice === 'tiles' ? 'grid' : 'cards', 'view-icon'));
      if (!button.dataset.viewBound) { button.dataset.viewBound = 'true';button.addEventListener('click', () => setView(button.dataset.viewChoice)); }
    });
    document.querySelectorAll('.navigation-bottom [data-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === currentCategory);
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
  }
  function setupSticky() {
    const bar = document.getElementById('navigationSticky');
    const anchor = document.getElementById('navigationAnchor');
    if (!bar || !anchor || bar.dataset.stickyBound) return;
    bar.dataset.stickyBound = 'true';
    let frame = 0;
    function update() {
      frame = 0;
      bar.classList.toggle('is-stuck', anchor.getBoundingClientRect().bottom < 0);
      document.documentElement.style.setProperty('--nav-sticky-height', bar.getBoundingClientRect().height + 'px');
    }
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, {passive:true});
    window.addEventListener('resize', update);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(update).observe(bar);
    update();
  }
  function refresh() {
    syncControls();
    document.querySelectorAll('.index-section').forEach(section => decorateSection(section, section.dataset.section));
    document.querySelectorAll('#links-container .link-card:not([data-shared-project])').forEach(decorateCard);
  }
  window.BmeNavigationDesign = {refresh, decorateSection, decorateCard, setView, setupSticky};
})();
