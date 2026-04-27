/* ═══════════════════════════════════════════════
   JMEDIA — Scroll Reveal System v3
   CSS-class driven. Fallback = fully visible.
   Never hides section wrappers, only children.
═══════════════════════════════════════════════ */
(function () {
  var EASE    = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var DUR     = '720ms';
  var STAGGER = 85;

  /* ── Inject CSS ── */
  var s = document.createElement('style');
  s.textContent = [
    '.jm-hide{opacity:0!important;transform:translateY(30px)!important}',
    '.jm-hide-wipe{clip-path:inset(0 100% 0 0)!important}',
    '.jm-show{opacity:1!important;transform:translateY(0)!important;',
      'transition:opacity '+DUR+' '+EASE+',transform '+DUR+' '+EASE+'}',
    '.jm-show-wipe{clip-path:inset(0 0% 0 0)!important;',
      'transition:clip-path '+DUR+' '+EASE+'}'
  ].join('');
  document.head.appendChild(s);

  function hide(el, wipe) {
    el.classList.add(wipe ? 'jm-hide-wipe' : 'jm-hide');
  }
  function show(el, wipe, delay) {
    setTimeout(function() {
      el.classList.remove(wipe ? 'jm-hide-wipe' : 'jm-hide');
      el.classList.add(wipe ? 'jm-show-wipe' : 'jm-show');
    }, delay || 0);
  }

  function watch(el, fn, thresh) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        fn(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: thresh || 0.08 });
    io.observe(el);
  }

  function inHero(el) {
    return !!el.closest('#hero, .hero-wrap, .hero-inner, [data-hero]');
  }

  function countUp(el) {
    var raw = el.textContent.trim();
    var num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    var sfx = raw.replace(/[0-9.]/g, '');
    if (isNaN(num)) return;
    var steps = 50, i = 0;
    var t = setInterval(function() {
      i++;
      var v = Math.min((num * i) / steps, num);
      el.textContent = (Number.isInteger(num) ? Math.round(v) : v.toFixed(1)) + sfx;
      if (i >= steps) clearInterval(t);
    }, 1200 / steps);
  }

  function init() {
    /* 1. Section titles — wipe */
    document.querySelectorAll('.sec-title').forEach(function(el) {
      if (inHero(el)) return;
      hide(el, true);
      watch(el, function(t){ show(t, true, 0); }, 0.25);
    });

    /* 2. Labels — fade up */
    document.querySelectorAll('.label').forEach(function(el) {
      if (inHero(el)) return;
      hide(el, false);
      watch(el, function(t){ show(t, false, 0); }, 0.4);
    });

    /* 3. Credit cards — stagger */
    document.querySelectorAll('.credits-grid').forEach(function(grid) {
      var cards = Array.from(grid.querySelectorAll('.credit-card'));
      cards.forEach(function(c){ hide(c, false); });
      watch(grid, function() {
        cards.forEach(function(c, i){ show(c, false, i * STAGGER); });
      }, 0.04);
    });

    /* 4. Service cards — stagger */
    document.querySelectorAll('.services-grid').forEach(function(grid) {
      var cards = Array.from(grid.querySelectorAll('.svc-card'));
      cards.forEach(function(c){ hide(c, false); });
      watch(grid, function() {
        cards.forEach(function(c, i){ show(c, false, i * STAGGER); });
      }, 0.04);
    });

    /* 5. Role rows — stagger */
    document.querySelectorAll('.roles-list').forEach(function(list) {
      var rows = Array.from(list.querySelectorAll('.role-row'));
      rows.forEach(function(r){ hide(r, false); });
      watch(list, function() {
        rows.forEach(function(r, i){ show(r, false, i * STAGGER); });
      }, 0.06);
    });

    /* 6. Credits banner — fade up */
    document.querySelectorAll('.credits-banner-split').forEach(function(el) {
      hide(el, false);
      watch(el, function(t){ show(t, false, 0); }, 0.06);
    });

    /* 7. MTR left/right panels */
    document.querySelectorAll('.mtr-section .mtr-left, .mtr-section .mtr-right').forEach(function(el, i) {
      hide(el, false);
      watch(el, function(t){ show(t, false, i * 120); }, 0.06);
    });

    /* 8. Equipment items */
    document.querySelectorAll('.equip-grid').forEach(function(grid) {
      var items = Array.from(grid.querySelectorAll('.equip-item'));
      items.forEach(function(c){ hide(c, false); });
      watch(grid, function() {
        items.forEach(function(c, i){ show(c, false, i * 60); });
      }, 0.04);
    });

    /* 9. Booking section content */
    document.querySelectorAll('.booking-section .booking-inner').forEach(function(el) {
      hide(el, false);
      watch(el, function(t){ show(t, false, 0); }, 0.08);
    });

    /* 10. Featured video section rows */
    document.querySelectorAll('.featured-section > div > div').forEach(function(el, i) {
      hide(el, false);
      watch(el, function(t){ show(t, false, i * 80); }, 0.04);
    });

    /* 11. Stat numbers count up */
    document.querySelectorAll('.hstat-num').forEach(function(el) {
      watch(el, function(){ countUp(el); }, 0.8);
    });

    /* 12. Any remaining .reveal-up not caught above */
    document.querySelectorAll('.reveal-up').forEach(function(el) {
      if (inHero(el)) return;
      if (el.classList.contains('sec-title')) return;
      if (el.classList.contains('jm-hide') || el.classList.contains('jm-hide-wipe')) return;
      hide(el, false);
      watch(el, function(t){ show(t, false, 0); }, 0.08);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
