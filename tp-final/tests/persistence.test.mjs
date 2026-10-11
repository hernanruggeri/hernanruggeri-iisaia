import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
async function start(dbPath) {
  const socket = createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, DB_PATH: dbPath, API_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`API no inició: ${output}`)), 5000);
    child.stdout.on('data', data => { output += data; if (output.includes('disponible')) { clearTimeout(timeout); resolve(); } });
    child.stderr.on('data', data => { output += data; });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`API terminó ${code}: ${output}`)); });
    child.once('error', reject);
  });
  return { child, base: `http://127.0.0.1:${port}/api` };
}
async function stop({ child }) {
  if (child.exitCode !== null) return;
  const exited = once(child, 'exit');
  child.kill('SIGTERM');
  await exited;
}
const input = { inicio: '2026-10-06T10:00:00-03:00', duracion_minutos: 9,
  caudal_litros_minuto: 0.8, volumen_litros: 7.2, observaciones: 'Persistencia tras reinicio' };
test('riego conserva ID y valores tras reiniciar el proceso; DELETE también persiste', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agroriego-restart-'));
  let api;
  try {
    api = await start(join(dir, 'records.sqlite'));
    const response = await fetch(`${api.base}/sectores/s2/riegos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
    });
    assert.equal(response.status, 201);
    const created = await response.json();
    await stop(api);
    api = await start(join(dir, 'records.sqlite'));
    const list = await (await fetch(`${api.base}/sectores/s2/riegos`)).json();
    assert.ok(list.some(row => row.id === created.id), 'El registro se perdió al reiniciar');
    assert.equal(list.find(row => row.id === created.id).volumen_litros, 7.2);
    assert.equal((await fetch(`${api.base}/sectores/s1/riegos/${created.id}`, { method: 'DELETE' })).status, 404);
    assert.equal((await fetch(`${api.base}/sectores/s2/riegos/${created.id}`, { method: 'DELETE' })).status, 204);
    assert.equal((await fetch(`${api.base}/sectores/s1/riegos/r1`, { method: 'DELETE' })).status, 204);
    await stop(api);
    api = await start(join(dir, 'records.sqlite'));
    assert.deepEqual(await (await fetch(`${api.base}/sectores/s2/riegos`)).json(), []);
    const seeds = await (await fetch(`${api.base}/sectores/s1/riegos`)).json();
    assert.equal(seeds.length, 0);
  } finally {
    if (api) await stop(api);
    await rm(dir, { recursive: true, force: true });
  }
});
