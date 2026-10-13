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
| Pérdida de trabajo | git reset (todas sus formas cubiertas), git clean y eliminación del repo prohibidos por los prefijos incluidos. Restauraciones requieren revisión. |
| Datos de prueba | Directorios temporales; nunca usar la base habitual para pruebas. |
| Secretos | Sin credenciales, coordenadas, rutas personales ni lista de proyectos confiables en la configuración publicada. |

No se agregan reglas allow para intérpretes o gestores completos: autorizar node, bash, npm o git sin acotar puede autorizar acciones muy distintas. Tampoco se habilitan MCP o plugins adicionales.

## Procedimiento de activación en Windows — referencia no ejecutada

Se conserva para explicar cómo se usaría la configuración. Por decisión del usuario no se realizará activación operativa ni comprobación en sesión real, local, virtual o remota. Estos pasos no son una autorización para ejecutarlos ni una condición pendiente de esta entrega documental.
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
Se revisaron estáticamente la sintaxis TOML, las 13 reglas y sus ejemplos. Posteriormente, el usuario instaló Codex CLI 0.162.1 en Windows y ejecutó cinco consultas `codex execpolicy check` desde Git Bash. Los resultados se observaron en capturas aportadas por el usuario el 13/10/2026. Se documentan como observaciones; no se reconstruye una salida original que no fue guardada en texto.

| Argumentos evaluados por execpolicy check | Decisión observada |
|---|---|
| git push origin main | prompt |
| git reset --hard HEAD | forbidden |
| git clean -fd | forbidden |
| git push --force origin main | prompt |
| git restore README.md | prompt |

Estas consultas suministran un comando como dato al evaluador de políticas. No ejecutaron push, reset, clean ni restore. Comprueban coincidencia de esas cinco formas con el archivo indicado; no demuestran que una sesión operativa cargue automáticamente la configuración, que el sandbox esté activo ni que cubra todas las variantes de comandos.

Se abrió la pantalla inicial de autenticación de Codex. No se aporta evidencia de inicio de una sesión operativa del agente ni de ejecución de tareas sobre el proyecto. La instalación del CLI y la pantalla de autenticación no se presentan como uso del agente durante el desarrollo. No se comprobó el sandbox en ejecución ni aislamiento virtual o remoto.

Por decisión explícita del usuario, no se iniciará una sesión real ni se concederá al agente acceso operativo a su computadora para esta comprobación. El procedimiento de activación queda únicamente como referencia. Las acciones locales de instalación, Git y consulta fueron ejecutadas manualmente por el usuario, no por acceso remoto del asistente a Windows.

## Fuentes
- [Curso, semana 4, configuración y defensa](https://github.com/FIUBA-Posgrado-Inteligencia-Artificial/IISAIA/blob/main/semanas/04/slides/_section-13.html).
- [Curso, permisos](https://github.com/FIUBA-Posgrado-Inteligencia-Artificial/IISAIA/blob/main/semanas/04/source_material/10-permisos.md).
- [OpenAI, configuración local](https://developers.openai.com/codex/config-basic).
- [OpenAI, reglas y comprobación](https://developers.openai.com/codex/rules).

## Matriz revisada de protección (pasos 1 a 3)
| Elemento | Lectura | Modificación o eliminación | Publicación | Control y límite |
|---|---|---|---|---|
| Código y documentación | Necesaria | Dentro del alcance de la tarea y con diff | Sólo con autorización vigente | Sandbox y supervisión; no autorización universal para cualquier cambio. |
| Historial y ramas | Consulta normal | Revisión para restaurar/rebase/amend; reset, clean y branch -D cubiertos se rechazan | push requiere revisión en el ámbito de reglas | Prefijos exactos, no análisis de todas las variantes de Git. |
| Base de riegos y respaldos reales | Excluidos de la copia de desarrollo | No usar para pruebas ni borrar | No publicar | Separación física de la copia y AGENTS.md; el sandbox no oculta todos los archivos legibles del equipo. |
| .env.weather y coordenadas | Excluidos; usar ejemplo público | Configuración privada fuera del trabajo del agente | No publicar | .gitignore y supervisión; .gitignore no evita lectura ni git add -f. |
| Configuración .codex | Lectura para revisión | Cambios explícitos, revisar diff y reiniciar | Publicable sin secretos | Las rutas protegidas dependen del runtime y OS; su protección efectiva no fue comprobada. |
| Instalaciones y red | Sólo según tarea | Elevación puntual para instalación o consulta | No subir datos privados | Red de comandos desactivada; búsqueda web y conectores tienen controles del host. |

## Revisión de las restricciones
Se amplió el prefijo git reset a todas sus formas para no depender del orden de --hard; esto también restringe usos no destructivos, que pueden resolverse con git restore --staged tras revisar el alcance. Se añadieron revisión de rebase y amend, rechazo de eliminación forzada de ramas y revisión de rm y los intérpretes PowerShell al solicitar salida del sandbox. No se añadieron allow globales.

El prompt general de git push también coincide con git push --force y --force-with-lease cuando empiezan por ese prefijo. No se promete un rechazo técnico específico para cualquier posición de esas opciones. AGENTS.md indica no forzar publicaciones; el supervisor debe rechazar la elevación correspondiente. git -C, rutas absolutas y otras variantes ilustran por qué no basta una lista de prefijos.

No se instalan hooks, plugins ni clientes alternativos para simular una garantía de confidencialidad. Si se requiere impedir técnicamente la lectura de datos reales, habrá que usar aislamiento de archivos/identidad o un entorno sin esos datos y verificarlo por separado.

## Estado de cierre de la preparación
- Paso 1: elementos y acciones protegidas definidos en la matriz.
- Paso 2: controles contrastados con la documentación oficial; limitaciones explicitadas.
- Paso 3: configuración, 13 reglas, instrucciones y documentación preparadas y verificadas estáticamente.
- Realizado localmente por el usuario: CLI 0.162.1, aplicación de los dos commits y cinco consultas con los resultados de la tabla.
- No realizado y fuera del alcance autorizado: sesión operativa del agente, carga efectiva en sesión y verificación del sandbox en ejecución.
- Pendiente de publicación: este cierre documental y la rama, desde Git Bash con autoría del usuario.

Como ejemplos adicionales no ejecutados, se podrían consultar políticas para git push --force origin main, git reset HEAD --hard, git rebase main, git commit --amend y git branch -D trabajo. Esperado: prompt, forbidden, prompt, prompt y forbidden, respectivamente. Son argumentos de codex execpolicy check, nunca órdenes a ejecutar directamente. Verificar una variante sin coincidencia (git -C . push) permite documentar el límite sin publicar nada. La consulta del archivo de reglas verifica coincidencias; no demuestra por sí sola que la sesión haya cargado ese archivo: para eso comprobar inicio, confianza y estado del runtime.

## Relación estricta con la consigna
La sección 13.3 de las diapositivas exige configuración del runtime con permisos pensados para el proyecto, versionada y explicada en la defensa. No especifica una comprobación durante una sesión real. La entrega documenta decisiones y límites, más cinco consultas realizadas; no afirma validación operativa completa ni garantiza aceptación académica. La configuración es una incorporación posterior al desarrollo original.
