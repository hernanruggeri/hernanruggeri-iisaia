# Pronóstico en el tablero local

Segunda etapa: panel en Resumen y API meteorológica. El servidor consulta al iniciar si se cargó la configuración privada. El botón Actualizar pronóstico consulta y guarda antes de mostrar el resultado. No hay consulta automática cada tres horas todavía; el navegador sólo relee la API local cada cinco segundos para detectar la finalización de la consulta inicial.

En Git Bash, desde tp-final:

```bash
npm run build
node.exe --env-file=.env.weather server/demo.js
```

Abrir http://127.0.0.1:4173/hr-agroriego-iot/#resumen. npm start sigue funcionando sin cargar meteorología; para esta etapa usar el comando anterior. Ctrl+C detiene el servidor. No borrar la base.

API adicional (base /api):
- GET /meteorologia: 200 con configured, updating, error, source, kind, checkedAt, stale y daily. daily es null si no hay datos. No devuelve coordenadas ni respuesta original del proveedor.
- POST /meteorologia: requiere Content-Type application/json; sin cuerpo. Consulta y guarda; 200 si tiene éxito, 502 si falla (conserva daily anterior), 503 sin configuración, 415 sin el encabezado requerido.
- Otros métodos: 405. Respuestas sin caché. Consultas simultáneas comparten la solicitud en curso.

La tabla muestra fechas locales del pronóstico, mínimas/máximas, precipitación prevista, probabilidad máxima y ET0. Fecha de consulta en Buenos Aires; aviso de antigüedad después de seis horas. Null aparece como Sin dato. Precipitación observada del indicador anterior sigue Sin dato: el pronóstico se muestra por separado. Sensores continúan simulados.

Validación realizada en Linux: cuatro pruebas meteorológicas, ocho de API/dominio, una de demo y cuatro de compatibilidad estática aprobadas; compilación exitosa. No se ejecutó navegador real en esta etapa por falta de Chromium; la inspección visual y el botón se comprobarán en Windows. La publicación se prepara por separado tras autorización del usuario.

## Coherencia del resumen
Las tarjetas ambientales toman temperatura y humedad de la serie horaria guardada, para la hora actual de Buenos Aires (sin interpolar). Precipitación prevista hoy toma el total diario de la misma descarga. Si no existe esa hora o fecha, muestran Sin dato. Consulta meteorológica muestra la descarga exitosa en 24 horas. Los valores horarios son estimaciones del modelo; suelo y dispositivos siguen simulados. La API agrega current con hora local válida, fecha, temperatura, humedad y precipitación, sin coordenadas. La prueba de selección horaria y ausencia aprobó.

## Historial coherente
El gráfico y el CSV de demostración contienen sólo humedad simulada; se retiró lluvia simulada. La sección Pronósticos meteorológicos guardados consulta GET /api/meteorologia?history=1: source, kind y versions con id, fetchedAt, checkedAt y daily, sin coordenadas. Presenta hasta 30 versiones recientes por primera descarga; todas quedan conservadas en SQLite. Fechas de consulta en Buenos Aires, fechas previstas locales. La selección no depende del sector ni del período de riegos. Recargar historial lee la base y no descarga Open-Meteo. No se incorporan observaciones meteorológicas.
