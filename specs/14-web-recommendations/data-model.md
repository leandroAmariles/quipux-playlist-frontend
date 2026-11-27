# Data model: Recomendaciones en la web

Todo vive en memoria, mientras el panel existe. La web no guarda nada.

## Respuesta de la API (`recommendation.dto.ts`)

Espejo del [contrato de HU-12](https://github.com/leandroAmariles/quipux-playlist-backend/blob/main/specs/12-ai-recommendations/contracts/rest-api.md).

| DTO | Campos |
|---|---|
| `RecommendationsDto` | `lista`, `origen`, `versionPrompt`, `recomendaciones: RecommendationDto[]` |
| `RecommendationDto` | `idCatalogo`, `titulo`, `artista`, `genero`, `motivo` |

## Modelo de la web (`recommendation.model.ts`)

Solo lo que se usa; `lista` y `versionPrompt` no se muestran.

| Tipo | Campo | De | Notas |
|---|---|---|---|
| `RecommendationSet` | `origin` | `origen` | `RecommendationOrigin` |
| | `items` | `recomendaciones` | 0 a 5, en el orden recibido |
| `Recommendation` | `catalogId` | `idCatalogo` | vacío = no verificada |
| | `title` | `titulo` | nunca vacío |
| | `artist` | `artista` | nunca vacío |
| | `genre` | `genero` | puede ir vacío |
| | `reason` | `motivo` | puede ir vacío |

`RecommendationOrigin`: `AI = 'IA'`, `FALLBACK = 'RESPALDO'`, `SIMILARITY = 'SIMILITUD'`.

**Dato derivado**: se avisa de «sin verificar» si `origin` es `AI` y algún `catalogId` está vacío (FR-009).

## Estado del panel

| Estado | `state` | Botón | Se ve |
|---|---|---|---|
| Sin pedir | `null` | habilitado | solo el botón |
| Cargando | `LOADING` | inhabilitado | aviso de búsqueda |
| Con respuesta | `READY` | habilitado | origen, aviso y sugerencias, o «no hay sugerencias» |
| Con error | `ERROR` | habilitado | mensaje |

```text
null ──pulsar──> LOADING ──200──> READY ──pulsar──> LOADING
                    └────fallo──> ERROR ──pulsar──> LOADING
```

Cada paso a `LOADING` borra el resultado y el error anteriores (FR-005). En `LOADING` no se puede lanzar otra petición.
Destruir el panel cancela la petición pendiente.

## Mensaje de error

| Fallo | Mensaje |
|---|---|
| `429` con `Retry-After` entero y positivo | demasiadas peticiones, con los segundos |
| `429` sin él | demasiadas peticiones, más tarde |
| `404` | lista no encontrada |
| `403` | sin permiso |
| cualquier otro, sin conexión o tiempo agotado | error general |

El `401` lo trata antes el interceptor: cierra la sesión y lleva al acceso.
