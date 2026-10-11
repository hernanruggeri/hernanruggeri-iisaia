# Especificación de la evolución final — 6 de octubre de 2026

## Objetivo y usuario
El responsable del riego manual consulta cuatro sectores y conserva registros para revisar qué intervención se realizó y cuándo. La entrega final mantiene el monitoreo experimental; no controla bombas ni electroválvulas.

## Base y decisión de alcance
Se parte del ZIP del avance presentado el 23 de septiembre. Ya conectaba React y Node, pero sus registros estaban en memoria. El usuario autorizó completar los seis pendientes revisados. La decisión técnica propuesta para esa etapa es SQLite local, con acceso desde el backend; no exige un servicio remoto ni credenciales. No se afirma que el usuario eligió personalmente esta tecnología: se adopta dentro del alcance autorizado.

## Comportamiento esperado
- Primer inicio: cuatro sectores y tres riegos de demostración, etiquetados.
- Consultar y registrar con el contrato del TP2; el sector proviene de la ruta.
- Guardar en SQLite antes de devolver 201. Reiniciar no pierde ni duplica datos.
- Eliminar un riego cargado por error, con confirmación del usuario; devolver 204, o 404 si no pertenece al sector.
- Cuando hay caudal medio, volumen estimado = minutos × litros/minuto, redondeado a dos decimales. Sin caudal, la API admite volumen informado manualmente. La interfaz usa la primera modalidad.
- Fechas de entrada con zona horaria; almacenamiento normalizado a UTC; visualización en Buenos Aires.
- API caída: aviso persistente, botón Reintentar y registro deshabilitado; no fingir un guardado local.
- Resumen diario y tabla toman los registros de la API. Historial de riegos filtrable por sector y período real; gráfico de humedad identificado como una muestra simulada fija.
- Configuración de sensores presentada como maqueta, sin simular un guardado real.

## Arquitectura
React → HTTP /api → Node → repositorio SQLite → archivo local data/agroriego.sqlite.
SQLite usa dos tablas con clave foránea (sectores y riegos), consultas parametrizadas, restricciones y una inicialización transaccional de única ejecución.

## Criterios de aceptación
1. Un registro creado por HTTP se recupera con su mismo ID tras reiniciar el proceso.
2. Eliminación persistente, pertenencia al sector y ausencia de reinserción de semillas.
3. Valores inválidos no cambian la base; campos adicionales y volumen incoherente devuelven 400.
4. Recorrido en navegador: consultar, registrar, recargar, filtrar, eliminar y manejar caída de API.
5. Un checkout limpio instala y compila; pruebas aisladas no tocan la base de uso.
6. Repositorio con arquitectura, contrato, instrucciones, proceso y evidencia verificable.

## Límites
Datos de sensores simulados; fuente externa sin configurar; uso local de un responsable; sin autenticación ni despliegue público; SQLite sin alta disponibilidad. Node 24 LTS, por el acceso integrado a SQLite. Los riegos en memoria de una sesión antigua no se pueden recuperar desde el ZIP: si hay registros que conservar en otra instalación, deberán exportarse antes.
