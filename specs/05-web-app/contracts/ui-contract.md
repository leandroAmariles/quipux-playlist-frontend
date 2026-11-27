# Contrato de la interfaz web

## Páginas

| Dirección | Contenido | Quién | Si no cumple |
|---|---|---|---|
| `/login` | formulario de acceso | sin sesión | con sesión va a `/playlists` |
| `/playlists` | listado; crear y borrar para `ADMIN` | con sesión | a `/login` |
| `/playlists/detail?name=<nombre>` | detalle | con sesión | a `/login`; sin `name`, a `/playlists` |
| `/playlists/new` | formulario de creación | `ADMIN` | `USER` va a `/playlists`; sin sesión, a `/login` |
| cualquier otra | — | — | a `/playlists` (y de ahí a `/login` sin sesión) |

## Llamadas a la API

Todas bajo `/api`; el proxy quita el prefijo. Los contratos de la API están en el repositorio de backend:
[listas](https://github.com/leandroAmariles/quipux-playlist-backend/blob/main/specs/02-playlist-management/contracts/rest-api.md),
[autenticación](https://github.com/leandroAmariles/quipux-playlist-backend/blob/main/specs/03-authentication-authorization/contracts/rest-api.md) y
[géneros](https://github.com/leandroAmariles/quipux-playlist-backend/blob/main/specs/04-genres/contracts/rest-api.md).

| Acción | Petición | Éxito | Fallos propios |
|---|---|---|---|
| Entrar | `POST /api/auth/login` (sin token) | crea la sesión y va a `/playlists` | `401` → credenciales |
| Listado | `GET /api/lists` | muestra o vacío | — |
| Detalle | `GET /api/lists/{nombre}` | muestra | `404` → no encontrada |
| Géneros | `GET /api/genres` | llena el selector | — |
| Crear | `POST /api/lists` | va a `/playlists` | `400` → datos y detalle; `409` → nombre repetido |
| Borrar | `DELETE /api/lists/{nombre}` | vuelve a pedir el listado | `404` → ya no existe, y vuelve a pedirlo |

Comunes: `401` (salvo al entrar) cierra la sesión y va a `/login`; `403` → sin permiso; cualquier otro estado, falta de
conexión o más de 10 segundos → error general.

## Mensajes

| Caso | Texto |
|---|---|
| Credenciales | Usuario o contraseña incorrectos. |
| Campo obligatorio al entrar | Escribe el usuario. · Escribe la contraseña. |
| Nombre vacío | El nombre es obligatorio. |
| `400` al crear | Los datos no son válidos. *(seguido del `detail` de la API)* |
| `409` | Ya existe una lista con ese nombre. |
| `404` en detalle | No se encontró la lista. |
| `404` al borrar | La lista ya no existe. |
| `403` | No tienes permiso para esta operación. |
| Error general | No se pudo completar la operación. Inténtalo de nuevo. |
| Géneros no disponibles | No se pudieron cargar los géneros. |
| Listado vacío | Todavía no hay listas. |
| Sin canciones | Esta lista no tiene canciones. |
| Carga | Cargando… |
| Confirmación | ¿Borrar la lista «{nombre}»? |

## Proxy de desarrollo

`/api/<ruta>` → `http://localhost:8080/<ruta>`. Para otro puerto se cambia `proxy.conf.json`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm ci` | instala las versiones del archivo de bloqueo |
| `npm start` | sirve la web en `http://localhost:4200` con el proxy |
| `npm test` | ejecuta las pruebas una vez y termina |
| `npm run build` | compila para producción |
