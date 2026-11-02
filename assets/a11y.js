/* JMEDIA accessibility layer, shared by every page. Load it after the page's own scripts.
   1. Pause motion: one control that stops every looping video, Vimeo reel, carousel,
      rotating word and CSS animation on the page (WCAG 2.2.2), remembered between visits.
   2. Dialogs: while the menu or a viewer is open, the page behind it is inert, so focus
      stays on what is visible (WCAG 2.4.3, 2.4.11), and the viewer's Close button gets focus.
   3. Links that open a new tab say so to screen readers. */
(function(){
  var root = document.documentElement;
  var KEY = 'jm-motion-paused';
  function isPaused(){ return root.classList.contains('motion-paused'); }
  window.jmMotionPaused = isPaused;

  /* ---------- 1. pause motion ---------- */
  var nativePlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function(){
    if (isPaused() && !this.__jmUserPlay){ this.pause(); return Promise.resolve(); }
    return nativePlay.apply(this, arguments);
  };
  /* a visitor who turns on a video's sound has chosen to watch that one */
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.feat__sound');
    if (!b) return;
    var f = b.closest('[data-feat]'), v = f && f.querySelector('video');
    if (v) v.__jmUserPlay = true;
  }, true);

  function vimeo(f, method){
    try { if (f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ method: method }), 'https://player.vimeo.com'); } catch(e){}
  }
  var vimeoFrames = [].slice.call(document.querySelectorAll('iframe[src*="player.vimeo.com"],iframe[data-src*="player.vimeo.com"]'));
  vimeoFrames.forEach(function(f){
    f.addEventListener('load', function(){
      if (!isPaused()) return;
      [0, 400, 1200, 2500].forEach(function(t){ setTimeout(function(){ if (isPaused()) vimeo(f, 'pause'); }, t); });
    });
  });

  function inView(el){
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.width > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
  function apply(paused, user){
    root.classList.toggle('motion-paused', paused);
    if (btn){
      btn.setAttribute('aria-pressed', String(paused));
      btn.querySelector('.motion-toggle__label').textContent = paused ? 'Play motion' : 'Pause motion';
      btn.title = paused ? 'Play motion' : 'Pause motion';
    }
    document.querySelectorAll('video').forEach(function(v){
      if (paused){ v.__jmUserPlay = false; v.pause(); }
      else if (user && v.loop && v.getAttribute('src') && inView(v)){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    });
    vimeoFrames.forEach(function(f){
      if (!f.getAttribute('src')) return;
      if (paused) vimeo(f, 'pause');
      else if (user && inView(f) && !f.closest('.rail__slide:not(.is-active)')) vimeo(f, 'play');
    });
    if (user){ try { localStorage.setItem(KEY, paused ? '1' : '0'); } catch(e){} }
  }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'motion-toggle';
  btn.innerHTML = '<svg class="i-pause" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="1.5" y="1" width="3" height="10" fill="currentColor"/><rect x="7.5" y="1" width="3" height="10" fill="currentColor"/></svg>' +
    '<svg class="i-play" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l9 5-9 5z" fill="currentColor"/></svg>' +
    '<span class="motion-toggle__label">Pause motion</span>';
  /* lives in the header, next to the menu button, so it never covers page content */
  var burger = document.getElementById('burger');
  if (burger) burger.parentNode.insertBefore(btn, burger); else document.body.insertBefore(btn, document.body.firstChild);
  btn.addEventListener('click', function(){ apply(!isPaused(), true); });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch(e){}
  apply(saved === '1', false);

  /* ---------- 2. menu and viewers ---------- */
  var layers = [
    { el: document.getElementById('menu'), keep: ['nav', 'menu'] },
    { el: document.getElementById('lightbox'), keep: ['lightbox'], focus: '#lbClose' }
  ].filter(function(l){ return l.el; });
  function setInert(open, keep){
    [].forEach.call(document.body.children, function(c){
      if (c.tagName === 'SCRIPT' || keep.indexOf(c.id) > -1) return;
      if (open) c.setAttribute('inert', ''); else c.removeAttribute('inert');
    });
  }
  layers.forEach(function(l){
    new MutationObserver(function(){
      var open = l.el.classList.contains('is-open');
      if (open === l.open) return;
      l.open = open;
      if (open) l.from = document.activeElement;
      setInert(open, l.keep);
      /* the page's own close handler tried to restore focus while the page was still inert: finish the job */
      if (!open && l.from && l.from.focus && (document.activeElement === document.body || l.el.contains(document.activeElement))) l.from.focus();
      if (open && l.focus){
        var target = l.el.querySelector(l.focus);
        setTimeout(function(){ if (target) target.focus(); }, 80);
      }
    }).observe(l.el, { attributes: true, attributeFilter: ['class'] });
  });

  /* ---------- 3. new tab links ---------- */
  document.querySelectorAll('a[target="_blank"]').forEach(function(a){
    if (a.querySelector('.sr-newtab')) return;
    var s = document.createElement('span');
    s.className = 'sr sr-newtab';
    s.textContent = ' (opens in a new tab)';
    if (a.hasAttribute('aria-label')) a.setAttribute('aria-label', a.getAttribute('aria-label') + ' (opens in a new tab)');
    else a.appendChild(s);
  });

  /* ---------- 4. in page links move keyboard focus, not just the scroll position ---------- */
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if (!t) return;
    setTimeout(function(){
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    }, 0);
  });

  /* ---------- 5. the header slides back whenever something in it has keyboard focus ---------- */
  var nav = document.getElementById('nav');
  if (nav) nav.addEventListener('focusin', function(){ nav.classList.remove('is-hidden'); });
})();
