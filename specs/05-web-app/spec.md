# Feature Specification: Aplicación web

**Feature Branch**: `feature/05-web-app`

**Created**: 2026-11-26

**Status**: Draft

**Input**: User description: "HU-05: como usuario, quiero una web para acceder, explorar las listas y, como administrador, gestionarlas, para no depender de un cliente REST." Fuentes, en el repositorio de backend: [`docs/backlog.md`](https://github.com/leandroAmariles/quipux-playlist-backend/blob/main/docs/backlog.md) (HU-05), [ADR-0001](https://github.com/leandroAmariles/quipux-playlist-backend/blob/main/docs/adr/0001-arquitectura-api-listas-reproduccion.md) (secciones 11 y 12) y los contratos REST de HU-02, HU-03 y HU-04.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acceder a la web (Priority: P1)

Como usuario, inicio sesión en la web con mi nombre de usuario y contraseña, para usar la aplicación sin un cliente REST.

**Why this priority**: Todas las operaciones de la API exigen token; sin acceso no se puede hacer nada más.

**Independent Test**: Iniciar sesión con credenciales válidas e inválidas, abrir una página sin sesión y dejar vencer el token.

**Acceptance Scenarios**:

1. **Given** credenciales válidas, **When** envío el formulario de acceso, **Then** llego al listado.
2. **Given** credenciales inválidas, **When** envío el formulario, **Then** sigo en él y veo el error de credenciales.
3. **Given** el usuario o la contraseña vacíos o solo con espacios, **When** intento enviar el formulario, **Then** se indica qué falta y no se llama a la API.
4. **Given** que no he iniciado sesión, **When** abro la dirección de una página protegida, **Then** se me lleva al acceso.
5. **Given** una sesión iniciada, **When** la web hace una petición a la API distinta del inicio de sesión, **Then** la petición lleva el token.
6. **Given** un token vencido o rechazado, **When** la API responde `401` a una petición, **Then** la sesión se cierra y se me lleva al acceso.
7. **Given** una sesión iniciada, **When** elijo cerrar sesión, **Then** se me lleva al acceso y las páginas protegidas dejan de ser accesibles.

---

### User Story 2 - Explorar las listas (Priority: P1)

Como usuario, veo el listado de listas y el detalle de cada una, para saber qué música hay disponible.

**Why this priority**: Es el valor principal para los dos roles y el punto de partida para crear y borrar.

**Independent Test**: Con la sesión iniciada, abrir el listado sin listas, con listas y con la API fallando, y entrar al detalle.

**Acceptance Scenarios**:

1. **Given** que hay listas, **When** abro el listado, **Then** veo cada una con su nombre y su descripción, en el orden en que las devuelve la API.
2. **Given** una lista del listado, **When** la abro, **Then** veo su nombre, descripción y canciones, con título, artista, álbum, año y género.
3. **Given** una petición en curso, **When** estoy en el listado o en el detalle, **Then** veo el estado de carga.
4. **Given** que no hay listas, **When** abro el listado, **Then** veo un mensaje de listado vacío.
5. **Given** una lista sin canciones, **When** abro su detalle, **Then** veo un mensaje de que no tiene canciones.
6. **Given** que la API no responde o responde con un error, **When** abro el listado o el detalle, **Then** veo un mensaje de error y puedo reintentar.
7. **Given** que la lista ya no existe, **When** abro su detalle, **Then** veo que no se encontró y puedo volver al listado.

---

### User Story 3 - Crear una lista (Priority: P1)

Como administrador, creo una lista con sus canciones desde un formulario, para organizar la música.

**Why this priority**: Es el formulario que pide el enunciado y la operación con más reglas.

**Independent Test**: Con un usuario `ADMIN`, crear listas válidas y rechazadas; con un usuario `USER`, intentar llegar al formulario.

**Acceptance Scenarios**:

1. **Given** un usuario `ADMIN` en el formulario, **When** completa el nombre y la descripción, añade dos canciones y guarda, **Then** la lista se crea, vuelve al listado y la ve en él.
2. **Given** el formulario con tres canciones, **When** quita la segunda, **Then** quedan las otras dos con sus datos intactos y en el mismo orden.
3. **Given** el nombre vacío o solo con espacios, **When** intenta guardar, **Then** se indica que el nombre es obligatorio y no se llama a la API.
4. **Given** el formulario abierto, **When** elige el género de una canción, **Then** las opciones son las que devuelve `GET /genres`, además de la opción de no indicar género.
5. **Given** datos que la API rechaza con `400`, **When** guarda, **Then** ve el error en el formulario y los datos escritos se conservan.
6. **Given** un nombre que ya existe, **When** guarda, **Then** ve el error de nombre repetido (`409`) y los datos escritos se conservan.
7. **Given** un usuario `USER`, **When** usa la web, **Then** no ve la opción de crear.
8. **Given** un usuario `USER`, **When** abre la dirección del formulario de creación, **Then** no accede a él y se le lleva al listado.

---

### User Story 4 - Borrar una lista (Priority: P1)

Como administrador, borro una lista desde el listado, para retirar la que ya no sirve.

**Why this priority**: Completa la gestión de listas; depende de que el listado exista.

**Independent Test**: Con un usuario `ADMIN`, cancelar y confirmar un borrado; con un usuario `USER`, revisar el listado.

**Acceptance Scenarios**:

1. **Given** un usuario `ADMIN` en el listado, **When** elige borrar una lista, **Then** se le pide confirmación nombrando la lista y todavía no se borra nada.
2. **Given** la confirmación abierta, **When** cancela, **Then** la lista sigue y no se llama a la API.
3. **Given** la confirmación abierta, **When** confirma, **Then** la lista se borra y el listado se actualiza sin recargar la página.
4. **Given** una lista ya borrada por otra persona, **When** confirma su borrado, **Then** ve que ya no existe y el listado se actualiza.
5. **Given** que el borrado falla por otro motivo, **When** confirma, **Then** ve un error y la lista sigue en el listado.
6. **Given** un usuario `USER`, **When** abre el listado, **Then** no ve la opción de borrar.

---

### Edge Cases

- **Nombres con caracteres especiales**: las listas con espacios, tildes, `ñ`, `&`, `?`, `#`, `+`, `;` o `%` en el nombre se pueden abrir y borrar desde la web.
- **Espacios alrededor del nombre**: se envía tal como se escribió; " Rock " y "Rock" son listas distintas (HU-02).
- **Recargar la página**: la sesión y la página actual se conservan, también en el detalle y en el formulario.
- **Direcciones compartidas con la API**: abrir o recargar una página de la web muestra la web, nunca la respuesta de la API.
- **Dirección que no existe**: lleva al listado o, sin sesión, al acceso.
- **Acceso con sesión iniciada**: abrir la página de acceso con una sesión vigente lleva al listado.
- **Sesión vencida al guardar**: el `401` lleva al acceso y lo escrito en el formulario se pierde.
- **Rol cambiado a mano en el navegador**: aunque la web muestre una opción, la API rechaza la operación; la web muestra que no hay permiso.
- **Doble envío**: mientras se guarda, se borra o se inicia sesión, la acción no se puede repetir.
- **Géneros no disponibles**: si `GET /genres` falla, se avisa, se puede reintentar y se pueden crear listas sin género.
- **Género que deja de ser válido**: si el catálogo cambia entre cargar el formulario y guardar, la API responde `400` y se muestra como los demás `400`.
- **Campos vacíos de una canción**: se envían sin valor, no como texto vacío.
- **Sin canciones**: se puede crear una lista sin ninguna canción.
- **API caída al iniciar sesión**: se muestra un error distinto del de credenciales.

## Requirements *(mandatory)*

### Functional Requirements

**Acceso y sesión**

- **FR-001**: La web debe ofrecer un formulario con nombre de usuario y contraseña, ambos obligatorios, que inicia sesión con `POST /auth/login`. Con éxito lleva al listado.
- **FR-002**: Las credenciales inválidas (`401` del inicio de sesión) se muestran en el propio formulario, sin indicar si falló el usuario o la contraseña. Cualquier otro fallo se muestra como un error distinto.
- **FR-003**: Un interceptor debe añadir el token a todas las peticiones a la API excepto el inicio de sesión.
- **FR-004**: Un `401` en cualquier petición distinta del inicio de sesión debe cerrar la sesión y llevar al acceso.
- **FR-005**: Sin sesión, ninguna página salvo la de acceso es accesible.
- **FR-006**: La sesión se conserva al recargar la página y termina al cerrar la pestaña, al cerrar sesión o al ser rechazado el token.
- **FR-007**: La web debe mostrar quién ha iniciado sesión y permitir cerrar la sesión.
- **FR-008**: La web debe obtener el rol del propio token y usarlo para mostrar u ocultar opciones. La autorización la sigue decidiendo la API.

**Ver listas**

- **FR-009**: El listado muestra todas las listas (`GET /lists`) con su nombre y descripción, y permite abrir cada una.
- **FR-010**: El detalle muestra una lista (`GET /lists/{listName}`) con su nombre, descripción y canciones. Los datos sin valor se ven como ausentes, no como `null`.
- **FR-011**: El listado y el detalle muestran un estado distinto para carga, vacío y error; el error permite reintentar. En el detalle, una lista inexistente se indica como no encontrada.

**Crear lista (`ADMIN`)**

- **FR-012**: El formulario recoge `nombre`, `descripcion` y las canciones (`titulo`, `artista`, `album`, `anno`, `genero`), y permite añadir y quitar canciones.
- **FR-013**: El nombre es obligatorio: vacío o solo con espacios no se envía y se indica en el campo. Las demás reglas las valida la API.
- **FR-014**: El género se elige entre los que devuelve `GET /genres`; no se escribe a mano y se puede dejar sin indicar.
- **FR-015**: Un `400` o un `409` se muestran en el formulario sin perder lo escrito. El `409` indica que el nombre ya existe. El `400` indica que los datos no son válidos e incluye el detalle que envía la API.
- **FR-016**: Tras crear la lista, la web vuelve al listado, que la incluye.

**Borrar lista (`ADMIN`)**

- **FR-017**: Antes de borrar (`DELETE /lists/{listName}`) se pide una confirmación que nombra la lista.
- **FR-018**: Tras borrar, o al saber que la lista ya no existe, el listado se actualiza. Un fallo se muestra y no quita la lista.

**Rol `USER`**

- **FR-019**: El rol `USER` no ve las opciones de crear ni borrar, y la ruta de creación queda bloqueada aunque se escriba su dirección.

**Integración**

- **FR-020**: En desarrollo, la web llama a la API por su mismo origen mediante el proxy de desarrollo, sin configurar CORS ni cambiar la API.
- **FR-021**: La web es un proyecto Angular en el repositorio `quipux-playlist-frontend`, con componentes standalone y formularios reactivos.
- **FR-022**: Los textos de la web están en español.

**Pruebas y documentación**

- **FR-023**: Las pruebas unitarias cubren: el interceptor (añade el token y un `401` redirige al acceso); el formulario de creación (valida el nombre, añade y quita canciones y muestra `400` y `409`); que `USER` no ve crear ni borrar; el bloqueo de rutas; y los servicios, con HTTP simulado.
- **FR-024**: Las pruebas se ejecutan con un solo comando, que termina sin intervención y falla si alguna prueba falla. No necesitan la API en marcha.
- **FR-025**: El `README.md` del repositorio de la web explica los requisitos y cómo arrancarla contra la API y ejecutar las pruebas. El repositorio no contiene contraseñas ni tokens.

### Key Entities *(include if feature involves data)*

- **Sesión**: token de acceso, nombre de usuario, rol y momento de vencimiento. Vive solo en el navegador.
- **Lista**: nombre, descripción y cero o más canciones (HU-02).
- **Canción**: título, artista, álbum, año y género (HU-02).
- **Género**: opción del catálogo que entrega la API (HU-04).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un administrador puede iniciar sesión, crear una lista con dos canciones, verla y borrarla sin usar otra herramienta, en menos de 3 minutos.
- **SC-002**: Todos los criterios de aceptación de HU-05 en el backlog se cumplen, y los de su apartado de pruebas tienen una prueba automática.
- **SC-003**: Con un usuario `USER` hay 0 opciones visibles para crear o borrar.
- **SC-004**: El 100 % de las operaciones fallidas muestran un mensaje; ninguna deja la pantalla en blanco o en carga indefinida.
- **SC-005**: Con 100 listas de 20 canciones, el listado y el detalle se ven en menos de 2 segundos en el equipo de desarrollo.
- **SC-006**: Un clon nuevo del repositorio permite ejecutar las pruebas siguiendo solo el `README.md`.

## Assumptions

- **Decisiones del ADR-0001**: Angular con componentes standalone y formularios reactivos, interceptor para el JWT, opciones ocultas para `USER` y acceso por el mismo origen ya están acordados.
- **Rol**: la respuesta del inicio de sesión no trae el rol, pero el token lo incluye (`role`); la web lo lee de ahí sin pedir cambios en la API.
- **Cierre de sesión**: el backlog no lo pide; se añade, solo en el navegador, para poder cambiar entre los usuarios de demostración. En el servidor no existe (HU-03).
- **Conservación de la sesión**: no se pide. Se elige que dure lo que la pestaña, para no dejar el token guardado después de cerrarla. No hay renovación: a los 30 minutos hay que volver a entrar.
- **Errores**: la API responde sus detalles en inglés y todos los `400` comparten código. La web usa mensajes propios en español y, solo en el `400` del formulario, añade el detalle en inglés, que es lo único que distingue, por ejemplo, un género no válido.
- **Validación en la web**: solo se exigen los campos obligatorios; las longitudes y los caracteres no permitidos en el nombre los valida la API (HU-02, HU-03).
- **Borrar**: la opción está en el listado, no en el detalle.
- **Origen de los géneros**: la web no muestra si vienen de Spotify o de la lista local; el backlog no lo pide.
- **Diseño**: interfaz sencilla para navegadores de escritorio actuales; no se piden diseño gráfico propio, adaptación a móvil, accesibilidad certificada ni varios idiomas.
- **Cobertura**: el mínimo del 80 % y Checkstyle son del backend; en la web se exigen las pruebas listadas. ESLint en CI es HU-08.
- **Repositorios**: el código y esta especificación van en `quipux-playlist-frontend`. El backlog sigue en el backend, y allí se marcan sus criterios.
- **Fuera de alcance**: modificar listas o canciones, paginación, búsqueda y filtros, registro de usuarios, Docker y nginx (HU-07), CI y ESLint (HU-08) y OpenAPI y Postman (HU-06).
- **Dependencias**: HU-02 (listas), HU-03 (autenticación y roles) y HU-04 (géneros), ya fusionadas en `main`. Para probar a mano se necesita la API en marcha con sus variables de entorno.
