# Recorrido de evaluación reproducible

Autor: Hernán Ruggeri. Node.js 24 o superior y npm. La aplicación funciona localmente; no activa dispositivos físicos.

## 1. Descargar e iniciar sin configuración privada

Desde Git Bash:

```bash
git clone https://github.com/hernanruggeri/hernanruggeri-iisaia.git
cd hernanruggeri-iisaia/tp-final
npm ci
npm run demo
```

Abrir http://127.0.0.1:4173/hr-agroriego-iot/#resumen. Mantener la terminal abierta. La demo consulta Open-Meteo para un punto público aproximado de Buenos Aires, zona del Obelisco (-34.6037, -58.3816); no representa la huerta. Referencia del punto: https://www.wikidata.org/wiki/Q831389. La etiqueta pública de demostración aparece en el panel, las tarjetas y el historial. Internet es necesario para descargar meteorología; una falla conserva datos anteriores o muestra Sin dato, sin impedir riegos.

Después de una compilación exitosa, `npm start` inicia sin recompilar. Ctrl+C detiene el servidor. No borrar data/agroriego.sqlite.

## 2. Comprobar el recorrido

1. Resumen: identificar humedad del suelo simulada y meteorología externa de demostración. Comprobar fuente, hora y etiqueta de ubicación pública.
2. Actualizar pronóstico: esperar a que vuelva a habilitarse el botón; comprobar hora de consulta.
3. Riego: seleccionar Zapallo, 9 minutos y 0,8 litros/minuto; comprobar 7,2 litros y guardar una observación.
4. Reiniciar con Ctrl+C y npm start; comprobar que el riego permanece.
5. Historial: humedad simulada sin lluvia ficticia; versiones de pronósticos externas y registros manuales separados.
6. Seleccionar versión guardada; distinguir fecha prevista, primera descarga y última consulta idéntica. Recargar historial sólo lee SQLite.

## 3. Actualización periódica

El servidor consulta al iniciar y cada tres horas, incluso sin el navegador abierto. El botón permite consulta inmediata. Las solicitudes simultáneas comparten la consulta en curso. El temporizador se cancela al detener el servidor. Computadora apagada, suspendida o servidor detenido no ejecutan descargas; al reiniciar se consulta otra vez. No es un servicio remoto ni una tarea de GitHub Actions. Una falla conserva el último dato y vuelve a intentar en el siguiente ciclo o con el botón.

## 4. Personalizar sin publicar coordenadas

Crear .env.weather privado con las cinco variables de .env.example. Ejecutar `npm run start:weather`; la configuración privada tiene prioridad y la interfaz no muestra su ubicación precisa. Una configuración privada inválida muestra error y no cambia silenciosamente a Buenos Aires. La demo común no lee automáticamente archivos privados.

Los datos de distintas configuraciones se guardan separados dentro de SQLite; cada vista consulta únicamente la configuración vigente. Ni .env.weather, ni SQLite, ni respaldos deben publicarse.

## 5. Archivos que explican el trabajo

| Aspecto | Archivos |
|---|---|
| Instalación y alcance | ../README.md y README.md |
| Diseño | docs/especificacion.md, docs/arquitectura.md, docs/openapi.yaml |
| Consulta y SQLite | server/weather.js, server/database.js |
| API y programación periódica | server/weather-api.js |
| Inicio de demo | server/demo.js, scripts/demo.mjs |
| Interfaz | src/App.jsx, src/WeatherPanel.jsx, src/WeatherHistory.jsx |
| Proceso asistido por IA | prompts.md, docs/proceso-ia.md |
| Evidencia | docs/verificacion.md y tests/ |

## 6. Verificar automáticamente

Detener primero la demo si se usa la misma terminal:

```bash
npm test
npm run build
npm run test:demo
npm run test:sites
```

Las pruebas meteorológicas usan respuestas controladas y bases temporales. Comprueban configuración, persistencia, ausencia de datos, privacidad, versiones y selección horaria. La prueba del temporizador dispara un callback controlado y comprueba el intervalo de 10.800.000 ms, la consulta inicial, la repetición y la cancelación; no espera tres horas ni consulta Internet. Las pruebas no modifican la base habitual. La disponibilidad del proveedor se comprueba manualmente con la demo.
