\# TP1 — Registro de riego



\*\*Autor:\*\* Hernán Ruggeri



\## Descripción



Este trabajo presenta una aplicación web para registrar un riego manual en una huerta.



La aplicación implementa una interfaz deliberadamente incómoda: permite completar la tarea, pero evita los mecanismos habituales de ingreso y requiere que la persona se detenga a pensar antes de cada acción.



\## Cómo se materializa la incomodidad



La aplicación es funcional: permite registrar un riego y una observación. Sin embargo, reemplaza formas habituales y rápidas de ingreso por mecanismos que exigen prestar atención y planificar cada acción.



\### Volumen de riego



El volumen no se puede escribir directamente ni seleccionar de una lista. Sólo puede modificarse mediante dos operaciones:



\- agregar 3 litros;

\- quitar 2 litros.



Por lo tanto, para alcanzar una cantidad determinada la persona debe calcular una combinación de acciones. Por ejemplo, para registrar 1 litro debe primero agregar 3 litros y luego quitar 2; para registrar 2 litros debe agregar 3 litros dos veces y quitar 2 litros dos veces.



Además, no se permiten valores negativos: el botón para quitar 2 litros permanece deshabilitado mientras el volumen sea menor que 2. De este modo, la interfaz obliga a considerar tanto el valor buscado como el valor actual antes de realizar cada clic.



\### Observación del riego



La observación tampoco puede escribirse directamente con el teclado físico. Debe construirse letra por letra mediante un teclado virtual que incluye las 27 letras del alfabeto español, incluida la Ñ.



El orden de las letras se modifica cada vez que se selecciona una. Esto impide memorizar la ubicación de las teclas y obliga a volver a buscar visualmente cada letra antes de continuar escribiendo.



La aplicación exige una observación de entre 8 y 40 caracteres, no permite espacios al comienzo ni espacios consecutivos y sólo habilita el registro cuando el texto cumple la extensión mínima. Los controles para agregar un espacio y borrar la última letra permanecen fijos, de modo que la corrección sigue siendo posible aun cuando el teclado cambie de disposición.



En ambos casos, la incomodidad no impide completar la tarea: introduce fricción intencional para que la persona se detenga a pensar antes de cada acción.



\## Funcionamiento



El volumen inicial es cero. El botón “Registrar riego” permanece deshabilitado hasta que se cumplan simultáneamente estas condiciones:



\- el volumen debe ser mayor que cero;

\- la observación debe contener al menos 8 caracteres, sin contar espacios externos.



Al registrar un valor válido, la aplicación muestra un mensaje de confirmación con el volumen seleccionado y la observación construida. La unidad se expresa como “1 litro” para el valor uno y “litros” para los demás valores.



\## Diseño y accesibilidad



La interfaz utiliza una paleta asociada a una huerta, con el volumen como elemento visual de mayor jerarquía. Los controles se adaptan a pantallas angostas y los elementos dinámicos incorporan etiquetas y mensajes accesibles para facilitar su interpretación.



\## Tecnologías



El artefacto está desarrollado en un único archivo mediante:



\- HTML;

\- CSS;

\- JavaScript nativo.



No utiliza frameworks, bibliotecas ni dependencias externas.



\## Archivos



\- `README.md`: informe y descripción del TP1.

\- `prompts.md`: prompts utilizados durante la construcción e iteración.

\- `index.html`: artefacto web interactivo.



\## Ejecución



Para utilizar la aplicación, se debe abrir el archivo `index.html` en un navegador web.



\## Prueba rápida



1\. Abrir `index.html` en un navegador web.

2\. Construir un volumen mayor que cero mediante los botones “Agregar 3 litros” y “Quitar 2 litros”.

3\. Escribir una observación de al menos 8 caracteres utilizando el teclado virtual.

4\. Verificar que las letras cambian de posición después de cada selección.

5\. Presionar “Registrar riego” y comprobar el mensaje de confirmación.

