import { PRODUCT_LINKS } from './product-links.js';

/**
 * Portafolio para "Elige tu Ricocat" (tienda).
 * palette = escala de color de tokens.css (rosa, azul, morado, naranja, guinda, marron): degradado -200, acento -600.
 * image = archivo en src/assets/images/products/. Las marcadas con `provisional` usan la foto de otro producto
 * de la misma línea hasta tener la definitiva (nombre sugerido en `imageName`).
 * flavorId = sabor equivalente en src/data/stages.js (para abrir "Dónde comprar" desde las etapas de vida).
 * stores (opcional) = [{ id, url }] tiendas donde está disponible; si falta se muestran todas con link "#".
 */

export const STAGES = [
  { value: 'all', label: 'Todos', selectLabel: 'Todas' },
  { value: 'gatitos', label: 'Gatitos' },
  { value: 'adultos', label: 'Adultos' },
  { value: 'esterilizados', label: 'Esterilizados' },
];

export const FORMATS = [
  { value: 'all', label: 'Todos' },
  { value: 'seco', label: 'Seco' },
  { value: 'humedo', label: 'Húmedo' },
];

/** Solo se muestra cuando la etapa es Adultos: un sabor por línea de color de Adultos (como en Etapas de vida).
 *  Filtra por palette: incluye todos los productos de ese color (secos y húmedos). */
export const FLAVORS = [
  { value: 'all', label: 'Todos' },
  { value: 'azul', label: 'Atún, sardina y trucha' },
  { value: 'morado', label: 'Festival de sabores' },
  { value: 'naranja', label: 'Pollo, sardina y salmón' },
  { value: 'guinda', label: 'Carne, salmón y leche' },
];

export const PAGE_SIZE = 8;

/** Envase según la presentación: define la altura objetivo del producto (--store-fit-* en tokens.css). */
const packOf = (presentation) =>
  /bolsa/i.test(presentation) ? 'bolsa' : /pouch/i.test(presentation) ? 'pouch' : /330/.test(presentation) ? 'lata-330' : 'lata';

/**
 * fit: medidas de la foto (px) y fracción que ocupa el producto (content) / margen vacío bajo él (bottom),
 * medidas automáticamente para normalizar. Ajuste fino opcional por producto: offsetY (px, + baja) y scale (multiplicador).
 */
const p = (id, name, stage, format, presentation, palette, image, extra = {}) => ({
  id, name, stage, format, presentation, palette, image, pack: packOf(presentation), ...extra,
});

export const products = [
  // Seco (bolsa)
  p('seco-gatitos', 'Carne, pescado y leche', 'gatitos', 'seco', 'Bolsa', 'rosa', 'gatitos-bolsa.png', { flavorId: 'carne-pescado-leche', fit: { w: 600, h: 600, content: 0.768, bottom: 0.125 } }),
  p('seco-atun', 'Atún, sardina y trucha', 'adultos', 'seco', 'Bolsa', 'azul', 'atun-bolsa.png', { flavorId: 'atun-sardina-trucha', flavors: ['pescado'], fit: { w: 1000, h: 1000, content: 0.799, bottom: 0.102 } }),
  p('seco-festival', 'Festival de sabores', 'adultos', 'seco', 'Bolsa', 'morado', 'festival-bolsa.png', { flavorId: 'festival-de-sabores', flavors: ['pescado', 'pollo', 'carne', 'salmon'], fit: { w: 500, h: 500, content: 0.8, bottom: 0.102 } }),
  p('seco-pollo', 'Pollo, sardina y salmón', 'adultos', 'seco', 'Bolsa', 'naranja', 'pollo-bolsa.png', { flavorId: 'pollo-sardina-salmon', flavors: ['pollo', 'pescado', 'salmon'], fit: { w: 600, h: 600, content: 0.763, bottom: 0.13 } }),
  p('seco-carne-salmon', 'Carne, salmón y leche', 'adultos', 'seco', 'Bolsa', 'guinda', 'carne-salmon-bolsa.png', { flavorId: 'carne-salmon-leche', flavors: ['carne', 'salmon'], fit: { w: 600, h: 600, content: 0.768, bottom: 0.125 } }),
  p('seco-esterilizados', 'Receta para esterilizados', 'esterilizados', 'seco', 'Bolsa', 'marron', 'esterilizados-bolsa.png', { flavorId: 'receta-unica', fit: { w: 500, h: 500, content: 0.8, bottom: 0.102 } }),

  // Paté lata 330 g
  p('pate-higado-pollo-330', 'Paté hígado y pollo', 'adultos', 'humedo', 'Lata 330 g', 'naranja', 'pate-higado-pollo-330g.png', { flavors: ['pollo'], fit: { w: 500, h: 500, content: 0.686, bottom: 0.178 } }),
  p('pate-sardina-pollo-330', 'Paté sardina y pollo', 'adultos', 'humedo', 'Lata 330 g', 'azul', 'pate-sardina-pollo-330g.png', { flavors: ['pescado', 'pollo'], fit: { w: 500, h: 500, content: 0.686, bottom: 0.178 } }),
  p('pate-pavo-higado-330', 'Paté pavo e hígado', 'adultos', 'humedo', 'Lata 330 g', 'morado', 'pate-pavo-higado-330g.png', { flavors: ['pavo'], fit: { w: 500, h: 500, content: 0.686, bottom: 0.178 } }),

  // Paté lata 180 g
  p('pate-gatitos-180', 'Paté gatitos', 'gatitos', 'humedo', 'Lata 180 g', 'rosa', 'pate-gatitos-180g.png', { fit: { w: 500, h: 500, content: 0.454, bottom: 0.272 } }),
  p('pate-atun-180', 'Paté atún y pescado', 'adultos', 'humedo', 'Lata 180 g', 'azul', 'pate-atun-pescado-180g.png', { flavors: ['pescado'], fit: { w: 500, h: 500, content: 0.606, bottom: 0.196 } }),
  p('pate-salmon-180', 'Paté salmón', 'adultos', 'humedo', 'Lata 180 g', 'guinda', 'pate-salmon-180g.png', { flavors: ['salmon'], fit: { w: 500, h: 500, content: 0.606, bottom: 0.196 } }),
  p('pate-carne-180', 'Paté carne', 'adultos', 'humedo', 'Lata 180 g', 'guinda', 'carne-salmon-lata-pate.png', { flavors: ['carne'], provisional: true, imageName: 'Producto Paté carne 180g', fit: { w: 360, h: 272, content: 0.68, bottom: 0.158 } }),
  p('pate-esterilizados-180', 'Paté esterilizados', 'esterilizados', 'humedo', 'Lata 180 g', 'marron', 'pate-esterilizados-180g.png', { fit: { w: 500, h: 500, content: 0.524, bottom: 0.236 } }),

  // Trocitos en salsa, lata 190 g
  p('trocitos-carne-lata', 'Trocitos en salsa sabor carne', 'gatitos', 'humedo', 'Lata 190 g', 'rosa', 'trocitos-carne-lata-190g.png', { fit: { w: 500, h: 500, content: 0.606, bottom: 0.196 } }),
  p('trocitos-pollo-lata', 'Trocitos en salsa sabor pollo', 'adultos', 'humedo', 'Lata 190 g', 'naranja', 'trocitos-pollo-lata-190g.png', { flavors: ['pollo'], fit: { w: 500, h: 500, content: 0.606, bottom: 0.196 } }),
  p('trocitos-pescado-lata', 'Trocitos en salsa sabor pescado', 'adultos', 'humedo', 'Lata 190 g', 'azul', 'trocitos-pescado-lata-190g.png', { flavors: ['pescado'], fit: { w: 500, h: 500, content: 0.606, bottom: 0.196 } }),

  // Trocitos en salsa, pouch 85 g
  p('trocitos-carne-pouch', 'Trocitos en salsa sabor carne', 'gatitos', 'humedo', 'Pouch 85 g', 'rosa', 'trocitos-carne-pouch-85g.png', { fit: { w: 500, h: 500, content: 0.748, bottom: 0.14 } }),
  p('trocitos-marinos-pouch', 'Trocitos en salsa sabores marinos', 'adultos', 'humedo', 'Pouch 85 g', 'azul', 'trocitos-marinos-pouch-85g.png', { flavors: ['pescado'], fit: { w: 500, h: 500, content: 0.748, bottom: 0.14 } }),
  p('trocitos-pollo-pouch', 'Trocitos en salsa sabor pollo', 'adultos', 'humedo', 'Pouch 85 g', 'naranja', 'trocitos-pollo-pouch-85g.png', { flavors: ['pollo'], fit: { w: 500, h: 500, content: 0.748, bottom: 0.14 } }),
  p('trocitos-salmon-pouch', 'Trocitos en salsa sabor salmón', 'adultos', 'humedo', 'Pouch 85 g', 'guinda', 'trocitos-salmon-pouch-85g.png', { flavors: ['salmon'], fit: { w: 500, h: 500, content: 0.748, bottom: 0.14 } }),
  p('trocitos-pescado-pouch', 'Trocitos en salsa sabor pescado', 'adultos', 'humedo', 'Pouch 85 g', 'azul', 'trocitos-pescado-pouch-85g.png', { flavors: ['pescado'], fit: { w: 500, h: 500, content: 0.748, bottom: 0.14 } }),

  // Filetitos en salsa
  p('filetitos-atun-lata', 'Filetitos en salsa sabor atún', 'adultos', 'humedo', 'Lata 190 g', 'azul', 'filetitos-atun-lata-190g.png', { flavors: ['pescado'], fit: { w: 500, h: 500, content: 0.678, bottom: 0.16 } }),
  p('filetitos-pavo-lata', 'Filetitos en salsa sabor pavo', 'adultos', 'humedo', 'Lata 190 g', 'morado', 'filetitos-pavo-lata-190g.png', { flavors: ['pavo'], fit: { w: 500, h: 500, content: 0.678, bottom: 0.16 } }),
  p('filetitos-atun-pouch', 'Filetitos en salsa sabor atún', 'adultos', 'humedo', 'Pouch 85 g', 'azul', 'filetitos-atun-pouch-85g.png', { flavors: ['pescado'], fit: { w: 500, h: 500, content: 0.748, bottom: 0.14 } }),
  p('filetitos-pavo-pouch', 'Filetitos en salsa sabor pavo', 'adultos', 'humedo', 'Pouch 85 g', 'morado', 'filetitos-pavo-pouch-85g.png', { flavors: ['pavo'], fit: { w: 500, h: 500, content: 0.748, bottom: 0.14 } }),
];

// Nombres repetidos (lata y pouch): se muestra la presentación junto al nombre.
const counts = products.reduce((m, x) => m.set(x.name, (m.get(x.name) ?? 0) + 1), new Map());
for (const x of products) x.showPresentation = counts.get(x.name) > 1;

export const labelOf = (list, value) => list.find((o) => o.value === value)?.label ?? value;


products.forEach((pr) => { pr.stores = PRODUCT_LINKS[pr.id] ?? []; });
