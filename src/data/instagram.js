// 03 · Publicaciones de Instagram dentro de las tarjetas (orden: atrás, medio, frente).
// Para cambiar una publicación, cambia su link y, si hace falta, su encuadre:
//   type: 'image' | 'carousel' | 'video'
//   headerOffset: alto de la cabecera a ocultar (px a ancho natural de 400)
//   ratio: alto / ancho del RECUADRO de contenido del embed (no del archivo original)
//   zoom: escala extra sobre el cover (recorta las franjas negras de los videos)
//   offsetX / offsetY: ajuste fino en px de la tarjeta (+ derecha / + abajo)
//   cover: portada (WebP ~600px) en public/instagram/: se ve debajo del embed y queda si este no carga
export const IG_DEFAULTS = { type: 'image', headerOffset: 54, ratio: 1.25, zoom: 1, offsetX: 0, offsetY: 0 };

export const INSTAGRAM_POSTS = [
  // No se pudo leer el embed para confirmar el tipo: queda como imagen 4:5. Si es otro, usa uno de estos encuadres:
  //   carrusel → type: 'carousel', zoom: 1.18 (recorta las flechas laterales y muestra la 1.ª imagen)
  //   video    → type: 'video', ratio: 1.25, zoom: 1.42 (recorta franjas negras; el play queda al centro)
  { url: 'https://www.instagram.com/p/DdXeV_QlVAE/', type: 'image', cover: null /* '/instagram/post-1.webp' cuando llegue */, title: 'Publicación de Ricocat en Instagram (1 de 3)' },
  { url: 'https://www.instagram.com/p/DfIVtlIDh88/', type: 'image', cover: null /* '/instagram/post-2.webp' cuando llegue */, title: 'Publicación de Ricocat en Instagram (2 de 3)' },
  { url: 'https://www.instagram.com/p/DPpPBpQE4Ch/', type: 'image', cover: null /* '/instagram/post-3.webp' cuando llegue */, title: 'Publicación de Ricocat en Instagram (3 de 3)' },
].map((p) => ({ ...IG_DEFAULTS, ...p }));

// Acepta links copiados de Instagram (/reel/… y con ?utm_source…) y los pasa a /p/…/embed
export const cleanUrl = (url) => url.split(/[?#]/)[0].replace('/reel/', '/p/').replace(/\/?(embed\/?)?$/, '/');
export const embedUrl = (url) => `${cleanUrl(url)}embed`;
