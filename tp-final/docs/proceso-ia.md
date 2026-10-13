# Proceso de desarrollo asistido por IA

## Procedencia
Se tomó como base `hr-agroriego-iot-demo-local.zip`, asociado al avance del 23 de septiembre de 2026. Se consultó el PowerPoint actualizado, el contrato publicado en tp2 y las notas/transcripciones de las clases 5 y 6. La versión intermedia ya integraba React y API Node, con datos en memoria. No se preservó un registro completo de todos los prompts originales: el guion intermedio es material privado de preparación y no forma parte del repositorio público.

## Supervisión y decisiones
El usuario definió el problema, cuatro sectores, registro manual, anonimización y ausencia de control físico. Tras una revisión, autorizó completar seis pendientes: persistencia, documentación del proceso, instrucciones del agente, coherencia y pruebas, repositorio y defensa. El agente propuso SQLite local por la escala y para evitar otra infraestructura; se implementó dentro de ese alcance autorizado. No se atribuye esta elección técnica al usuario ni se inventan aprobaciones intermedias.

## Secuencia realmente realizada
1. Especificación y plan escritos antes de modificar el comportamiento; primer commit de documentación.
2. Prueba por HTTP que crea un riego, reinicia el proceso y exige recuperar su ID. Sobre el avance falló con «El registro se perdió al reiniciar». Se conserva salida en pruebas-reinicio-antes.txt.
3. Repositorio SQLite con inicialización transaccional única, clave foránea, consultas parametrizadas y cierre. La misma prueba pasó después. También verifica que DELETE persista y que una semilla eliminada no reaparezca.
4. Validaciones y DELETE del contrato TP2. Se verificaron entradas inválidas sin cambios en la base. Se añadió origen manual/demostración a respuestas.
5. Integración UI: volumen calculado, etiquetas de origen, total del día en Buenos Aires, filtros de registros, eliminación confirmada, aviso persistente y reintento si falla la API.
6. Revisión de compilación y compatibilidad heredada del frontend estático. Se detectó que faltaba copiar worker/index.js; se corrigió y se repitieron las comprobaciones afectadas.
7. Prueba real de navegador: detectó desborde móvil de tabla; se corrigió la columna y se repitió la comprobación.
8. Revisión de archivos versionados: se acotó /data/ en .gitignore para excluir sólo la base local, sin excluir public/data. Se probó una exportación limpia de Git.
9. Documentación, presentación y preparación de entrega. Ver verificacion.md para la evidencia final, incluidas las limitaciones del entorno.

## Qué hizo la IA
Analizó requisitos, inspeccionó código, propuso diseño, escribió implementación y pruebas, ejecutó comandos y generó documentación. El entorno fue Codex con acceso al repositorio y herramientas de ejecución. No se utilizaron Superpowers ni subagentes en esta etapa. Se incluyó CLAUDE.md únicamente para reutilizar instrucciones en Claude Code si se trabaja allí más adelante.

## Correcciones relevantes
- Guardar en memoria no era persistencia: se sustituyó por SQLite.
- El dato de demostración de 12 minutos × 0,8 L/min figuraba como 9,5 L: se corrigió a 9,6 L.
- «Guardar localmente» sin API podía inducir a creer que había persistencia: se eliminó esa vía y se bloqueó la escritura sin conexión.
- El selector de período del avance no alteraba el gráfico: se dejó explícita la muestra fija y se implementó el filtro real de riegos.
- El botón de configuración mostraba éxito sin guardar parámetros: se sustituyó por una aclaración de maqueta.
- El script de demo se adaptó para invocar npm mediante cmd.exe en Windows. No se afirma prueba nativa Windows en este entorno.

## Apropiación para la defensa
Explicar por qué el registro sobrevive al reinicio, dónde está el contrato, qué devuelve cada endpoint, cuándo un dato es simulado, cómo se probó y qué quedó fuera del alcance. Poder cambiar un criterio con un plan y verificarlo, sin aceptar automáticamente la propuesta del modelo.

## Ampliación meteorológica — octubre de 2026
El usuario solicitó incorporar información externa, definió una ubicación en configuración privada y comprobó la consulta desde Git Bash. Codex implementó consulta, validación, SQLite y pruebas aisladas; luego API e interfaz. La revisión con capturas detectó formato horario de 12 horas y etiquetas ambiguas: se corrigieron a 24 horas y se separaron estimaciones externas, humedad simulada y registros manuales. Se retiró lluvia simulada del gráfico y CSV y se incorporó consulta de versiones guardadas. La ampliación se mantuvo local hasta la autorización de publicación del 12 de octubre; se conserva la autoría del usuario y se excluyen PPT, guiones, coordenadas y bases privadas.

### Reproducibilidad para evaluación
Tras publicar la integración, el usuario pidió una ubicación pública de ejemplo y consulta periódica. Se agregó un modo de demostración identificado (Buenos Aires, zona del Obelisco) y se conservó prioridad de configuración privada. Se implementó un temporizador de tres horas con cancelación al cerrar y reutilización de consulta en curso. La prueba usa un temporizador controlado; no se afirma espera real de tres horas. Se documentaron pasos y mapa de archivos en recorrido-docente.md.

## Configuración de permisos — 13/10/2026
A solicitud del usuario se incorporó configuración local de Codex con sandbox workspace-write, aprobación on-request, red de comandos desactivada y reglas para publicación y operaciones que descartan trabajo. Se documentan alcance y verificación local pendiente en permisos-codex.md. No se presenta como configuración utilizada antes de esta incorporación.
