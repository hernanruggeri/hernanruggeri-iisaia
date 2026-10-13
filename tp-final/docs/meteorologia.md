# Meteorología local: consulta y almacenamiento

Primera etapa posterior a la entrega: módulo y comandos locales. No modifica el tablero ni publica datos. La configuración se lee de `.env.weather`, excluido de Git. No usar variables VITE para coordenadas privadas.

Desde tp-final, con Node 24:

```bash
node.exe --env-file=.env.weather scripts/weather-local.mjs update
node.exe --env-file=.env.weather scripts/weather-local.mjs show
```

En Linux/macOS usar node en lugar de node.exe. Update consulta Open-Meteo y guarda sólo tras validar series y unidades; show recupera el último resultado sin Internet. DB_PATH permite otra ubicación, igual que en el servidor de riegos.

Tablas nuevas en data/agroriego.sqlite: weather_downloads conserva fuente, tipo pronóstico, zona horaria, configuración privada, respuesta original y fechas de primera descarga y última consulta exitosa. weather_values conserva valores diarios y horarios con unidad y momento válido. Fechas previstas son locales de la zona configurada; descargas son UTC. Un null es ausencia, nunca cero.

Se guardan precipitación prevista, probabilidad máxima diaria, temperatura mínima/máxima y ET0 diarios; temperatura y humedad relativa horarias. Todos proceden de modelos, no de estaciones ni sensores de la huerta. ET0 no equivale directamente al requerimiento del cultivo. Fuente: https://open-meteo.com/en/docs

Versiones con series distintas se conservan; una respuesta idéntica actualiza la fecha de consulta sin duplicar valores. La huella excluye el tiempo de procesamiento del proveedor. Una falla no modifica los valores anteriores. La fecha mostrada permite reconocer datos antiguos; esta primera etapa se amplió después con interfaz y consultas periódicas; ver meteorologia-tablero.md.

El módulo agrega tablas sin cambiar las tablas de riego ni user_version, por lo que la entrega anterior puede seguir abriendo la base. Antes de usarlo sobre una base real, detener el servidor y copiar el archivo a un respaldo privado. No publicar la base, respuestas meteorológicas con coordenadas ni .env.weather.

Pruebas aisladas: configuración inválida, unidades/valores inválidos, reinicio, deduplicación, versiones nuevas, ausencia de conexión y convivencia con riegos. La consulta real fue comprobada por el usuario en Windows antes de esta implementación; las pruebas del módulo usan respuestas controladas y no prueban disponibilidad de Open-Meteo.
