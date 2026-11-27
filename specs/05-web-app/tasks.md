---
description: "Tareas de HU-05: aplicación web"
---

# Tasks: Aplicación web

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md),
[contracts/ui-contract.md](contracts/ui-contract.md), [quickstart.md](quickstart.md)

**Tests**: pedidos (FR-023, FR-024). En cada historia se escriben primero y deben fallar antes de implementar.

**Rutas**: relativas a la raíz de `quipux-playlist-frontend`, salvo que se indique otro repositorio.

**Reglas para todas las tareas**: identificadores en inglés y textos de la interfaz en español; textos, rutas y valores
fijos desde `src/app/core/constants/`; datos de prueba desde `src/testing/fixtures/*.json`; sin comentarios en el
código; estado de pantalla en signals (research R2). Los textos son los de la sección "Mensajes" del contrato.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin depender de tareas sin terminar)
- **[US1]** acceder · **[US2]** explorar · **[US3]** crear · **[US4]** borrar

---

## Phase 1: Setup

- [X] T001 Generar el proyecto en una carpeta temporal fuera del repositorio con `npx @angular/cli@22.3.0 new quipux-playlist-frontend --defaults --skip-git --style=css --ssr=false --ai-config=none --interactive=false` y copiarlo a la raíz sin `node_modules`, conservando `README.md` y `specs/` y fusionando `.gitignore` sin duplicados (research R1, R12); instalar con `npm install` para crear `package-lock.json`
- [X] T002 Ajustar `package.json`: `engines.node` según research R1 y script `test` = `ng test --watch=false`
- [X] T003 [P] Crear `proxy.conf.json` según research R4 y "Proxy de desarrollo" del contrato, y declararlo como `proxyConfig` de `serve` en `angular.json`
- [X] T004 [P] Quitar el contenido de ejemplo de `src/app/app.ts`, `src/app/app.html` y `src/app/app.spec.ts`, poner `lang="es"` y el título en `src/index.html`, y dejar los estilos base en `src/styles.css`
- [X] T005 Comprobar que `npm test` y `npm run build` terminan sin errores

---

## Phase 2: Foundational

**Bloquea a todas las historias.**

- [X] T006 [P] Crear en `src/app/core/constants/` los archivos `app-route.ts` (páginas del contrato), `api-path.ts` (direcciones bajo `/api`), `ui-text.ts` (mensajes del contrato), `settings.ts` (tiempo máximo de research R8 y clave de almacenamiento), `role.ts` (`data-model.md` `Session.role`), `view-state.ts` ("Estados de pantalla" de data-model.md) y `http-status.ts`
- [X] T007 [P] Crear `src/testing/jwt.ts` (arma tokens de prueba con `sub`, `role` y `exp`) y `src/testing/fixtures/` con `session.json`, `playlists.json` (incluidos los nombres especiales de research R5), `genres.json` y `problems.json`; activar `resolveJsonModule` en `tsconfig.spec.json`
- [X] T008 [P] Escribir `src/app/core/forms/not-blank.spec.ts` y `src/app/core/forms/not-blank.ts`: validador que rechaza vacío o solo espacios sin modificar el valor
- [X] T009 Escribir `src/app/core/http/error-message.spec.ts` y `src/app/core/http/error-message.ts` con `src/app/core/http/problem-detail.ts`: traduce un `HttpErrorResponse` a `403` o error general (incluidos sin conexión, tiempo agotado y `502`); depende de T006

**Checkpoint**: base lista y `npm test` en verde.

---

## Phase 3: User Story 1 - Acceder a la web (Priority: P1) 🎯 MVP

**Goal**: iniciar y cerrar sesión, con las páginas protegidas.

**Independent Test**: entrar con credenciales válidas e inválidas, abrir `/playlists` sin sesión y probar con un token vencido.

### Tests for User Story 1

- [X] T010 [P] [US1] Escribir `src/app/core/session/session-store.spec.ts`: usuario, rol y vencimiento leídos del token (incluido un usuario con tildes), token ilegible o sin `exp`, sesión vencida, recarga desde `sessionStorage` y cierre
- [X] T011 [P] [US1] Escribir `src/app/api/auth-api.spec.ts`: `POST /api/auth/login` con HTTP simulado y respuesta convertida en sesión
- [X] T012 [P] [US1] Escribir `src/app/core/http/auth-interceptor.spec.ts`: añade `Authorization` y el tiempo máximo; no añade el token al acceso ni a direcciones fuera de `/api/`; un `401` cierra la sesión y va a `/login`; el `401` del acceso no redirige
- [X] T013 [P] [US1] Escribir `src/app/core/guards/session-guards.spec.ts` con `RouterTestingHarness`: sin sesión va a `/login`; con sesión vencida también; con sesión, `/login` va a `/playlists`; una dirección desconocida va a `/playlists`
- [X] T014 [P] [US1] Escribir `src/app/features/login/login-page.spec.ts`: campos obligatorios sin llamar a la API, éxito va al listado, `401` muestra credenciales, otro fallo muestra el error general, botón desactivado en curso
- [X] T015 [P] [US1] Escribir `src/app/app.spec.ts`: con sesión muestra el usuario y "cerrar sesión", que la cierra y va a `/login`; sin sesión no muestra ninguno

### Implementation for User Story 1

- [X] T016 [US1] Implementar `src/app/core/session/token-claims.ts` y `src/app/core/session/session-store.ts` según `data-model.md` `Session.token`, `Session.username`, `Session.role` y `Session.expiresAt` (research R7)
- [X] T017 [US1] Implementar `src/app/api/auth-api.ts` y `src/app/api/auth.dto.ts`
- [X] T018 [US1] Implementar `src/app/core/http/auth-interceptor.ts` (research R8)
- [X] T019 [P] [US1] Implementar `src/app/core/guards/auth-guard.ts` y `src/app/core/guards/guest-guard.ts`
- [X] T020 [US1] Implementar `src/app/features/login/login-page.ts`, `login-page.html` y `login-page.css` con formulario reactivo y `not-blank`
- [X] T021 [P] [US1] Crear la página provisional `src/app/features/playlists/list/playlist-list-page.ts` y `playlist-list-page.html`
- [X] T022 [US1] Declarar las páginas en `src/app/app.routes.ts` y registrar en `src/app/app.config.ts` el router con `withComponentInputBinding` y `provideHttpClient(withInterceptors([...]))`
- [X] T023 [US1] Implementar la cabecera con usuario y cierre de sesión en `src/app/app.ts`, `src/app/app.html` y `src/app/app.css`

**Checkpoint**: se puede entrar y salir; `npm test` en verde.

---

## Phase 4: User Story 2 - Explorar las listas (Priority: P1)

**Goal**: listado y detalle con sus estados.

**Independent Test**: con sesión, ver el listado vacío, con listas y con la API caída; abrir un detalle y recargarlo.

### Tests for User Story 2

- [X] T024 [P] [US2] Escribir `src/app/api/playlist-api.spec.ts`: `GET /api/lists` y `GET /api/lists/{nombre}` con HTTP simulado, nombres especiales codificados (research R6) y mapeo de DTO a modelo con valores `null`
- [X] T025 [P] [US2] Escribir `src/app/features/playlists/list/playlist-list-page.spec.ts`: carga, listas en el orden recibido, vacío, error y reintento, enlace al detalle con `name`
- [X] T026 [P] [US2] Escribir `src/app/features/playlists/detail/playlist-detail-page.spec.ts`: carga, canciones, datos ausentes sin mostrar `null`, sin canciones, no encontrada con vuelta al listado, error y reintento, sin `name` va al listado

### Implementation for User Story 2

- [X] T027 [US2] Crear `src/app/api/playlist.model.ts`, `playlist.dto.ts` y `playlist.mapper.ts` según `data-model.md` `Playlist.name`, `Playlist.description`, `Playlist.songs`, `Song.title`, `Song.artist`, `Song.album`, `Song.year` y `Song.genre`
- [X] T028 [US2] Implementar `list` y `get` en `src/app/api/playlist-api.ts`
- [X] T029 [P] [US2] Completar `src/app/features/playlists/list/playlist-list-page.ts`, `.html` y `.css`
- [X] T030 [P] [US2] Implementar `src/app/features/playlists/detail/playlist-detail-page.ts`, `.html` y `.css` (research R5)
- [X] T031 [US2] Añadir la página de detalle a `src/app/app.routes.ts`

**Checkpoint**: US1 y US2 funcionan.

---

## Phase 5: User Story 3 - Crear una lista (Priority: P1)

**Goal**: formulario de creación solo para `ADMIN`.

**Independent Test**: como `ADMIN`, crear listas válidas y rechazadas; como `USER`, escribir `/playlists/new`.

### Tests for User Story 3

- [X] T032 [P] [US3] Escribir `src/app/api/genre-api.spec.ts`: `GET /api/genres` con HTTP simulado
- [X] T033 [P] [US3] Ampliar `src/app/api/playlist-api.spec.ts`: `POST /api/lists` con el cuerpo en español, campos vacíos como `null`, nombre sin recortar y canciones en orden
- [X] T034 [P] [US3] Escribir `src/app/features/playlists/create/playlist-create-page.spec.ts`: nombre obligatorio sin llamar a la API; añadir y quitar canciones conservando las demás; opciones de género y "sin género"; fallo de géneros con reintento y guardado posible; `201` va al listado; `400` con `detail` y `409` sin perder lo escrito; `403`; botón desactivado en curso
- [X] T035 [P] [US3] Escribir `src/app/core/guards/admin-guard.spec.ts`: `USER` en `/playlists/new` va a `/playlists`; `ADMIN` entra; sin sesión va a `/login`
- [X] T036 [P] [US3] Ampliar `src/app/features/playlists/list/playlist-list-page.spec.ts`: la opción de crear aparece para `ADMIN` y no para `USER`

### Implementation for User Story 3

- [X] T037 [P] [US3] Implementar `src/app/api/genre-api.ts`, `genre.model.ts` y `genre.dto.ts` según `data-model.md` `GenreCatalog.genres` y `GenreCatalog.source`
- [X] T038 [P] [US3] Implementar `create` en `src/app/api/playlist-api.ts` y el mapeo a DTO en `src/app/api/playlist.mapper.ts` según "Formulario de creación" de data-model.md: `description`, `songs[]`, `songs[].title`, `songs[].artist`, `songs[].album`, `songs[].year` y `songs[].genre`
- [X] T039 [P] [US3] Implementar `src/app/core/guards/admin-guard.ts`
- [X] T040 [US3] Implementar `src/app/features/playlists/create/playlist-create-page.ts`, `.html` y `.css` con `FormArray`; reglas de "Formulario de creación" de data-model.md: `name`, `songs[]` y `songs[].genre`
- [X] T041 [US3] Añadir `/playlists/new` con sus guardas a `src/app/app.routes.ts`
- [X] T042 [US3] Mostrar la opción de crear solo a `ADMIN` en `src/app/features/playlists/list/playlist-list-page.ts` y `.html`

**Checkpoint**: US1 a US3 funcionan.

---

## Phase 6: User Story 4 - Borrar una lista (Priority: P1)

**Goal**: borrar desde el listado con confirmación, solo `ADMIN`.

**Independent Test**: como `ADMIN`, cancelar y confirmar un borrado; como `USER`, revisar el listado.

### Tests for User Story 4

- [X] T043 [P] [US4] Ampliar `src/app/api/playlist-api.spec.ts`: `DELETE /api/lists/{nombre}` con nombres especiales
- [X] T044 [P] [US4] Ampliar `src/app/features/playlists/list/playlist-list-page.spec.ts`: confirmación con el nombre; cancelar no llama a la API; confirmar borra y vuelve a pedir el listado; `404` avisa y vuelve a pedirlo; otro fallo avisa y conserva la lista; sin doble borrado; `USER` no ve la opción

### Implementation for User Story 4

- [X] T045 [US4] Implementar `delete` en `src/app/api/playlist-api.ts`
- [X] T046 [US4] Implementar el borrado con `window.confirm` en `src/app/features/playlists/list/playlist-list-page.ts` y `.html` (research R10), de modo que el mensaje siga visible tras volver a pedir el listado

**Checkpoint**: las cuatro historias funcionan.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T047 Ejecutar `npx prettier --write src`, `npm test` y `npm run build` y dejarlos sin errores ni avisos de presupuesto
- [X] T048 [P] Escribir `README.md`: requisitos, arranque contra la API, pruebas, proxy y enlace a `specs/05-web-app/`, sin contraseñas ni tokens (FR-025)
- [X] T049 Desde una copia limpia sin `node_modules`, ejecutar `npm ci` y `npm test` siguiendo solo el `README.md` (SC-006)
- [X] T050 Ejecutar las comprobaciones de [quickstart.md](quickstart.md) contra la API real con variables de un solo uso, incluido un `POST` y un `DELETE` a través del proxy; anotar en él el resultado de cada una y cuáles quedan sin comprobar
- [X] T051 Con 100 listas de 20 canciones creadas en la API, medir que listado y detalle se ven en menos de 2 segundos y anotarlo en [quickstart.md](quickstart.md) (SC-005)
- [X] T052 Revisar el diff completo: sin secretos, archivos temporales, textos o valores sueltos ni comentarios
- [X] T053 En `quipux-playlist-backend`, como cambio aparte de solo documentación y en su propia rama: quitar "Falta la aplicación web" de `README.md` y marcar en `docs/backlog.md` los criterios de HU-05 comprobados

---

## Dependencies & Execution Order

```text
Setup → Foundational → US1 → US2 → US3 → US4 → Polish
```

- **US1** solo depende de la base.
- **US2** necesita la sesión, el interceptor y las guardas de US1.
- **US3** necesita US1 y la página de listado y el servicio de US2.
- **US4** necesita la página de listado y el servicio de US2, y el rol de US1. No depende de US3, pero comparte con ella
  `playlist-api.ts` y `playlist-list-page`: se hacen una detrás de otra.

Dentro de cada historia: pruebas → modelos → servicios → páginas → rutas.

## Parallel Examples

- **Base**: T006, T007 y T008.
- **US1**: T010 a T015; después, T019 y T021.
- **US2**: T024, T025 y T026; después de T028, T029 y T030.
- **US3**: T032 a T036; después, T037, T038 y T039.
- **US4**: T043 y T044.

## Implementation Strategy

**MVP**: Setup, Foundational y US1: acceso protegido, comprobable por sí solo.

**Entrega**: las cuatro historias son P1 y HU-05 no se entrega a medias (backlog, "Orden de entrega"). Cada checkpoint
sirve para validar y hacer un commit, no para publicar.

## Notes

- Commits en Conventional Commits, en inglés y con `HU-05` como ámbito; solo cuando se pidan.
- No se genera `requests.http`: no hay endpoints nuevos ni modificados.
- Los comentarios de revisión que aparezcan se registran en `specs/05-web-app/code-review.md`.
