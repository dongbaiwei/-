(function (root) {
  'use strict';
  const categories = ['academic', 'service', 'resource'];
  function normalize(input) {
    const name = String(input.name || '').trim();
    const description = String(input.description || '').trim();
    if (!name || name.length > 64) throw new Error('请填写网站名称，最多 64 个字。');
    if (description.length > 140) throw new Error('简介最多 140 个字。');
    if (!categories.includes(input.category)) throw new Error('请选择网站分类。');
    let value = String(input.url || '').trim();
    if (!value || value.length > 2048) throw new Error('请填写有效的网站网址。');
    if (!/^[a-z][a-z\d+.-]*:/i.test(value)) value = 'https://' + value;
    let url;
    try { url = new URL(value); } catch { throw new Error('网址格式不正确，例如 https://bme.seu.edu.cn/。'); }
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
      throw new Error('请使用 http 或 https 网站网址。');
    }
    return {id: String(input.id || ''), name, description: description || '自定义网站', url: url.href, category: input.category};
  }
  function validate(input, existing) {
    const site = normalize(input);
    if (existing.some(item => item.name.toLocaleLowerCase() === site.name.toLocaleLowerCase())) {
      throw new Error('这个网站名称已存在，请使用其他名称。');
    }
    if (existing.some(item => {
      try { return new URL(item.url).href === site.url; } catch { return false; }
    })) throw new Error('这个网址已经在导航中了。');
    return site;
  }
  function load(raw, builtins) {
    const data = JSON.parse(raw || '[]');
    if (!Array.isArray(data)) throw new Error('自定义网站数据格式不正确。');
    const sites = [];
    for (const entry of data) {
      try {
        const site = validate(entry, builtins.concat(sites));
        if (site.id && !sites.some(item => item.id === site.id)) sites.push(site);
      } catch { /* Ignore malformed entries without rendering unsafe content. */ }
    }
    return sites;
  }
  const api = {normalize, validate, load};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BmeSiteModel = api;
})(typeof window === 'undefined' ? globalThis : window);
