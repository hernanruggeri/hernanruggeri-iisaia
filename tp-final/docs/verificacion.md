# Verificación de la versión final — 6 de octubre de 2026

## Entorno
Linux, Node v24.19.0. Instalación npm con package-lock; base de pruebas temporal. No se ejecutó Windows nativo en este entorno. La versión intermedia había sido probada por el usuario en Windows; esa comprobación no se presenta como validación de la nueva versión.

## Resultados

| Comprobación | Evidencia | Resultado |
|---|---|---|
| API y dominio | pruebas-api.txt | 8 pruebas aprobadas: consultas, creación, contrato, reinicio, entradas inválidas, volumen y fechas |
| Persistencia real | persistence.test.mjs | Tres procesos consecutivos sobre el mismo archivo temporal; conserva ID, valores y eliminaciones; no reinserta semilla borrada |
| Instalación limpia | prueba-instalacion-limpia.txt | Exportación de los archivos de Git, npm ci, pruebas, build y navegador |
| Compilación | compilacion.txt | Build final exitoso; advertencia de tamaño del bundle, sin impedir ejecución |
| Servidor integral | pruebas-integracion.txt | 1 prueba aprobada: HTML + GET + POST + consulta |
| Compatibilidad estática heredada | pruebas-estatico.txt | 4 pruebas aprobadas; no prueba una API remota |
| Navegador real | pruebas-navegador.txt | Registro, cálculo, recarga, filtros, cancelación/eliminación, API caída/reintento y vista móvil |

La prueba de reinicio primero falló sobre el avance por pérdida del registro: ver pruebas-reinicio-antes.txt. El resultado final está incluido en pruebas-api.txt. No se afirma que todas las pruebas se escribieron antes de la implementación: la prueba previa se aplicó al problema central de persistencia.

## Navegador
Playwright sobre Chromium 153 headless, 1440×1000 y 390×844. La descarga estándar de Chromium falló en este entorno; se utilizó un ejecutable Chromium proporcionado por un paquete temporal, mediante PLAYWRIGHT_CHROMIUM_EXECUTABLE. Ese paquete no forma parte de la entrega. El usuario puede usar la instalación normal documentada en el README.

La prueba detectó un desborde móvil de la tabla heredada. Se corrigió el mínimo de ancho de la columna para que el desplazamiento sea interno a la tabla. Las capturas de docs/capturas corresponden a datos de prueba, no a registros de una instalación real. La espera de recarga del script también se corrigió para contemplar el estado Cargando.

## Revisión técnica
- Consultas parametrizadas y FK; inicialización única transaccional.
- Escritura antes del 201; eliminación sólo dentro del sector pedido; cierre de conexión.
- Fecha con zona horaria y validación del día; normalización UTC; vista Buenos Aires.
- Campos extra, volumen incoherente y cuerpo inválido se rechazan sin escribir. Métodos no permitidos: 405; cuerpos grandes: 413.
- Eliminación confirmada; estado sin API no conserva una falsa fila local ni anuncia un guardado.
- Los sensores y curvas siguen simulados; límites y origen visibles.
- Artefactos estáticos heredados preservados; no se confunden con servidor persistente.
- Base local, .env y node_modules excluidos de Git y del paquete de entrega.

## Comprobación final en la computadora de presentación
Desde tp-final: node --version, npm ci y npm run demo. Crear «Demo final» con 9 min y 0,8 L/min; verificar 7,2 L; detener, reiniciar y recuperar la fila. Esto confirma instalación, firewall, puertos y entorno Windows específicos. No es una función pendiente de implementación.

## Límites de la evidencia
No se evaluaron sensores físicos, despliegue público, carga multiusuario ni calidad de una fuente meteorológica real. Las pruebas no convierten los umbrales demostrativos en criterios agronómicos validados. Preparación de archivos y publicación remota son pasos distintos; consultar el estado final informado al usuario antes de enviar el enlace al docente.

## Revisión previa a publicación — 11 de octubre de 2026

Se repitieron `npm ci`, `npm test` (8 pruebas), `npm run build`, `npm run test:demo` (1 prueba) y `npm run test:sites` (4 pruebas): todos aprobados. La descarga estándar de Chromium falló; no se repitió la prueba de navegador en esta revisión. Se conserva la evidencia previa del 6 de octubre. Se verificaron los 50 archivos seleccionados para publicación, excluyendo presentaciones, guiones, historial empaquetado, bases locales y dependencias.

## Comprobación nativa en Windows — 11 de octubre de 2026

El usuario verificó la entrega publicada en su computadora con Windows y Git Bash, Node v24.19.0 y npm 11.17.0. Ejecutó `npm ci && npm test && npm run demo`; las capturas aportadas muestran compilación y servidor integral disponibles. En el navegador registró un riego manual del Sector 02 (Zapallo), con 9 minutos, 0,8 litros por minuto y observación «Demo final windows»; el volumen calculado fue 7,20 litros. Tras detener el servidor y reiniciarlo con `npm start`, recuperó el registro en la interfaz. Esta evidencia confirma la persistencia de ese registro en la instalación Windows de presentación; complementa las pruebas automatizadas descritas arriba, sin sustituirlas.

La publicación final quedó en el commit `22d7cecfd59ac1d72190f2e3a489c811a000e702`, con 50 archivos dentro de `tp-final/` y autoría de Hernán Ruggeri. No se publicaron PowerPoint, guiones, base local ni configuración privada. Las ampliaciones meteorológicas posteriores y los ajustes del tablero permanecen fuera de la entrega publicada. Esta sección documenta comprobaciones realizadas después de preparar el paquete final.

## Ampliación meteorológica — comprobación manual del 11 de octubre

El usuario consultó Open-Meteo desde Windows, descargó y guardó un pronóstico, y lo recuperó con `show` en un proceso nuevo sin consultar Internet. Las capturas confirmaron el panel de Resumen, el botón Actualizar pronóstico, el formato de 24 horas, las tarjetas ambientales externas y el Historial de versiones guardadas. El riego «Demo final windows» seguía disponible después de las ampliaciones. La gráfica y el CSV de muestra se limitaron a humedad simulada. Las coordenadas y respuestas originales permanecen privadas; no se incluyen capturas identificatorias nuevas en Git.

La revisión para publicación del 12 de octubre ejecutó npm ci, npm test (13 pruebas), npm run build, npm run test:demo (1 prueba) y npm run test:sites (4 pruebas): todos aprobados. No se afirma una nueva ejecución automatizada de Chromium ni una comprobación móvil de esta ampliación. La descarga automática periódica y las observaciones meteorológicas siguen fuera del alcance.
