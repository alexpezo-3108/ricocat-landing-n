// 03 · Alimento 100% completo: croquetas, huellas y tarjetas.
import pez from '../assets/images/croqueta-pez.png';
import triangulo from '../assets/images/croqueta-triangulo.png';
import cruz from '../assets/images/croqueta-cruz.png';
import corazon from '../assets/images/croqueta-corazon.png';
import redonda from '../assets/images/croqueta-redonda.png';

// TODO cliente: importar las fotos y completar el alt de cada tarjeta.
/** @type {{ image?: import("astro").ImageMetadata; alt: string }[]} */
export const cards = [
  { image: undefined, alt: '' },
  { image: undefined, alt: '' },
  { image: undefined, alt: '' },
];

export const kibbles = [
  { id: 'pez', src: pez },
  { id: 'triangulo', src: triangulo },
  { id: 'cruz', src: cruz },
  { id: 'corazon', src: corazon },
  { id: 'redonda', src: redonda },
];

// Huellas fijas: se ven sin JS o con movimiento reducido; con JS sirven de molde y aparecen al azar.
export const pawSpots = [{ x: 14, y: 5 }, { x: 45, y: 9 }, { x: 49, y: 21 }, { x: 78, y: 90 }, { x: 12, y: 84 }];
