import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";
import { createApiHandler, createApiState } from "../server/api.js";

const state = createApiState();
const server = createServer(createApiHandler(state));
let apiBaseUrl;

before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  apiBaseUrl = `http://127.0.0.1:${address.port}/api`;
});

after(async () => {
  state.close();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET /sectores devuelve los cuatro sectores", async () => {
  const response = await fetch(`${apiBaseUrl}/sectores`);
  const sectors = await response.json();

  assert.equal(response.status, 200);
  assert.equal(sectors.length, 4);
  assert.equal(sectors[0].cultivo, "Maíz dulce");
});

test("POST /sectores/{sectorId}/riegos crea un registro y devuelve 201", async () => {
  const response = await fetch(`${apiBaseUrl}/sectores/s2/riegos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inicio: "2026-09-23T10:30:00-03:00",
      duracion_minutos: 8,
      volumen_litros: 6.4,
      caudal_litros_minuto: 0.8,
      observaciones: "Registro creado durante la demo.",
    }),
  });
  const irrigation = await response.json();

  assert.equal(response.status, 201);
  assert.equal(irrigation.sector_id, "s2");
  assert.equal(irrigation.volumen_litros, 6.4);
  assert.ok(irrigation.id);
});

test("GET /sectores/{sectorId}/riegos recupera el registro creado", async () => {
  const response = await fetch(`${apiBaseUrl}/sectores/s2/riegos`);
  const irrigations = await response.json();

  assert.equal(response.status, 200);
  assert.equal(irrigations.length, 1);
  assert.equal(irrigations[0].observaciones, "Registro creado durante la demo.");
});

test("POST rechaza propiedades adicionales con 400", async () => {
  const response = await fetch(`${apiBaseUrl}/sectores/s1/riegos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inicio: "2026-09-23T10:30:00-03:00",
      duracion_minutos: 8,
      volumen_litros: 6.4,
      sector_id: "s4",
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.codigo, "RIEGO_INVALIDO");
  assert.match(body.mensaje, /sector_id/);
});

test("POST devuelve 404 cuando el sector no existe", async () => {
  const response = await fetch(`${apiBaseUrl}/sectores/inexistente/riegos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inicio: "2026-09-23T10:30:00-03:00",
      duracion_minutos: 8,
      volumen_litros: 6.4,
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.codigo, "SECTOR_NO_ENCONTRADO");
});
