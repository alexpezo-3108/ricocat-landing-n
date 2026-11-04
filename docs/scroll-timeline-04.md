# 04 Tipos de alimento — línea de tiempo de scroll

Unidad: **1 pantalla = 1 × `window.innerHeight` px de scroll** (100svh). Todo escala con el alto del viewport; no hay tiempos en segundos, todo va ligado al scroll (con Lenis suavizando la rueda).

## Estructura
- Alto de la sección: **11.3 pantallas** = acercamiento 1 + secuencia 9.3 + tapa de Gatitos 1.
- El escenario (100svh) queda **sticky** cuando el borde superior de la sección llega arriba del viewport.
- `A` = 0 cuando la sección asoma por abajo del viewport. `t` = 0 cuando el escenario queda sticky (`A` = 1).
  - `A = (innerHeight - section.getBoundingClientRect().top) / innerHeight`
  - `t = A - 1` (entre 0 y 9.3)

## Acercamiento (antes del sticky, en A)
| A | Qué pasa |
|---|---|
| 0 → 0.95 | Línea punteada baja hasta el plato |
| 0.25 → 1.0 | Plato se reduce de 1.7 → 1 (mobile 1.5 → 1), curva power2.out |
| 0.95 → 1.35 | Pintado azul (semitono) desde el plato |
| 1.35 → 1.60 | Patrón de íconos aparece en ondas |

## Secuencia (en t, escenario sticky)
| Momento | t inicio → fin | Largo |
|---|---|---|
| Entrada (plato vacío) | 0 → 1.6 | 1.6 |
| Seco | 1.6 → 3.8 | 2.2 |
| Húmedo | 3.8 → 6.2 | 2.4 |
| Mix | 6.2 → 8.0 | 1.8 |
| Salida (plato vacío) | 8.0 → 9.3 | 1.3 |
| Tapa: Gatitos sube y cubre | 9.3 → 10.3 | 1.0 |

### Cambio de plato (contenido/posición)
Mezcla suave (smoothstep) de ±0.35 alrededor de cada frontera; el contenido cambia en la frontera (blend = 0.5):
- Entrada → Seco: 1.25 → 1.95
- Seco → Húmedo: 3.45 → 4.15
- Húmedo → Mix: 5.85 → 6.55
- Mix → Salida: 7.65 → 8.35

### Pausa de lectura (plato quieto, tarjetas/beneficios visibles)
- Seco: 1.985 → 3.415
- Húmedo: 4.22 → 5.78
- Mix: 6.515 → 7.685

### Posición vertical del centro del plato (unidades de diseño)
| | Entrada | Seco | Húmedo | Mix | Salida |
|---|---|---|---|---|---|
| Desktop (lienzo 1440×850) | 425 | 405 | 460 | 577 | 425 |
| Mobile (lienzo 375×760) | 380 | 188 | 188 | 470 | 380 |

## Gancho en vivo (recomendado en lugar de copiar números)
La sección emite en cada frame:

```js
document.querySelector('[data-types]').addEventListener('types:progress', (e) => {
  const { approach, t, total, progress, moment, from, to, blend, plateZoom, plateY, line, paint, wave } = e.detail;
  // approach: 0–1 acercamiento · t: 0–9.3 · progress: t/total · moment: 'entrada'|'seco'|'humedo'|'mix'|'salida'
  // from/to/blend: transición del plato en curso (blend 0–1) · plateZoom: escala actual · plateY: centro en unidades de diseño
});
```

Así, si se ajusta cualquier largo en `tokens.css` (`--types-len-*`, `--types-hold`, `--types-overlap`, `--types-plate-zoom*`), el 3D sigue sincronizado sin tocar nada.
