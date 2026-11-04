import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ricocat-muestra.example.com', // provisorio: igual que SITE_URL en src/data/site.js
  output: 'static',
  compressHTML: true,
  build: { inlineStylesheets: 'always' },
});
