import { createHash, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { defaultDbPath } from './database.js';

const dailyFields = {
  temperature_2m_max: '°C', temperature_2m_min: '°C',
  precipitation_sum: 'mm', precipitation_probability_max: '%',
  et0_fao_evapotranspiration: 'mm',
};
const hourlyFields = { temperature_2m: '°C', relative_humidity_2m: '%' };

export function weatherConfig(env = process.env) {
  const number = (key, min, max) => {
    if (!env[key]?.trim()) throw new Error(`Falta ${key} en la configuración privada.`);
    const value = Number(env[key]);
    if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${key} inválido.`);
    return value;
  };
  if (env.WEATHER_PROVIDER !== 'open-meteo') throw new Error('Proveedor meteorológico inválido.');
  const timezone = env.WEATHER_TIMEZONE;
  try { new Intl.DateTimeFormat('es', { timeZone: timezone }); }
  catch { throw new Error('Zona horaria inválida.'); }
  if (!timezone) throw new Error('Falta WEATHER_TIMEZONE.');
  const days = number('WEATHER_FORECAST_DAYS', 1, 7);
  if (!Number.isInteger(days)) throw new Error('Cantidad de días inválida.');
  return { latitude: number('WEATHER_LATITUDE', -90, 90),
    longitude: number('WEATHER_LONGITUDE', -180, 180), timezone, days };
}

export function validateForecast(data, config) {
  if (data.timezone !== config.timezone) throw new Error('Zona horaria inesperada en la respuesta.');
  for (const [group, fields] of [['daily', dailyFields], ['hourly', hourlyFields]]) {
    const times = data[group]?.time;
    if (!Array.isArray(times) || times.length === 0 || new Set(times).size !== times.length)
      throw new Error(`Fechas ${group} inválidas.`);
    const pattern = group === 'daily' ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (times.some(t => typeof t !== 'string' || !pattern.test(t))) throw new Error('Formato de fecha inválido.');
    for (const [field, unit] of Object.entries(fields)) {
      const values = data[group][field];
      if (data[`${group}_units`]?.[field] !== unit || !Array.isArray(values) || values.length !== times.length)
        throw new Error(`Serie o unidad inválida: ${field}.`);
      if (values.some(v => v !== null && (!Number.isFinite(v)
        || ((unit === 'mm' || unit === '%') && v < 0) || (unit === '%' && v > 100))))
        throw new Error(`Valor inválido: ${field}.`);
    }
  }
  if (data.daily.time.length !== config.days) throw new Error('Pronóstico diario incompleto.');
  return data;
}

export async function fetchForecast(config, fetcher = fetch) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({ latitude: String(config.latitude), longitude: String(config.longitude),
    timezone: config.timezone, forecast_days: String(config.days),
    daily: Object.keys(dailyFields).join(','), hourly: Object.keys(hourlyFields).join(',') }).toString();
  const response = await fetcher(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Open-Meteo respondió HTTP ${response.status}.`);
  return validateForecast(await response.json(), config);
}

export function openWeatherStore(path = process.env.DB_PATH || defaultDbPath) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS weather_downloads (
      id TEXT PRIMARY KEY, fetched_at TEXT NOT NULL, last_checked_at TEXT NOT NULL,
      source TEXT NOT NULL, kind TEXT NOT NULL, timezone TEXT NOT NULL,
      fingerprint TEXT NOT NULL UNIQUE, payload TEXT NOT NULL, config TEXT NOT NULL
    ) STRICT;
    CREATE TABLE IF NOT EXISTS weather_values (
      download_id TEXT NOT NULL REFERENCES weather_downloads(id),
      resolution TEXT NOT NULL, valid_at TEXT NOT NULL, variable TEXT NOT NULL,
      value REAL, unit TEXT NOT NULL,
      PRIMARY KEY(download_id, resolution, valid_at, variable)
    ) STRICT;`);
  return {
    save(data, config, at = new Date().toISOString()) {
      validateForecast(data, config);
      // Retain changed forecasts; identical series only update the last successful check.
      const fingerprint = createHash('sha256').update(JSON.stringify({ config,
        daily: data.daily, hourly: data.hourly, daily_units: data.daily_units,
        hourly_units: data.hourly_units })).digest('hex');
      db.exec('BEGIN IMMEDIATE');
      try {
        const existing = db.prepare('SELECT id FROM weather_downloads WHERE fingerprint = ?').get(fingerprint);
        if (existing) {
          db.prepare('UPDATE weather_downloads SET last_checked_at = ? WHERE id = ?').run(at, existing.id);
          db.exec('COMMIT');
          return { id: existing.id, inserted: false };
        }
        const id = randomUUID();
        db.prepare('INSERT INTO weather_downloads VALUES (?,?,?,?,?,?,?,?,?)')
          .run(id, at, at, 'open-meteo', 'pronostico', config.timezone, fingerprint,
            JSON.stringify(data), JSON.stringify(config));
        const insert = db.prepare('INSERT INTO weather_values VALUES (?,?,?,?,?,?)');
        for (const [group, fields] of [['daily', dailyFields], ['hourly', hourlyFields]])
          data[group].time.forEach((time, i) => {
            for (const [field, unit] of Object.entries(fields))
              insert.run(id, group, time, field, data[group][field][i], unit);
          });
        db.exec('COMMIT');
        return { id, inserted: true };
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    history(config) {
      return db.prepare('SELECT id, fetched_at, last_checked_at, payload FROM weather_downloads WHERE config = ? ORDER BY fetched_at DESC, rowid DESC LIMIT 30')
        .all(JSON.stringify(config)).map(row => ({ id: row.id, fetchedAt: row.fetched_at,
          checkedAt: row.last_checked_at, daily: JSON.parse(row.payload).daily }));
    },
    latest(config) {
      const row = db.prepare('SELECT * FROM weather_downloads WHERE config = ? ORDER BY last_checked_at DESC, rowid DESC LIMIT 1')
        .get(JSON.stringify(config));
      return row ? { id: row.id, fetched_at: row.fetched_at, last_checked_at: row.last_checked_at,
        source: row.source, kind: row.kind, data: JSON.parse(row.payload) } : null;
    },
    close: () => db.close(),
  };
}

export async function updateForecast(store, config, fetcher = fetch) {
  const data = await fetchForecast(config, fetcher);
  return store.save(data, config);
}
