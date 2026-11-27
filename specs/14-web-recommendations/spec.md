# Feature Specification: Recomendaciones en la web

**Feature Branch**: `feature/14-web-recommendations`

**Created**: 2026-11-27

**Status**: Draft

**Input**: User description: "HU-14, bloque web, tipo feature: Recomendaciones en la web. Solo se entrega el bloque web de HU-14." Fuentes: `backlog-ia.md` (HU-14, bloque «Recomendaciones en la web») y ADR-0002 «Recomendaciones con IA», ambos en la carpeta de trabajo del módulo de IA, y el [contrato REST de recomendaciones](https://github.com/leandroAmariles/quipux-playlist-backend/blob/main/specs/12-ai-recommendations/contracts/rest-api.md) de HU-12.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pedir sugerencias desde el detalle (Priority: P1)

Como usuario, pido desde el detalle de una lista sugerencias de canciones y las veo allí mismo, para descubrir música sin usar un cliente REST.

**Why this priority**: Es el valor del bloque; sin ello no hay nada que indicar ni que fallar.

**Independent Test**: Con la sesión iniciada, abrir el detalle de una lista, pulsar el botón y comprobar la carga y las sugerencias recibidas, con cada uno de los dos roles.

**Acceptance Scenarios**:

1. **Given** el detalle de una lista cargado, **When** todavía no he pulsado el botón, **Then** veo el botón para pedir recomendaciones y no se ha hecho ninguna petición de recomendaciones.
2. **Given** el detalle de una lista, **When** pulso el botón, **Then** veo el estado de carga de las recomendaciones, el botón queda inhabilitado y la lista y sus canciones siguen a la vista.
3. **Given** una petición en curso, **When** llega una respuesta con sugerencias, **Then** desaparece la carga y veo cada sugerencia con título, artista, género y motivo, en el orden recibido.
4. **Given** una respuesta sin ninguna sugerencia, **When** se muestra, **Then** veo un mensaje de que no hay sugerencias para la lista, junto a su origen.
5. **Given** un usuario `USER` o `ADMIN`, **When** abre el detalle, **Then** dispone del botón.
6. **Given** unas sugerencias ya mostradas, **When** vuelvo a pulsar el botón, **Then** se piden de nuevo y la respuesta sustituye a la anterior.

---

### User Story 2 - Saber de dónde vienen las sugerencias (Priority: P2)

Como usuario, veo si las sugerencias las generó la IA o son de respaldo, para saber cuánto fiarme de ellas.

**Why this priority**: La API responde con éxito también cuando la IA falla; sin el origen, el respaldo pasaría por una sugerencia de la IA.

**Independent Test**: Mostrar una respuesta de cada origen y comprobar que el texto que la acompaña es distinto y correcto.

**Acceptance Scenarios**:

1. **Given** una respuesta con origen `IA` y sugerencias sin identificador de catálogo, **When** se muestra, **Then** veo que las generó la IA y que no están verificadas contra un catálogo.
2. **Given** una respuesta con origen `RESPALDO`, **When** se muestra, **Then** veo que son sugerencias de respaldo y no de la IA, sin que se presente como un error.
3. **Given** una respuesta con origen `SIMILITUD`, **When** se muestra, **Then** veo que se eligieron por similitud en el catálogo.

---

### User Story 3 - Entender un fallo y reintentar (Priority: P2)

Como usuario, cuando las recomendaciones no se pueden obtener veo por qué y puedo intentarlo de nuevo, para no quedarme ante una pantalla que no responde.

**Why this priority**: El backlog exige el estado de error, incluido el límite de peticiones; no impide ver sugerencias cuando todo va bien.

**Independent Test**: Provocar cada fallo con respuestas simuladas (límite superado, lista inexistente, error de la API y falta de respuesta) y comprobar el mensaje y el reintento.

**Acceptance Scenarios**:

1. **Given** que superé el límite de peticiones, **When** la API responde `429` con el tiempo de espera, **Then** veo que hice demasiadas peticiones y cuántos segundos debo esperar.
2. **Given** un `429` sin un tiempo de espera utilizable, **When** se muestra, **Then** veo que hice demasiadas peticiones y que lo intente más tarde.
3. **Given** que la API no responde o responde con un error inesperado, **When** pido recomendaciones, **Then** veo un mensaje de error, la lista sigue a la vista y puedo volver a pulsar el botón.
4. **Given** una lista que otra persona borró, **When** pido recomendaciones y la API responde `404`, **Then** veo que no se encontró la lista y puedo volver al listado.
5. **Given** un token vencido o rechazado, **When** la API responde `401`, **Then** la sesión se cierra y se me lleva al acceso, como en el resto de la web.
6. **Given** un mensaje de error a la vista, **When** pulso el botón y la nueva petición tiene éxito, **Then** el mensaje desaparece y veo las sugerencias.

---

### Edge Cases

- **Respuesta lenta**: la API puede tardar hasta 30 s antes de responder con sugerencias de la IA o de respaldo; la web no la abandona antes.
- **Sin respuesta**: pasado el tiempo máximo de espera de la web, se muestra el error general.
- **Doble pulsación**: mientras hay una petición en curso no se puede lanzar otra.
- **Cambio de lista o salida de la página**: la petición en curso se descarta y las sugerencias de una lista nunca aparecen en el detalle de otra.
- **Lista sin canciones**: el botón está disponible; la API responde con respaldo.
- **Nombres con caracteres especiales**: las recomendaciones se pueden pedir para los mismos nombres cuyo detalle se puede abrir (HU-05).
- **Género o motivo vacíos**: se ven como ausentes.
- **Texto con apariencia de HTML o de enlace**: lo escribe un modelo; se muestra como texto literal y no se interpreta.
- **Textos largos**: título, artista (hasta 255 caracteres), género (100) y motivo (120) se muestran completos.
- **Sin permiso**: un `403` muestra el mensaje de falta de permiso que ya usa la web.
- **Detalle no disponible**: mientras el detalle está cargando, falló o la lista no existe, no se ofrece el botón.

## Requirements *(mandatory)*

### Functional Requirements

**Petición**

- **FR-001**: El detalle de una lista ya cargado debe ofrecer un botón para pedir recomendaciones, a los roles `USER` y `ADMIN`.
- **FR-002**: Las recomendaciones se piden solo al pulsar el botón, nunca al abrir el detalle, con `GET /lists/{listName}/recommendations` según el contrato de HU-12 y con el token de la sesión.
- **FR-003**: Mientras la petición está en curso se muestra un estado de carga propio de las recomendaciones y el botón queda inhabilitado; el resto del detalle no cambia.
- **FR-004**: La web debe esperar la respuesta de las recomendaciones hasta 35 segundos. El tiempo máximo de las demás operaciones (10 segundos) no cambia.
- **FR-005**: Cada pulsación descarta las sugerencias y el error anteriores. Al cambiar de lista o salir del detalle se descarta también la petición en curso.

**Resultado**

- **FR-006**: Cada sugerencia muestra `titulo`, `artista`, `genero` y `motivo`, en el orden de la respuesta. Un valor vacío se ve como ausente.
- **FR-007**: Los textos recibidos se muestran como texto literal, sin interpretar HTML.
- **FR-008**: Toda respuesta con éxito indica su origen: `IA`, generadas por IA; `RESPALDO`, sugerencias de respaldo que no son de la IA; `SIMILITUD`, elegidas por similitud en el catálogo.
- **FR-009**: Con origen `IA`, si alguna sugerencia no trae identificador de catálogo (`idCatalogo` vacío), se advierte de que no están verificadas contra un catálogo.
- **FR-010**: El texto del origen `RESPALDO` no debe atribuirlo a un fallo concreto: también es la respuesta para una lista vacía o con la IA desactivada.
- **FR-011**: Una respuesta sin sugerencias muestra un mensaje de que no hay ninguna, además del origen.

**Errores**

- **FR-012**: Un `429` muestra que se hicieron demasiadas peticiones, con los segundos de espera de la cabecera `Retry-After`. Si falta o no es un número entero positivo, se pide intentarlo más tarde.
- **FR-013**: Un `404` indica que no se encontró la lista; el enlace de vuelta al listado sigue disponible.
- **FR-014**: Un `401` y un `403` se tratan como en el resto de la web (HU-05). Cualquier otro estado, la falta de conexión o la espera agotada muestran el error general.
- **FR-015**: Un fallo de las recomendaciones no oculta la lista ni sus canciones, y el botón queda habilitado para reintentar. La web no reintenta por su cuenta.

**Convenciones, pruebas y entrega**

- **FR-016**: Los textos nuevos están en español.
- **FR-017**: Las pruebas unitarias, con HTTP simulado, cubren: la petición solo al pulsar y con el nombre codificado; la carga y el botón inhabilitado; el tiempo de espera ampliado; las sugerencias y la respuesta sin ninguna; cada origen y el aviso de no verificadas; el `429` con y sin tiempo de espera; el `404`; el error general y el reintento; y el descarte al cambiar de lista.
- **FR-018**: Las pruebas pasan con el comando de pruebas actual, sin la API, sin modelos y sin `AI_API_KEY`.
- **FR-019**: El `README.md` de la web describe las recomendaciones y apunta a esta especificación.
- **FR-020**: El trabajo asistido por IA de este bloque se anota en un `AI-LOG.md` del repositorio de la web: prompts relevantes, resultado, lo aceptado o corregido y cómo se verificó.
- **FR-021**: Al entregar, y solo tras verificarlos, se marcan en `backlog-ia.md` los tres criterios de «Recomendaciones en la web». No se marca ningún otro.

### Key Entities *(include if feature involves data)*

- **Respuesta de recomendaciones**: nombre de la lista, origen, versión del prompt y de 0 a 5 sugerencias.
- **Sugerencia**: identificador de catálogo (vacío si no está verificada), título, artista, género y motivo.
- **Origen**: `IA`, `RESPALDO` o `SIMILITUD` (este último no se produce hasta HU-13).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desde el detalle de una lista, un usuario obtiene sugerencias con una sola acción y sin salir de la página.
- **SC-002**: En el 100 % de las respuestas con éxito se ve su origen, y ninguna de respaldo se presenta como generada por IA.
- **SC-003**: El 100 % de las peticiones terminan en sugerencias, en el aviso de que no hay ninguna o en un mensaje de error; ninguna queda cargando más allá del tiempo máximo de espera.
- **SC-004**: Una respuesta que llega a los 30 segundos se muestra como sugerencias y no como error.
- **SC-005**: Tras cualquier fallo de las recomendaciones, el 100 % del detalle de la lista sigue visible y utilizable.
- **SC-006**: Los tres criterios web de HU-14 se cumplen y cada uno tiene al menos una prueba automática.

## Assumptions

- **Alcance**: solo el bloque web de HU-14. Quedan fuera la evaluación con RAGAS y los prompts y trazas en Langfuse. No se modifican el backend ni la infraestructura.
- **Contrato**: la web usa el endpoint de HU-12 tal como está entregado; el backlog confirma que este bloque no necesita HU-13.
- **`SIMILITUD`**: el ADR-0002 ya lo define. Se contempla para que la web no haya que cambiarla al llegar HU-13; solo se puede probar con respuestas simuladas.
- **Tiempo de espera**: la API espera por defecto 30 s al modelo; los 35 s dejan margen. Si se configura la API por encima de eso, habrá que revisar el valor de la web. El servidor web de la imagen conserva su configuración actual.
- **Petición a demanda**: el backlog pide un botón y la API limita a 10 peticiones por usuario y minuto; por eso no se piden al abrir el detalle.
- **Límite de peticiones**: se informa del tiempo de espera, sin cuenta atrás ni bloqueo del botón; pulsar antes de tiempo vuelve a mostrar el aviso.
- **Datos no mostrados**: la versión del prompt y el identificador de catálogo no se enseñan al usuario.
- **Sin persistencia**: las sugerencias no se guardan en el navegador; al volver al detalle hay que pedirlas de nuevo.
- **Fuera de alcance**: añadir una sugerencia a la lista, valorar sugerencias, pedirlas desde el listado, y diseño para móvil o accesibilidad certificada (como en HU-05).
- **`AI-LOG.md`**: el del módulo está en el repositorio de backend, que en esta entrega no se modifica; por eso el de este bloque va en el repositorio de la web.
- **Backlog**: `backlog-ia.md` es el único archivo fuera del repositorio de la web (aparte de los de spec-kit) que cambia, y solo en esas tres casillas.
- **Dependencias**: HU-05 (web) y HU-12 (recomendaciones), ya entregadas. Para probar a mano se necesita la API en marcha; sin los servicios de IA responde con `RESPALDO`.
