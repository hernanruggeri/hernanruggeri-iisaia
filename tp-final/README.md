# HR AgroRiego — Trabajo final IISAIA

**Autor:** Hernán Ruggeri. Sistema web para el monitoreo experimental del suelo y el registro de riegos manuales.

El responsable consulta cuatro sectores, registra una intervención y conserva su historial. La interfaz React usa una API REST Node y una base SQLite local. Los sensores siguen simulados; la aplicación no activa bombas ni electroválvulas.

## Instalar y ejecutar (Windows, Linux o macOS)

Requisito: **Node.js 24 LTS** y npm (`node --version` debe mostrar v24 o superior). La versión final requiere este entorno; el avance podía correr con versiones anteriores. Se usa `node:sqlite`, integrado en Node, sin instalar un servidor de base de datos.

Desde la raíz del repositorio:

```bash
cd tp-final
npm ci
npm run demo
```

Abrir `http://127.0.0.1:4173/hr-agroriego-iot/`. El comando compila e inicia frontend y API en un mismo servidor local. Detener con Ctrl+C. Para iniciarlo de nuevo sin recompilar: `npm start` (después de una compilación exitosa). `npm run dev` inicia sólo Vite; para desarrollo, abrir otra terminal con `npm run dev:api`.

Si Windows no encuentra `npm`, instalar Node 24 LTS y reabrir Git Bash o PowerShell. Si el puerto 4173 está ocupado, en PowerShell: `$env:DEMO_PORT="4174"; npm run demo`; en Git Bash: `DEMO_PORT=4174 npm run demo`. Usar el puerto indicado en la consola.

## Recorrido para comprobar la entrega

1. Resumen: cuatro sectores con humedad simulada; Zapallo está debajo de su umbral demostrativo. Las tarjetas ambientales muestran estimaciones externas si se configura meteorología.
2. Riego: seleccionar Zapallo, fecha/hora de Buenos Aires, **9 minutos**, **0,8 litros por minuto**. El volumen se calcula: **7,2 litros**. Escribir una observación y guardar.
3. Verificar respuesta de éxito y fila nueva, etiquetada Manual. Recargar el navegador.
4. Detener y reiniciar el servidor. El mismo registro debe seguir disponible: ya no está en memoria.
5. Historial: seleccionar sector y período para filtrar riegos. La curva superior es una muestra fija simulada, independiente del período elegido.
6. Para corregir una carga equivocada, eliminar desde Riego: confirmar sólo si se desea borrar ese registro. Cancelar conserva el dato; confirmar lo elimina de SQLite.

## Datos y persistencia

- Archivo local: `data/agroriego.sqlite`, creado automáticamente al primer inicio. **No borrar para reiniciar:** es el historial.
- Se inicializan cuatro sectores y tres riegos etiquetados Demostración una sola vez; reiniciar no duplica ni vuelve a insertar semillas eliminadas.
- Registros nuevos: origen Manual. Duración y caudal informados; volumen estimado. No equivalen a una medición de caudalímetro.
- API: `GET /api/sectores`, `GET`/`POST /api/sectores/{sectorId}/riegos`, `DELETE /api/sectores/{sectorId}/riegos/{riegoId}`.
- Contrato final: [docs/openapi.yaml](docs/openapi.yaml); amplía el TP2 sin modificar aquella entrega.
- Open-Meteo opcional: estimaciones horarias y pronósticos diarios guardados en SQLite. Sin configuración o dato disponible: Sin dato. No equivalen a lluvia observada.
- Configuración y dispositivos: maqueta ilustrativa. No se guarda configuración de sensores.

Para respaldar: detener el servidor, copiar `data/agroriego.sqlite` a una carpeta privada y reiniciar. Para restaurar: detener, conservar una copia de la base actual y reemplazarla por el respaldo. No publicar bases con registros reales ni `.env`. `DB_PATH` en el entorno del proceso permite otra ruta. Las pruebas usan memoria o directorios temporales y nunca modifican la base habitual.

## Verificación reproducible

```bash
npm test
npm run build
npm run test:demo
npm run test:sites
npx playwright install chromium
npm run test:browser
```

`npm test` verifica API, entradas inválidas y reinicio de procesos reales. `test:demo` verifica HTML servido más recorrido HTTP; `test:browser` opera la interfaz real, recarga, filtra, elimina y simula API caída. Playwright y Chromium se necesitan sólo para esta última comprobación. La prueba de navegador original corresponde al recorrido de riegos; la ampliación meteorológica fue comprobada manualmente en Windows. El test de navegador admite `PLAYWRIGHT_CHROMIUM_EXECUTABLE` para un Chromium ya instalado. Ver [docs/verificacion.md](docs/verificacion.md) para evidencia y límites del entorno.

## Documentación de la entrega

- [Especificación](docs/especificacion.md), [plan](docs/plan.md) y [arquitectura](docs/arquitectura.md).
- [Proceso asistido por IA](docs/proceso-ia.md) y [prompts](prompts.md).
- [Verificación y revisión](docs/verificacion.md).
- Instrucciones del agente: `AGENTS.md`, con detalle por capa; `CLAUDE.md` es compatibilidad, no evidencia de uso de Claude en esta etapa.

## Alcance y límites

Versión para ejecución local, un responsable y volumen reducido. Sin autenticación, despliegue público, sensores físicos ni automatización del riego. El servidor escucha sólo en 127.0.0.1. SQLite síncrono es adecuado para esta demo; no se evaluó concurrencia de alta carga. El adaptador `worker/` y `.openai/` conserva compatibilidad heredada con frontend estático, **sin API persistente**: desplegar esos archivos solos no publica el sistema final.

## Relación con la materia

Se entrega un frontend, backend y datos persistentes, con decisiones y pruebas documentadas. El docente aclaró en clase 6 (03:03:35–03:04:54) que el flujo específico mostrado no era obligatorio: debe poder explicarse lo construido y el uso del entorno agéntico. Esta etapa usó Codex con especificación, plan, prueba previa, implementación, revisión y verificación. No se usó Superpowers ni subagentes.

Fuentes: [marco del trabajo final](https://github.com/FIUBA-Posgrado-Inteligencia-Artificial/IISAIA/blob/main/semanas/04/source_material/14-trabajo-final.md); [flujo recomendado](https://github.com/FIUBA-Posgrado-Inteligencia-Artificial/IISAIA/blob/main/semanas/05/source_material/15-bajada-al-tp-final.md); notas/transcripciones clases 5 y 6 del 23 y 30 de septiembre de 2026, aportadas al proyecto; [SQLite en Node 24](https://nodejs.org/docs/latest-v24.x/api/sqlite.html).

## Ampliación meteorológica — Open-Meteo

Después de `npm run build`, crear `.env.weather` localmente con WEATHER_PROVIDER=open-meteo, WEATHER_LATITUDE, WEATHER_LONGITUDE, WEATHER_TIMEZONE=America/Argentina/Buenos_Aires y WEATHER_FORECAST_DAYS=3. Las coordenadas se completan en privado; no usar variables VITE para ubicación. Ver [.env.example](.env.example) y [documentación meteorológica](docs/meteorologia-tablero.md).

```bash
npm run start:weather
```

Consulta al iniciar y con Actualizar pronóstico; descarga automática cada tres horas mientras el servidor esté funcionando. Resumen muestra temperatura/humedad estimadas de la hora local, precipitación prevista del día y última consulta. Historial separa la muestra simulada de humedad, las versiones meteorológicas guardadas y los riegos. Los datos externos son de modelos, no observaciones de estación ni mediciones de la huerta.

`npm run weather:update` descarga y guarda; `npm run weather:show` lee la base sin Internet. Tablas weather_downloads y weather_values en el mismo archivo SQLite. Conserva versiones distintas y evita duplicar respuestas idénticas. Historial muestra hasta 30 versiones recientes; todas permanecen guardadas. Respuestas de la API pública local no incluyen coordenadas. Sin conexión conserva el último resultado con aviso y fecha. Datos faltantes no se reemplazan por simulados ni por cero.

Base, respaldos y `.env.weather` excluidos de Git. La versión académica original puede consultarse en el commit `e9c0027`; la ampliación no cambia TP1 ni TP2.

## Demo inmediata para evaluación

Sin .env.weather, `npm run demo` y `npm start` usan una ubicación pública de ejemplo (Buenos Aires, zona del Obelisco), identificada en pantalla y ajena a la huerta. Consultan al iniciar y cada tres horas mientras el servidor está activo. Si se carga configuración privada mediante `npm run start:weather`, tiene prioridad. Ver el [recorrido completo para el docente](docs/recorrido-docente.md), incluidos comandos, comprobaciones y mapa de archivos.

## Permisos del entorno agéntico
Configuración local en `.codex/config.toml` y `.codex/rules/agroriego.rules`. Ver [decisiones, activación y comprobaciones](docs/permisos-codex.md). Incorporada el 13/10/2026; no se atribuye a etapas anteriores. Se verificaron cinco consultas de política con Codex CLI 0.162.1, ejecutadas manualmente por el usuario. No se inició una sesión operativa del agente ni se verificó el sandbox en ejecución; la activación se documenta sólo como referencia.
