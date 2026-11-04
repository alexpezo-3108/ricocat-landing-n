# Ricocat — Landing

Astro 100% estático + CSS nativo.

```
npm install
npm run dev      # desarrollo
npm run build    # salida estática en dist/
```

- Tokens (color, tipo, espacio, motion): `src/styles/tokens.css`
- Keyframes y reduced-motion: `src/styles/motion.css`
- Contenido (links, beneficios, intervalo del carrusel): `src/data/site.js`
- Secciones: `src/components/sections/` · UI reutilizable: `src/components/ui/`
- Imágenes: `src/assets/images/` (Astro genera AVIF/WebP responsive) · SVG: `src/assets/svg/`
- `Ricocat Hero Preview.dc.html` es solo una vista previa de diseño (usa los mismos CSS/JS); no forma parte del build.

## Publicar la muestra (Vercel)

1. Subir el proyecto a un repositorio de GitHub (con `package-lock.json`: se genera con `npm install`).
2. En Vercel: **Add New… → Project** e importar el repositorio. Vercel detecta Astro; no hace falta cambiar nada (`vercel.json` ya fija build `npm run build` y salida `dist`).
3. **Deploy**. Copiar la URL asignada (ej. `ricocat-muestra.vercel.app`) en `SITE_URL` (`src/data/site.js`) y en `site` (`astro.config.mjs`), y hacer push para volver a publicar.

La muestra sale con `noindex, nofollow` y un `robots.txt` que bloquea la indexación (`IS_PREVIEW = true`).

### Para el lanzamiento real
- Conectar el dominio final en Vercel y ponerlo en `SITE_URL` y en `site`.
- `src/data/site.js`: `IS_PREVIEW = false`.
- `public/`: agregar `og-image.jpg` (1200×630) y `favicon.svg` del cliente.
- Hacer push para volver a publicar.
