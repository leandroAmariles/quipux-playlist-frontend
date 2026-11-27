# AI-LOG

Registro del uso de IA en el bloque web de HU-14 (recomendaciones en la web). El del resto del módulo está en el
repositorio de backend, que esta entrega no modifica; se usa su mismo formato.

Asistente: Claude Code con el modelo Claude Sonnet 5.5.

## 1. Prompts

Cada entrada dice qué se pidió, qué devolvió la IA, qué se aceptó o corregido y cómo se verificó.

### P01 · 2026-11-27 · Especificación

- **Prompt**: «Genera la especificacion de la HU-14, bloque web, tipo feature: Recomendaciones en la web», según
  `backlog-ia.md` y el ADR-0002, en `specs/14-web-recommendations`, sobre la rama ya existente; solo el bloque web, sin
  tocar backend, infra ni las otras carpetas de trabajo, salvo marcar los tres criterios web en `backlog-ia.md`.
- **Respuesta**: `spec.md` (3 historias, 21 requisitos, 6 criterios de éxito) y su checklist. Advirtió que la web
  cortaba a los 10 s y la API puede tardar 30 s. No ejecutó el hook que crea ramas ni marcó el backlog antes de
  entregar.
- **Aceptado o corregido**: la persona usuaria pidió el siguiente paso sin pedir cambios.
- **Verificación**: contraste con el contrato de HU-12 en el código del backend; checklist 16 de 16.

### P02 · 2026-11-27 · Plan

- **Prompt**: «Haz el plan»
- **Respuesta**: `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md` y `quickstart.md`.
- **Aceptado o corregido**: la persona usuaria pidió el siguiente paso sin pedir cambios.
- **Verificación**: lectura del código de `@angular/common` 22.3.0. Mostró que el interceptor pisaría cualquier tiempo de
  espera mayor puesto por un servicio (`research.md`, punto 1).

### P03 · 2026-11-27 · Tareas

- **Prompt**: «Genera las tareas»
- **Respuesta**: `tasks.md` con 39 tareas.
- **Aceptado o corregido**: la persona usuaria pidió implementarlas.
- **Verificación**: comprobación automática de formato, numeración, etiquetas y rutas.

### P04 · 2026-11-27 · Implementación

- **Prompt**: «Implementa»
- **Respuesta**: el código de las tres historias, con las pruebas escritas antes que el código:
  - Nuevos: `src/app/api/recommendation*.ts`, `src/app/features/playlists/detail/recommendations/` y
    `src/testing/fixtures/recommendations.json`.
  - Cambiados: interceptor, `error-message.ts`, constantes y textos, página de detalle y `README.md`.
- **Corregido sobre la marcha por la propia IA**:
  - Una tabla `it.each` que no compilaba por tipos.
  - El guion de validación esperaba una respuesta HTTP con la API detenida; lo que hay que esperar es el mensaje.
  - `quickstart.md` mandaba usar `-p quipux-ia`, que habría reemplazado la pila de otra carpeta de trabajo; se usó
    `quipux-web`.
- **Aceptado o corregido por la persona usuaria**: pidió el PR sin pedir cambios; la revisión se hace en él.
- **Verificación**: 161 pruebas, lint, build y las comprobaciones de `quickstart.md` en un navegador contra la API y el
  modelo reales (sección «Resultados» de ese archivo).

## 2. Autoría de las pruebas

- Las pruebas automáticas de esta historia (55) las generó la IA; la persona usuaria no ha añadido ninguna a mano.
- Las comprobaciones «a mano» de `quickstart.md` las ejecutó la IA con un guion temporal de navegador, no una persona.

## 3. Límites conocidos

- Con la API recién detenida, el error de las recomendaciones puede tardar los 35 s completos.
- Anular o abandonar una petición no la descuenta del límite por usuario de la API.
- Si `AI_TIMEOUT` se sube por encima de 35 s, la web mostrará error antes de que la API responda.
