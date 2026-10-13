# Configuración de permisos de Codex

## Propósito y procedencia
Incorporada el 13 de octubre de 2026, después del desarrollo inicial. No se presenta como configuración usada en etapas anteriores. Resuelve el punto de configuración del runtime con permisos pensados para el proyecto; no acredita por sí sola la skill propia, modo plan, ramas o defensa.

Se sigue la sección 13.3 de la semana 4 y la sección de permisos del curso: decidir según el costo del error, versionar la configuración y explicar sus límites. AGENTS.md contiene instrucciones para el modelo; config.toml y las reglas son mecanismos del runtime.

## Decisiones
| Control | Decisión y motivo |
|---|---|
| sandbox_mode | workspace-write: editar y comprobar dentro del proyecto sin acceso de escritura general al equipo. |
| approval_policy | on-request: pedir elevación cuando sea necesaria; no activar acceso completo ni aprobaciones automáticas universales. |
| Red de comandos | Desactivada por defecto: instalaciones y Open-Meteo se autorizan puntualmente. No controla las herramientas de búsqueda web del host. |
| Publicación | git push y gh pr merge con prompt al evaluar ejecución fuera del sandbox; revisar cambios y pruebas. |
| Pérdida de trabajo | reset --hard, git clean y eliminación del repo prohibidos por los prefijos incluidos. Restauraciones requieren revisión. |
| Datos de prueba | Directorios temporales; nunca usar la base habitual para pruebas. |
| Secretos | Sin credenciales, coordenadas, rutas personales ni lista de proyectos confiables en la configuración publicada. |

No se agregan reglas allow para intérpretes o gestores completos: autorizar node, bash, npm o git sin acotar puede autorizar acciones muy distintas. Tampoco se habilitan MCP o plugins adicionales.

## Activación en Windows
1. Actualizar la copia local con Git y abrir Git Bash en tp-final/.
2. Ejecutar `codex --version` y registrar la versión. La aplicación AgroRiego no requiere Codex para funcionar.
3. Revisar .codex/config.toml y .codex/rules/agroriego.rules antes de marcar el proyecto como confiable. Esa decisión se guarda localmente, no se publica.
4. Abrir `codex` desde tp-final/. Reiniciar la sesión si ya estaba abierta. La configuración está en esta carpeta para limitar su alcance al trabajo final.
5. Consultar `/status`: comprobar workspace-write y on-request. Si difiere, revisar flags, configuración personal y políticas administradas. No reducir una restricción administrada para hacer coincidir el ejemplo.
6. En Windows comprobar también que el sandbox de Codex está instalado y activo; Git Bash por sí solo no lo proporciona. Usar el mecanismo soportado por la versión instalada o WSL. No sustituirlo por acceso completo.

## Comprobaciones seguras
Desde tp-final/, las siguientes órdenes sólo consultan la política; no publican, borran ni restauran:

```bash
codex execpolicy check --pretty --rules .codex/rules/agroriego.rules -- git push origin main
codex execpolicy check --pretty --rules .codex/rules/agroriego.rules -- git reset --hard HEAD
codex execpolicy check --pretty --rules .codex/rules/agroriego.rules -- git clean -fd
codex execpolicy check --pretty --rules .codex/rules/agroriego.rules -- git restore README.md
codex execpolicy check --pretty --rules .codex/rules/agroriego.rules -- gh repo delete hernanruggeri/hernanruggeri-iisaia
```

Esperado, respectivamente: prompt, forbidden, forbidden, prompt, forbidden. Guardar versión, salida y fecha como evidencia sólo después de ejecutar las comprobaciones. Nunca ejecutar las órdenes destructivas directamente para probarlas.

## Alcance real
Las reglas comparan prefijos exactos de comandos; no intenciones. Opciones anteriores al subcomando (por ejemplo git -C ... push), rutas de ejecutables, scripts o clientes alternativos pueden no coincidir. Se mantienen bajo el sandbox y la revisión del supervisor; estas reglas no son una garantía universal de bloqueo.

Según la documentación de Codex, las reglas controlan ejecución fuera del sandbox. No se afirma que cada comando dentro de éste muestre un prompt. workspace-write tampoco protege todos los archivos de la carpeta contra lectura o escritura, y .gitignore sólo evita publicación accidental: no es control de acceso. Mantener datos y respaldos reales fuera del entorno de trabajo del agente; usar una copia sin .env.weather ni la base real para desarrollo. No copiar configuración personal completa al repo.

Los archivos de proyecto sólo se cargan cuando el proyecto es confiable. Flags y políticas de mayor prioridad pueden cambiar el comportamiento. Esta configuración de CLI/IDE local no modifica los permisos de este chat ni de un contenedor Work Cloud.

## Validación realizada
Se revisó la sintaxis TOML, estructura de reglas y ejemplos de coincidencia sin ejecutar operaciones destructivas. No se ejecutó Codex CLI ni se comprobó el sandbox nativo Windows en el entorno de preparación; los pasos anteriores quedan como verificación local pendiente. No se atribuye uso retrospectivo de esta configuración.

## Fuentes
- [Curso, semana 4, configuración y defensa](https://github.com/FIUBA-Posgrado-Inteligencia-Artificial/IISAIA/blob/main/semanas/04/slides/_section-13.html).
- [Curso, permisos](https://github.com/FIUBA-Posgrado-Inteligencia-Artificial/IISAIA/blob/main/semanas/04/source_material/10-permisos.md).
- [OpenAI, configuración local](https://developers.openai.com/codex/config-basic).
- [OpenAI, reglas y comprobación](https://developers.openai.com/codex/rules).
