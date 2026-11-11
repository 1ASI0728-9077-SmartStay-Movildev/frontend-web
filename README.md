# SmartStay · frontend

Integración inicial sobre el proyecto existente: Vue 3, JavaScript, Vite, Vue Router con historial HTML5, Axios, Pinia, PrimeVue y vue-i18n. Se conservan las capas por dominio y el cliente HTTP compartido; se añadió únicamente Three.js para los visores 3D/360°, cargado bajo demanda.

## Instalación y ejecución

Requiere una versión de Node compatible con Vite 8 (Node 22.12+ o 20.19+; comprobado con Node 24.22.1).

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

En PowerShell, si la política bloquea `npm.ps1`, usar `npm.cmd` en los mismos comandos. No es necesario cambiar la política del sistema. Los scripts existentes son dev/build/preview; se añadió test con el ejecutor nativo de Node, sin librerías adicionales. No existe script de lint.

El gestor del proyecto es npm. Se actualizó package-lock.json al instalar Three.js; no se migró el gestor de paquetes.

## Gateway y variables públicas

Se conserva el nombre existente `VITE_MOVILDEV_API_URL` para no duplicar variables equivalentes:

- `.env.development`: origen del túnel temporal actual.
- `.env.production`: mismo túnel, exclusivamente para la demo.

El valor contiene **solo el origen**, sin /health, /api/v1, rutas, credenciales o parámetros. El cliente lo valida, añade /api/v1 una vez y no cambia a localhost si el túnel falla. Para trabajar localmente puede usarse `.env.development.local` con el origen local; Vite da prioridad al archivo local del modo.

Cuando reinicie Cloudflare Tunnel, reemplazar el origen en los archivos de los modos utilizados. Cuando exista un gateway permanente, reemplazarlo en `.env.production` o en la variable del entorno de build del alojamiento. Las variables VITE_* son públicas y quedan incrustadas en el JavaScript: nunca introducir claves, credenciales de MySQL/ActiveMQ, tokens de GitHub ni secretos del backend.

Cambiar una variable requiere **reiniciar el servidor de desarrollo** o **reconstruir y volver a desplegar** el frontend estático. Cambiar variables del servidor después de generar dist no modifica los archivos ya construidos.

El frontend accede únicamente al gateway. No usa /internal/, MySQL, ActiveMQ ni proveedores de IA directamente. El Swagger público corresponde a IAM; los contratos se revisaron en el backend local, en modo de lectura y sin leer archivos de secretos.

## Funcionalidad

- Login con username (no email), validación, mostrar/ocultar contraseña y cierre local.
- Sesión persistida en localStorage bajo smartstay.session, siguiendo el almacenamiento anterior del proyecto. Incluye identidad, rol, alcance y JWT; no guarda contraseñas. Comprueba exp al restaurar, navegar, solicitar, recuperar foco y mediante temporizador. No hay refresh, logout remoto ni /auth/me.
- Token Bearer en solicitudes privadas; catálogo y Concierge públicos salen sin token. Timeout de 30 segundos y ninguna repetición automática.
- Menú y guards comunes: guest/admin/chain_admin para reservas, pagos y perfil; admin/chain_admin para consultas administrativas. Los demás roles solo ven inicio, catálogo, Explorar en 3D y Asistente IA.
- El cliente no interpreta un hotelId nulo como acceso global de admin. Filtra las listas de hoteles/habitaciones/reservas para ese rol y deshabilita acciones fuera del hotel asignado; la autorización efectiva y los alcances de cadena dependen del servidor.
- Catálogo con filtros, reservas con fechas UTC y estancia de 1–30 noches, detalle, cancelación y confirmación administrativa.
- Pagos simulados con importe de la reserva e Idempotency-Key por intento. Ante red, timeout o 5xx inciertos, comprobar primero el pago y reintentar manualmente con el mismo cuerpo y clave. Estos se mantienen solo en memoria; salir de la pantalla o recargar pierde el intento. Antes de crear otro intento, consultar el estado.
- Solo tarjeta de prueba: el contrato valida CreditCard/Luhn y campos obligatorios. La interfaz usa paymentMethod CreditCard y permite vencimiento/CVV sin patrones adicionales. Usar datos de prueba rellena un ejemplo válido; los espacios y guiones del número se normalizan antes de enviar. No usar tarjetas reales. No se almacenan número ni CVV.
- El pago y la reserva muestran sus estados reales por separado. La confirmación puede ser asíncrona: usar Actualizar.
- Mi perfil usa el ID del usuario; la creación envía ese mismo ID en userId porque el controller no lo asigna automáticamente. El ID del perfil es independiente. No hay edición ni eliminación.
- Consultas de usuarios, perfiles, alojamientos y métricas. OccupancyRate ya está expresado de 0 a 100; no se multiplica otra vez. El contrato de ingresos agregados no incluye moneda, por lo que se muestra su valor sin inventar una.
- Concierge muestra las ofertas, assistantMessage y fallbackUsed recibidos; no traduce textos del backend.
- Español predeterminado, ES/EN persistido en smartstay.locale, formularios y mensajes traducidos e Intl para fechas e importes.

Los archivos antiguos de monitoreo y registro se conservaron para revisión, pero sus rutas, llamadas y navegación están desconectadas. No hay datos simulados en las pantallas del producto.

## Build y alojamiento

`npm run build` genera **dist/**. Publicar ese directorio con un alojamiento estático, configurar `VITE_MOVILDEV_API_URL` antes del build y usar HTTPS para un gateway público HTTPS.

Vue Router usa createWebHistory: configurar el servidor para devolver **index.html** en rutas de navegación inexistentes, conservando la entrega normal de archivos estáticos. Por ejemplo, en Nginx del alojamiento del frontend: `try_files $uri $uri/ /index.html;`. No requiere cambiar el gateway ni el repositorio backend.

Durante esta demo deben seguir activos la PC que ejecuta el backend, Docker con sus servicios y el túnel Cloudflare. Un túnel caído mostrará indisponibilidad; no hay fallback a otro backend.

## Validación realizada

- npm.cmd test: 13 pruebas de sesión/JWT, fechas y límites, permisos, formatos de errores, URL/Bearer/JSON/idempotencia, 401 frente a 403 y ausencia de reintentos automáticos.
- npm.cmd run build: compilación correcta. Se mantiene la advertencia de bundle principal mayor a 500 kB, asociada al registro global existente de PrimeVue; las pantallas de negocio se cargan bajo demanda.
- Gateway real: /health y /api/v1/rooms/search devolvieron 200; login con credenciales intencionalmente inválidas devolvió 401.
- Chrome desde http://127.0.0.1:5173: catálogo real, ES/EN, CORS con JSON y una consulta GET de pago de solo lectura con Authorization e Idempotency-Key (401 esperado). El preflight HTTP de POST /api/v1/payments también devolvió 204 permitiendo ambos headers. En Chrome, el POST con cuerpo vacío y autenticación inválida pasó CORS y fue rechazado sin transacción.
- Chrome con respuestas HTTP simuladas exclusivamente durante pruebas: login correcto, sesión y EN al recargar, menú y acceso directo por rol, creación de reserva, perfil vinculado, pago con fallo de red y reintento con el mismo cuerpo/clave, estados de pago/reserva, consultas administrativas, 401, 403, 409, red desconectada, cierre y vencimiento JWT. No se crearon reservas ni pagos en el backend real. Se verificó también el menú móvil a 375 px y los estados 429/fallback/vacío de Concierge con respuestas simuladas.

## Validación manual pendiente con cuentas de prueba

No se proporcionaron credenciales reales. Introducir username y password manualmente en login, nunca en .env ni en el código.

1. Iniciar sesión con cuentas de prueba guest, admin y chain_admin. Recargar, comprobar el alcance del menú, abrir rutas directamente y cerrar sesión. Dejar vencer un JWT real para verificar su expiración.
2. Buscar una habitación reservable; elegir fechas de 1–30 noches y crear **una reserva de prueba**. Comprobar el total y el estado del servidor.
3. Abrir Pagos desde la reserva. Introducir únicamente una tarjeta de prueba válida (por ejemplo el número de prueba Luhn 4111111111111111), titular de prueba, vencimiento MM/YY y CVV de prueba. Enviar una vez y actualizar el estado. No se configura una pasarela externa.
4. Para simular un resultado incierto usar DevTools de red sobre datos de prueba. No crear otro intento a ciegas: consultar el pago y, si no existe, usar el reintento explícito de la misma página.
5. Verificar permisos y alcances reales de hotel/cadena con dichas cuentas, respuestas 403/409 de negocio, creación de perfil y recomendaciones reales de Concierge.
6. Comprobar CORS nuevamente desde el origen definitivo del frontend, especialmente POST de pagos y sus headers. Si falla, registrar origen, endpoint, status y headers del preflight y de la respuesta. No usar no-cors ni desactivar la seguridad del navegador.

Los casos autenticados contra el backend real y sus efectos asíncronos quedan pendientes hasta disponer de cuentas y registros de prueba. No se modificó el backend ni se desplegaron recursos.

## Archivos y organización de los cambios

| Área | Cambios |
| --- | --- |
| Configuración | .env.example, .env.development, .env.production, package.json (test), .gitignore (dist), index.html y README.md |
| Arranque y navegación | src/main.js, src/app.vue y src/router.js; se corrigió la importación de app.vue para sistemas con nombres sensibles a mayúsculas |
| Compartido | src/shared/domain (sesión, fechas, permisos), application (solicitudes y formato), infrastructure (Axios y errores), presentation (layout, tarjetas, estados, inicio, 403/404), src/style.css |
| IAM e idiomas | src/iam (store, comando, entidad, recurso, ensamblador, API, guard, login, consulta de usuarios), src/i18n.js y src/locales/es.json/en.json |
| Negocio | src/accommodations, bookings, payments, profiles, analytics y concierge, con servicios HTTP y vistas por función; payments/domain contiene el intento de pago en memoria |
| Pruebas | tests/integration.test.js con Node; las respuestas de prueba del navegador fueron temporales y no forman parte de los datos del producto |

## Demostración de tecnologías emergentes: IA y 3D

### Explorar en 3D

Disponible en el menú público, el inicio y las tarjetas del catálogo y del chat:

- `/explore`: habitaciones reales del catálogo con escena o recorrido disponible.
- `/explore/:roomId`: habitación seleccionada, con pestañas Habitación 3D y Recorrido 360°.
- `GET /api/v1/rooms/{roomId}/vr`: escena basada en dimensiones, paredes, huecos de puertas y ventanas, camas y distribución reales. Los acabados y detalles visuales son esquemáticos.
- `GET /api/v1/rooms/{roomId}/tour`: manifiesto de panorámicas. Las rutas relativas se resuelven contra el gateway configurado, sin reescribirlas ni inventar imágenes.

Three.js es la única dependencia nueva. Se carga al abrir un visor, no al entrar al catálogo o al chat. Ratón: arrastrar para girar, rueda para acercar y botón derecho para desplazar. Pantalla táctil: un dedo para girar y dos para acercar/desplazar. Hay control de paredes y restablecimiento de cámara. La vista 360° incluye selector de ubicación, enlaces entre nodos y botones de zoom.

No hay editor ni guardado de diseños y no se requiere un visor físico de realidad virtual. WebGL debe estar disponible. Al cambiar de pestaña, habitación o ruta se liberan controles, observadores, geometrías, materiales, texturas y el contexto gráfico.

**Incidencia observada en el backend:** el manifiesto real de la habitación 102 contiene rutas como `/tours/room-102/manifest.json/entry.jpg`, que devolvieron 404 en Chrome. La pestaña 360° informa la ruta fallida y permite reintentar; la escena 3D sigue funcionando por separado. No se modificó el backend ni se sustituyeron esas rutas silenciosamente.

### Asistente IA

Concierge ahora presenta una conversación con burbujas, indicador de búsqueda, ofertas por respuesta, recuperación de mensajes fallidos y Nueva conversación. Las preferencias de estancia se mantienen visibles y cada respuesta conserva las fechas con las que fue consultada.

El endpoint sigue siendo `POST /api/v1/concierge/messages`. No acepta historial, por lo que cada mensaje se envía de forma independiente con fechas, huéspedes, distrito, presupuesto y USD. El historial es visual y temporal: desaparece al salir de la pantalla. Las recomendaciones del backend se muestran tal como llegan.

Se distingue la recomendación asistida por IA de `fallbackUsed: true`, que se etiqueta como respuesta alternativa del catálogo. **En la prueba real de esta entrega se recibió una oferta con fallbackUsed=true**; se confirmó la integración del servicio, pero no una generación efectiva del modelo de IA. No se leen ni solicitan claves para intentar corregirlo desde el frontend.

### Pago de prueba más flexible

El formulario admite espacios y guiones en el número y los elimina antes de enviar. Solo exige campos completos: no bloquea por Luhn ni impone un patrón o longitud adicional de vencimiento/CVV. El backend conserva su validación CreditCard y puede rechazar números arbitrarios con 400.

Usar datos de prueba rellena un número válido, titular de ejemplo, vencimiento futuro y CVV de prueba. **No envía el pago**. El importe del servidor, la idempotencia y el almacenamiento exclusivo en memoria permanecen iguales.

### Comprobaciones de esta ampliación

- 13 pruebas automatizadas: se añadieron normalización de tarjeta, geometría con huecos, URL de panorámicas y mensajes/preferencias independientes.
- Build correcto; Three.js queda en un chunk diferido de unos 563 kB sin comprimir. El bundle principal de PrimeVue continúa siendo grande.
- Chrome con backend real: escena 102 (4 × 5 m, 20 m²), rotación, zoom, restablecimiento, paredes, error 404 de panorámica, liberación del canvas al cambiar de pestaña y respuesta real de Concierge con fallback.
- Chrome con respuestas controladas: historial de dos consultas, bloqueo de envíos simultáneos, recuperación tras 429, ES/EN, tarjeta flexible enviada sin bloqueo local, validación 400 mostrada y botón de prueba sin envío automático.
- WebGL deshabilitado: mensaje visible y ausencia de canvas vacío. Pantalla de 375 px: visor y chat sin desbordamiento; controles táctiles configurados.
- Catálogo en una página nueva: comprobado que no descarga Three.js. No se crearon pagos ni reservas reales.

Archivos de esta ampliación: `src/accommodations/domain/room-scene.js`, componentes y gráficos del visor, vista `explore.vue` y API de alojamientos; `src/concierge/domain/chat-message.js` y su vista; dominio y vista de pagos; router, navegación, tarjetas, inicio, locales, estilos, pruebas, package.json y package-lock.json. Se respetó la URL actual del usuario en .env.development.
