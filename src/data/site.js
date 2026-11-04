// Publicación: versión de muestra (no indexable). Pasar a false en el lanzamiento real.
export const IS_PREVIEW = true;
// URL pública del sitio (canonical y Open Graph). Provisoria hasta tener el dominio.
export const SITE_URL = 'https://ricocat-muestra.example.com';
// Archivos para compartir y favicon (en public/). Provisorios: reemplazar por los del cliente.
export const SHARE_IMAGE = '/og-image.jpg'; // 1200×630
export const FAVICON = '/favicon.svg'; // isotipo blanco sobre azul de marca
export const APPLE_TOUCH_ICON = '/apple-touch-icon.png'; // 180×180, a sangre (iOS redondea)

export const adoptLink = { label: 'Adopta un gatito', href: '#adopta' };
export const buyLink = { label: 'Dónde comprar', href: '#tienda' };

// 12 · Adopta un gatito: links del aliado de adopciones (pendientes del cliente, por ahora "#").
export const adoptPartner = { adoptUrl: '#', partnerUrl: '#' };

export const navLinks = [
  { label: 'Alimentos', href: '#alimentos' },
  { label: 'Etapas de vida', href: '#etapas' },
  { label: 'Productos', href: '#tienda' },
];

// Navegación del footer (scroll suave a cada sección).
export const footerLinks = [
  { label: 'Alimentos', href: '#tipos' },
  { label: 'Etapas de vida', href: '#etapa-gatitos' },
  { label: 'Productos', href: '#tienda' },
  { label: 'Adopta', href: '#adopta' },
];

// Links legales: pendientes. Cuando lleguen, agrégalos aquí ({ label, href }) y aparecen en la barra final.
export const legalLinks = [];

// TODO: URLs pendientes del cliente.
export const socialLinks = [
  { label: 'Facebook', icon: 'red-facebook', href: '#' },
  { label: 'Instagram', icon: 'red-instagram', href: '#' },
  { label: 'YouTube', icon: 'red-youtube', href: '#' },
];

export const benefits = [
  { icon: 'icono-previene-calculos-urinarios', lines: ['Previene cálculos', 'urinarios'] },
  { icon: 'icono-corazon-sano', lines: ['Corazón', 'sano y fuerte'] },
  { icon: 'icono-control-bolas-de-pelo', lines: ['Control de bolas', 'de pelo'] },
];

// Milisegundos por beneficio en el carrusel mobile.
export const benefitsInterval = 3000;
