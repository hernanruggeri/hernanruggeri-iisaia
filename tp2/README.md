# TP2 — API Agroriego: sectores y riegos manuales

**Autor:** Hernán Ruggeri

## Qué API elegí

Elegí diseñar el contrato de una API REST para Agroriego. El recorte funcional permite consultar los sectores productivos monitoreados y listar, registrar o eliminar sus registros de riego manual.

La API relaciona dos recursos:

- `Sector`: representa un sector productivo y su estado actual de humedad.
- `Riego`: representa un registro de riego manual asociado a un sector.

El trabajo se limita al diseño y la documentación del contrato mediante OpenAPI 3.1.0. No incluye servidor, frontend, base de datos, autenticación, despliegue ni control de bombas, electroválvulas o cualquier otro dispositivo físico.

## Operaciones incluidas

| Método | Ruta | Finalidad | Respuestas documentadas |
| --- | --- | --- | --- |
| `GET` | `/sectores` | Listar los sectores monitoreados | `200` |
| `GET` | `/sectores/{sectorId}/riegos` | Listar los riegos manuales de un sector | `200`, `404` |
| `POST` | `/sectores/{sectorId}/riegos` | Registrar un riego manual en un sector | `201`, `400`, `404` |
| `DELETE` | `/sectores/{sectorId}/riegos/{riegoId}` | Eliminar un registro cargado por error | `204`, `404` |

## Qué decidí yo

- Elegí `Sector` y `Riego` porque son recursos reales del dominio y mantienen una relación clara: cada registro de riego pertenece a un sector.
- Anidé la colección de riegos bajo `/sectores/{sectorId}` porque cada riego se consulta o registra dentro del contexto de un sector determinado. Por eso preferí una ruta jerárquica en lugar de una colección general filtrada mediante parámetros de consulta.
- Usé nombres de rutas en plural, campos en `snake_case` y nombres de esquemas en `PascalCase` para mantener una convención uniforme.
- Separé `RiegoInput` de `Riego`. El esquema de entrada contiene solamente los datos que aporta quien registra el riego; la respuesta agrega `id` y `sector_id`.
- No incluí `sector_id` en el cuerpo del `POST` porque el sector ya queda identificado por `{sectorId}` en la ruta. Así evité pedir el mismo dato por dos vías distintas.
- Definí `inicio`, `duracion_minutos` y `volumen_litros` como obligatorios. Dejé `caudal_litros_minuto` y `observaciones` como opcionales porque un riego puede registrarse aunque esos datos no estén disponibles.
- Apliqué validaciones del dominio: porcentajes entre 0 y 100, duración mínima de un minuto, volumen y caudal mayores que cero, fecha y hora con formato `date-time` y observaciones de hasta 300 caracteres.
- Usé `400` cuando el cuerpo de la solicitud es inválido y `404` cuando el sector o el riego solicitado no existen. Una creación válida devuelve `201`; una eliminación correcta, `204` sin cuerpo de respuesta.
- Limité el borrado a registros de riego manual cargados por error. No incorporé operaciones para activar el riego ni para controlar dispositivos.

## Qué salió mal y cómo lo corregí

En el primer borrador, `RiegoInput` no declaraba `sector_id`, pero el esquema tampoco prohibía propiedades adicionales. En consecuencia, el contrato no impedía expresamente que un cliente enviara `sector_id` u otro campo no definido dentro del cuerpo de la solicitud.

Esto podía reintroducir la misma ambigüedad que se quería evitar: el sector quedaría indicado en la ruta y también podría aparecer en el cuerpo, sin establecer cuál de los dos valores debía prevalecer si fueran diferentes.

La corrección consistió en agregar `additionalProperties: false` únicamente a `RiegoInput`. De esta forma, el cuerpo acepta sólo los campos declarados y `{sectorId}` queda como única fuente de identificación del sector en esa operación.

## Validación realizada

El archivo `openapi.yaml` fue revisado de dos maneras:

- se comprobó su estructura y que el YAML pudiera interpretarse correctamente;
- se cargó en Swagger Editor, donde se visualizaron las cuatro operaciones sin errores y `RiegoInput` quedó identificado como un esquema que no admite propiedades adicionales.

## Archivos de la entrega

- `openapi.yaml`: contrato final de la API.
- `prompts.md`: secuencia de prompts utilizada en una única conversación, con el objetivo de cada intervención.
- `README.md`: descripción del alcance, las decisiones tomadas y la corrección realizada.
