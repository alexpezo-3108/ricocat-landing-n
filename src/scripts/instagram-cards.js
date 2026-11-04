/**
 * 03 · Embeds de Instagram dentro de las tarjetas, sin cambiar su tamaño, posición ni rotación.
 * La tarjeta es una ventana (overflow: hidden); el iframe va a su ancho natural y se escala hasta el ancho interior.
 * Carga diferida (IntersectionObserver), escala con ResizeObserver y fallback si el embed no carga.
 * Variables (CSS): --ig-natural-w, --ig-natural-h, --ig-offset-y. La escala (--ig-scale) la calcula este script.
 */
import { INSTAGRAM_POSTS, embedUrl, cleanUrl } from '../data/instagram.js';

const LOAD_TIMEOUT = 10000; // ms sin evento load → fallback
// Ícono servido desde public/: en el build es /icons/…; en la vista previa (sin bundler) public/icons/…
const IG_ICON = import.meta.env ? `${import.meta.env.BASE_URL}icons/red-instagram.svg` : 'public/icons/red-instagram.svg';

export function initInstagramCards() {
  const cards = [...document.querySelectorAll('.food__card')];
  if (!cards.length) return;

  // "Cover" del recuadro de contenido (bajo la cabecera, ancho × ratio) × zoom, centrado en la tarjeta
  const setScale = (card) => {
    const f = card._ig;
    if (!f) return;
    const W = parseFloat(getComputedStyle(card).getPropertyValue('--ig-natural-w')) || 400;
    const cw = card.clientWidth, ch = card.clientHeight;
    const Hc = W * f.ratio;
    const k = Math.max(cw / W, ch / Hc) * f.zoom;
    const x = cw / 2 - (W / 2) * k + f.offsetX;
    const y = ch / 2 - (f.headerOffset + Hc / 2) * k + f.offsetY;
    card.style.setProperty('--ig-scale', k.toFixed(4));
    card.style.setProperty('--ig-x', `${x.toFixed(2)}px`);
    card.style.setProperty('--ig-y', `${y.toFixed(2)}px`);
  };
  const ro = new ResizeObserver((entries) => entries.forEach((e) => setScale(e.target)));

  const fallback = (card, post) => {
    card.querySelector('.food__ig-frame')?.remove();
    if (card.querySelector('.food__ig-fallback')) return;
    const a = document.createElement('a');
    a.className = 'food__ig-fallback';
    a.href = cleanUrl(post.url); a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `<img src="${IG_ICON}" alt="" width="48" height="48"><span>Ver en Instagram</span>`;
    card.append(a);
  };

  cards.forEach((card, i) => {
    let post = INSTAGRAM_POSTS[i];
    if (!post) return;
    card.removeAttribute('aria-hidden');
    card.classList.add('food__card--ig');
    post = { ...post, url: cleanUrl(post.url) };
    card._ig = post;
    card.dataset.igType = post.type;
    // Mobile: toda la tarjeta abre la publicación (en desktop esta capa no existe y el embed es interactivo)
    const link = document.createElement('a');
    link.className = 'food__ig-link';
    link.href = post.url; link.target = '_blank'; link.rel = 'noopener';
    link.innerHTML = `<span class="food__ig-tag"><img src="${IG_ICON}" alt="" width="16" height="16">@ricocat</span>`;
    link.setAttribute('aria-label', `${post.title}: ver en Instagram (se abre en una pestaña nueva)`);
    card.append(link);
    setScale(card);
    ro.observe(card);
  });

  const load = (card, i) => {
    const post = INSTAGRAM_POSTS[i];
    if (!post || card.querySelector('.food__ig-frame')) return;
    const frame = document.createElement('iframe');
    frame.className = 'food__ig-frame';
    frame.src = embedUrl(post.url);
    frame.title = post.title;
    frame.loading = 'lazy';
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('allowtransparency', 'true');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; clipboard-write';
    const timer = setTimeout(() => fallback(card, post), LOAD_TIMEOUT);
    frame.addEventListener('load', () => clearTimeout(timer), { once: true });
    frame.addEventListener('error', () => { clearTimeout(timer); fallback(card, post); }, { once: true });
    card.prepend(frame);
  };

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    cards.forEach(load);
    io.disconnect();
  }, { rootMargin: '600px 0px' });
  io.observe(cards[0].closest('section') || cards[0]);
}
