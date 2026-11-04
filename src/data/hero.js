// Bodegón del Hero: imágenes, tamaños responsive y alt. Posiciones y tamaños en pantalla: hero.css (--x/--y/--w).
import bolsaFestival from '../assets/images/producto-bolsa-festival-de-sabores-con-sombra.png';
import bolsaEsterilizados from '../assets/images/producto-bolsa-esterilizados.png';
import bolsaAdultos from '../assets/images/producto-bolsa-adultos-atun-sardina-y-trucha.png';
import lata from '../assets/images/producto-lata-pate-higado-y-pollo.png';
import pouch from '../assets/images/producto-pouch-sabores-marinos.png';
import carne from '../assets/images/ingrediente-carne.png';
import leche from '../assets/images/ingrediente-leche.png';
import atun from '../assets/images/ingrediente-atun.png';
import salmon from '../assets/images/ingrediente-salmon.png';
import trucha from '../assets/images/ingrediente-trucha.png';
import arvejas from '../assets/images/ingredientes-arvejas-y-zanahorias.png';
import arveja from '../assets/images/ingrediente-arveja.png';
import maiz from '../assets/images/ingrediente-maiz.png';

export const DESKTOP = '(min-width: 75em)';

// Orden = orden de apilado. alt vacío = decorativo. floating = flota en loop (los del piso quedan quietos).
export const heroItems = [
  { id: 'esterilizados', kind: 'product', src: bolsaEsterilizados, widths: [360, 560, 760, 957], sizes: `${DESKTOP} 34vw, 75vw`, alt: 'Bolsa de Ricocat Adultos Esterilizados' },
  { id: 'adultos', kind: 'product', src: bolsaAdultos, widths: [320, 520, 720, 871], sizes: `${DESKTOP} 31vw, 68vw`, alt: 'Bolsa de Ricocat Adultos sabor atún, sardina y trucha' },
  { id: 'festival', kind: 'product', src: bolsaFestival, widths: [600, 1003], sizes: `${DESKTOP} 70vw, 100vw`, alt: 'Bolsa de Ricocat Adultos Festival de sabores', priority: true },
  { id: 'leche', kind: 'ingredient', floating: true, src: leche, widths: [184, 369], sizes: `${DESKTOP} 13vw, 24vw` },
  { id: 'atun', kind: 'ingredient', floating: true, src: atun, widths: [152, 303], sizes: `${DESKTOP} 10vw, 18vw` },
  { id: 'carne', kind: 'ingredient', floating: true, src: carne, widths: [118, 236], sizes: `${DESKTOP} 8vw, 15vw` },
  { id: 'lata', kind: 'product', src: lata, widths: [192, 384], sizes: `${DESKTOP} 11vw, 25vw`, alt: 'Lata de Ricocat Paté sabor hígado y pollo' },
  { id: 'pouch', kind: 'product', src: pouch, widths: [163, 325], sizes: `${DESKTOP} 11vw, 26vw`, alt: 'Pouch de Ricocat Sabores marinos' },
  { id: 'salmon', kind: 'ingredient', src: salmon, widths: [160, 320], sizes: `${DESKTOP} 12vw, 21vw` },
  { id: 'trucha', kind: 'ingredient', src: trucha, widths: [140, 280], sizes: `${DESKTOP} 9vw, 14vw` },
  { id: 'arvejas', kind: 'ingredient', src: arvejas, widths: [113, 226], sizes: `${DESKTOP} 8vw, 13vw` },
  { id: 'arveja-a', kind: 'ingredient', floating: true, src: arveja, widths: [45, 90], sizes: `${DESKTOP} 2vw, 5vw` },
  { id: 'arveja-b', kind: 'ingredient', floating: true, src: arveja, widths: [45, 90], sizes: `${DESKTOP} 3vw, 6vw` },
  { id: 'maiz-a', kind: 'ingredient', floating: true, src: maiz, widths: [32], sizes: '32px' },
  { id: 'maiz-b', kind: 'ingredient', floating: true, src: maiz, widths: [32], sizes: '32px' },
  { id: 'maiz-c', kind: 'ingredient', floating: true, src: maiz, widths: [32], sizes: '32px' },
  { id: 'maiz-d', kind: 'ingredient', floating: true, src: maiz, widths: [32], sizes: '32px' },
  { id: 'arveja-c', kind: 'ingredient', floating: true, src: arveja, widths: [45, 90], sizes: `${DESKTOP} 3vw, 6vw` },
  { id: 'arveja-d', kind: 'ingredient', floating: true, src: arveja, widths: [45, 90], sizes: `${DESKTOP} 2vw, 5vw` },
  { id: 'maiz-e', kind: 'ingredient', floating: true, src: maiz, widths: [32], sizes: '32px' },
  { id: 'maiz-f', kind: 'ingredient', floating: true, src: maiz, widths: [32], sizes: '32px' },
];
