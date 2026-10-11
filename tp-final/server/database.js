import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialSectors, initialIrrigations } from './seed.js';

export const defaultDbPath = fileURLToPath(new URL('../data/agroriego.sqlite', import.meta.url));

/** Owns persistence; handlers use this interface instead of mutable arrays. */
export function openDatabase(path = process.env.DB_PATH || defaultDbPath) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  const version = db.prepare('PRAGMA user_version').get().user_version;
  if (version > 1) { db.close(); throw new Error('Versión de base de datos no soportada.'); }
  if (version === 0) {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(`
        CREATE TABLE sectores (
          id TEXT PRIMARY KEY, numero TEXT NOT NULL, cultivo TEXT NOT NULL,
          humedad_actual_pct INTEGER NOT NULL CHECK (humedad_actual_pct BETWEEN 0 AND 100),
          humedad_min_pct INTEGER NOT NULL, humedad_max_pct INTEGER NOT NULL,
          estado_humedad TEXT NOT NULL CHECK (estado_humedad IN ('seco','adecuado','exceso'))
        ) STRICT;
        CREATE TABLE riegos (
          id TEXT PRIMARY KEY, sector_id TEXT NOT NULL REFERENCES sectores(id),
          inicio TEXT NOT NULL, duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos >= 1),
          caudal_litros_minuto REAL CHECK (caudal_litros_minuto > 0),
          volumen_litros REAL NOT NULL CHECK (volumen_litros > 0), observaciones TEXT,
          origen TEXT NOT NULL CHECK (origen IN ('demostracion','manual'))
        ) STRICT;
        CREATE INDEX riegos_sector_inicio ON riegos(sector_id, inicio DESC);
      `);
      const sectorInsert = db.prepare('INSERT INTO sectores VALUES (?,?,?,?,?,?,?)');
      for (const s of initialSectors) sectorInsert.run(s.id, s.numero, s.cultivo, s.humedad_actual_pct,
        s.humedad_min_pct, s.humedad_max_pct, s.estado_humedad);
      const irrigationInsert = db.prepare('INSERT INTO riegos VALUES (?,?,?,?,?,?,?,?)');
      for (const r of initialIrrigations) irrigationInsert.run(r.id, r.sector_id, new Date(r.inicio).toISOString(),
        r.duracion_minutos, r.caudal_litros_minuto, r.volumen_litros, r.observaciones, 'demostracion');
      db.exec('PRAGMA user_version = 1; COMMIT');
    } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  }
  const list = db.prepare('SELECT * FROM riegos WHERE sector_id = ? ORDER BY inicio DESC, rowid DESC');
  const insert = db.prepare('INSERT INTO riegos VALUES (?,?,?,?,?,?,?,?)');
  const remove = db.prepare('DELETE FROM riegos WHERE sector_id = ? AND id = ?');
  const clean = row => {
    const result = { ...row };
    for (const key of ['caudal_litros_minuto', 'observaciones']) if (result[key] === null) delete result[key];
    return result;
  };
  return {
    listSectors: () => db.prepare('SELECT * FROM sectores ORDER BY numero').all().map(row => ({ ...row })),
    findSector: id => db.prepare('SELECT * FROM sectores WHERE id = ?').get(id),
    listIrrigations: id => list.all(id).map(clean),
    addIrrigation: r => {
      insert.run(r.id, r.sector_id, r.inicio, r.duracion_minutos, r.caudal_litros_minuto ?? null,
        r.volumen_litros, r.observaciones ?? null, 'manual');
      return { ...r, origen: 'manual' };
    },
    deleteIrrigation: (sectorId, id) => remove.run(sectorId, id).changes > 0,
    close: () => db.close(),
  };
}
