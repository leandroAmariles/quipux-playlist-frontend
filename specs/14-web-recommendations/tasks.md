---
description: "Tareas de HU-14, bloque web: recomendaciones en la web"
---

# Tasks: Recomendaciones en la web

**Input**: Design documents from `specs/14-web-recommendations/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md),
[contracts/ui-contract.md](contracts/ui-contract.md), [quickstart.md](quickstart.md)

**Tests**: obligatorias (FR-017). En cada fase se escriben antes que el código y deben fallar primero; un `import` de un
archivo que aún no existe hace fallar la compilación de las pruebas, y cuenta como fallo.

**Rutas**: relativas al repositorio `quipux-playlist-frontend`, en la rama `feature/14-web-recommendations`. No se
modifican `quipux-playlist-backend`, `quipux-playlist-infra` ni las carpetas `Quipux music app AI` y
`Quipux music app AI-ia`; la única excepción es T038.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin depender de tareas sin terminar)
- **[Story]**: historia de `spec.md` (US1, US2, US3)

---

## Phase 1: Setup

- [X] T001 Comprobar la línea base con las versiones de `package-lock.json`: `npm ci`, `npm test` (106 pruebas antes de esta historia) y `npm run lint`, todo en verde
- [X] T002 [P] Crear `AI-LOG.md` en la raíz, en español, con el asistente y el modelo usados y una entrada por prompt (pedido, respuesta, aceptado o corregido, verificación): P01 «Genera la especificacion de la HU-14, bloque web» → `spec.md` y checklist, sin cambios pedidos; P02 «Haz el plan» → `plan.md` y documentos de diseño, con el hallazgo de `research.md` punto 1 verificado en el código de Angular; P03 «Genera las tareas» → `tasks.md`. Sin rutas locales ni datos personales (FR-020)

---

## Phase 2: Foundational (bloquea las tres historias)

**Purpose**: poder pedir las recomendaciones con el tiempo de espera correcto.

- [X] T003 [P] Crear `src/testing/fixtures/recommendations.json` con respuestas del contrato de HU-12 y datos ficticios: `ai` (`IA`, dos sugerencias con `idCatalogo` vacío, una con `genero` y `motivo` vacíos), `fallback` (`RESPALDO` con sugerencias), `empty` (`RESPALDO` sin ninguna), `similarity` (`SIMILITUD` con `idCatalogo`), `verified` (`IA` con `idCatalogo`) y `markup` (`IA` con `<img src=x onerror=alert(1)>` en `motivo`)
- [X] T004 [P] Añadir `RECOMMENDATIONS_TIMEOUT_MS = 35_000` en `src/app/core/constants/settings.ts`
- [X] T005 [P] Añadir `recommendationsPath(name)` en `src/app/core/constants/api-path.ts`, como `playlistPath(name)` seguido de `/recommendations`
- [X] T006 [P] Añadir en `src/app/core/http/auth-interceptor.spec.ts` la prueba de que una petición a la API que ya trae `timeout` lo conserva; la prueba actual de los 10 s se mantiene (FR-004)
- [X] T007 En `src/app/core/http/auth-interceptor.ts`, aplicar `request.timeout ?? REQUEST_TIMEOUT_MS` en lugar de fijar siempre 10 s (research.md punto 1; depende de T006)
- [X] T008 [P] Crear `src/app/api/recommendation.model.ts` con el enum `RecommendationOrigin` y las interfaces `Recommendation` y `RecommendationSet`, según `data-model.md`: `RecommendationSet.origin`, `RecommendationSet.items`, `Recommendation.catalogId`, `Recommendation.title`, `Recommendation.artist`, `Recommendation.genre` y `Recommendation.reason`
- [X] T009 [P] Crear `src/app/api/recommendation.dto.ts` con `RecommendationsDto` y `RecommendationDto`, tabla «Respuesta de la API» de `data-model.md`
- [X] T010 Crear `src/app/api/recommendation.mapper.ts` con `toRecommendationSet`, que conserva el orden y no transforma los valores vacíos (depende de T008 y T009)
- [X] T011 Crear `src/app/api/recommendation-api.spec.ts`, montando `authInterceptor` con `provideHttpClient(withInterceptors(...))`: `GET` a `recommendationsPath(name)`, nombre codificado para cada `specialNames` de `src/testing/fixtures/playlists.json`, `request.timeout` igual a `RECOMMENDATIONS_TIMEOUT_MS`, token presente y mapeo de `ai` (depende de T003 a T005 y T007)
- [X] T012 Crear `src/app/api/recommendation-api.ts` con `RecommendationApi.get(name)`, que pide con `timeout: RECOMMENDATIONS_TIMEOUT_MS` y mapea con `toRecommendationSet` (depende de T010 y T011)

**Checkpoint**: `npm test` en verde.

---

## Phase 3: User Story 1 - Pedir sugerencias desde el detalle (Priority: P1) 🎯 MVP

**Goal**: un botón en el detalle que pide las sugerencias y las muestra.

**Independent Test**: abrir el detalle, pulsar el botón y ver la carga y las sugerencias o el aviso de que no hay.

### Tests for User Story 1

- [X] T013 [P] [US1] Crear `src/app/features/playlists/detail/recommendations/recommendations-panel.spec.ts` (HTTP simulado, utilidades de `src/testing/dom.ts`): no pide nada al pintarse; al pulsar `button.recommend` muestra `RECOMMENDATIONS_LOADING` e inhabilita el botón; una segunda pulsación no lanza otra petición; muestra las filas en orden con `—` en los valores vacíos; muestra `NO_RECOMMENDATIONS` con `empty`; el marcado de `markup` se ve literal y no crea ningún `img`; volver a pulsar borra el resultado anterior y pide de nuevo; destruir el componente cancela la petición pendiente (FR-002, FR-003, FR-005, FR-006, FR-007, FR-011)
- [X] T014 [P] [US1] Añadir en `src/app/features/playlists/detail/playlist-detail-page.spec.ts`: el botón no existe mientras carga, con error ni con lista inexistente; existe con el detalle cargado, con y sin canciones, sin haber pedido recomendaciones; mientras se buscan, las canciones siguen a la vista; cambiar la entrada `name` con una petición pendiente la deja cancelada y el panel nuevo vuelve a estar sin pedir (FR-001, FR-003, FR-005)

### Implementation for User Story 1

- [X] T015 [US1] Añadir a `UiText`, en `src/app/core/constants/ui-text.ts`, `RECOMMENDATIONS`, `GET_RECOMMENDATIONS`, `RECOMMENDATIONS_LOADING`, `NO_RECOMMENDATIONS` y `REASON`, con los textos de `contracts/ui-contract.md`
- [X] T016 [US1] Crear `recommendations-panel.ts` y `recommendations-panel.html` en `src/app/features/playlists/detail/recommendations/`: selector `app-recommendations-panel`, entrada `playlistName = input.required<string>()`, `styleUrl: '../playlist-detail-page.css'`, señal `state` (`ViewState | null`) según «Estado del panel» de `data-model.md`, `takeUntilDestroyed`, carga con `role="status"` y tabla con `Recommendation.title`, `Recommendation.artist`, `Recommendation.genre` y `Recommendation.reason` de `data-model.md`, solo con interpolación (depende de T012 a T015)
- [X] T017 [US1] Pintar `<app-recommendations-panel [playlistName]="current.name" />` debajo de las canciones en `src/app/features/playlists/detail/playlist-detail-page.html`, importarlo en `playlist-detail-page.ts` y añadir `overflow-wrap: anywhere` a las celdas en `playlist-detail-page.css` (depende de T016)
- [X] T018 [US1] Ejecutar `npm test` y dejar en verde T013, T014 y las pruebas anteriores de `src/app/features/playlists/`

**Checkpoint**: se piden y se ven sugerencias. Los errores todavía no se tratan (US3).

---

## Phase 4: User Story 2 - Saber de dónde vienen las sugerencias (Priority: P2)

**Goal**: cada respuesta dice su origen y avisa de lo no verificado.

**Independent Test**: mostrar una respuesta de cada origen y comprobar su texto.

### Tests for User Story 2

- [X] T019 [US2] Añadir en `src/app/features/playlists/detail/recommendations/recommendations-panel.spec.ts`: texto propio para `ai`, `fallback` y `similarity`; el origen se ve también con `empty`; `UNVERIFIED_RECOMMENDATIONS` aparece con `ai` y no con `verified`, `fallback` ni `similarity`; el origen no usa `role="alert"` (FR-008 a FR-011)

### Implementation for User Story 2

- [X] T020 [US2] Añadir a `UiText`, en `src/app/core/constants/ui-text.ts`, `ORIGIN_AI`, `ORIGIN_FALLBACK`, `ORIGIN_SIMILARITY` y `UNVERIFIED_RECOMMENDATIONS`, con los textos de `contracts/ui-contract.md`
- [X] T021 [US2] En `recommendations-panel.ts` y `recommendations-panel.html`, de `src/app/features/playlists/detail/recommendations/`, mostrar el texto según `RecommendationSet.origin` encima de las sugerencias y el aviso derivado de `RecommendationSet.origin` y `Recommendation.catalogId` («Dato derivado» de `data-model.md`) (depende de T019 y T020)
- [X] T022 [US2] Ejecutar `npm test` y dejar en verde las pruebas de `src/app/features/playlists/detail/`

**Checkpoint**: ningún respaldo se presenta como sugerencia de la IA.

---

## Phase 5: User Story 3 - Entender un fallo y reintentar (Priority: P2)

**Goal**: cada fallo, incluido el `429`, se explica y permite reintentar.

**Independent Test**: simular cada fallo y comprobar el mensaje, que la lista sigue y que el botón funciona.

### Tests for User Story 3

- [X] T023 [P] [US3] Añadir en `src/app/core/http/error-message.spec.ts` las pruebas de `retryAfterSeconds`: entero positivo; cabecera ausente, `0`, negativa, decimal, con texto y fecha HTTP devuelven `null`; un error que no es HTTP devuelve `null` (FR-012)
- [X] T024 [P] [US3] Añadir en `src/app/features/playlists/detail/recommendations/recommendations-panel.spec.ts`: `429` con `Retry-After` muestra `tooManyRequestsText`, y sin él `TOO_MANY_REQUESTS`; `404` muestra `PLAYLIST_NOT_FOUND`; `403`, `FORBIDDEN`; cada estado de `generalStatuses` de `src/testing/fixtures/problems.json`, `GENERIC_ERROR`; el mensaje usa `role="alert"`, el botón queda habilitado, no se lanza ninguna petición sola y un nuevo intento con éxito borra el mensaje (FR-012 a FR-015). El `401` ya lo cubre `auth-interceptor.spec.ts`
- [X] T025 [P] [US3] Añadir en `src/app/features/playlists/detail/playlist-detail-page.spec.ts` que, tras un fallo de las recomendaciones, el nombre, las canciones y el enlace al listado siguen a la vista (FR-013, FR-015)

### Implementation for User Story 3

- [X] T026 [P] [US3] Añadir `TOO_MANY_REQUESTS = 429` a `HttpStatus` en `src/app/core/constants/http-status.ts`
- [X] T027 [P] [US3] Añadir `retryAfterSeconds(error: unknown): number | null` en `src/app/core/http/error-message.ts` (research.md punto 4; depende de T023)
- [X] T028 [P] [US3] Añadir a `src/app/core/constants/ui-text.ts` `UiText.TOO_MANY_REQUESTS` y la función `tooManyRequestsText(seconds)`, con los textos de `contracts/ui-contract.md`
- [X] T029 [US3] En `recommendations-panel.ts` y `recommendations-panel.html`, de `src/app/features/playlists/detail/recommendations/`, tratar el error según «Mensaje de error» de `data-model.md`, reutilizando `hasStatus` y `errorMessage`, y borrarlo al volver a pedir (depende de T024 y T026 a T028)
- [X] T030 [US3] Ejecutar `npm test` y dejar en verde todas las pruebas de `src/`

**Checkpoint**: las tres historias completas.

---

## Phase 6: Polish & entrega

- [X] T031 [P] Actualizar `README.md`: la introducción menciona las recomendaciones y su origen; enlace a `specs/14-web-recommendations/`; la espera de 35 s y que un `AI_TIMEOUT` mayor exige revisarla (FR-019)
- [X] T032 Ejecutar `npm test`, `npm run lint`, `npm run build` (sin avisos de tamaño) y `npx prettier --check "src/**/*.{ts,html,css,json}"`; comprobar que los archivos de `src/` no usan `innerHTML` (FR-018)
- [X] T033 Ejecutar las comprobaciones 1 a 8 de `specs/14-web-recommendations/quickstart.md` contra la pila de Compose con `-p quipux-ia`, con secretos de un solo uso en la terminal y sin crear archivos en `quipux-playlist-infra`; al terminar, `down`
- [X] T034 Ejecutar la comprobación 9 (origen `IA`) de `specs/14-web-recommendations/quickstart.md` si los modelos están disponibles; si no, anotar en ese archivo que no se ejecutó y por qué
- [X] T035 Ejecutar las comprobaciones 10 a 13 de `specs/14-web-recommendations/quickstart.md` con un servidor de prueba escrito en una carpeta temporal fuera de los repositorios
- [X] T036 Anotar en una sección «Resultados» de `specs/14-web-recommendations/quickstart.md` qué se ejecutó, cómo y con qué resultado, incluido lo que no se haya podido comprobar
- [X] T037 Completar `AI-LOG.md` con la implementación: prompt, archivos creados o cambiados, lo corregido sobre lo generado, qué pruebas son de la IA y cuáles manuales, y cómo se verificó (FR-020)
- [X] T038 En `backlog-ia.md` de la carpeta `Quipux music app AI-ia`, marcar solo los criterios de «Recomendaciones en la web» que T032 a T036 hayan verificado; no cambiar ninguna otra línea (FR-021)
- [X] T039 Revisar `git status` y el diff: en `quipux-playlist-frontend` solo cambios de esta historia; `quipux-playlist-backend` y `quipux-playlist-infra` sin cambios; anotar en `specs/14-web-recommendations/quickstart.md` cualquier desviación

---

## Dependencies & Execution Order

```text
Setup ──> Foundational ──> US1 ──┬──> US2 ──┐
                                 └──> US3 ──┴──> Polish
```

- **Foundational** bloquea las tres historias.
- **US2** y **US3** necesitan el panel de US1. No dependen entre sí, pero editan los mismos archivos del panel y
  `ui-text.ts`: conviene hacerlas en orden.
- **Polish**: T038 solo después de T032 a T036.

## Parallel Examples

```text
Foundational: T003, T004, T005, T006, T008, T009
US1:          T013, T014                     (pruebas, antes de implementar)
US3:          T023, T024, T025               (pruebas)  ·  T026, T027, T028 (constantes y utilidades)
```

US2 no tiene tareas paralelas: son pocas y comparten el panel.

## Implementation Strategy

1. **MVP**: Setup, Foundational y US1. Sirve para validar la integración con la API.
2. US2 y comprobar.
3. US3 y comprobar.
4. Polish.

El MVP **no se entrega solo**: el backlog exige también el estado de error con `429` (US3) y el origen (US2).
