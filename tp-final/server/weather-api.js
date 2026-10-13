import { weatherConfig, openWeatherStore, updateForecast } from './weather.js';
export function weatherForNow(data, timezone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const part = name => parts.find(p => p.type === name).value;
  const date = `${part('year')}-${part('month')}-${part('day')}`;
  const hour = `${date}T${part('hour')}:00`;
  const hi = data?.hourly?.time?.indexOf(hour) ?? -1;
  const di = data?.daily?.time?.indexOf(date) ?? -1;
  return { hour: hi >= 0 ? hour : null, temperature: hi >= 0 ? data.hourly.temperature_2m[hi] : null,
    humidity: hi >= 0 ? data.hourly.relative_humidity_2m[hi] : null,
    date, precipitation: di >= 0 ? data.daily.precipitation_sum[di] : null };
}
export const demoWeatherConfig = Object.freeze({ latitude: -34.6037, longitude: -58.3816,
  timezone: 'America/Argentina/Buenos_Aires', days: 3 });
export const weatherIntervalMs = 3 * 60 * 60 * 1000;
export function createWeatherHandler(options = {}) {
  let config, store, configurationError = '', pending = null, lastError = '', closed = false, timer = null;
  let mode = 'privada';
  const schedule = options.schedule || setInterval;
  const unschedule = options.unschedule || clearInterval;
  if (options.config) config = options.config;
  else if (process.env.WEATHER_PROVIDER) {
    try { config = weatherConfig(); } catch { configurationError = 'Configuración meteorológica inválida.'; }
  }
  else if (options.demo) { config = { ...demoWeatherConfig }; mode = 'demo'; }
  if (config) store = options.store || openWeatherStore();
  const refresh = () => {
    if (!pending) pending = updateForecast(store, config, options.fetcher).then(() => { lastError = ''; })
      .catch(() => { lastError = 'No se pudo actualizar. Se conserva el último pronóstico guardado.'; })
      .finally(() => { pending = null; if (closed) store.close(); });
    return pending;
  };
  const snapshot = () => {
    const saved = store?.latest(config);
    return { configured: Boolean(config), updating: Boolean(pending), error: configurationError || lastError,
      source: 'Open-Meteo', kind: 'pronostico', mode, locationLabel: mode === 'demo' ? 'Demostración pública — Buenos Aires (zona del Obelisco), no corresponde a la huerta' : 'Ubicación configurada en privado', intervalHours: timer ? 3 : null, checkedAt: saved?.last_checked_at || null,
      stale: !saved || Date.now() - Date.parse(saved.last_checked_at) > 6 * 3600000,
      current: config ? weatherForNow(saved?.data, config.timezone) : null,
      daily: saved?.data.daily || null };
  };
  if (store && options.autoUpdate !== false) {
    refresh();
    timer = schedule(() => { if (!closed) refresh(); }, weatherIntervalMs);
    timer?.unref?.();
  }
  const handler = async (request, response) => {
    const write = (status, body) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(body)); };
    if (!['GET','POST'].includes(request.method)) { response.setHeader('Allow','GET, POST'); write(405,{mensaje:'Usar GET o POST.'}); return; }
    if (request.method === 'POST') {
      // JSON custom header prevents cross-origin forms from triggering an external query.
      if (!String(request.headers['content-type']).startsWith('application/json')) { write(415,{mensaje:'Usar application/json.'}); return; }
      if (!store) { write(503,{...snapshot(),error:configurationError || 'Meteorología sin configurar.'}); return; }
      await refresh();
    }
    if (request.method === 'GET' && new URL(request.url, 'http://localhost').searchParams.get('history') === '1') {
      write(200, { source: 'Open-Meteo', kind: 'pronostico', mode, locationLabel: mode === 'demo' ? 'Demostración pública — Buenos Aires (zona del Obelisco), no corresponde a la huerta' : 'Ubicación configurada en privado', versions: store ? store.history(config) : [] }); return;
    }
    write(lastError && request.method === 'POST' ? 502 : 200, snapshot());
  };
  handler.close = () => { closed = true; if (timer !== null) { unschedule(timer); timer = null; } if (!pending) store?.close(); };
  return handler;
}
