# Quickstart: validar las recomendaciones en la web

## Pruebas automáticas

En `quipux-playlist-frontend`, sin API, modelos ni `AI_API_KEY`:

```bash
npm ci
npm test         # termina solo, en verde
npm run lint
npm run build    # sin errores ni avisos de tamaño
```

## Arrancar

Desde `quipux-playlist-infra/compose`, que construye los repositorios hermanos (aquí, esta rama de la web). Las tres
variables obligatorias (README de infra) se definen en la terminal, **sin crear `.env`**, para no tocar ese repositorio.

Se usa el nombre de proyecto `quipux-web`: `quipux-ia` es la pila de la carpeta `Quipux music app AI-ia`, y desde aquí
se reemplazarían sus contenedores.

```bash
API_PORT=8180 WEB_PORT=4280 docker compose -p quipux-web up -d --build --wait   # http://localhost:4280
docker compose -p quipux-web down                                               # al terminar
```

Con esto la IA está desactivada y todo responde con `RESPALDO`.

## Comprobaciones a mano

Textos esperados en el [contrato de la interfaz](contracts/ui-contract.md).

| # | Pasos | Resultado |
|---|---|---|
| 1 | Como `admin`, crear una lista con una canción y abrirla | botón visible; ninguna petición de recomendaciones |
| 2 | Pulsar el botón | origen de respaldo y sugerencias, sin aviso de «sin verificar» |
| 3 | Repetir como `user` | igual |
| 4 | Pulsar 11 veces en menos de un minuto | la undécima muestra el aviso con los segundos; las canciones siguen |
| 5 | Esperar ese tiempo y pulsar | vuelven las sugerencias |
| 6 | Borrar la lista en otra pestaña y pulsar | «No se encontró la lista.» y enlace al listado |
| 7 | Detener la API (`docker compose -p quipux-web stop api`) y pulsar | error general; botón habilitado |
| 8 | Abrir y recomendar una lista llamada `Canción #1?` | funciona como el detalle |

## Origen `IA` (opcional, necesita los modelos)

Añadir `AI_API_KEY` en la terminal y el segundo archivo; descarga y requisitos en el README de infra.

```bash
API_PORT=8180 WEB_PORT=4280 LITELLM_PORT=4180 docker compose -p quipux-web -f compose.yaml -f compose.ai.yaml up -d --build
```

| # | Pasos | Resultado |
|---|---|---|
| 9 | Pulsar el botón en una lista con canciones | origen IA, aviso de «sin verificar» y hasta 5 sugerencias |

Detener con los mismos archivos (`down` conserva los modelos).

## Respuestas que la API real no produce a voluntad

Con un servidor de prueba temporal en `http://localhost:8080`, fuera del repositorio, que imite el acceso, el detalle y
las recomendaciones, y `npm start`:

| # | Respuesta simulada | Resultado |
|---|---|---|
| 10 | `200` a los 30 s | se ve la carga y después las sugerencias (SC-004) |
| 11 | sin respuesta | error general a los 35 s |
| 12 | `motivo` con `<img src=x onerror=alert(1)>` | se ve como texto |
| 13 | `origen: SIMILITUD` | texto de similitud |

Las filas 10 y 11 se repiten contra la imagen con nginx si el puerto 8080 y Docker lo permiten; si no se hace, se anota.

## Resultados (2026-11-27)

**Automáticas**: `npm test` 161 pruebas en verde (106 antes de esta historia), `npm run lint` sin errores,
`npm run build` sin avisos de tamaño (325 kB iniciales) y ningún `innerHTML` en `src/`.

**En el navegador**: Chrome sin ventana manejado por un guion temporal, fuera de los repositorios, con secretos de un
solo uso que se borraron al terminar. Filas 1 a 9 contra la composición real con `-p quipux-web`.

| # | Resultado observado |
|---|---|
| 1 | correcto |
| 2 | correcto: respaldo, 5 sugerencias, sin aviso |
| 3 | correcto como `user` |
| 4 | correcto: diez `200` y un `429` con «…en 60 s.»; las canciones siguen |
| 5 | correcto a los 61 s |
| 6 | correcto |
| 7 | correcto. Recién detenida la API el error tardó 35,2 s (nginx seguía intentando conectar); 15 s después, 4,4 s |
| 8 | correcto |
| 9 | correcto con `llama3.2:3b` en CPU: origen IA, aviso y 5 sugerencias sin motivo, en **11,2 s** (más que los 10 s del resto de la web) |
| 10 | correcto: 30,2 s, con `ng serve` y con la imagen nginx |
| 11 | correcto: 35,2 s, con `ng serve` y con la imagen nginx |
| 12 | correcto: texto literal, sin imagen ni diálogo |
| 13 | correcto |

Además, con 255 caracteres sin espacios en título y artista no hay desplazamiento horizontal a 1100 ni a 700 px.

**Sin comprobar a mano**: `401` y `403` al pedir recomendaciones (solo con pruebas automáticas), la respuesta sin
ninguna sugerencia (solo simulada en las pruebas), otros navegadores y el origen `IA` con GPU.

**Desviaciones**:

- Proyecto `quipux-web` en lugar de `quipux-ia` (motivo en «Arrancar»).
- Para la fila 9 se copiaron los modelos del volumen `quipux-ia_ollama-models`, montado en solo lectura, a un volumen
  propio que se borró con la pila. También se eliminaron las imágenes construidas para la prueba.
- `prettier --check` necesita `--end-of-line auto` en Windows: con `core.autocrlf=true` marca todos los archivos,
  también antes de esta historia.

**Alcance del cambio**: en `quipux-playlist-frontend`, solo archivos de esta historia; `quipux-playlist-backend` y
`quipux-playlist-infra` sin cambios; fuera del repositorio, solo las tres casillas web de `backlog-ia.md`.
