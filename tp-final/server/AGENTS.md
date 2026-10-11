# Backend
Leer docs/openapi.yaml. SQLite es la fuente persistente. Parametrizar SQL; validar antes de escribir; inicializar semillas una sola vez. Dar 201 tras guardar, 204 tras eliminar; 400/404/405/413/500 según corresponda. Enlazar a 127.0.0.1. DB_PATH configura archivo, ruta por defecto relativa al proyecto. Cerrar conexión al cerrar el servidor; no resetear datos al iniciar.
