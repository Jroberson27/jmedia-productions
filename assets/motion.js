/* JMEDIA motion layer: shared scroll animation for every page.
   Loads before each page's own script, so the elements it tags here
   are picked up by that script's reveal observer. */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  root.classList.add('motion');

  /* 1. stagger: children of these groups reveal one after another */
  var groups = ['.partners', '.pgrid', '.edge', '.trio', '.credits', '.work-grid', '.reviews', '.stats', '.foot__cols', '.plans', '.carousel__track'];
  groups.forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(g){
      [].forEach.call(g.children, function(c, i){
        if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', '');
        if (!c.hasAttribute('data-reveal-delay')) c.style.setProperty('--rd', ((i % 6) * 0.08).toFixed(2) + 's');
      });
    });
  });

  /* 2. section heads: every eyebrow and big heading gets its own entrance */
  document.querySelectorAll('.section__head > .eyebrow, .section__head > .h2, .statement .eyebrow, .statement .h2, .band .h2, .split span')
    .forEach(function(el){ if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', ''); });

  /* masked headings start at zero visible height, which some browsers report as
     never intersecting, so watch the heading's container instead */
  var masked = [].slice.call(document.querySelectorAll('.h2[data-reveal], .display[data-reveal], .split span[data-reveal]'));
  if (reduce || !('IntersectionObserver' in window)){ masked.forEach(function(h){ h.classList.add('in'); }); }
  else {
    var mo = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        masked.forEach(function(h){ if (h.parentElement === en.target) h.classList.add('in'); });
        mo.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    masked.forEach(function(h){ mo.observe(h.parentElement); });
  }

  if (reduce) return;

  /* 3. scroll linked: hero drift, parallax media, featured frames */
  var hero = document.querySelector('.hero');
  var para = [].slice.call(document.querySelectorAll('[data-parallax], .detail__media img, .bleed > img, .band > img, .vcard__frame img'));
  var tick = false;
  function frame(){
    var vh = window.innerHeight, y = window.scrollY;
    if (hero){
      var hp = Math.max(0, Math.min(1, y / (hero.offsetHeight || vh)));
      hero.style.setProperty('--hp', hp.toFixed(3));
    }
    para.forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var c = (r.top + r.height / 2 - vh / 2) / vh;            /* -1 above centre, +1 below */
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      el.style.setProperty('--py', (c * k * 100).toFixed(2) + 'px');
    });
    tick = false;
  }
  window.addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);
  frame();
})();
