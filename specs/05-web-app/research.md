# Research: Aplicación web

Las comprobaciones se hicieron el 2026-11-26 en un proyecto desechable, con Angular 22.3.0 y Node 22.22.3.

## R1. Versión de Angular

- **Decisión**: Angular 22.3 con TypeScript 6.0, generado con `npx @angular/cli@22.3.0`. `engines` pide Node
  `^22.22.3 || ^24.15.0 || >=26.0.0`.
- **Motivo**: es la última versión estable y el equipo de desarrollo cumple su requisito de Node justo en el mínimo.
- **Alternativas**: usar el CLI global instalado (20.2.1). Se descarta: crearía un proyecto dos versiones atrás.

## R2. Detección de cambios y estado

- **Decisión**: sin `zone.js` y con `OnPush`, que son los valores por defecto del proyecto generado. El estado que cambia
  tras una petición vive en signals.
- **Motivo**: con esos valores, asignar un campo normal desde una respuesta HTTP no repinta la pantalla.
- **Alternativas**: volver a `zone.js` o marcar los componentes como `Eager`. Se descarta: es ir contra la plataforma.

## R3. Formularios

- **Decisión**: formularios reactivos, con `FormArray` para las canciones.
- **Motivo**: lo fijan el ADR-0001 (sección 12) y FR-021.
- **Alternativas**: *signal forms*. Se descarta por contradecir el ADR.

## R4. Proxy de desarrollo

- **Decisión**: la web llama a `/api/...` y `proxy.conf.json` lo reenvía a `http://localhost:8080` quitando `/api`.
- **Motivo**: sin prefijo, las páginas `/playlists` o `/lists` competirían con las rutas de la API. La API no cambia.
- **Comprobado** contra un servidor de eco: `%20`, `%3B`, `%25`, `%23`, `%3F`, tildes y puntos llegan sin alterar; `Host`
  sigue siendo el de la web, así que un `POST` con `Origin` es del mismo origen. Con el destino apagado responde `502`.
- **Comprobado con la API real**: crear y borrar a través del proxy, incluidos los nombres especiales.
- **Para HU-07**: nginx tendrá que hacer la misma reescritura.

## R5. Dirección del detalle

- **Decisión**: `/playlists/detail?name=<nombre>`.
- **Motivo**: con el nombre en la ruta, recargar `/playlists/data.json` respondió `404`, porque el servidor de desarrollo
  lo toma por un archivo. Con el parámetro de consulta, la recarga responde la web.
- **Comprobado**: el router conserva sin cambios 15 nombres con espacios (también en los extremos), `.`, `;`, `%`, `+`,
  `&`, `=`, `#`, `?`, comillas, paréntesis y `ñ`.
- **Alternativas**: `/playlists/:name`. Se descarta por el fallo anterior; nginx podría repetirlo.

## R6. Nombre en las llamadas a la API

- **Decisión**: `encodeURIComponent` sobre el nombre en `/api/lists/{nombre}`.
- **Comprobado**: `HttpClient` no recodifica la ruta. La API ya rechaza `.` y `..`, que el navegador resolvería como
  segmentos de ruta.

## R7. Sesión

- **Decisión**: guardar solo el token en `sessionStorage`; el vencimiento se vuelve a leer de él. El usuario (`sub`), el rol (`role`) y el
  vencimiento (`exp`) se leen del contenido del token, sin librería y sin verificar la firma.
- **Motivo**: sobrevive a recargar y se borra al cerrar la pestaña (FR-006). La firma solo la puede verificar la API, que
  es quien autoriza.
- **Alternativas**: `localStorage` (el token quedaría guardado), memoria (se pierde al recargar) o cookie (cambiaría la
  API).
- **Riesgo aceptado**: un script inyectado podría leer el token. Angular escapa lo que pinta y no se usa `innerHTML`.
- **Limitación**: un navegador puede restaurar `sessionStorage` al reabrir una pestaña cerrada; no se probó.

## R8. Interceptor y tiempo máximo

- **Decisión**: un interceptor funcional, registrado con `provideHttpClient(withInterceptors([...]))`, que añade el token
  solo a las direcciones `/api/` distintas del inicio de sesión, trata el `401` y fija un tiempo máximo de 10 segundos.
- **Motivo**: sin tiempo máximo, una API que no contesta dejaría la carga indefinida (SC-004). `HttpRequest` ya trae la
  opción `timeout`. El catálogo de géneros tarda como mucho unos 3 segundos (HU-04).

## R9. Pruebas

- **Decisión**: Vitest a través de `ng test`, con jsdom, `HttpTestingController` y `RouterTestingHarness`. `npm test`
  ejecuta `ng test --watch=false`.
- **Comprobado**: ese comando termina solo y no necesita navegador.
- **Sin ESLint**: es de HU-08. Se conserva el Prettier que genera el CLI.

## R10. Confirmación de borrado e interfaz

- **Decisión**: `window.confirm` con el nombre de la lista, y CSS propio sin librería de componentes.
- **Motivo**: cumple FR-017 sin dependencias ni diseño que el backlog no pide.
- **Alternativas**: diálogo propio o Angular Material. Se descartan por tamaño.

## R11. Textos y valores fijos

- **Decisión**: textos de la interfaz, rutas, direcciones de la API, rol y límites en constantes y enums de
  `core/`; los datos de prueba en archivos JSON.
- **Motivo**: aplica a TypeScript las convenciones del backend (sin literales sueltos, listas fuera del código). El JSON
  hace aquí el papel de los `.properties`.

## R12. Crear el proyecto en un repositorio con archivos

- **Decisión**: generar con `--ai-config=none --skip-git` en una carpeta temporal y copiar al repositorio, fusionando
  `.gitignore` y `README.md`.
- **Motivo**: el repositorio ya tiene ambos archivos y el CLI no escribe encima.
