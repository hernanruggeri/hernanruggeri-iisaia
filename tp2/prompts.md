# Prompts utilizados para el TP2

**Autor:** Hernán Ruggeri

Toda la secuencia se desarrolló, de principio a fin, en una única conversación de IA. Los prompts se presentan en el mismo orden en que fueron utilizados.

## Prompt 1 — Generación del primer borrador del contrato

```text
Necesito que generes el contenido completo de un archivo `openapi.yaml` utilizando OpenAPI 3.1.0. El contrato corresponde a la API “Agroriego — Sectores y riegos manuales”.

Usá estos datos generales:

- título: `API Agroriego — Sectores y riegos manuales`;
- versión: `1.0.0`;
- autor: `Hernán Ruggeri`;
- descripciones, rutas y campos en español;
- rutas con nombres de recursos en plural;
- campos en `snake_case`;
- schemas en `PascalCase`.

La API debe trabajar solamente con dos recursos relacionados: `Sector` y `Riego`. Un riego manual pertenece a un sector.

Definí los siguientes schemas:

1. `Sector`, con estos campos obligatorios:
   - `id`: string;
   - `numero`: string;
   - `cultivo`: string;
   - `humedad_actual_pct`: integer entre 0 y 100;
   - `humedad_min_pct`: integer entre 0 y 100;
   - `humedad_max_pct`: integer entre 0 y 100;
   - `estado_humedad`: string con los valores `seco`, `adecuado` o `exceso`.

2. `RiegoInput`, para registrar un riego manual, con:
   - `inicio`: string con formato `date-time`, obligatorio;
   - `duracion_minutos`: integer con mínimo 1, obligatorio;
   - `volumen_litros`: number mayor que 0, obligatorio;
   - `caudal_litros_minuto`: number mayor que 0, opcional;
   - `observaciones`: string de hasta 300 caracteres, opcional.

   No incluyas `sector_id` en `RiegoInput`, porque el sector ya se identifica en el path.

3. `Riego`, con los mismos campos de `RiegoInput` y además:
   - `id`: string, obligatorio;
   - `sector_id`: string, obligatorio.

4. `Error`, con:
   - `codigo`: string, obligatorio;
   - `mensaje`: string, obligatorio.

Incluí exactamente estas operaciones:

- `GET /sectores`: devuelve `200` con un array de `Sector`.
- `GET /sectores/{sectorId}/riegos`: recibe `sectorId` como parámetro obligatorio de path; devuelve `200` con un array de `Riego` y `404` con `Error` si el sector no existe.
- `POST /sectores/{sectorId}/riegos`: recibe `sectorId` como parámetro obligatorio de path y un body `RiegoInput`; devuelve `201` con `Riego`, `400` con `Error` si el body es inválido y `404` con `Error` si el sector no existe.
- `DELETE /sectores/{sectorId}/riegos/{riegoId}`: recibe `sectorId` y `riegoId` como parámetros obligatorios de path; devuelve `204` sin body cuando elimina correctamente y `404` con `Error` si el sector o el riego no existen.

No agregues otras rutas, recursos ni métodos. No incluyas sensores o dispositivos como recursos, meteorología, activación automática o remota del riego, autenticación, servidor, frontend, handlers, base de datos, despliegue ni código de implementación.

Incluí una descripción general que aclare que la API administra registros de riego manual y no controla bombas, electroválvulas ni dispositivos físicos.

Devolvé únicamente el contenido completo de `openapi.yaml`, sin explicaciones adicionales ni código de implementación.
```

**Qué intentaba lograr:** generar el primer borrador completo del contrato OpenAPI, fijando los recursos, la jerarquía, los esquemas, las validaciones y los códigos de respuesta, y evitando que la IA incorporara implementación o funciones ajenas al alcance.

## Prompt 2 — Corrección del esquema de entrada

```text
Revisando el `openapi.yaml` generado, detecté que `RiegoInput` no declara `sector_id`, pero todavía permite propiedades adicionales porque el schema no las prohíbe expresamente.

Modificá únicamente el schema `RiegoInput` para agregar:

`additionalProperties: false`

La finalidad es que el body de `POST /sectores/{sectorId}/riegos` acepte solamente los campos declarados en `RiegoInput` y rechace cualquier campo adicional, especialmente `sector_id`, porque el sector ya está identificado en el path.

No modifiques las rutas, los métodos, los códigos de respuesta, los campos, las validaciones ni los demás schemas. Conservá también los datos generales y la autoría de Hernán Ruggeri.

Devolvé el contenido completo y actualizado de `openapi.yaml`, sin explicaciones adicionales ni código de implementación.
```

**Qué intentaba lograr:** cerrar estrictamente el esquema de entrada para impedir que el cliente enviara `sector_id` u otros campos no definidos, manteniendo la ruta como única fuente de identificación del sector.
