(function () {
  'use strict';
  const key = 'seubme_custom_sites_v1';
  const model = window.BmeSiteModel;
  let sites = [];
  let mounted = false;
  const cards = () => Array.from(document.querySelectorAll('#links-container .link-card'));
  const existingSites = () => cards().map(card => ({name: card.querySelector('.link-title').textContent, url: card.querySelector('a').href}));
  const error = message => { document.getElementById('customSiteError').textContent = message; };
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function persist(next) {
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { throw new Error('当前浏览器无法保存网站，请允许网站存储后再试。'); }
    sites = next;
  }
  function updateCounts() {
    const total = cards().length;
    const label = document.getElementById('siteTotalLabel');
    if (label) label.textContent = '共 ' + total + ' 个常用站点';
    for (const category of ['all', 'academic', 'service', 'resource']) {
      const count = category === 'all' ? total : cards().filter(card => card.dataset.category === category).length;
      const tabCount = document.querySelector('[data-tab="' + category + '"] .n');
      if (tabCount) tabCount.textContent = count;
      const section = document.getElementById('sec-' + category);
      if (section) {
        section.querySelector('.sec-count').textContent = count + ' sites';
        section.querySelectorAll('.row-no').forEach((node, index) => { node.textContent = String(index + 1).padStart(2, '0'); });
      }
    }
  }
  function buildCard(site) {
    const modern = !!document.getElementById('sec-academic');
    const card = element('div', 'link-card fade-in-up custom-site-card');
    card.dataset.category = site.category;
    card.dataset.customSiteId = site.id;
    card.draggable = true;
    const favorite = element('button', 'favorite-btn');
    favorite.type = 'button';
    favorite.setAttribute('aria-label', '收藏 ' + site.name);
    favorite.appendChild(element('i', 'fas fa-star'));
    favorite.addEventListener('click', event => { event.stopPropagation(); toggleFavorite(favorite); });
    const link = element('a');
    link.href = site.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.addEventListener('click', () => recordVisit(link));
    if (modern) {
      const head = element('span', 'tile-head');
      head.append(element('span', 'row-no'), element('span', 'row-domain', new URL(site.url).hostname));
      link.append(head, element('span', 'link-title', site.name), element('span', 'link-desc', site.description));
    } else {
      const icon = element('div', 'link-icon');
      icon.appendChild(element('i', 'fas fa-link'));
      const text = element('div', 'link-text');
      text.append(element('div', 'link-title', site.name), element('div', 'link-desc', site.description));
      link.append(icon, text);
    }
    const remove = element('button', 'custom-site-remove', '×');
    remove.type = 'button';
    remove.title = '删除这个自定义网站';
    remove.setAttribute('aria-label', '删除自定义网站 ' + site.name);
    remove.addEventListener('click', event => { event.stopPropagation(); removeSite(site, card); });
    card.append(favorite, link, remove);
    if (isDragMode) card.classList.add('draggable');
    const section = document.getElementById('sec-' + site.category);
    if (section) section.querySelector('.sec-rows').appendChild(card);
    else {
      const container = document.getElementById('links-container');
      const next = Array.from(container.querySelectorAll('.link-card')).find(item => {
        const ranks = {academic: 0, service: 1, resource: 2};
        return ranks[item.dataset.category] > ranks[site.category];
      });
      container.insertBefore(card, next || document.getElementById('no-results'));
    }
    return card;
  }
  function removeSite(site, card) {
    try { persist(sites.filter(item => item.id !== site.id)); }
    catch (problem) { showToast(problem.message); return; }
    card.remove();
    favorites = favorites.filter(name => name !== site.name);
    recentVisits = recentVisits.filter(item => item.title !== site.name);
    customOrder = customOrder.filter(name => name !== site.name);
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      localStorage.setItem('recentVisits', JSON.stringify(recentVisits));
      localStorage.setItem('customOrder', JSON.stringify(customOrder));
    } catch { /* The saved site deletion has already succeeded. */ }
    updateCounts();
    performSearch();
    showToast('已删除自定义网站');
  }
  function migrateOrder() {
    try {
      if (localStorage.getItem('seubme_order_revision') === 'graduate-second-v1') return;
      if (customOrder.length) {
        const order = ['东南大学', '研究生院'].concat(customOrder.filter(name => !['东南大学', '研究生院'].includes(name)));
        customOrder = order;
        localStorage.setItem('customOrder', JSON.stringify(order));
      }
      localStorage.setItem('seubme_order_revision', 'graduate-second-v1');
    } catch { /* Keep the updated order in memory when storage is unavailable. */ }
  }
  function openForm() {
    document.getElementById('customSiteForm').reset();
    error('');
    document.getElementById('customSiteCategory').value = ['academic', 'service', 'resource'].includes(currentCategory) ? currentCategory : 'academic';
    document.getElementById('customSiteDialog').showModal();
    document.getElementById('customSiteName').focus();
  }
  function submitForm(event) {
    event.preventDefault();
    error('');
    try {
      const site = model.validate({
        id: window.crypto.randomUUID ? window.crypto.randomUUID() : 'site-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        name: document.getElementById('customSiteName').value,
        url: document.getElementById('customSiteUrl').value,
        description: document.getElementById('customSiteDescription').value,
        category: document.getElementById('customSiteCategory').value
      }, existingSites());
      persist(sites.concat(site));
      buildCard(site);
      initializeFavorites();
      setupDragAndDrop();
      setupCardClick();
      updateCounts();
      document.getElementById('customSiteDialog').close();
      document.getElementById('searchInput').value = '';
      if (typeof switchCat === 'function') switchCat(site.category);
      else filterCategory(site.category);
      showToast('网站已加入导航');
    } catch (problem) { error(problem.message); }
  }
  function highlightTextSafely(card, keyword) {
    if (!keyword) return;
    for (const node of [card.querySelector('.link-title'), card.querySelector('.link-desc')]) {
      const text = node.textContent;
      const lower = text.toLowerCase();
      const search = keyword.toLowerCase();
      node.replaceChildren();
      let from = 0;
      let index;
      while ((index = lower.indexOf(search, from)) !== -1) {
        node.appendChild(document.createTextNode(text.slice(from, index)));
        node.appendChild(element('span', 'highlight', text.slice(index, index + search.length)));
        from = index + search.length;
      }
      node.appendChild(document.createTextNode(text.slice(from)));
    }
  }
  function init() {
    if (mounted) return;
    mounted = true;
    window.highlightText = highlightTextSafely;
    migrateOrder();
    try { sites = model.load(localStorage.getItem(key), existingSites()); }
    catch { showToast('自定义网站暂时无法读取，仍可使用默认导航。'); }
    sites.forEach(buildCard);
    updateCounts();
    document.getElementById('addSiteButton').addEventListener('click', openForm);
    document.getElementById('customSiteForm').addEventListener('submit', submitForm);
    document.getElementById('cancelAddSite').addEventListener('click', () => document.getElementById('customSiteDialog').close());
  }
  window.BmeCustomSites = {init, updateCounts};
})();
