Prompts de construcción — TP1

Autor: Hernán Ruggeri







Este archivo reúne las especificaciones técnicas utilizadas para construir e iterar la aplicación. Cada prompt describe la estructura, el estilo, el estado, el comportamiento y las restricciones relevantes del artefacto. No se incluyen intercambios de coordinación, autorización, publicación o uso de GitHub.



1 — Selector aritmético de volumen

Construí una aplicación web en un único archivo HTML para registrar un riego

manual en una huerta.



Estructura:

\- Un <main> centrado que contenga el título “Registro de riego”, una breve

&#x20; explicación y una sección para seleccionar el volumen.

\- La sección de volumen debe mostrar el valor actual y dos botones:

&#x20; “Agregar 3 litros” y “Quitar 2 litros”.

\- Debajo, incluir un botón “Registrar riego” y un área para mostrar mensajes.



Estilo:

\- Fondo claro, panel blanco, bordes suaves y una paleta verde asociada a una

&#x20; huerta.

\- El volumen debe ser el elemento visual de mayor jerarquía.

\- Los dos botones de volumen deben presentarse juntos y adaptarse a pantallas

&#x20; angostas.



Comportamiento:

\- Estado: volume, inicialmente igual a 0.

\- “Agregar 3 litros” suma 3 al estado volume.

\- “Quitar 2 litros” resta 2 solamente cuando el resultado no sea negativo.

\- El botón para quitar debe quedar deshabilitado cuando el volumen sea menor a 2.

\- El botón “Registrar riego” debe quedar deshabilitado con volumen 0 y mostrar

&#x20; una confirmación al registrar un valor válido.



Constraints:

\- Un solo archivo HTML.

\- CSS dentro de <style> y JavaScript dentro de <script>.

\- JavaScript nativo, sin frameworks ni dependencias externas.

Qué intentaba lograr: construir una tarea simple, pero volver incómodo el ingreso de un número que normalmente se escribiría directamente.



Qué devolvió: un selector cuyo estado se modifica exclusivamente mediante sumas de 3 y restas de 2, con bloqueo de valores negativos y confirmación del volumen seleccionado.



2 — Agregar observaciones con teclado virtual

Sobre el archivo TP1/index.html existente, agregá debajo del selector de

volumen una sección “Observación del riego”.



Estructura:

\- Un área de sólo lectura donde se vea la observación construida.

\- Un contador de caracteres.

\- Un teclado virtual con las 27 letras del alfabeto español, incluida la Ñ.

\- Dos botones de edición: “Agregar espacio” y “Borrar última letra”.



Estado:

\- observation: texto acumulado, inicialmente vacío.

\- minimumCharacters: 8.

\- maximumCharacters: 40.

\- letters: arreglo con las letras disponibles en el teclado.



Comportamiento:

\- El usuario no puede escribir directamente: cada letra se agrega desde el

&#x20; teclado virtual.

\- No permitir agregar espacios al inicio, espacios consecutivos ni caracteres

&#x20; por encima del máximo.

\- “Borrar última letra” elimina el último carácter y permanece disponible

&#x20; cuando la observación no está vacía.

\- El botón “Registrar riego” sólo se habilita con un volumen mayor que cero y

&#x20; una observación válida de al menos 8 caracteres sin contar espacios externos.

\- Al registrar, mostrar el volumen y la observación ingresados.



Constraints:

\- Mantener intacta la lógica +3 / −2 del volumen.

\- No crear archivos adicionales ni usar dependencias externas.

Qué intentaba lograr: sumar una segunda tarea de ingreso de datos y hacer que el texto no pudiera completarse con el método convencional del teclado físico.



Qué devolvió: una observación construida letra por letra, con límites de longitud, controles de edición y validación conjunta con el volumen.



3 — Convertir el teclado virtual en un teclado escurridizo

Sobre el teclado virtual de observaciones ya implementado, convertí el teclado en la

interfaz incómoda principal sin modificar la sección de volumen.



Comportamiento:

\- Al cargar la página, renderizar las 27 letras en un orden aleatorio.

\- Cada vez que el usuario selecciona una letra, agregarla a observacion y

&#x20; volver a renderizar el teclado con un orden diferente.

\- Usar una función shuffledLetters que copie el arreglo letters y lo mezcle;

&#x20; no alterar el arreglo original.

\- Usar renderKeyboard para reconstruir los botones con la letra y un

&#x20; aria-label descriptivo.

\- “Agregar espacio” y “Borrar última letra” deben permanecer fuera del teclado

&#x20; y no cambiar de posición.

\- El reordenamiento no debe borrar el texto ya construido ni modificar la

&#x20; validación de 8 a 40 caracteres.



Reglas de preservación:

\- Mantener el estado volumen, los botones +3 / −2 y su bloqueo de valores

&#x20; negativos.

\- Mantener el proyecto en un único archivo HTML con JavaScript nativo.

Qué intentaba lograr: hacer lenta e incómoda la localización de cada letra, sin impedir que la observación pueda completarse y corregirse.



Por qué está escrito así: separar letters de su versión mezclada evita perder las letras disponibles. Mantener fijos los controles de espacio y borrado asegura una salida clara ante errores de escritura.



Qué devolvió: un teclado que cambia de disposición después de cada letra, mientras la observación, el contador y los controles de edición se conservan.



4 — Ajuste final de textos y confirmación

Sobre TP1/index.html y TP1/README.md existentes, ajustá los textos sin cambiar

la lógica funcional.



Interfaz:

\- Usar “Registro de riego” como título de la página.

\- Mostrar, en dos oraciones consecutivas:

&#x20; “Indicá el volumen estimado utilizado en cantidad de litros.”

&#x20; “No se puede escribir: debés construir el número combinando sumas de 3

&#x20; litros y restas de 2 litros.”

\- En observaciones, mostrar solamente:

&#x20; “No se puede escribir directamente. Construí una observación de entre 8 y 40

&#x20; caracteres con el teclado virtual.”

\- No anticipar en la instrucción visible que las letras cambian de posición.



README:

\- Describir la aplicación como una interfaz para una persona que registra un

&#x20; riego manual en una huerta.

\- Explicar allí el reordenamiento de las letras y los controles que permanecen

&#x20; fijos.

\- No incluir enlaces ni referencias a otros proyectos o casos externos.



Confirmación:

\- Mostrar “1 litro” cuando el volumen sea 1 y “litros” para cualquier otro

&#x20; valor.



Constraints:

\- Mantener el HTML, CSS y JavaScript en un único archivo.

\- No modificar el comportamiento del selector aritmético ni del teclado

&#x20; escurridizo.

Qué intentaba lograr: mejorar la claridad del texto visible y separar la instrucción para la persona usuaria de la explicación técnica de la interfaz deliberadamente incómoda.



Qué devolvió: una interfaz con textos más directos, una explicación técnica en el README y una confirmación gramaticalmente correcta para el volumen.

