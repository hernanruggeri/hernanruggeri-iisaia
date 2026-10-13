---
name: revisar-cambio-agroriego
description: Revisar un cambio de HR AgroRiego contra su especificación, contrato de API, persistencia, interfaz y anonimización. Usar cuando se solicite explícitamente revisar un diff o una modificación del trabajo final. No implementar cambios, publicar ni activar entornos; permitir revisión documental con evidencia aportada por el usuario.
---

# Revisar un cambio de AgroRiego

## Entrada y límites
Obtener el cambio o diff, su objetivo y las evidencias disponibles. Si falta el diff, solicitarlo sin pedir secretos. Usar archivos públicos del repositorio o material aportado. No conceder permisos ni iniciar Codex CLI, sesiones operativas, entornos virtuales/remotos o conexiones a la computadora del usuario. Respetar las instrucciones vigentes de AGENTS.md y docs/permisos-codex.md.

Realizar una revisión; no modificar código ni publicar. No leer .env.weather, bases reales o respaldos, ni solicitar coordenadas privadas. No ejecutar comandos de la aplicación o Git como parte de esta skill. Proponer comprobaciones pertinentes para ejecución manual del usuario; evaluar las salidas sólo si éste las aporta. Distinguir estas instrucciones de los controles técnicos del runtime: la skill no crea aislamiento ni permisos.

## Procedimiento
1. Delimitar el objetivo, los archivos afectados y criterios de aceptación. Identificar si el cambio es documental o funcional; no pedir pruebas funcionales para una mera edición de texto.
2. Leer desde tp-final/ AGENTS.md, docs/especificacion.md y docs/arquitectura.md. Para cambios de contrato o datos, leer docs/openapi.yaml y server/AGENTS.md; para interfaz, src/AGENTS.md. Consultar docs/verificacion.md y docs/proceso-ia.md sólo para contrastar evidencia y antecedentes relevantes. Si se recibió una selección de archivos, indicar qué información no pudo revisarse.
3. Seguir el flujo del cambio entre interfaz, endpoint y persistencia. Comparar nombres de campos, tipos, validaciones y respuestas. Revisar SQL parametrizado, claves foráneas, inicialización única y recuperación al reiniciar cuando afecte SQLite. No inferir persistencia sólo porque la interfaz muestra éxito.
4. Revisar los criterios propios de AgroRiego: cuatro sectores; sensores simulados etiquetados; riegos manuales; volumen estimado igual a duración por caudal; fecha local de Buenos Aires; error visible y sin falso guardado cuando falla API. Para meteorología, distinguir pronóstico externo de lluvia observada, mostrar fecha y fallos de actualización, conservar último dato con aviso y no sustituir faltantes por cero o valores simulados.
5. Revisar anonimización y alcance. No exponer ubicación precisa ni identidades. Comprobar que cambios en documentación no atribuyan uso histórico de herramientas, pruebas o aprobaciones sin evidencia. Diferenciar funcionamiento local de un frontend estático sin API persistente.
6. Seleccionar comprobaciones manuales según el riesgo y leer sus salidas aportadas. Consultar los scripts actuales de package.json antes de proponer un comando. Para API/persistencia, considerar npm test; para interfaz o empaquetado, npm run build y las pruebas de demo/navegador pertinentes. Para persistencia, exigir evidencia de reinicio si se pretende afirmar conservación de datos. Indicar bases temporales y evitar datos reales. No exigir descargas, red ni una sesión agéntica para cerrar una revisión documental.
7. Presentar hallazgos concretos con archivo o pasaje, consecuencia y sugerencia. Separar fallos demostrados, riesgos por revisar y mejoras opcionales. Priorizar pérdida de datos, ruptura del contrato y exposición de información. No declarar resultados de pruebas sin una salida observada.

## Salida
Entregar:
- Objetivo y alcance efectivamente revisados.
- Tabla: hallazgo, evidencia, impacto y propuesta.
- Comprobaciones realizadas por el usuario y resultado observado; comprobaciones sugeridas pero no realizadas, por separado.
- Estado: sin hallazgos en el alcance revisado, requiere ajustes o evidencia insuficiente; explicar el motivo.
- Límites: revisión documental o evidencia de ejecución aportada, archivos no disponibles y aspectos no comprobados.

No equiparar ausencia de hallazgos con garantía de seguridad, ejecución verificada o aprobación académica. No fabricar una revisión o un modo plan histórico.
