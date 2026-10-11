import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { createApiHandler, createApiState } from '../server/api.js';
import { dailyLiters, estimatedVolume, filterRecords } from '../src/domain.mjs';

test('entradas inválidas se rechazan por HTTP sin escribir; contrato y métodos', async () => {
  const store = createApiState();
  const server = createServer(createApiHandler(store));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/sectores/s2/riegos`;
  const valid = { inicio: '2026-10-06T10:00:00-03:00', duracion_minutos: 9, caudal_litros_minuto: 0.8, volumen_litros: 7.2 };
  try {
    const bad = [null, [], {}, {...valid, duracion_minutos: 0}, {...valid, duracion_minutos: 1.5},
      {...valid, volumen_litros: -1}, {...valid, caudal_litros_minuto: 0}, {...valid, volumen_litros: 8},
      {...valid, inicio: '2026-02-30T10:00:00-03:00'}, {...valid, inicio: '2026-10-06T10:00:00'},
      {...valid, observaciones: 'x'.repeat(301)}, {...valid, origen: 'manual'}, {...valid, sector_id: 's1'}];
    for (const input of bad) {
      const response = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      assert.equal(response.status, 400, JSON.stringify(input));
    }
    assert.deepEqual(await (await fetch(base)).json(), []);
    assert.equal((await fetch(base, { method: 'PUT' })).status, 405);
    assert.equal((await fetch(base, { method: 'POST', body: '{broken' })).status, 400);
    assert.equal((await fetch(base, { method: 'POST', body: 'x'.repeat(100001) })).status, 413);
    const response = await fetch(base, { method: 'POST', body: JSON.stringify({...valid, caudal_litros_minuto: undefined}) });
    assert.equal(response.status, 201, 'Volumen informado sin caudal permitido por contrato');
    const created = await response.json();
    assert.equal(created.origen, 'manual');
    assert.equal((await fetch(`${base}/${created.id}`, {method:'DELETE'})).status, 204);
    assert.equal((await fetch(`${base}/${created.id}`, {method:'DELETE'})).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
    store.close();
  }
});
test('volumen, filtros y total diario distinguen fecha de Buenos Aires', () => {
  assert.equal(estimatedVolume(9, 0.8), 7.2);
  const records = [
    { sectorId:'s1', start:'2026-10-06T01:00:00Z', volume:5 }, // 5 de octubre BA
    { sectorId:'s2', start:'2026-10-06T13:00:00Z', volume:7.2 },
    { sectorId:'s2', start:'2026-10-01T13:00:00Z', volume:8 },
  ];
  const now = new Date('2026-10-06T15:00:00Z');
  assert.equal(dailyLiters(records, now), 7.2);
  assert.equal(filterRecords(records,'s2','24h',now).length,1);
  assert.equal(filterRecords(records,'s2','7d',now).length,2);
  assert.equal(filterRecords(records,'s1','todo',now).length,1);
});
