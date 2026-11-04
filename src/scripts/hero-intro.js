/**
 * Preloader + entrada del Hero: UNA timeline GSAP (salida del preloader y fases del hero superpuestas).
 * T = 0 es el inicio de la subida de la cortina. Todos los tiempos/escalas/curvas en HERO_INTRO.
 * - Preloader solo en la 1.ª visita de la sesión (html.has-preloader, puesto por el script inline del <head>):
 *   un porcentaje que sigue el progreso real (imágenes del hero decodificadas + document.fonts.ready).
 * - Visitas siguientes: sin preloader e intro corta (HERO_INTRO.short).
 * - Estado previo pintado por CSS (html.is-intro-pending): solo la bolsa central en primer plano.
 * - Solo transform/opacity (+ clip-path del relleno). Medidas leídas antes de empezar. will-change solo durante la intro.
 * - Scroll / toque / tecla durante la intro → progress(1).
 * - prefers-reduced-motion: logo completo, la capa sale directo y el hero aparece en su estado final.
 */
export const HERO_INTRO = {
  storageKey: 'ricocat-hero-intro',
  mobileTime: 0.85,          // mobile: todos los tiempos × 0.85
  short: 1.0,                // s: duración de la intro corta (visitas siguientes)
  scale: { desktop: 2.4, mobile: 1.9 }, // fuente: --intro-scale en hero.css
  focus: { x: 0.5, y: 0.4 }, // punto de la bolsa central que queda al centro de la pantalla
  preloader: {
    min: 0.6, max: 5,        // s visible: mínimo (sin parpadeo) y tope de seguridad si lo obligatorio no termina
    extraBudget: 2,          // s: presupuesto para la carga extra; luego sale igual y lo extra sigue en segundo plano
    weights: { required: 0.8, extra: 0.2 }, // reparto del progreso
    fillLerp: 0.07,          // suavidad del contador (0–1 por frame)
    plateFrames: 10,         // extra: primeros frames del giro de entrada del plato (entrada_0001…0010)
    logoOut: { dur: 0.35, y: -12, scale: 0.92, ease: 'power2.in' },
    curtain: { dur: 0.8, ease: 'power3.inOut', radius: 40 }, // radius: % del ancho en el borde inferior
  },
  shineAt: 0.6,              // s: pasada de brillo sobre la bolsa central (desde el inicio de la cortina)
  festival: { at: 0.3, dur: 2.0, ease: 'expo.inOut', rotate: 0, yPercent: 6 }, // rotate 0: la bolsa entra recta
  sides: { esterilizados: 0.9, adultos: 1.05, dur: 1.2, ease: 'power3.out', fromX: 35, fromScale: 0.8, fadeDur: 0.2 },
  front: { lata: 1.4, pouch: 1.52, dur: 0.9, ease: 'back.out(1.6)', fromY: 60, fromScale: 0.9 },
  stripes: { at: [1.0, 1.15, 1.3, 1.45], dur: 0.8, ease: 'power4.inOut' }, // 1 izq, 1 der, 2, 3
  glow: { at: 1.8 },                                    // duración/curva en CSS (--intro-glow-dur)
  beams: { at: 2.0, dur: 0.8, ease: 'cubic-bezier(0.33, 1, 0.68, 1)', stagger: 0.1 }, // WAAPI (no pisa su deriva CSS)
  logo: { at: 2.2, dur: 0.6, fromY: 20, fadeDur: 0.2 },
  ingredients: {
    at: 1.25, dur: 0.95, stagger: 0.09, // entran mientras la cámara se aleja ease: 'back.out(1.4)', easeY: 'power2.out',
    distance: 0.6, rotate: 40, fromScale: 0.6,
    order: ['salmon', 'carne', 'atun', 'leche', 'trucha', 'arvejas', 'arveja-a', 'arveja-b', 'maiz-a', 'maiz-b', 'maiz-c', 'maiz-d', 'arveja-c', 'arveja-d', 'maiz-e', 'maiz-f'],
  },
  header: { at: 2.45, dur: 0.5, fromY: -30, stagger: 0.04, ease: 'power3.out' },
  tagline: { at: 2.5, dur: 0.45, fromY: 24, stagger: 0.06, ease: 'power3.out' },
  cta: { at: 2.62, dur: 0.45, fromScale: 0.9, ease: 'back.out(2)' },
  benefits: { at: 2.72, dur: 0.45, fromY: 20, stagger: 0.06, ease: 'power3.out' },
  end: 3.3,
};

const CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js';
const DESKTOP = '(min-width: 75em)';
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

async function loadGsap() {
  try { return (await import('gsap')).gsap; } catch {
    if (window.gsap) return window.gsap;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = CDN; s.onload = res; s.onerror = rej;
      document.head.append(s);
    });
    return window.gsap;
  }
}

const offsetWithin = (el, ancestor) => {
  let x = 0, y = 0;
  for (let n = el; n && n !== ancestor; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
  return { x, y };
};

function splitWords(title) {
  const words = [];
  title.querySelectorAll('.hero__title-line').forEach((line) => {
    [...line.childNodes].forEach((node) => {
      if (node.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const w = document.createElement('span');
        w.className = 'hero__word';
        w.textContent = part;
        frag.append(w);
        words.push(w);
      });
      node.replaceWith(frag);
    });
  });
  return words;
}

const byVisualLine = (words) => {
  const lines = new Map();
  words.forEach((w) => { const k = Math.round(w.offsetTop); lines.set(k, [...(lines.get(k) ?? []), w]); });
  return [...lines.keys()].sort((a, b) => a - b).map((k) => lines.get(k));
};

const until = (test, el) => new Promise((res) => {
  if (test()) return res();
  const mo = new MutationObserver(() => { if (test()) { mo.disconnect(); res(); } });
  mo.observe(el, { attributes: true });
});

function buildStripes(brand) {
  if (brand.querySelector('.hero__stripe')) return [...brand.querySelectorAll('.hero__stripe')];
  const stripes = ['1l', '1r', '2', '3'].map((k) => {
    const s = document.createElement('span');
    s.className = `hero__stripe hero__stripe--${k}`;
    s.setAttribute('aria-hidden', 'true');
    return s;
  });
  brand.prepend(...stripes);
  brand.classList.add('has-stripes');
  return stripes;
}

// Bloquea el scroll mientras está el preloader (también el de Lenis: el listener va primero y en captura).
function lockScroll() {
  const keys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']);
  const block = (e) => {
    if (e.type === 'keydown' && !keys.has(e.key)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  const evs = ['wheel', 'touchmove', 'keydown'];
  evs.forEach((e) => addEventListener(e, block, { capture: true, passive: false }));
  return () => evs.forEach((e) => removeEventListener(e, block, true));
}

// Progreso real de carga: imágenes del hero decodificadas + fuentes.
function trackLoad(hero, urls = [], extra = []) {
  const imgs = [...hero.querySelectorAll('.hero__item-img, .hero__beam')];
  const tasks = [
    ...urls.map((src) => { const img = new Image(); img.decoding = 'async'; img.src = src; return img.decode().catch(() => {}); }),
    ...extra.map((pr) => Promise.resolve(pr).catch(() => {})),
    ...imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => {
      img.addEventListener('load', r, { once: true });
      img.addEventListener('error', r, { once: true });
    })).then(() => img.decode?.()).catch(() => {})),
    (document.fonts?.ready ?? Promise.resolve()).catch(() => {}),
  ];
  const state = { done: 0, total: tasks.length };
  tasks.forEach((t) => t.then(() => { state.done += 1; }));
  state.all = Promise.all(tasks);
  return state;
}

// Carga extra (no bloquea): lo que se ve justo después del hero. Si no termina a tiempo sigue en segundo plano.
function trackExtra(plateFrames) {
  const urls = new Set();
  document.querySelectorAll('.band img, #alimentos img').forEach((img) => {
    const src = img.currentSrc || img.getAttribute('src');
    if (src && !src.startsWith('data:')) urls.add(src);
  });
  const plate = document.querySelector('[data-plate]');
  if (plate?.dataset.plateSeq) {
    const base = plate.dataset.plateSeq + (matchMedia('(max-width: 767px)').matches ? 'm/' : '');
    for (let n = 1; n <= plateFrames; n += 1) urls.add(`${base}entrada/entrada_${String(n).padStart(4, '0')}.webp`);
  }
  const tasks = [...urls].map((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = 'low';
    img.src = src;
    return img.decode().catch(() => {});
  });
  // Módulo del pintado de 04 (y OGL, que importa): solo se descarga y evalúa, no se inicia nada
  tasks.push(import('./types-halftone.js').catch(() => {}));
  tasks.push(import('ogl').catch(() => import('https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js')).catch(() => {}));
  const state = { done: 0, total: tasks.length };
  tasks.forEach((t) => t.then(() => { state.done += 1; }));
  state.all = Promise.all(tasks);
  return state;
}

export function initHeroIntro() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const C = HERO_INTRO;
  const main = document.getElementById('contenido');
  const preloader = root.classList.contains('has-preloader') ? document.querySelector('[data-preloader]') : null;
  const pct = preloader?.querySelector('.preloader__pct');
  let pctShown = -1;
  const setPct = (v) => { const n = Math.round(v * 100); if (pct && n !== pctShown) { pctShown = n; pct.textContent = `${n}%`; } };
  const intro = root.classList.contains('hero-intro');
  const short = root.classList.contains('hero-intro-short');
  const isDesktop = matchMedia(DESKTOP).matches;
  const unlock = preloader ? lockScroll() : () => {};
  if (preloader) main?.setAttribute('aria-busy', 'true');
  const t0 = performance.now();

  const removePreloader = () => {
    preloader?.remove();
    root.classList.remove('has-preloader');
    main?.removeAttribute('aria-busy');
    unlock();
  };
  const plain = () => {
    setPct(1); // sin intro: hero en su estado final (CSS)
    root.classList.remove('hero-intro', 'hero-intro-short', 'is-intro-pending');
    removePreloader();
    document.dispatchEvent(new Event('hero:intro-end'));
  };
  try { sessionStorage.setItem(C.storageKey, '1'); } catch {}

  // Preparación del hero (antes de cualquier animación)
  const q = (s) => hero.querySelector(s);
  const qa = (s) => [...hero.querySelectorAll(s)];
  const festival = q('.hero__item--festival');
  const brand = q('.hero__brand');
  const title = q('.hero__title');
  const words = intro && title ? splitWords(title) : [];
  const stripes = intro && isDesktop && brand ? buildStripes(brand) : [];
  const S = parseFloat(getComputedStyle(hero).getPropertyValue('--intro-scale')) || (isDesktop ? C.scale.desktop : C.scale.mobile);
  const cameraOrigin = () => {
    const f = offsetWithin(festival, hero);
    const yOff = festival.offsetHeight * (C.festival.yPercent / 100);
    const px = f.x + festival.offsetWidth * C.focus.x;
    const py = f.y + festival.offsetHeight * C.focus.y;
    const cx = hero.clientWidth / 2;
    const cy = Math.min(hero.clientHeight, innerHeight) / 2 - yOff;
    return `${((cx - S * px) / (1 - S) - f.x).toFixed(1)}px ${((cy - S * py) / (1 - S) - f.y).toFixed(1)}px`;
  };
  if (intro && festival) festival.style.setProperty('--intro-origin', cameraOrigin());

  // Progreso: suave, nunca retrocede. Obligatorio (80%): imágenes del hero decodificadas, fuentes y GSAP.
  // Extra (20%, presupuesto de 2s): cintillo + sección 03, módulo del pintado de 04 y los primeros frames del plato.
  const gsapReady = loadGsap();
  const load = trackLoad(hero, [], [gsapReady]);
  const extra = preloader ? trackExtra(C.preloader.plateFrames) : { done: 0, total: 0, all: Promise.resolve() };
  let extraDone = !preloader;
  extra.all.then(() => { extraDone = true; });
  const W = C.preloader.weights;
  const progress = (elapsed) => {
    const req = load.done / load.total;
    const ext = extraDone || elapsed >= C.preloader.extraBudget || !extra.total ? 1 : extra.done / extra.total;
    return W.required * req + W.extra * ext;
  };
  let shown = reduced ? 1 : 0;
  let target = 0;
  let rafId = 0;
  const tick = () => {
    const elapsed = (performance.now() - t0) / 1000;
    target = Math.max(target, elapsed >= C.preloader.max ? 1 : progress(elapsed));
    shown = Math.min(1, shown + Math.max(0.004, (target - shown) * C.preloader.fillLerp));
    if (shown > target) shown = target;
    setPct(shown);
    rafId = requestAnimationFrame(tick);
  };
  if (preloader) { setPct(shown); if (!reduced) tick(); }
  const filled = new Promise((res) => {
    if (!preloader) return res();
    const check = () => {
      const elapsed = (performance.now() - t0) / 1000;
      if ((reduced ? target >= 1 || load.done === load.total : shown >= 0.999) && elapsed >= C.preloader.min) return res();
      if (reduced && elapsed >= C.preloader.max) return res();
      setTimeout(check, 50);
    };
    // Sale cuando lo obligatorio está listo Y (el extra terminó O se agotó el presupuesto)
    load.all.then(() => Promise.race([extra.all, new Promise((r) => setTimeout(r, Math.max(0, C.preloader.extraBudget * 1000 - (performance.now() - t0))))])).then(() => { target = 1; });
    check();
  });

  if (reduced || !intro) {
    Promise.race([load.all, new Promise((r) => setTimeout(r, C.preloader.max * 1000))]).then(() => filled).then(plain);
    return;
  }

  const ready = Promise.all([
    gsapReady,
    filled,
    preloader ? null : Promise.race([load.all, new Promise((r) => setTimeout(r, 1200))]),
    isDesktop ? until(() => 'layoutReady' in hero.dataset, hero) : null,
  ]);
  const safety = setTimeout(plain, (C.preloader.max + 1.5) * 1000); // GSAP no llegó: hero normal
  ready.then(([gsap]) => {
    clearTimeout(safety);
    cancelAnimationFrame(rafId);
    setPct(1);
    if (!gsap || !root.classList.contains('hero-intro')) return plain();
    build(gsap);
  }).catch(plain);

  function build(gsap) {
    // Medidas, todas antes de empezar
    const origin = cameraOrigin();
    const vw = innerWidth, vh = innerHeight;
    const stage = q('.hero__stage');
    const sc = stage.getBoundingClientRect();
    const scx = sc.left + sc.width / 2, scy = sc.top + sc.height / 2;
    const ingredients = C.ingredients.order.map((id) => q(`.hero__item--${id}`)).filter(Boolean).map((el) => {
      const r = el.getBoundingClientRect();
      const side = r.left + r.width / 2 < scx ? -1 : 1;
      const dy = (r.top + r.height / 2 - scy) / (sc.height / 2 || 1);
      return { el, side, x: side * vw * C.ingredients.distance, y: dy * vh * 0.25 - vh * 0.12, rot: gsap.getProperty(el, 'rotation') };
    });
    const lines = byVisualLine(words);
    const header = [...document.querySelectorAll('.site-header > *')];
    const benefitItems = isDesktop ? qa('.benefit') : [];
    const beams = qa('.hero__beam');
    const el = {
      decor: q('.hero__decor'), logo: q('.hero__logo'), cta: q('.hero__cta'), benefits: q('.hero__benefits'),
      est: q('.hero__item--esterilizados'), adu: q('.hero__item--adultos'), lata: q('.hero__item--lata'), pouch: q('.hero__item--pouch'),
    };
    const animated = [festival, el.est, el.adu, el.lata, el.pouch, ...stripes, el.logo, ...ingredients.map((g) => g.el), ...header, ...words, el.cta, el.benefits, ...benefitItems].filter(Boolean);

    const tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } });
    const P = preloader ? C.preloader.logoOut.dur : 0; // T = 0 → inicio de la cortina
    const k = short ? C.short / C.end : (isDesktop ? 1 : C.mobileTime);
    const T = (s) => P + s * k;
    const D = (s) => s * k;

    // Preloader: logo sale (−0.35s → 0) y la cortina sube con borde inferior curvo (0 → 0.8s)
    if (preloader) {
      const lo = C.preloader.logoOut, cu = C.preloader.curtain;
      tl.to(pct, { y: lo.y, scale: lo.scale, opacity: 0, duration: lo.dur, ease: lo.ease }, 0);
      tl.to(preloader, { yPercent: -100, duration: cu.dur, ease: cu.ease }, P);
      tl.fromTo(preloader, { borderBottomLeftRadius: '0% 0%', borderBottomRightRadius: '0% 0%' },
        { borderBottomLeftRadius: `50% ${cu.radius}%`, borderBottomRightRadius: `50% ${cu.radius}%`, duration: cu.dur, ease: cu.ease }, P);
      tl.call(removePreloader, null, P + cu.dur);
    }

    // 1 · Cámara: la bolsa central se aleja
    const F = C.festival;
    // El estado previo de CSS (translateY 6%) no debe leerse como y en px: se limpia y se fija x/y = 0 en ambos extremos.
    gsap.set(festival, { clearProps: 'transform' });
    tl.fromTo(festival, { x: 0, y: 0, scale: S, rotation: F.rotate, yPercent: F.yPercent, transformOrigin: origin },
      { x: 0, y: 0, scale: 1, rotation: 0, yPercent: 0, duration: D(F.dur), ease: F.ease, immediateRender: true }, T(F.at));

    // Brillo de la bolsa central en primer plano (hero-shine.js escucha el evento)
    tl.call(() => document.dispatchEvent(new CustomEvent('hero:shine', { detail: { bag: 'festival' } })), null, T(C.shineAt ?? 0.6));

    // 2 · Productos
    const Sd = C.sides;
    [[el.est, 1, Sd.esterilizados], [el.adu, -1, Sd.adultos]].forEach(([node, toCenter, at]) => {
      if (!node) return;
      tl.fromTo(node, { xPercent: toCenter * Sd.fromX, scale: Sd.fromScale }, { xPercent: 0, scale: 1, duration: D(Sd.dur), ease: Sd.ease }, T(at));
      tl.fromTo(node, { opacity: 0 }, { opacity: 1, duration: D(Sd.fadeDur), ease: 'none' }, T(at));
    });
    const Fr = C.front;
    [[el.lata, Fr.lata], [el.pouch, Fr.pouch]].forEach(([node, at]) => {
      if (!node) return;
      tl.fromTo(node, { y: Fr.fromY, scale: Fr.fromScale, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: D(Fr.dur), ease: Fr.ease }, T(at));
    });

    // 3 · Franjas
    stripes.forEach((s, i) => tl.fromTo(s, { scaleX: 0 }, { scaleX: 1, duration: D(C.stripes.dur), ease: C.stripes.ease }, T(C.stripes.at[i])));

    // 4 · Luz: resplandores (transición CSS), haces y su contenedor
    tl.call(() => hero.classList.add('is-lit'), null, T(C.glow.at));
    tl.set(el.decor, { opacity: 1 }, T(C.glow.at)); // el piso (en .hero__decor) se enciende con la Luz
    // Haces: con propiedad scale individual (WAAPI) para no leer ni pisar su transform/translate de CSS
    const beamAnims = [];
    beams.forEach((b, i) => {
      b.style.scale = '1 0';
      tl.call(() => {
        b.style.scale = '';
        beamAnims.push(b.animate([{ scale: '1 0' }, { scale: '1 1' }], { duration: D(C.beams.dur) * 1000, easing: C.beams.ease }));
      }, null, T(C.beams.at + i * C.beams.stagger));
    });

    // 5 · Logo
    const L = C.logo;
    tl.fromTo(el.logo, { y: L.fromY, scale: 0.85 }, { keyframes: [{ y: 0, scale: 1.05, duration: D(L.dur * 0.55), ease: 'power2.out' }, { scale: 1, duration: D(L.dur * 0.45), ease: 'back.out(2)' }] }, T(L.at));
    tl.fromTo(el.logo, { opacity: 0 }, { opacity: 1, duration: D(L.fadeDur), ease: 'none' }, T(L.at));

    // 6 · Ingredientes: desde su lado, trayectoria curva (x e y con curvas distintas)
    const I = C.ingredients;
    ingredients.forEach(({ el: node, side, x, y, rot }, i) => {
      const at = T(I.at + i * I.stagger);
      tl.fromTo(node, { x, rotation: rot + side * I.rotate, scale: I.fromScale, opacity: 0 },
        { x: 0, rotation: rot, scale: 1, opacity: 1, duration: D(I.dur), ease: I.ease, onComplete: () => node.classList.add('is-settled') }, at);
      tl.fromTo(node, { y }, { y: 0, duration: D(I.dur), ease: I.easeY }, at);
    });

    // 7 · Contenido
    const H = C.header, G = C.tagline, B = C.benefits;
    tl.fromTo(header, { y: H.fromY, opacity: 0 }, { y: 0, opacity: 1, duration: D(H.dur), ease: H.ease, stagger: D(H.stagger) }, T(H.at));
    if (title) tl.set(title, { opacity: 1 }, T(G.at));
    lines.forEach((line, i) => tl.fromTo(line, { y: G.fromY, opacity: 0 }, { y: 0, opacity: 1, duration: D(G.dur), ease: G.ease }, T(G.at + i * G.stagger)));
    tl.fromTo(el.cta, { scale: C.cta.fromScale, opacity: 0 }, { scale: 1, opacity: 1, duration: D(C.cta.dur), ease: C.cta.ease }, T(C.cta.at));
    if (benefitItems.length) {
      tl.fromTo(el.benefits, { opacity: 0 }, { opacity: 1, duration: D(0.2), ease: 'none' }, T(B.at));
      tl.fromTo(benefitItems, { y: B.fromY, opacity: 0 }, { y: 0, opacity: 1, duration: D(B.dur), ease: B.ease, stagger: D(B.stagger) }, T(B.at));
    } else {
      tl.fromTo(el.benefits, { y: B.fromY, opacity: 0 }, { y: 0, opacity: 1, duration: D(B.dur), ease: B.ease }, T(B.at));
    }

    gsap.set(animated, { willChange: 'transform, opacity' });
    root.classList.remove('is-intro-pending'); // los valores iniciales ya los puso GSAP

    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    let ended = false;
    const end = () => {
      if (ended) return;
      ended = true;
      events.forEach((e) => removeEventListener(e, skip, true));
      removeEventListener('scroll', onScroll);
      removePreloader();
      hero.classList.add('is-lit');
      beams.forEach((b) => { b.style.scale = ''; });
      beamAnims.forEach((a) => a.finish());
      ingredients.forEach(({ el: node }) => node.classList.add('is-settled'));
      gsap.set(animated, { clearProps: 'transform,transformOrigin,opacity,willChange' });
      gsap.set([el.decor, title].filter(Boolean), { clearProps: 'opacity' });
      document.dispatchEvent(new Event('hero:intro-end'));
    };
    const skip = () => tl.progress(1);
    const onScroll = () => { if (scrollY > 2) skip(); };
    tl.eventCallback('onComplete', end);
    // Durante el preloader el scroll está bloqueado; el salto aplica desde que se ve el hero.
    tl.call(() => {
      events.forEach((e) => addEventListener(e, skip, { capture: true, passive: true }));
      addEventListener('scroll', onScroll, { passive: true });
    }, null, P);
    requestAnimationFrame(() => tl.play());
  }
}
