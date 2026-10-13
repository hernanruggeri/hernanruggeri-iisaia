# Repositorio de Hernán Ruggeri — IISAIA

**Autor:** Hernán Ruggeri

Repositorio correspondiente al curso Introducción a la Ingeniería de Software Asistida por Inteligencia Artificial.

## Entregas

- [TP1 — Registro de riego](tp1/): interfaz deliberadamente incómoda para registrar un riego manual.
- [TP2 — API Agroriego](tp2/): diseño y documentación del contrato OpenAPI para consultar sectores y registrar riegos manuales.
- [Trabajo final — HR AgroRiego](tp-final/): aplicación React, API REST Node y persistencia SQLite para consultar cuatro sectores y registrar riegos manuales.

## Ejecutar el trabajo final

Requisito: Node.js 24 o superior y npm. Desde la raíz del repositorio:

```bash
cd tp-final
npm ci
npm run demo
```

Abrir `http://127.0.0.1:4173/hr-agroriego-iot/`. Consultar el [README del trabajo final](tp-final/README.md) para el recorrido, las pruebas y los límites, y la [verificación](tp-final/docs/verificacion.md) para la evidencia.

La entrega publicada utiliza sensores simulados y registra intervenciones manuales; no activa bombas ni electroválvulas. La ampliación meteorológica permite consultar Open-Meteo y conservar pronósticos en SQLite; requiere configuración privada. Presentaciones, guiones, bases privadas y archivos de configuración local se mantienen fuera del repositorio.

Para evaluar la aplicación sin configurar coordenadas, seguir el [recorrido para el docente](tp-final/docs/recorrido-docente.md). La demo meteorológica usa una ubicación pública de ejemplo claramente identificada.
