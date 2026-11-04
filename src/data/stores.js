/**
 * Tiendas para "Dónde comprar" (fuente: ricocat-links-v3_2.json del cliente). logo: ruta/URL (null = placeholder "LOGO").
 * Los links por producto van en product-links.js. Si un producto no está en una tienda, esa tienda no aparece.
 */
export const STORES = [
  { id: 'plaza-vea', name: 'Plaza Vea', type: 'Supermercado', logo: null },
  { id: 'tottus', name: 'Tottus', type: 'Supermercado', logo: null },
  { id: 'metro', name: 'Metro', type: 'Supermercado', logo: null },
  { id: 'wong', name: 'Wong', type: 'Supermercado', logo: null },
  { id: 'vivanda', name: 'Vivanda', type: 'Supermercado', logo: null },
  { id: 'superpet', name: 'Superpet', type: 'Pet shop', logo: null },
  { id: 'naricitas', name: 'Naricitas', type: 'Pet shop', logo: null },
  { id: 'gopet', name: 'GoPet', type: 'Pet shop', logo: null },
  { id: 'mascotify', name: 'Mascotify', type: 'Pet shop', logo: null },
  { id: 'promart', name: 'Promart', type: 'Otras tiendas', logo: null },
  { id: 'makro', name: 'Makro', type: 'Supermercado', logo: null },
  { id: 'mascota-veloz', name: 'Mascota Veloz', type: 'Pet shop', logo: null },
  { id: 'pikotin', name: 'Pikotin', type: 'Pet shop', logo: null },
  { id: 'casa-mascotas', name: 'Casa Mascotas', type: 'Pet shop', logo: null },
  { id: 'petlover', name: 'Petlover', type: 'Pet shop', logo: null },
  { id: 'vamos-pet-shop', name: 'Vamos Pet Shop', type: 'Pet shop', logo: null },
  { id: 'choco-pet', name: 'Choco.pet', type: 'Pet shop', logo: null },
  { id: 'real-plaza', name: 'Real Plaza', type: 'Otras tiendas', logo: null },
  { id: 'convet', name: 'Convet', type: 'Pet shop', logo: null },
  { id: 'vega', name: 'Vega', type: 'Supermercado', logo: null },
  { id: 'oechsle', name: 'Oechsle', type: 'Otras tiendas', logo: null },
  { id: 'falabella', name: 'Falabella', type: 'Otras tiendas', logo: null },
  { id: 'garuka', name: 'Garuka', type: 'Pet shop', logo: null },
  { id: 'rappi', name: 'Rappi', type: 'Delivery', logo: null },
];

/** Tiendas de un producto con link directo, en el orden de STORES. */
export function storesFor(product) {
  const byId = new Map((product?.stores ?? []).map((x) => [x.id, x.url]));
  return STORES.filter((s) => byId.get(s.id)).map((s) => ({ ...s, url: byId.get(s.id) }));
}
