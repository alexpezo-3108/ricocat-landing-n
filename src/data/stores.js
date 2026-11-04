/**
 * Tiendas para "Dónde comprar" (fuente: ricocat-links-v3_2.json del cliente). logo: ruta en public/stores (ícono cuadrado 192×192 con fondo y esquinas propios; null = placeholder "LOGO").
 * Los links por producto van en product-links.js. Si un producto no está en una tienda, esa tienda no aparece.
 */
export const STORES = [
  { id: 'plaza-vea', name: 'Plaza Vea', type: 'Supermercado', logo: '/stores/plaza-vea.webp' },
  { id: 'tottus', name: 'Tottus', type: 'Supermercado', logo: '/stores/tottus.webp' },
  { id: 'metro', name: 'Metro', type: 'Supermercado', logo: '/stores/metro.webp' },
  { id: 'wong', name: 'Wong', type: 'Supermercado', logo: '/stores/wong.webp' },
  { id: 'vivanda', name: 'Vivanda', type: 'Supermercado', logo: '/stores/vivanda.webp' },
  { id: 'superpet', name: 'Superpet', type: 'Pet shop', logo: '/stores/superpet.webp' },
  { id: 'naricitas', name: 'Naricitas', type: 'Pet shop', logo: '/stores/naricitas.webp' },
  { id: 'gopet', name: 'GoPet', type: 'Pet shop', logo: '/stores/gopet.webp' },
  { id: 'mascotify', name: 'Mascotify', type: 'Pet shop', logo: '/stores/mascotify.webp' },
  { id: 'promart', name: 'Promart', type: 'Otras tiendas', logo: '/stores/promart.webp' },
  { id: 'makro', name: 'Makro', type: 'Supermercado', logo: '/stores/makro.webp' },
  { id: 'mascota-veloz', name: 'Mascota Veloz', type: 'Pet shop', logo: '/stores/mascota-veloz.webp' },
  { id: 'pikotin', name: 'Pikotin', type: 'Pet shop', logo: '/stores/pikotin.webp' },
  { id: 'casa-mascotas', name: 'Casa Mascotas', type: 'Pet shop', logo: '/stores/casa-mascotas.webp' },
  { id: 'petlover', name: 'Petlover', type: 'Pet shop', logo: '/stores/petlover.webp' },
  { id: 'vamos-pet-shop', name: 'Vamos Pet Shop', type: 'Pet shop', logo: '/stores/vamos-pet-shop.webp' },
  { id: 'choco-pet', name: 'Choco.pet', type: 'Pet shop', logo: '/stores/choco-pet.webp' },
  { id: 'real-plaza', name: 'Real Plaza', type: 'Otras tiendas', logo: '/stores/real-plaza.webp' },
  { id: 'convet', name: 'Convet', type: 'Pet shop', logo: '/stores/convet.webp' },
  { id: 'vega', name: 'Vega', type: 'Supermercado', logo: '/stores/vega.webp' },
  { id: 'oechsle', name: 'Oechsle', type: 'Otras tiendas', logo: '/stores/oechsle.webp' },
  { id: 'falabella', name: 'Falabella', type: 'Otras tiendas', logo: '/stores/falabella.webp' },
  { id: 'garuka', name: 'Garuka', type: 'Pet shop', logo: '/stores/garuka.webp' },
  { id: 'rappi', name: 'Rappi', type: 'Delivery', logo: '/stores/rappi.webp' },
];

/** Tiendas de un producto con link directo, en el orden de STORES. */
export function storesFor(product) {
  const byId = new Map((product?.stores ?? []).map((x) => [x.id, x.url]));
  return STORES.filter((s) => byId.get(s.id)).map((s) => ({ ...s, url: byId.get(s.id) }));
}
