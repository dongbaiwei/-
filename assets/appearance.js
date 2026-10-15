(function () {
  'use strict';
  const key = 'seubme_appearance_v1';
  const themes = ['white', 'black', 'blue'];
  const wallpapers = ['molecular', 'emblem', 'plain', 'upload'];
  const root = document.documentElement;
  let state = {theme: 'white', wallpaper: 'molecular', image: ''};
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    state.theme = themes.includes(saved.theme) ? saved.theme : 'white';
    state.image = typeof saved.image === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(saved.image) ? saved.image : '';
    state.wallpaper = wallpapers.includes(saved.wallpaper) && (saved.wallpaper !== 'upload' || state.image) ? saved.wallpaper : 'molecular';
  } catch { /* Use defaults when saved preferences cannot be read. */ }
  function apply() {
    root.dataset.theme = state.theme;
    root.dataset.wallpaper = state.wallpaper;
    if (state.image) root.style.setProperty('--user-wallpaper', 'url("' + state.image + '")');
    else root.style.removeProperty('--user-wallpaper');
  }
  apply();
  function init() {
    const dialog = document.getElementById('appearanceDialog');
    if (!dialog) return;
    const status = document.getElementById('appearanceStatus');
    const input = document.getElementById('wallpaperFile');
    const open = document.getElementById('appearanceButton');
    const controls = document.getElementById('appearanceControls') || dialog;
    function render() {
      apply();
      controls.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === state.theme)));
      controls.querySelectorAll('[data-wallpaper-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.wallpaperChoice === state.wallpaper)));
      document.getElementById('uploadedWallpaper').hidden = !state.image;
      document.getElementById('removeWallpaper').hidden = !state.image;
      document.getElementById('uploadedWallpaperPreview').style.backgroundImage = state.image ? 'url("' + state.image + '")' : '';
    }
    function save(next) {
      try { localStorage.setItem(key, JSON.stringify(next)); }
      catch { status.textContent = '当前浏览器无法保存设置，请释放网站存储空间后重试。'; return false; }
      state = next;
      render();
      status.textContent = '已保存';
      return true;
    }
    open.addEventListener('click', () => { status.textContent = ''; dialog.showModal(); });
    ['closeAppearance', 'doneAppearance'].forEach(id => document.getElementById(id).addEventListener('click', () => dialog.close()));
    controls.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => save({...state, theme: button.dataset.themeChoice})));
    controls.querySelectorAll('[data-wallpaper-choice]').forEach(button => button.addEventListener('click', () => save({...state, wallpaper: button.dataset.wallpaperChoice})));
    document.getElementById('removeWallpaper').addEventListener('click', () => save({...state, image: '', wallpaper: state.wallpaper === 'upload' ? 'molecular' : state.wallpaper}));
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { status.textContent = '请选择 JPG、PNG 或 WebP 图片。'; input.value = ''; return; }
      if (file.size > 20 * 1024 * 1024) { status.textContent = '图片超过 20 MB，请选择较小的图片。'; input.value = ''; return; }
      input.disabled = true;
      status.textContent = '正在处理图片…';
      const objectUrl = URL.createObjectURL(file);
      try {
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = objectUrl; });
        const scale = Math.min(1, 1920 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let image = canvas.toDataURL('image/jpeg', .86);
        if (image.length > 1800000) image = canvas.toDataURL('image/jpeg', .65);
        save({...state, image, wallpaper: 'upload'});
      } catch { status.textContent = '无法读取这张图片，请选择其他图片。'; }
      finally { URL.revokeObjectURL(objectUrl); input.disabled = false; input.value = ''; }
    });
    render();
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
})();
