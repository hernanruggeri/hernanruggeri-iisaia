# Instrucciones del proyecto HR AgroRiego

## Contexto y alcance
Entrega académica IISAIA. Mantener React + API Node + SQLite, cuatro sectores y riego manual. Sin activación física. Identidad pública HR AgroRiego / Barrio de Chacras; no exponer ubicación precisa, establecimiento, propietarios ni estación.

## Estructura
- src/: frontend; detalles en src/AGENTS.md.
- server/: API, SQLite y servidor local; detalles en server/AGENTS.md.
- public/data/: telemetría de demostración y meteorología sin configurar.
- tests/: pruebas aisladas; docs/: especificación, plan, proceso, evidencia y presentación.
- worker/ y .openai/: compatibilidad heredada para frontend estático; no contienen API persistente y no equivalen a un despliegue final.

## Forma de trabajo
Leer especificación y contrato antes de cambiar interfaces. Para cambios funcionales, planificar, definir criterios de aceptación, comprobar el fallo que se corrige, implementar, revisar y verificar. Documentar lo ejecutado realmente; no inventar aprobaciones, pruebas, prompts históricos ni uso de herramientas. Respetar autoría de commits del usuario. Mantener secretos y bases locales fuera de Git.

## Verificación
Node 24 LTS. npm ci; npm test; npm run build; npm run test:demo; npm run test:sites. Validar en navegador y comprobar reinicio para cambios en persistencia. No usar ni borrar data/agroriego.sqlite para pruebas: usar directorio temporal.

## Decisiones
Sensores siempre etiquetados como simulados. Riegos nuevos son registros manuales; semillas son demostración. Volumen estimado = duración × caudal. Sin dato meteorológico válido, mostrar Sin dato. Sin API, no mostrar guardado exitoso ni inventar registros.

## Permisos del entorno agéntico
Configuración local en `.codex/config.toml` y `.codex/rules/agroriego.rules`. Ver [decisiones, activación y comprobaciones](docs/permisos-codex.md). Incorporada el 13/10/2026; no se atribuye a etapas anteriores.
