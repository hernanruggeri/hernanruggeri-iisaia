import { weatherConfig, openWeatherStore, updateForecast } from '../server/weather.js';

let store;
try {
  const config = weatherConfig();
  store = openWeatherStore();
  const action = process.argv[2] || 'update';
  if (!['update', 'show'].includes(action)) throw new Error('Usar update o show.');
  if (action === 'update') {
    try {
      const result = await updateForecast(store, config);
      console.log(result.inserted ? 'Pronóstico guardado en SQLite.' : 'Pronóstico sin cambios; consulta actualizada.');
    } catch {
      console.error('No se pudo actualizar el pronóstico. Se conserva el último guardado.');
      process.exitCode = 1;
    }
  }
  const saved = store.latest(config);
  if (!saved) console.log('Sin dato meteorológico guardado.');
  else {
    console.log(`Fuente: Open-Meteo | Tipo: pronóstico | Última consulta exitosa: ${saved.last_checked_at}`);
    console.table(saved.data.daily.time.map((fecha, i) => ({ fecha,
      minima_C: saved.data.daily.temperature_2m_min[i], maxima_C: saved.data.daily.temperature_2m_max[i],
      precipitacion_mm: saved.data.daily.precipitation_sum[i],
      probabilidad_pct: saved.data.daily.precipitation_probability_max[i],
      ET0_mm: saved.data.daily.et0_fao_evapotranspiration[i] })));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { store?.close(); }
