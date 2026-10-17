(function () {
  'use strict';
  const hintKey = 'seubme_welcome_seen_v1';
  const issueUrl = 'https://github.com/dongbaiwei/Seu-Web-Navigator/issues/new';
  const contactEmail = '2659385932@qq.com';
  function init() {
    const hint = document.getElementById('welcomeHint');
    let dismissed = false;
    try { dismissed = localStorage.getItem(hintKey) === '1'; } catch {}
    hint.hidden = dismissed;
    function dismissHint() {
      hint.hidden = true;
      try { localStorage.setItem(hintKey, '1'); } catch { /* Still dismiss for this visit. */ }
    }
    function showHint() {
      hint.hidden = false;
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      hint.scrollIntoView?.({block:'center', behavior:reduceMotion?'instant':'smooth'});
    }
    document.getElementById('welcomeDismiss').addEventListener('click', dismissHint);
    document.getElementById('welcomeChooseCollege').addEventListener('click', () => { dismissHint();document.getElementById('collegeButton').click(); });
    document.getElementById('welcomeCustomize').addEventListener('click', () => { dismissHint();document.getElementById('personalButton').click(); });
    document.getElementById('openWelcomeHint').addEventListener('click', showHint);
    document.getElementById('collegeResults')?.addEventListener('click', event => {
      if (event.target.closest('[data-college-id]')) dismissHint();
    });

    const dialog = document.createElement('dialog');
    dialog.id = 'feedbackDialog';dialog.className = 'personal-dialog feedback-dialog';
    dialog.setAttribute('aria-labelledby', 'feedbackHeading');
    dialog.setAttribute('aria-describedby', 'feedbackIntro');
    dialog.innerHTML = '<div class="personal-heading"><h2 id="feedbackHeading">反馈问题 / 推荐网站</h2><button type="button" id="closeFeedback" aria-label="关闭反馈窗口">×</button></div>' +
      '<p class="personal-note" id="feedbackIntro">告诉我哪个链接有问题，或推荐一个好用的网站。可以邮件联系，也可以登录 GitHub 后确认提交公开反馈。</p>' +
      '<div class="feedback-email"><div class="feedback-email-row"><div><span class="feedback-email-label">邮件联系</span><a id="feedbackEmail" href="mailto:' + contactEmail + '">' + contactEmail + '</a></div><button type="button" id="copyFeedbackEmail">复制邮箱</button></div><p id="feedbackEmailStatus" role="status" aria-live="polite"></p></div>' +
      '<form id="feedbackForm"><label class="personal-field">反馈类型<select id="feedbackType"><option value="broken">链接失效</option><option value="recommend">推荐网站</option><option value="suggestion">使用问题 / 改进建议</option></select></label>' +
      '<div class="feedback-field-grid"><label class="personal-field">网站名称（选填）<input id="feedbackSiteName" maxlength="64" placeholder="例如：图书馆"></label><label class="personal-field">网站网址（选填）<input id="feedbackSiteUrl" type="url" maxlength="2048" placeholder="https://example.com" inputmode="url"></label></div>' +
      '<label class="personal-field">具体说明<textarea id="feedbackDescription" rows="4" maxlength="800" required placeholder="例如：点击后显示错误页面；或介绍推荐网站的用途。"></textarea></label>' +
      '<p class="feedback-context-note">反馈内容会附上当前学院、显示方式和页面地址。</p>' +
      '<div class="feedback-actions"><button type="button" id="copyFeedback">复制反馈内容</button><a class="feedback-submit" id="feedbackGitHub" href="' + issueUrl + '" target="_blank" rel="noopener noreferrer">前往 GitHub 反馈 ↗</a></div>' +
      '<p id="feedbackStatus" class="feedback-status" role="status" aria-live="polite"></p>' +
      '<label class="personal-field feedback-copy-field" id="feedbackCopyField" hidden>可手动复制下方内容<textarea id="feedbackCopyText" rows="7" readonly></textarea></label></form>';
    document.body.append(dialog);
    const form = document.getElementById('feedbackForm');
    const status = document.getElementById('feedbackStatus');
    const name = document.getElementById('feedbackSiteName');
    const url = document.getElementById('feedbackSiteUrl');
    const description = document.getElementById('feedbackDescription');
    const type = document.getElementById('feedbackType');
    const types = {broken:'链接失效', recommend:'推荐网站', suggestion:'使用问题 / 改进建议'};
    function contents() {
      const college = BmeColleges.get(BmePersonalization.getState().college).name;
      const pageUrl = new URL(window.location.href);pageUrl.search = '';pageUrl.hash = '';
      return {
        title: '【' + types[type.value] + '】' + (name.value.trim() || description.value.trim().split('\n')[0].slice(0,36)),
        body: ['反馈类型：' + types[type.value], '网站名称：' + (name.value.trim() || '未填写'), '网站链接：' + (url.value.trim() || '未填写'), '', '具体说明：', description.value.trim(), '', '—— 页面信息 ——', '学院：' + college, '显示方式：' + (document.documentElement.dataset.navView === 'tiles' ? '磁贴' : '卡片'), '页面地址：' + pageUrl.href].join('\n')
      };
    }
    function validate() {
      description.setCustomValidity(description.value.trim() ? '' : '请填写具体说明');
      return form.reportValidity();
    }
    description.addEventListener('input', () => description.setCustomValidity(''));
    form.addEventListener('submit', event => event.preventDefault());
    function openFeedback() {
      document.getElementById('personalDialog')?.close();
      status.textContent = '';document.getElementById('feedbackCopyField').hidden = true;
      document.getElementById('feedbackEmailStatus').textContent = '';
      dialog.showModal();
    }
    document.getElementById('openSiteFeedback').addEventListener('click', openFeedback);
    document.getElementById('closeFeedback').addEventListener('click', () => dialog.close());
    document.getElementById('feedbackEmail').addEventListener('click', event => {
      const data = contents();
      const subject = name.value.trim() || description.value.trim() ? data.title : '东南大学个人导航反馈';
      const destination = 'mailto:' + contactEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(data.body);
      event.currentTarget.href = destination.length <= 6000 ? destination : 'mailto:' + contactEmail + '?subject=' + encodeURIComponent(subject);
      document.getElementById('feedbackEmailStatus').textContent = destination.length <= 6000 ? '请在邮件应用中确认内容后发送。' : '内容较长，请复制反馈内容后粘贴到邮件中。';
    });
    document.getElementById('copyFeedbackEmail').addEventListener('click', async () => {
      const emailStatus = document.getElementById('feedbackEmailStatus');
      try { await navigator.clipboard.writeText(contactEmail);emailStatus.textContent = '邮箱已复制。'; }
      catch { emailStatus.textContent = '请选中或长按邮箱复制：' + contactEmail; }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    document.getElementById('feedbackGitHub').addEventListener('click', event => {
      if (!validate()) { event.preventDefault();return; }
      const data = contents();
      const destination = issueUrl + '?' + new URLSearchParams({title:data.title,body:data.body});
      event.currentTarget.href = destination.length <= 7500 ? destination : issueUrl;
      if (destination.length > 7500) {
        document.getElementById('feedbackCopyField').hidden = false;
        document.getElementById('feedbackCopyText').value = data.title + '\n\n' + data.body;
        status.textContent = '内容较长，请复制后粘贴到新打开的 GitHub 页面。';
      } else status.textContent = '请在新打开的 GitHub 页面确认并提交反馈。';
    });
    document.getElementById('copyFeedback').addEventListener('click', async () => {
      if (!validate()) return;
      const data = contents();const text = data.title + '\n\n' + data.body;
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = '反馈内容已复制。';
      } catch {
        const area = document.getElementById('feedbackCopyText');area.value = text;
        document.getElementById('feedbackCopyField').hidden = false;
        area.focus();area.select();status.textContent = '请复制已选中的反馈内容。';
      }
    });

    // Keep support reachable when the decorative footer is turned off.
    const settingsContent = document.querySelector('#personalDialog .personal-content');
    if (settingsContent) {
      const support = document.createElement('div');support.className = 'settings-support';
      const guide = document.createElement('button');guide.type = 'button';guide.textContent = '查看使用提示';
      guide.addEventListener('click', () => { document.getElementById('personalDialog').close();showHint(); });
      const feedback = document.createElement('button');feedback.type = 'button';feedback.textContent = '反馈问题 / 推荐网站';
      feedback.addEventListener('click', openFeedback);support.append(guide,feedback);settingsContent.append(support);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
