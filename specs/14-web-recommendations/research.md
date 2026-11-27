# Research: Recomendaciones en la web

No quedan puntos `NEEDS CLARIFICATION`. Comprobado sobre `@angular/common` 22.3.0 instalado con `npm ci`. Línea base
antes de cambiar nada: 14 archivos y 106 pruebas en verde, y `npm run lint` sin errores.

## 1. Tiempo de espera de 35 s solo para las recomendaciones

**Hallazgo**: `authInterceptor` clona cada petición con `timeout: REQUEST_TIMEOUT_MS` (10 s), y `HttpRequest.clone` usa
`update.timeout ?? this.timeout`. Un tiempo mayor puesto por el servicio quedaría **pisado**, y las pruebas del servicio
sin interceptor no lo verían.

- **Decision**: el servicio pide `timeout: RECOMMENDATIONS_TIMEOUT_MS` (35 s) y el interceptor pasa a aplicar
  `request.timeout ?? REQUEST_TIMEOUT_MS`. La prueba del servicio monta el interceptor real.
- **Rationale**: quien conoce su operación fija su límite; el interceptor solo pone el valor por defecto.
- **Alternatives considered**: reconocer la URL en el interceptor (frágil); un `HttpContextToken` (más piezas para un
  solo caso); el operador `timeout` de RxJS (el límite de 10 s seguiría abortando); subir el límite de todas las
  peticiones (contradice FR-004).

Al agotarse el tiempo, `FetchBackend` aborta la petición y emite un `HttpErrorResponse` sin estado HTTP útil, así que
cae en el error general sin código nuevo.

**Resto de la cadena**: `nginx/default.conf.template` no fija `proxy_read_timeout` (60 s por defecto) y
`proxy.conf.json` no fija ninguno. No se cambian; se comprueba con una respuesta lenta (`quickstart.md`).

## 2. Dónde vive la interfaz

- **Decision**: componente hijo `RecommendationsPanel`, con la entrada obligatoria `playlistName`, que el detalle pinta
  solo en su estado listo.
- **Rationale**: las recomendaciones tienen estados propios que no deben mezclarse con los del detalle (FR-003, FR-015),
  y el botón no existe mientras el detalle carga o falla.
- **Alternatives considered**: todo dentro de `PlaylistDetailPage` (dos máquinas de estados en una clase); una ruta
  aparte (SC-001 pide no salir de la página); `rxResource` (la web usa `subscribe` y señales, y la petición es a
  demanda).

## 3. Descartar la petición en curso

- **Decision**: `takeUntilDestroyed` en el panel. Al cambiar de lista, el detalle pasa a «cargando», lo que destruye el
  panel; al salir de la página, también. Anular la suscripción aborta la petición del navegador.
- **Rationale**: no hace falta estado ni comparación de nombres. Una prueba en el detalle cambia de lista con una
  petición pendiente y verifica que se cancela.
- **Limitación**: la API ya habrá contado la petición en el cupo de 10 por minuto.

## 4. `Retry-After`

- **Decision**: aceptar solo un entero positivo en segundos; cualquier otra cosa muestra el texto sin tiempo.
- **Rationale**: el contrato de HU-12 lo envía en segundos. La petición va por el mismo origen, así que la cabecera se
  puede leer, y nginx la reenvía.
- **Alternatives considered**: admitir también la forma de fecha HTTP (la API no la usa).

## 5. Capa de API

- **Decision**: `RecommendationApi` con su DTO, modelo y mapeador, como los servicios de listas y géneros. La ruta se
  forma a partir de `playlistPath(name)`, que ya codifica el nombre.
- **Alternatives considered**: un método más en `PlaylistApi` (mezcla otro contrato y otro tiempo de espera).

## 6. Texto escrito por un modelo

- **Decision**: solo interpolación de plantilla; nada de `innerHTML` ni de convertir texto en enlaces. Una prueba envía
  marcado HTML y comprueba que se ve literal.

## 7. Estilos

- **Decision**: el panel reutiliza `playlist-detail-page.css` para que su tabla se vea como la de canciones; se añade
  `overflow-wrap: anywhere` a las celdas para los textos largos sin espacios.
- **Alternatives considered**: copiar las reglas (duplicado); llevarlas a `styles.css` (afectaría a toda la web).

## 8. Otros

- Sin dependencias nuevas.
- `AI-LOG.md` nuevo en la raíz del repositorio de la web (FR-020). `.dockerignore` ya lo deja fuera de la imagen.
- `CHANGELOG.md` no se toca: lo genera release-please.
