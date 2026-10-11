import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createDemoServer } from "../server/demo.js";

import { createApiState } from "../server/api.js";
const server = createDemoServer({ store: createApiState() });
let baseUrl;

before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("la demo sirve el frontend y completa el recorrido vertical", async () => {
  const pageResponse = await fetch(`${baseUrl}/hr-agroriego-iot/#riego`);
  assert.equal(pageResponse.status, 200);
  assert.match(await pageResponse.text(), /<div id="root"><\/div>/);

  const sectorsResponse = await fetch(`${baseUrl}/api/sectores`);
  const sectors = await sectorsResponse.json();
  assert.equal(sectorsResponse.status, 200);
  assert.equal(sectors.length, 4);

  const createResponse = await fetch(`${baseUrl}/api/sectores/s2/riegos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inicio: "2026-09-23T11:00:00-03:00",
      duracion_minutos: 10,
      volumen_litros: 8,
      caudal_litros_minuto: 0.8,
      observaciones: "Prueba integral",
    }),
  });
  const created = await createResponse.json();
  assert.equal(createResponse.status, 201);
  assert.ok(created.id);

  const listResponse = await fetch(`${baseUrl}/api/sectores/s2/riegos`);
  const irrigations = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.ok(irrigations.some((irrigation) => irrigation.id === created.id));
});
