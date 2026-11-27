# Contrato de la interfaz: recomendaciones

Amplía el [contrato de la interfaz de HU-05](../../05-web-app/contracts/ui-contract.md). No hay páginas ni rutas nuevas.

## Dónde

En `/playlists/detail?name=<nombre>`, una sección «Recomendaciones» debajo de las canciones, solo cuando el detalle está
cargado. Para `USER` y `ADMIN`.

## Llamada a la API

| Acción | Petición | Cuándo | Espera máxima |
|---|---|---|---|
| Recomendar | `GET /api/lists/{nombre}/recommendations` | al pulsar el botón | 35 s |

`{nombre}` se codifica como en el detalle. Lleva el token. El resto de peticiones sigue en 10 s.

## Elementos

| Elemento | Detalle |
|---|---|
| Botón | `button.recommend`, inhabilitado mientras se busca |
| Carga | texto con `role="status"` |
| Error | texto con `role="alert"` |
| Origen | encima de las sugerencias, también cuando no hay ninguna; no es un error |
| Sugerencias | tabla con Título, Artista, Género y Motivo; un valor vacío se ve como `—` |

## Textos

| Caso | Texto |
|---|---|
| Título de la sección | Recomendaciones |
| Botón | Ver recomendaciones |
| Carga | Buscando recomendaciones… |
| Origen `IA` | Sugerencias generadas por IA. |
| Aviso (`IA` sin identificador de catálogo) | No están verificadas contra un catálogo: pueden contener errores. |
| Origen `RESPALDO` | Sugerencias de respaldo, no generadas por IA. |
| Origen `SIMILITUD` | Sugerencias elegidas por similitud en el catálogo. |
| Sin sugerencias | No hay sugerencias para esta lista. |
| `429` con tiempo | Has hecho demasiadas peticiones. Inténtalo de nuevo en {n} s. |
| `429` sin tiempo | Has hecho demasiadas peticiones. Inténtalo de nuevo más tarde. |
| `404` | No se encontró la lista. |
| `403` | No tienes permiso para esta operación. |
| Error general | No se pudo completar la operación. Inténtalo de nuevo. |

Los tres últimos son los textos que la web ya usa.
