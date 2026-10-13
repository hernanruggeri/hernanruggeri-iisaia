# Skill propia de AgroRiego

## Relación con la consigna
Se incorpora revisar-cambio-agroriego como respuesta al requisito «Al menos una skill propia» de la sección 13.3 del trabajo final. El procedimiento está adaptado a la especificación, API, SQLite, interfaz y anonimización de AgroRiego; se incorpora al repositorio para su revisión y explicación en la defensa. La valoración académica corresponde al docente.

La consigna consultada no exige expresamente ejecutar la skill ni aportar una prueba de ejecución. Se realizó revisión de estructura y contenido; no se activó ni ejecutó mediante un agente. Esta creación posterior, del 13/10/2026, no se presenta como herramienta utilizada durante el desarrollo previo ni como evidencia de modo plan.

## Archivos y alcance
- .agents/skills/revisar-cambio-agroriego/SKILL.md: nombre, descripción, entradas, límites, procedimiento y salida.
- .agents/skills/revisar-cambio-agroriego/agents/openai.yaml: metadatos y allow_implicit_invocation=false.

Las rutas anteriores son relativas a tp-final/. La ubicación .agents/skills corresponde al descubrimiento de skills de repositorio de Codex, distinto de .codex/config.toml para configuración del runtime. No se instala en carpetas personales ni en el catálogo de skills de esta cuenta.

La skill revisa material público o aportado y propone comprobaciones manuales; no ejecuta comandos, modifica código, publica ni abre sesiones. Son instrucciones de procedimiento, no una frontera técnica de seguridad. La opción de invocación implícita queda desactivada; esto no garantiza impedir toda activación explícita si alguien utiliza posteriormente un host compatible.

## Ejemplos de aplicación documental (no ejecutados)
| Cambio aportado | Aspectos que el procedimiento indica revisar |
|---|---|
| Nuevo campo en un registro de riego | Correspondencia entre interfaz, OpenAPI, validación y persistencia. |
| Etiqueta de precipitación | Diferencia entre pronóstico y observación, fecha y ausencia de datos. |
| Edición de un README | Claridad y correspondencia con lo realizado, sin pedir pruebas funcionales innecesarias. |

## Revisión realizada
Se comprobó el frontmatter YAML con name y description, correspondencia entre nombre y carpeta, metadatos, invocación implícita desactivada y existencia de los archivos del proyecto citados. Se revisó que las instrucciones sean específicas, proporcionen una salida evaluable y respeten el alcance documental. No se realizó una prueba de selección automática o ejecución por un agente, ni se reinstaló Codex CLI.

## Fuentes
- [Consigna, sección 13.3](https://github.com/FIUBA-Posgrado-Inteligencia-Artificial/IISAIA/blob/main/semanas/04/slides/_section-13.html).
- [OpenAI, estructura y ubicación de skills](https://developers.openai.com/codex/skills).
