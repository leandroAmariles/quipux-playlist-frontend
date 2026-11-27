# Implementation Plan: Aplicación web

**Branch**: `feature/05-web-app` | **Date**: 2026-11-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/05-web-app/spec.md`

## Summary

Crear en `quipux-playlist-frontend` una aplicación Angular con acceso, listado, detalle, creación y borrado, que consume
la API existente por un proxy bajo `/api`. La sesión y el rol salen del token; la API no cambia. Detalle en
[research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 6.0 sobre Node `^22.22.3 || ^24.15.0 || >=26.0.0`

**Primary Dependencies**: Angular 22.3 (router, formularios reactivos, `HttpClient`) y RxJS 7.8. Ninguna fuera de las
que genera el CLI

**Storage**: `sessionStorage` para la sesión

**Testing**: Vitest 5 mediante `ng test`, jsdom, `HttpTestingController`, `RouterTestingHarness`

**Target Platform**: navegadores de escritorio actuales; desarrollo en Windows

**Project Type**: web-application (solo frontend)

**Performance Goals**: listado y detalle en menos de 2 s con 100 listas de 20 canciones (SC-005)

**Constraints**: mismo origen, sin CORS; sin cambios en la API; sin contraseñas ni tokens en el repositorio

**Scale/Scope**: 4 páginas, 6 llamadas a la API

## Constitution Check

La constitución sigue sin rellenar. Se usan como puertas el ADR-0001 y las reglas de `CLAUDE.md`.

| Puerta | Antes de Phase 0 | Tras Phase 1 |
|---|---|---|
| Angular standalone y formularios reactivos (ADR-0001, 12) | Cumple | Cumple |
| Mismo origen, sin CORS | Cumple | Cumple |
| La API sigue siendo quien autoriza | Cumple | Cumple |
| Identificadores en inglés; DTO y modelo separados, con mapeadores | Cumple | Cumple |
| Sin valores fijos sueltos; datos de prueba fuera del código | Cumple | Cumple |
| Sin comentarios explicativos en el código | Cumple | Cumple |
| Sin secretos en el repositorio | Cumple | Cumple |

Las reglas de Java (hexagonal en Maven, JaCoCo, Checkstyle) no aplican a este repositorio.

## Project Structure

### Documentation (this feature)

```text
specs/05-web-app/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-contract.md
└── tasks.md          # /speckit-tasks
```

No se genera `requests.http`: la historia no añade ni cambia endpoints.

### Source Code

Raíz: `quipux-playlist-frontend`.

```text
├── proxy.conf.json
├── package.json, package-lock.json, angular.json, tsconfig*.json
└── src/
    ├── testing/                 datos de prueba en JSON y utilidades
    └── app/
        ├── app.ts, app.config.ts, app.routes.ts
        ├── core/
        │   ├── constants/       rutas, direcciones de la API, textos, límites, rol
        │   ├── session/         sesión y lectura del token
        │   ├── http/            interceptor y traducción de errores
        │   └── guards/          con sesión, sin sesión, ADMIN
        ├── api/                 servicios, DTO, modelos y mapeadores
        └── features/
            ├── login/
            └── playlists/       list/, detail/, create/
```

**Structure Decision**: `features` depende de `api` y `core`; `api` y `core` no dependen de `features`. Solo `api`
conoce los DTO.

### Flujo

| Caso | Recorrido |
|---|---|
| Entrar | formulario → servicio de acceso → leer el token → guardar la sesión → listado |
| Cada petición | interceptor: token y tiempo máximo → proxy → API; `401` → cerrar sesión y acceso |
| Navegar | guarda: ¿sesión vigente? → ¿rol? → página |
| Crear | validar el nombre → mapear (vacíos a `null`) → `201` → listado; `400`/`409` → mensaje en el formulario |
| Borrar | confirmar → `DELETE` → volver a pedir el listado |

### Orden de trabajo

1. Proyecto base: generar, fusionar con el repositorio, proxy y `npm test`.
2. Acceso y sesión: servicio, interceptor, guardas y formulario.
3. Listado y detalle con sus estados.
4. Creación.
5. Borrado y opciones por rol.
6. Cierre: validación a mano y documentación.

### Estrategia de pruebas

| Qué | Casos |
|---|---|
| Sesión | lectura del token, token ilegible, vencimiento, recarga |
| Interceptor | añade el token; no en el acceso; `401` cierra y redirige; `401` del acceso no redirige |
| Guardas | sin sesión, con sesión, `USER` en la ruta de creación |
| Servicios | cada llamada con HTTP simulado; nombres con caracteres especiales; mapeo en los dos sentidos |
| Acceso | campos obligatorios, error de credenciales, doble envío |
| Listado y detalle | carga, vacío, error y reintento, no encontrada |
| Creación | nombre obligatorio, añadir y quitar canciones, géneros, `400`, `409` |
| Borrado | cancelar, confirmar, `404`, otro fallo |
| Rol | `USER` no ve crear ni borrar |

Las pruebas se escriben antes que el código que comprueban.

### Cierre de la historia

- Frontend: `README.md`, con enlace a `specs/05-web-app/`.
- Backend, solo documentación y en un cambio aparte: quitar "Falta la aplicación web" del `README.md` y marcar HU-05 en
  `docs/backlog.md`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| El nombre de la lista va como parámetro y no en la ruta | Recargar un nombre como `data.json` daba `404` | La ruta con parámetro falla con algunos nombres válidos |
