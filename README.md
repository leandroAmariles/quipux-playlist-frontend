# quipux-playlist-frontend

Aplicación web Angular para gestionar listas de reproducción de música: iniciar sesión, ver las listas y su detalle y,
con el rol `ADMIN`, crearlas y borrarlas.

La documentación del proyecto está en [quipux-playlist-backend](https://github.com/leandroAmariles/quipux-playlist-backend).
La especificación de esta aplicación está en [`specs/05-web-app/`](specs/05-web-app/).

## Requisitos

- Node `^22.22.3`, `^24.15.0` o `>=26.0.0`, con npm
- Para usarla, la API del backend en marcha en `http://localhost:8080`. Las pruebas no la necesitan

No hace falta instalar Angular CLI.

## Comandos

```bash
npm ci           # instala las versiones del archivo de bloqueo
npm test         # ejecuta las pruebas una vez y termina
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

Escucha en el puerto 8080 del contenedor. Para levantar la web junto con la API, sigue el
[README de quipux-playlist-infra](https://github.com/leandroAmariles/quipux-playlist-infra#readme).

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/app/core` | constantes y textos, sesión, interceptor y guardas |
| `src/app/api` | llamadas a la API, DTO, modelos y mapeadores |
| `src/app/features` | páginas de acceso y de listas |
| `src/testing` | utilidades y datos de prueba |
