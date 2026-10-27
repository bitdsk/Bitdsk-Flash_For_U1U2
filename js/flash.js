/* ==========================================================================
   Bitdsk Flash Tool — 页面交互
   1) 把 [data-main-site] 链接指向主站（地址来自 config.js）
   2) 移动端汉堡菜单
   3) 返回顶部按钮
   无框架、无依赖。
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.BITDSK_FLASH_CONFIG || {};

  /* ---------- 1. 主站链接 ---------- */
  function wireMainSite() {
    var base = String(CFG.mainSite || '').replace(/\/+$/, '');
    var links = document.querySelectorAll('[data-main-site]');

    if (!base) {
      // 未配置主站：把链接隐藏，避免死链
      Array.prototype.forEach.call(links, function (a) {
        a.style.display = 'none';
      });
      return;
    }

    Array.prototype.forEach.call(links, function (a) {
      var path = a.getAttribute('data-main-site') || '';
      a.href = base + '/' + path.replace(/^\/+/, '');
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- 2. 汉堡菜单 ---------- */
  function wireMenu() {
    var btn = document.querySelector('.hamburger');
    var nav = document.getElementById('nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    // 点击导航项后收起
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) nav.classList.remove('open');
    });

    // 点击空白处收起
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  /* ---------- 3. 返回顶部 ---------- */
  function wireBackTop() {
    var btn = document.getElementById('backtop');
    if (!btn) return;
    function sync() {
      btn.style.opacity = window.scrollY > 600 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 600 ? 'auto' : 'none';
    }
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  /* ---------- 4. 高亮当前导航项 ---------- */
  function wireActive() {
    var nav = document.getElementById('nav');
    if (!nav || nav.querySelector('a.active')) return;
    var here = location.pathname.replace(/\/+$/, '');
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      if (!a.href || /^https?:/.test(a.getAttribute('href') || '')) return;
      try {
        if (new URL(a.href).pathname.replace(/\/+$/, '') === here) a.classList.add('active');
      } catch (e) { /* noop */ }
    });
  }

  function boot() {
    wireMainSite();
    wireMenu();
    wireBackTop();
    wireActive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
