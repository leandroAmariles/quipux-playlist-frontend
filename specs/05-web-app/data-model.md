# Data Model: Aplicación web

Los DTO conservan los nombres del contrato JSON y se convierten a modelos en inglés con funciones de mapeo (ADR-0001,
secciones 2 y 8). No hay persistencia propia salvo la sesión.

## Session

| Campo | Origen | Uso |
|---|---|---|
| `token` | `accessToken` del inicio de sesión | cabecera `Authorization` |
| `username` | `sub` del token | cabecera de la web |
| `role` | `role` del token: `USER` o `ADMIN` | mostrar u ocultar opciones |
| `expiresAt` | `exp` del token | saber si sigue vigente |

- Un token ilegible o sin `exp` no crea sesión.
- Un rol distinto de `ADMIN` se trata como sin permisos de gestión.

```text
sin sesión ──inicio correcto──▶ con sesión
con sesión ──cerrar sesión · 401 · vencida · cerrar pestaña──▶ sin sesión
```

## Playlist y Song

| Modelo | DTO | Tipo |
|---|---|---|
| `Playlist.name` | `nombre` | texto, obligatorio |
| `Playlist.description` | `descripcion` | texto o `null` |
| `Playlist.songs` | `canciones` | lista de `Song` |
| `Song.title` | `titulo` | texto o `null` |
| `Song.artist` | `artista` | texto o `null` |
| `Song.album` | `album` | texto o `null` |
| `Song.year` | `anno` | texto o `null` |
| `Song.genre` | `genero` | texto o `null` |

## GenreCatalog

`genres` (`generos`) y `source` (`origen`: `SPOTIFY` o `LOCAL`). La web solo usa `genres`.

## Formulario de creación

| Control | Regla en la web | Al enviar |
|---|---|---|
| `name` | obligatorio, no solo espacios | tal como se escribió |
| `description` | — | `null` si está vacío |
| `songs[]` | se pueden añadir y quitar; empieza vacío | en el orden mostrado |
| `songs[].title`, `artist`, `album`, `year` | — | `null` si está vacío |
| `songs[].genre` | opción del catálogo o "sin género" | `null` si no se elige |

## Estados de pantalla

| Pantalla | Estados |
|---|---|
| Listado | cargando → con listas · vacío · error (reintentar) |
| Detalle | cargando → con lista · no encontrada · error (reintentar) |
| Acción (entrar, guardar, borrar) | en reposo → en curso (control desactivado) → reposo, con o sin mensaje |
| Géneros del formulario | cargando → disponibles · error (reintentar, se puede guardar sin género) |
