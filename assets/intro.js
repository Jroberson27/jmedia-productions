/* JMEDIA homepage intro, about 1.6 seconds, nothing to click.
   Three reels whip across the full screen; the last one holds for a beat, then its frame
   shrinks straight into the centre phone while the headline and side phones arrive.
   Every move is a transform or an opacity change scheduled up front, so it stays smooth
   even while the rest of the page is still loading.
   The <head> decides whether it runs (html.intro): never with reduced motion, never when
   motion is paused, never on a deep link, and only once per visit. */
(function(){
  var root = document.documentElement;
  if (!root.classList.contains('intro')){ var skip = document.getElementById('intro'); if (skip) skip.remove(); return; }
  var ov = document.getElementById('intro');
  var done = false;

  function finish(){
    if (done) return; done = true;
    var v = document.querySelector('.hero--home .fan__item[data-pos="c"] video');
    if (v){ try { v.currentTime = 0; } catch(e){} var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    root.classList.add('intro-live');
    window.jmIntroUntil = Math.max(window.jmIntroUntil || 0, Date.now() + 1200);
    try { sessionStorage.setItem('jm-intro-seen', '1'); } catch(e){}
    if (ov && ov.animate && !ov.getAnimations().length) ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' });
    setTimeout(function(){ if (ov) ov.remove(); root.classList.remove('intro', 'intro-live'); }, 300);
  }
  setTimeout(finish, 3200);                             /* safety net: the page never waits longer than this */
  if (!ov || !ov.animate){ finish(); return; }

  var panels = [].slice.call(ov.querySelectorAll('.intro__panel'));
  var land = panels[2], frame = land.querySelector('.intro__frame'), bgs = [].slice.call(ov.querySelectorAll('.intro__bg'));
  var shade = ov.querySelector('.intro__shade');
  var target = document.querySelector('.hero--home .fan__item[data-pos="c"] .screen');

  function run(){
    if (window.scrollY > 40){ finish(); return; }       /* the browser restored a scrolled position */
    var r = target && target.getBoundingClientRect();
    if (!r || !r.width){ finish(); return; }
    var vw = innerWidth, vh = innerHeight;
    /* the frame takes the phone screen's shape at full screen height, so it shrinks without stretching */
    var fw = vh * r.width / r.height;
    [].forEach.call(ov.querySelectorAll('.intro__frame'), function(f){ f.style.width = fw + 'px'; f.style.left = ((vw - fw) / 2) + 'px'; });
    var radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 30;

    var whip = 'cubic-bezier(.7,0,.25,1)', settle = 'cubic-bezier(.2,.8,.2,1)', glide = 'cubic-bezier(.65,0,.2,1)';
    [0, 1].forEach(function(i){
      panels[i].animate([
        { transform: 'translate3d(105%,0,0) skewX(-6deg)' },
        { transform: 'translate3d(0,0,0) skewX(0)', offset: .5 },
        { transform: 'translate3d(-105%,0,0) skewX(6deg)' }
      ], { duration: 440, delay: i * 170, easing: whip, fill: 'both' });
    });
    land.animate([
      { transform: 'translate3d(105%,0,0) skewX(-6deg)' },
      { transform: 'translate3d(0,0,0) skewX(0)' }
    ], { duration: 360, delay: 340, easing: settle, fill: 'both' });

    /* frame to phone: one uniform scale and a move, on the compositor */
    var s = r.height / vh;
    var tx = (r.left + r.width / 2) - vw / 2, ty = (r.top + r.height / 2) - vh / 2;
    var move = { duration: 600, delay: 780, easing: glide, fill: 'both' };
    frame.animate([
      { transform: 'translate3d(0,0,0) scale(1)' },
      { transform: 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + s + ')' }
    ], move);
    frame.animate([{ borderRadius: '0px' }, { borderRadius: (radius / s) + 'px' }], move);
    bgs.forEach(function(bg){ bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 760, easing: 'ease-out', fill: 'both' }); });
    shade.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: 960, easing: 'ease-out', fill: 'both' });

    /* the page arrives on the same clock: headline, header and side phones */
    var arrive = 'cubic-bezier(.22,.61,.36,1)';
    var copy = document.querySelector('.hero--home .home__grid > div:first-child');
    if (copy) copy.animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }],
      { duration: 700, delay: 920, easing: arrive, fill: 'backwards' });
    var nav = document.getElementById('nav');
    if (nav) nav.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 1000, easing: arrive, fill: 'backwards' });
    var cue = document.querySelector('.hero--home .scroll-cue');
    if (cue) cue.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 1200, fill: 'backwards' });
    root.classList.add('intro-live');                    /* hand the start states to the animations above */
    [].forEach.call(document.querySelectorAll('.hero--home .fan__item:not([data-pos="c"])'), function(it){
      var end = getComputedStyle(it).transform;
      it.animate([{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: end === 'none' ? 'none' : end }],
        { duration: 900, delay: 1180, easing: glide, fill: 'backwards' });
    });
    window.jmIntroUntil = Date.now() + 3400;             /* the carousel's first turn waits for the side phones */
    var out = ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, delay: 1390, easing: 'ease-out', fill: 'both' });
    out.onfinish = finish;
  }

  /* start once the frames are decoded, so nothing whips past as a black box */
  var imgs = [].slice.call(ov.querySelectorAll('img'));
  var ready = imgs.map(function(im){ return im.decode ? im.decode().catch(function(){}) : Promise.resolve(); });
  var started = false;
  function go(){ if (!started){ started = true; requestAnimationFrame(run); } }
  Promise.all(ready).then(go);
  setTimeout(go, 600);
})();
