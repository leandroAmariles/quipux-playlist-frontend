# quipux-playlist-frontend

Aplicación web Angular para gestionar listas de reproducción de música: iniciar sesión, ver las listas y su detalle,
pedir recomendaciones para una lista y, con el rol `ADMIN`, crearlas y borrarlas.

La documentación del proyecto está en [quipux-playlist-backend](https://github.com/leandroAmariles/quipux-playlist-backend).
La especificación de esta aplicación está en [`specs/05-web-app/`](specs/05-web-app/) y la de las recomendaciones en
[`specs/14-web-recommendations/`](specs/14-web-recommendations/). El uso de IA en estas últimas está en
[`AI-LOG.md`](AI-LOG.md).

## Recomendaciones

En el detalle de una lista, **Ver recomendaciones** pide sugerencias a la API y dice de dónde vienen:

| Origen | Significado |
|---|---|
| `IA` | las generó el modelo; sin catálogo, no están verificadas |
| `RESPALDO` | lista fija de la API: IA desactivada o sin respuesta, o lista sin canciones |
| `SIMILITUD` | elegidas del catálogo; la API todavía no lo produce |

La API limita las peticiones por usuario; al superarlo, la web indica cuántos segundos esperar.

La web espera la respuesta hasta 35 segundos, porque la API aguarda al modelo hasta 30 (`AI_TIMEOUT`). Si se sube ese
valor, hay que subir también `RECOMMENDATIONS_TIMEOUT_MS` en
[`settings.ts`](src/app/core/constants/settings.ts). El resto de las peticiones se abandona a los 10 segundos.

## Requisitos

- Node `^22.22.3`, `^24.15.0` o `>=26.0.0`, con npm
- Para usarla, la API del backend en marcha en `http://localhost:8080`. Las pruebas no la necesitan

No hace falta instalar Angular CLI.

## Comandos

```bash
npm ci           # instala las versiones del archivo de bloqueo
npm test         # ejecuta las pruebas una vez y termina
npm run lint     # analiza el código con ESLint
npm start        # sirve la web en http://localhost:4200
npm run build    # compila para producción en dist/
```

## Arrancar contra la API

1. En el repositorio de backend, arranca la API siguiendo su `README.md`. Allí se eligen las contraseñas de los dos
   usuarios de demostración, `user` (rol `USER`) y `admin` (rol `ADMIN`).
2. En este repositorio, ejecuta `npm ci` y `npm start`.
3. Abre `http://localhost:4200` y entra con uno de esos usuarios.

La sesión dura lo que el token (30 minutos) y se pierde al cerrar la pestaña.

## Proxy de desarrollo

La web llama a la API por su mismo origen, bajo `/api`, y `proxy.conf.json` reenvía cada petición a
`http://localhost:8080` quitando ese prefijo. No hace falta configurar CORS. Si la API usa otro puerto, cambia `target`
en ese archivo.

## Imagen de Docker

El [`Dockerfile`](Dockerfile) compila la web y la sirve con nginx, que reenvía `/api` a la API quitando ese prefijo,
igual que el proxy de desarrollo. La configuración está en
[`nginx/default.conf.template`](nginx/default.conf.template).

| Variable | Por defecto | Para qué |
|---|---|---|
| `API_URL` | `http://api:8080` | dirección de la API: esquema, nombre y puerto, sin ruta ni `/` final |

Escucha en el puerto 8080 del contenedor y responde `200 OK` en `GET /` sin token como sonda HTTP para Kubernetes (sin
afectar al enrutamiento SPA ni a `/api`). En Kubernetes, `API_URL` apunta al FQDN del `Service`
(`http://api.quipux-playlist.svc.cluster.local:8080`) para el `resolver` de nginx. Para levantar y desplegar junto con la
API, sigue el [README de quipux-playlist-infra](https://github.com/leandroAmariles/quipux-playlist-infra#readme).

## Integración continua

Cada PR y cada push a `main` ejecutan tres comprobaciones ([`ci.yml`](.github/workflows/ci.yml)), y `main` solo admite
PR con las tres en verde.

| Comprobación | Falla ante | En local |
|---|---|---|
| `build-test` | un error de compilación o una prueba | `npm run build` y `npm test` |
| `lint` | un error de ESLint | `npm run lint` |
| `trivy` | un secreto, o una dependencia entregada con una vulnerabilidad `HIGH` o `CRITICAL` corregible | Trivy, abajo |

```bash
trivy fs --scanners vuln --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 .
trivy fs --scanners secret --severity HIGH,CRITICAL --exit-code 1 --skip-dirs node_modules --skip-dirs dist .
```

Un hallazgo que no se pueda corregir se excluye de uno en uno y con su motivo: en Trivy, con un `.trivyignore.yaml`
(campo `statement`) y `trivyignores: .trivyignore.yaml` en el paso del workflow; en ESLint, en
[`eslint.config.js`](eslint.config.js).

Si una comprobación falla porque no pudo descargar dependencias o la base de vulnerabilidades, usa
**Re-run failed jobs**.

## Versiones e imágenes

[release-please](https://github.com/googleapis/release-please) calcula la versión a partir de los
[Conventional Commits](https://www.conventionalcommits.org/es/) que llegan a `main`: `fix` sube el parche y `feat` o un
cambio incompatible suben el menor mientras la versión sea menor que 1.0.0. `docs`, `chore`, `test`, `refactor`,
`build` y `ci` no generan versión.

1. Con cambios publicables, abre o actualiza un PR `chore(main): release X.Y.Z` con la versión en `package.json` y el
   `CHANGELOG.md`. Pasa por el mismo CI que los demás.
2. Al fusionarlo se crean el tag `vX.Y.Z` y la release, y el mismo workflow
   ([`release.yml`](.github/workflows/release.yml)) construye la imagen, la analiza con Trivy y la publica.
3. Si la publicación en GHCR termina en verde, el trabajo `update-infra` abre o actualiza automáticamente un PR en
   `quipux-playlist-infra` (`chore(deploy): bump frontend image to X.Y.Z`) actualizando el tag en `k8s/kustomization.yaml`
   para que Argo CD lo despliegue tras aprobar el CI de infra. Si falla `publish`, no se abre ningún PR en infra.

La imagen es `ghcr.io/leandroamariles/quipux-playlist-frontend:X.Y.Z`, para `linux/amd64` y sin etiqueta `latest`.

- Si la publicación falla por una causa pasajera, **Re-run failed jobs** publica esa misma versión.
- Si Trivy rechaza la imagen, esa versión se queda sin imagen: se corrige y sale en la siguiente.

## Ajustes de GitHub

No viven en el código, así que hay que repetirlos si se recrea el repositorio.

1. **Protección de `main`:**

   ```bash
   gh api -X PUT repos/leandroAmariles/quipux-playlist-frontend/branches/main/protection \
     --input .github/branch-protection.json
   gh api repos/leandroAmariles/quipux-playlist-frontend/branches/main/protection
   ```

2. **Token de release-please:** en GitHub, **Settings → Developer settings → Fine-grained tokens**, crea uno limitado a
   este repositorio con **Contents**, **Pull requests** e **Issues** en lectura y escritura. Guárdalo como secreto con
   `gh secret set RELEASE_PLEASE_TOKEN -R leandroAmariles/quipux-playlist-frontend`, que lo pide sin mostrarlo. Cuando
   venza, el workflow `Release` falla: genera otro y sustituye el secreto.
3. **Imagen pública:** tras la primera publicación, abre el paquete y usa **Package settings → Change visibility →
   Public**. En GitHub no se puede volver a privado.
4. **Token para abrir PR en infra (`INFRA_PR_TOKEN`):** crea un PAT de grano fino limitado **exclusivamente** a
   `leandroAmariles/quipux-playlist-infra` con **Contents** y **Pull requests** en lectura y escritura, sin permisos sobre
   este repositorio, y guárdalo con `gh secret set INFRA_PR_TOKEN -R leandroAmariles/quipux-playlist-frontend`.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/app/core` | constantes y textos, sesión, interceptor y guardas |
| `src/app/api` | llamadas a la API, DTO, modelos y mapeadores |
| `src/app/features` | páginas de acceso y de listas |
| `src/testing` | utilidades y datos de prueba |
