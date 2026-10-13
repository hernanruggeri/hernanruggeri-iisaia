import { useEffect, useState } from 'react';
const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const value = (v, unit) => Number.isFinite(v) ? `${v.toLocaleString('es-AR')} ${unit}` : 'Sin dato';
export function WeatherPanel({ onWeather }) {
  const [weather, setWeather] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = async () => {
      try { const r = await fetch(`${base}/meteorologia`); if (!r.ok) throw new Error();
        const data = await r.json(); if (active) { setWeather(data); onWeather?.(data); setError(''); } }
      catch { if (active) { setError('No se pudo consultar la meteorología.'); onWeather?.(previous => previous ? { ...previous, unavailable: true } : null); } }
    };
    load(); const timer = setInterval(load, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [onWeather]);
  const update = async () => {
    setBusy(true); setError('');
    try {
      const r = await fetch(`${base}/meteorologia`, { method: 'POST', headers: {'Content-Type':'application/json'} });
      const data = await r.json(); setWeather(data); onWeather?.(data);
      if (!r.ok) setError(data.error || 'No se pudo actualizar el pronóstico.');
    } catch { setError('No se pudo actualizar. Se muestra el último resultado disponible.'); }
    finally { setBusy(false); }
  };
  const daily = weather?.daily;
  return <section className="panel weather-panel" aria-labelledby="weather-title">
    <div className="panel-heading"><div><h2 id="weather-title">Pronóstico meteorológico</h2>
      <p>Fuente: Open-Meteo · Estimaciones de modelos para la zona, sin mediciones de la huerta.</p></div>
      <button className="secondary-button" onClick={update} disabled={busy || weather?.updating || !weather?.configured}>
        {busy || weather?.updating ? 'Actualizando pronóstico…' : 'Actualizar pronóstico'}</button></div>
    <p>Última consulta del pronóstico: {weather?.checkedAt ? new Date(weather.checkedAt).toLocaleString('es-AR', {timeZone:'America/Argentina/Buenos_Aires', hourCycle:'h23'}) : 'Sin dato'}</p>
    {(error || weather?.error) && <p role="alert" className="error-message">{error || weather.error}</p>}
    {weather?.stale && daily && <p role="status">Pronóstico desactualizado: pasaron más de seis horas desde la consulta.</p>}
    {!daily ? <p>{weather === null ? 'Cargando meteorología…' : 'Sin dato meteorológico guardado.'}</p> :
    <div className="weather-table-scroll"><table><thead><tr><th>Fecha</th><th>Mínima</th><th>Máxima</th><th>Precipitación prevista</th><th>Probabilidad máxima</th><th>ET₀</th></tr></thead>
      <tbody>{daily.time.map((day,i)=><tr key={day}><td>{day.split('-').reverse().join('/')}</td>
        <td>{value(daily.temperature_2m_min[i],'°C')}</td><td>{value(daily.temperature_2m_max[i],'°C')}</td>
        <td>{value(daily.precipitation_sum[i],'mm')}</td><td>{value(daily.precipitation_probability_max[i],'%')}</td>
        <td>{value(daily.et0_fao_evapotranspiration[i],'mm/día')}</td></tr>)}</tbody></table></div>}
    <p>ET₀: evapotranspiración de referencia; no equivale directamente al requerimiento de cada cultivo.</p>
  </section>;
}
