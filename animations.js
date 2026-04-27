/* ═══════════════════════════════════════════════
   JMEDIA — Scroll Reveal Animation System
   Everything below hero starts hidden,
   reveals as user scrolls into view.
═══════════════════════════════════════════════ */
(function () {
  const EASING  = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const DUR     = '0.75s';
  const STAGGER = 90; // ms between staggered children

  /* ─── SELECTORS + ANIMATION TYPE ─── */
  const TARGETS = [
    // Section-level wrappers
    { sel: '.roles-section',          anim: 'fadeUp',   thresh: 0.06 },
    { sel: '.credits-section',        anim: 'fadeUp',   thresh: 0.06 },
    { sel: '.credits-banner-split',   anim: 'fadeUp',   thresh: 0.08 },
    { sel: '.featured-section',       anim: 'fadeUp',   thresh: 0.06 },
    { sel: '.services-section',       anim: 'fadeUp',   thresh: 0.06 },
    { sel: '.mtr-section',            anim: 'fadeUp',   thresh: 0.06 },
    { sel: '.equip-section',          anim: 'fadeUp',   thresh: 0.06 },
    { sel: '.booking-section',        anim: 'fadeUp',   thresh: 0.06 },

    // Titles — cinematic clip-path wipe
    { sel: '.sec-title',              anim: 'wipe',     thresh: 0.4  },

    // Labels / eyebrows — fade only
    { sel: '.label',                  anim: 'fadeUp',   thresh: 0.5  },

    // Staggered grids
    { sel: '.credits-grid',           anim: 'stagger',  thresh: 0.04, children: '.credit-card'  },
    { sel: '.services-grid',          anim: 'stagger',  thresh: 0.04, children: '.svc-card'     },
    { sel: '.roles-list',             anim: 'stagger',  thresh: 0.08, children: '.role-row'     },
    { sel: '.equip-grid',             anim: 'stagger',  thresh: 0.04, children: '.equip-item'   },

    // Stat numbers count up
    { sel: '.hstat-num',              anim: 'countUp',  thresh: 0.9  },

    // Video grid rows
    { sel: '.vid-section',            anim: 'fadeUp',   thresh: 0.06 },

    // Generic reveal-up (legacy)
    { sel: '.reveal-up',              anim: 'fadeUp',   thresh: 0.1  },
  ];

  /* ─── HIDE ─── */
  function hide(el, anim) {
    el.style.transition = 'none';
    if (anim === 'wipe') {
      el.style.willChange  = 'clip-path';
      el.style.clipPath    = 'inset(0 100% 0 0)';
    } else {
      el.style.willChange  = 'opacity, transform';
      el.style.opacity     = '0';
      el.style.transform   = 'translateY(32px)';
    }
  }

  /* ─── REVEAL ─── */
  function show(el, anim, delay) {
    const d = `${delay || 0}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (anim === 'wipe') {
        el.style.transition = `clip-path ${DUR} ${d} ${EASING}`;
        el.style.clipPath   = 'inset(0 0% 0 0)';
      } else {
        el.style.transition = `opacity ${DUR} ${d} ${EASING}, transform ${DUR} ${d} ${EASING}`;
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0)';
      }
      el.style.willChange = 'auto';
    }));
  }

  /* ─── STAGGER CHILDREN ─── */
  function stagger(parent, childSel) {
    parent.querySelectorAll(childSel).forEach((child, i) => {
      hide(child, 'fadeUp');
      show(child, 'fadeUp', i * STAGGER);
    });
  }

  /* ─── COUNT UP ─── */
  function countUp(el) {
    const raw    = el.textContent.trim();
    const num    = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const suffix = raw.replace(/[0-9.]/g, '');
    if (isNaN(num)) { show(el, 'fadeUp', 0); return; }

    const steps  = 55;
    const ms     = 1300 / steps;
    let step = 0;
    el.style.opacity   = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';

    const t = setInterval(() => {
      step++;
      const val = Math.min((num * step) / steps, num);
      el.textContent = (Number.isInteger(num) ? Math.round(val) : val.toFixed(1)) + suffix;
      if (step >= steps) clearInterval(t);
    }, ms);
  }

  /* ─── IS INSIDE HERO? ─── */
  function inHero(el) {
    return !!el.closest('#hero, .hero-wrap, .hero-inner, [data-hero]');
  }

  /* ─── OBSERVE ─── */
  function observe(el, anim, thresh, children) {
    if (inHero(el)) return;

    if (anim === 'stagger' && children) {
      // Hide children immediately; reveal on intersection
      el.querySelectorAll(children).forEach(c => hide(c, 'fadeUp'));
    } else {
      hide(el, anim);
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (anim === 'stagger' && children) {
          stagger(el, children);
        } else if (anim === 'countUp') {
          countUp(el);
        } else {
          show(el, anim, 0);
        }
        obs.unobserve(el);
      });
    }, { threshold: thresh });

    obs.observe(el);
  }

  /* ─── INIT ─── */
  function init() {
    // Dedupe — track already-animated elements
    const seen = new WeakSet();

    TARGETS.forEach(({ sel, anim, thresh, children }) => {
      document.querySelectorAll(sel).forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        observe(el, anim, thresh, children);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
