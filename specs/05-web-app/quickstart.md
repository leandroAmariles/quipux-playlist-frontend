# Quickstart: validar la aplicación web

## Requisitos

- Java 21 y Node `^22.22.3 || ^24.15.0 || >=26.0.0`
- Las variables `JWT_SECRET`, `DEMO_USER_PASSWORD` y `DEMO_ADMIN_PASSWORD` (README del backend)

## Pruebas automáticas

En `quipux-playlist-frontend`, sin la API en marcha:

```bash
npm ci
npm test         # termina solo, en verde
npm run build    # sin errores
```

## Arrancar

```bash
# terminal 1, en quipux-playlist-backend, con las variables definidas
./mvnw package
java -jar bootstrap/target/playlist-bootstrap-0.1.0-SNAPSHOT.jar

# terminal 2, en quipux-playlist-frontend
npm start        # http://localhost:4200
```

## Comprobaciones a mano

Los textos esperados están en el [contrato de la interfaz](contracts/ui-contract.md).

| # | Pasos | Resultado |
|---|---|---|
| 1 | Entrar con una contraseña incorrecta | error en el formulario |
| 2 | Entrar como `admin` | listado vacío |
| 3 | Crear una lista con dos canciones, eligiendo género | aparece en el listado; `POST /api/lists` responde `201` a través del proxy |
| 4 | Abrirla y recargar la página | mismo detalle, sin pedir acceso |
| 5 | Crear otra con el mismo nombre | mensaje de nombre repetido, sin perder lo escrito |
| 6 | Crear `data.json`, `a;b`, `100%` y `Canción #1?`; abrir, recargar y borrar cada una | todas funcionan |
| 7 | Borrar una lista, primero cancelando | solo se borra al confirmar |
| 8 | Cerrar sesión, entrar como `user` | sin opciones de crear ni borrar |
| 9 | Como `user`, escribir `/playlists/new` | vuelve al listado |
| 10 | Arrancar la API con `JWT_TTL=10s`, entrar, esperar y navegar | vuelve al acceso |
| 11 | Detener la API y abrir el listado | error con opción de reintentar |
| 12 | Cerrar la pestaña y abrir `http://localhost:4200` en otra | pide acceso |

## Resultados (2026-11-26)

Ejecutadas contra la API real y `npm start`, con secretos de un solo uso, en Chrome sin ventana manejado por un guion
temporal que no está en el repositorio. No se probó a mano ni en otros navegadores.

| Comprobación | Resultado |
|---|---|
| 1 a 9 | correctas. En la 6, además, `v1.0`, ` Rock `, `50%25`, `a+b&c=d` e `it's (x)` |
| 10 | correcta |
| 11 | correcta; el acceso con la API caída muestra el error general, no el de credenciales |
| 12 | correcta abriendo una segunda pestaña; no se probó cerrar la primera |
| Otras | `400` con el detalle de la API; detalle inexistente; borrar una lista ya borrada; recargar el formulario; `/lists` y `/genres` muestran la web; un `401` de la API cierra la sesión |
| SC-005 | con 101 listas, el listado se mostró en 81 ms tras recargar y un detalle de 20 canciones en 58 ms |

Sin errores de JavaScript en la consola. No se midió SC-001, que depende de una persona.
