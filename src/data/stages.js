// Etapas de vida. Cada etapa = una sección (componente LifeStage).
// Agregar una etapa: sumar un objeto a `stages`. Si tiene varios sabores, `flavors` lleva varios
// objetos y el componente muestra el selector ‹ › solo. Productos opcionales: omite la clave.
import gBolsa from '../assets/images/stages/gatitos/bolsa.png';
import gPate from '../assets/images/stages/gatitos/lata-pate.png';
import gPouch from '../assets/images/stages/gatitos/pouch.png';
import gTrocitos from '../assets/images/stages/gatitos/lata-trocitos.png';
import gGato from '../assets/images/stages/gatitos/gato.png';
import gK1 from '../assets/images/stages/gatitos/croqueta-1.png';
import gK2 from '../assets/images/stages/gatitos/croqueta-2.png';
import gK3 from '../assets/images/stages/gatitos/croqueta-3.png';
import gK4 from '../assets/images/stages/gatitos/croqueta-4.png';
import gK5 from '../assets/images/stages/gatitos/croqueta-5.png';
import aAtunBolsa from '../assets/images/stages/adultos-atun/bolsa.png';
import aAtunPate from '../assets/images/stages/adultos-atun/lata-pate.png';
import aAtunPouch from '../assets/images/stages/adultos-atun/pouch.png';
import aAtunTrocitos from '../assets/images/stages/adultos-atun/lata-trocitos.png';
import aAtunGato from '../assets/images/stages/adultos-atun/gato.png';
import aAtunK1 from '../assets/images/stages/adultos-atun/k-pez-naranja.png';
import aAtunK2 from '../assets/images/stages/adultos-atun/k-triangulo.png';
import aAtunK3 from '../assets/images/stages/adultos-atun/k-pez-rojo.png';
import aAtunK4 from '../assets/images/stages/adultos-atun/k-pez-marron.png';
import aAtunK5 from '../assets/images/stages/adultos-atun/k-cruz.png';
import aFestivalBolsa from '../assets/images/stages/adultos-festival/bolsa.png';
import aFestivalPate from '../assets/images/stages/adultos-festival/lata-pate.png';
import aFestivalPouch from '../assets/images/stages/adultos-festival/pouch.png';
import aFestivalTrocitos from '../assets/images/stages/adultos-festival/lata-trocitos.png';
import aFestivalGato from '../assets/images/stages/adultos-festival/gato.png';
import aFestivalK1 from '../assets/images/stages/adultos-festival/k-tambor.png';
import aFestivalK2 from '../assets/images/stages/adultos-festival/k-y.png';
import aFestivalK3 from '../assets/images/stages/adultos-festival/k-pez-rojo.png';
import aFestivalK4 from '../assets/images/stages/adultos-festival/k-pez-marron.png';
import aFestivalK5 from '../assets/images/stages/adultos-festival/k-redonda.png';
import aPolloBolsa from '../assets/images/stages/adultos-pollo/bolsa.png';
import aPolloPate from '../assets/images/stages/adultos-pollo/lata-pate.png';
import aPolloPouch from '../assets/images/stages/adultos-pollo/pouch.png';
import aPolloTrocitos from '../assets/images/stages/adultos-pollo/lata-trocitos.png';
import aPolloGato from '../assets/images/stages/adultos-pollo/gato.png';
import aPolloK1 from '../assets/images/stages/adultos-pollo/k-tambor.png';
import aPolloK2 from '../assets/images/stages/adultos-pollo/k-y.png';
import aPolloK3 from '../assets/images/stages/adultos-pollo/k-pez-rojo.png';
import aPolloK4 from '../assets/images/stages/adultos-pollo/k-pez-marron.png';
import aPolloK5 from '../assets/images/stages/adultos-pollo/k-redonda.png';

/**
 * @typedef {'rosa'|'azul'|'morado'|'naranja'|'guinda'|'marron'} Palette
 * @typedef {{ src: ImageMetadata, alt: string }} Pic
 * @typedef {{
 *   id: string, name: string, description: string,
 *   palette?: Palette,                                  // si cambia por sabor (Adultos)
 *   products: { bag: Pic, pate?: Pic, pouch?: Pic, trocitos?: Pic },
 *   cat: { src: ImageMetadata, alt: string, shadow?: ImageMetadata, pos?: Pos, shadowPos?: Pos }, // pos: ajuste fino por imagen
 *   kibbles: ImageMetadata[],                          // hasta 5, en el orden de los huecos del bodegón
 * }} Flavor
 * @typedef {{ x: number, y: number, w: number }} Pos  // coordenadas del bodegón 580×445
 * @typedef {{
 *   id: string, name: string, palette: Palette,
 *   cta: { label: string, stores: string },            // stores: clave para el selector de tiendas
 *   layout?: 'duo',                                     // bodegón de 2 productos (bolsa + paté a la derecha)
 *   benefits: { icon: string|null, bold: string, rest: string }[],  // icon null = pendiente
 *   flavors: Flavor[],
 * }} Stage
 */
import aCarneBolsa from '../assets/images/stages/adultos-carne/bolsa.png';
import aCarnePate from '../assets/images/stages/adultos-carne/lata-pate.png';
import aCarnePouch from '../assets/images/stages/adultos-carne/pouch.png';
import aCarneTrocitos from '../assets/images/stages/adultos-carne/lata-trocitos.png';
import aCarneGato from '../assets/images/stages/adultos-carne/gato.png';
import aCarneK1 from '../assets/images/stages/adultos-carne/k-corazon.png';
import aCarneK2 from '../assets/images/stages/adultos-carne/k-cruz.png';
import aCarneK3 from '../assets/images/stages/adultos-carne/k-pez-rojo.png';
import aCarneK4 from '../assets/images/stages/adultos-carne/k-pez-amarillo.png';
import aCarneK5 from '../assets/images/stages/adultos-carne/k-redonda.png';
import eBolsa from '../assets/images/stages/esterilizados/bolsa.png';
import ePate from '../assets/images/stages/esterilizados/lata-pate.png';
import eGato from '../assets/images/stages/esterilizados/gato.png';
import eK1 from '../assets/images/stages/esterilizados/k-corazon.png';
import eK2 from '../assets/images/stages/esterilizados/k-redonda.png';
import eK3 from '../assets/images/stages/esterilizados/k-pez-rojo.png';
import eK4 from '../assets/images/stages/esterilizados/k-pez-marron.png';
import eK5 from '../assets/images/stages/esterilizados/k-cruz.png';

const ADULT_DESC = 'Alimento 100% completo y balanceado, con el sabor que más disfruta.';

/** @type {Stage[]} */
export const stages = [
  {
    id: 'gatitos',
    name: 'Gatitos',
    palette: 'rosa',
    cta: { label: 'Ver producto', stores: 'gatitos' },
    benefits: [
      { icon: 'icono-formacion-osea-muscular', bold: 'Formación', rest: 'ósea y muscular' },
      { icon: 'icono-desarrollo-cerebro-vision', bold: 'Desarrollo', rest: 'cerebro y visión' },
      { icon: 'icono-optima-digestion', bold: 'Óptima', rest: 'digestión' },
      { icon: 'icono-sistema-inmunologico', bold: 'Sistema', rest: 'inmunológico reforzado' },
    ],
    flavors: [
      {
        id: 'carne-pescado-leche',
        name: 'Carne, pescado y leche',
        description: 'Fórmula premium para que crezca fuerte y sano en sus primeros meses.',
        products: {
          bag: { src: gBolsa, alt: 'Bolsa de Ricocat Gatitos sabor carne, pescado y leche' },
          pate: { src: gPate, alt: 'Lata de Ricocat Gatitos paté sabor pollo y carne' },
          pouch: { src: gPouch, alt: 'Pouch de Ricocat Gatitos trocitos en salsa sabor carne' },
          trocitos: { src: gTrocitos, alt: 'Lata de Ricocat Gatitos trocitos en salsa sabor carne' },
        },
        cat: { src: gGato, alt: 'Gatito atigrado de pie junto a los productos' },
        kibbles: [gK1, gK2, gK3, gK4, gK5],
      },
    ],
  },
  {
    id: 'adultos',
    name: 'Adultos',
    palette: 'azul',
    cta: { label: 'Ver producto', stores: 'adultos' },
    benefits: [
      { icon: 'icono-tipos-optima-vision', bold: 'Óptima', rest: 'visión' },
      { icon: 'icono-tipos-piel-sana', bold: 'Piel sana', rest: 'y pelo brillante' },
      { icon: 'icono-tipos-control-bolas-de-pelo', bold: 'Control', rest: 'de bolas de pelo' },
      { icon: 'icono-tipos-previene-calculos', bold: 'Previene', rest: 'cálculos urinarios' },
    ],
    flavors: [
      {
        id: 'atun-sardina-trucha',
        name: 'Atún, sardina y trucha',
        palette: 'azul',
        description: ADULT_DESC,
        products: {
          bag: { src: aAtunBolsa, alt: 'Bolsa de Ricocat Adultos sabor atún, sardina y trucha' },
          pate: { src: aAtunPate, alt: 'Lata de Ricocat Adultos paté' },
          pouch: { src: aAtunPouch, alt: 'Pouch de Ricocat Adultos trocitos en salsa' },
          trocitos: { src: aAtunTrocitos, alt: 'Lata de Ricocat Adultos trocitos en salsa' },
        },
        cat: { src: aAtunGato, alt: 'Gato gris de ojos azules caminando junto a los productos', pos: { x: -26.5, y: 136.1, w: 329.4 } },
        kibbles: [aAtunK1, aAtunK2, aAtunK3, aAtunK4, aAtunK5],
      },
      {
        id: 'festival-de-sabores',
        name: 'Festival de sabores',
        palette: 'morado',
        description: ADULT_DESC,
        products: {
          bag: { src: aFestivalBolsa, alt: 'Bolsa de Ricocat Adultos sabor festival de sabores' },
          pate: { src: aFestivalPate, alt: 'Lata de Ricocat Adultos paté' },
          pouch: { src: aFestivalPouch, alt: 'Pouch de Ricocat Adultos trocitos en salsa' },
          trocitos: { src: aFestivalTrocitos, alt: 'Lata de Ricocat Adultos trocitos en salsa' },
        },
        cat: { src: aFestivalGato, alt: 'Gato atigrado naranja caminando junto a los productos', pos: { x: -16.8, y: 166.3, w: 265 } },
        kibbles: [aFestivalK1, aFestivalK2, aFestivalK3, aFestivalK4, aFestivalK5],
      },
      {
        id: 'pollo-sardina-salmon',
        name: 'Pollo, sardina y salmón',
        palette: 'naranja',
        description: ADULT_DESC,
        products: {
          bag: { src: aPolloBolsa, alt: 'Bolsa de Ricocat Adultos sabor pollo, sardina y salmón' },
          pate: { src: aPolloPate, alt: 'Lata de Ricocat Adultos paté' },
          pouch: { src: aPolloPouch, alt: 'Pouch de Ricocat Adultos trocitos en salsa' },
          trocitos: { src: aPolloTrocitos, alt: 'Lata de Ricocat Adultos trocitos en salsa' },
        },
        cat: { src: aPolloGato, alt: 'Gato atigrado gris de pie junto a los productos', pos: { x: -8.3, y: 150.9, w: 260.2 } },
        kibbles: [aPolloK1, aPolloK2, aPolloK3, aPolloK4, aPolloK5],
      },
      {
        id: 'carne-salmon-leche',
        name: 'Carne, salmón y leche',
        palette: 'guinda',
        description: ADULT_DESC,
        products: {
          bag: { src: aCarneBolsa, alt: 'Bolsa de Ricocat Adultos sabor carne, salmón y leche' },
          pate: { src: aCarnePate, alt: 'Lata de Ricocat Adultos paté sabor carne' },
          pouch: { src: aCarnePouch, alt: 'Pouch de Ricocat Adultos trocitos en salsa sabor salmón' },
          trocitos: { src: aCarneTrocitos, alt: 'Lata de Ricocat Adultos trocitos en salsa' },
        },
        cat: { src: aCarneGato, alt: 'Gato naranja y blanco de pie junto a los productos', pos: { x: -42.3, y: 160.8, w: 265 } },
        kibbles: [aCarneK1, aCarneK2, aCarneK3, aCarneK4, aCarneK5],
      },
    ],
  },
  {
    id: 'esterilizados',
    name: 'Esterilizados',
    palette: 'marron',
    layout: 'duo',
    cta: { label: 'Ver producto', stores: 'esterilizados' },
    benefits: [
      { icon: 'icono-tipos-peso-optimo', bold: 'Peso', rest: 'óptimo' },
      { icon: 'icono-tipos-optima-vision', bold: 'Óptima', rest: 'visión' },
      { icon: 'icono-tipos-control-bolas-de-pelo', bold: 'Control', rest: 'de bolas de pelo' },
      { icon: 'icono-tipos-previene-calculos', bold: 'Previene', rest: 'cálculos urinarios' },
    ],
    flavors: [
      {
        id: 'receta-unica',
        name: 'Receta única',
        description: 'Mayor aporte de fibra y bajo contenido de grasa para un peso saludable, con acidificantes que regulan el pH de su orina.',
        products: {
          bag: { src: eBolsa, alt: 'Bolsa de Ricocat Adultos Esterilizados' },
          pate: { src: ePate, alt: 'Lata de Ricocat Adultos Esterilizados paté' },
        },
        cat: { src: eGato, alt: 'Gato siamés claro de pie junto a los productos', pos: { x: -14.7, y: 112.3, w: 311.0 } },
        kibbles: [eK1, eK2, eK3, eK4, eK5],
      },
    ],
  },
];
