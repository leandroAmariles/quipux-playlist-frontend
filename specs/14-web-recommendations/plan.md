# Implementation Plan: Recomendaciones en la web

**Branch**: `feature/14-web-recommendations` | **Date**: 2026-11-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/14-web-recommendations/spec.md`

## Summary

El detalle de una lista gana un panel de recomendaciones a demanda, que llama al endpoint de HU-12, indica el origen de
las sugerencias y trata la carga y los errores, incluido el `429`. Es un componente hijo con su propio estado y un
servicio de API nuevo. El único cambio en código compartido con efecto en el comportamiento es que el interceptor
respete un tiempo de espera ya fijado: hoy pisaría los 35 s que necesitan las recomendaciones
([research.md](research.md), punto 1).

## Technical Context

**Language/Version**: TypeScript 6.0; Node `^22.22.3 || ^24.15.0 || >=26.0.0`

**Primary Dependencies**: Angular 22.3 (componentes standalone, señales, `HttpClient`), RxJS 7.8. Ninguna nueva

**Storage**: N/A

**Testing**: Vitest 5 con `@angular/build:unit-test`, jsdom y `HttpTestingController`; ESLint 10

**Target Platform**: navegadores de escritorio actuales; servida por nginx (HU-07) o por `ng serve`

**Project Type**: aplicación web (solo el repositorio `quipux-playlist-frontend`)

**Performance Goals**: sin objetivo propio; la latencia la marca el modelo (hasta 30 s)

**Constraints**: espera de 35 s solo para las recomendaciones y 10 s para lo demás; textos en español; sin cambios en
backend ni infra; pruebas sin API ni modelos

**Scale/Scope**: 1 componente, 1 servicio, hasta 5 sugerencias por respuesta

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` es la plantilla sin rellenar: no define principios ni condiciones. Se aplican las
reglas del proyecto que tienen sentido en la web:

| Regla | Cómo se cumple | Antes | Después del diseño |
|---|---|---|---|
| Identificadores en inglés; el contrato en español solo en DTO y valores | modelo y mapeador propios | ✅ | ✅ |
| Constantes y textos centralizados en `core/constants` | rutas, estado `429`, tiempos y textos | ✅ | ✅ |
| Conventional Commits | `feat(HU-14): …` | ✅ | ✅ |
| Sin secretos ni datos reales | solo datos de prueba ficticios | ✅ | ✅ |

Las reglas de Java (PMD, Checkstyle, JaCoCo, ArchUnit) no aplican. No hay violaciones que justificar.

`requests.http` no se genera: la implementación consume un endpoint, no añade ni cambia ninguno.

## Project Structure

### Documentation (this feature)

```text
specs/14-web-recommendations/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-contract.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/app/
├── api/
│   ├── recommendation-api.ts          # nuevo (+ .spec.ts, con el interceptor real)
│   ├── recommendation.dto.ts          # nuevo
│   ├── recommendation.mapper.ts       # nuevo
│   └── recommendation.model.ts        # nuevo, con RecommendationOrigin
├── core/
│   ├── constants/api-path.ts          # recommendationsPath(name)
│   ├── constants/http-status.ts       # TOO_MANY_REQUESTS = 429
│   ├── constants/settings.ts          # RECOMMENDATIONS_TIMEOUT_MS = 35_000
│   ├── constants/ui-text.ts           # textos y tooManyRequestsText(seconds)
│   ├── http/auth-interceptor.ts       # request.timeout ?? REQUEST_TIMEOUT_MS (+ prueba)
│   └── http/error-message.ts          # retryAfterSeconds(error) (+ prueba)
└── features/playlists/detail/
    ├── playlist-detail-page.{ts,html,css}   # pinta el panel (+ pruebas en .spec.ts)
    └── recommendations/
        └── recommendations-panel.{ts,html,spec.ts}   # nuevo
src/testing/fixtures/recommendations.json            # nuevo
README.md                                            # recomendaciones y enlace a la especificación
AI-LOG.md                                            # nuevo
```

**Structure Decision**: se mantiene la estructura de HU-05 (`core`, `api`, `features`, `testing`). El panel cuelga de la
página que lo usa.

## Pruebas por requisito

| Archivo | Cubre |
|---|---|
| `recommendation-api.spec.ts` | ruta codificada, mapeo y 35 s con el interceptor puesto (FR-002, FR-004) |
| `auth-interceptor.spec.ts` | respeta un tiempo ya fijado y pone 10 s si no lo hay (FR-004) |
| `error-message.spec.ts` | `Retry-After` válido, ausente, cero, negativo y no numérico (FR-012) |
| `recommendations-panel.spec.ts` | sin petición al pintar, carga, doble pulsación, resultado, vacío, cada origen y aviso, HTML literal, `429`, `404`, `403`, error general, reintento (FR-003, FR-005 a FR-015) |
| `playlist-detail-page.spec.ts` | botón solo con el detalle cargado; la lista sigue tras un fallo; cambiar de lista cancela (FR-001, FR-005, FR-015) |

Los tres criterios del backlog quedan cubiertos (SC-006): botón, carga y `429` en el panel; origen en el panel; HTTP
simulado en todos. El rol no cambia nada en el panel (FR-001), así que se comprueba a mano.

## Orden de entrega

1. Interceptor, constantes y servicio, con sus pruebas.
2. Panel e integración en el detalle, con sus pruebas (historias 1, 2 y 3).
3. `README.md` y `AI-LOG.md`, incluidos los prompts de especificación y plan.
4. `npm test`, `npm run lint`, `npm run build` y las comprobaciones de `quickstart.md`.
5. Solo entonces, marcar en `backlog-ia.md` los criterios web que hayan quedado verificados (FR-021).

## Riesgos

| Riesgo | Respuesta |
|---|---|
| El interceptor deja de aplicar los 10 s a lo demás | su prueba actual se mantiene y se añade la del tiempo propio |
| La API se configura con `AI_TIMEOUT` mayor de 35 s | la web mostraría error general; documentado en el README |
| El origen `IA` no se puede probar a mano sin los modelos | cubierto con HTTP simulado; si no se ejecuta la fila 9, se anota |

## Complexity Tracking

No aplica.
