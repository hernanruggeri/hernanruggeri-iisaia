import { useEffect, useState } from 'react';
const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const format = value => new Date(value).toLocaleString('es-AR', {timeZone:'America/Argentina/Buenos_Aires',hourCycle:'h23'});
const number = (v, unit) => Number.isFinite(v) ? `${v.toLocaleString('es-AR')} ${unit}` : 'Sin dato';
export function WeatherHistory() {
  const [versions,setVersions]=useState([]);
  const [selected,setSelected]=useState('');
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let active=true;setBusy(true);
    fetch(`${base}/meteorologia?history=1`).then(async r=>{if(!r.ok)throw new Error();return r.json();})
      .then(data=>{if(active){setVersions(data.versions);setSelected(data.versions[0]?.id || '');setError('');}})
      .catch(()=>{if(active)setError('No se pudo consultar el historial meteorológico guardado.');})
      .finally(()=>{if(active)setBusy(false);});
    return()=>{active=false;};
  },[retry]);
  const version=versions.find(v=>v.id===selected);
  return <section className="panel weather-panel" aria-labelledby="weather-history-title">
    <div className="panel-heading"><div><h2 id="weather-history-title">Pronósticos meteorológicos guardados</h2>
      <p>Fuente: Open-Meteo · Hasta 30 versiones recientes. Datos previstos para la zona; no representan lluvia observada.</p></div>
      <button className="secondary-button" disabled={busy} onClick={()=>setRetry(v=>v+1)}>{busy?'Cargando…':'Recargar historial'}</button></div>
    {error && <p role="alert" className="error-message">{error}</p>}
    {!busy && versions.length===0 && <p>Sin pronósticos guardados.</p>}
    {versions.length>0 && <><label htmlFor="forecast-version">Versión guardada</label>{' '}
      <select id="forecast-version" value={selected} onChange={e=>setSelected(e.target.value)}>
        {versions.map(v=><option key={v.id} value={v.id}>Primera descarga: {format(v.fetchedAt)}</option>)}
      </select>
      {version && <><p>Última consulta con estos mismos valores: {format(version.checkedAt)}. Horario de Buenos Aires.</p>
      <div className="weather-table-scroll"><table><thead><tr><th>Fecha prevista</th><th>Precipitación prevista</th><th>Probabilidad máxima</th><th>Mínima</th><th>Máxima</th><th>ET₀</th></tr></thead>
        <tbody>{version.daily.time.map((day,i)=><tr key={day}><td>{day.split('-').reverse().join('/')}</td>
          <td>{number(version.daily.precipitation_sum[i],'mm')}</td><td>{number(version.daily.precipitation_probability_max[i],'%')}</td>
          <td>{number(version.daily.temperature_2m_min[i],'°C')}</td><td>{number(version.daily.temperature_2m_max[i],'°C')}</td>
          <td>{number(version.daily.et0_fao_evapotranspiration[i],'mm/día')}</td></tr>)}</tbody></table></div></>}
      <p>Las consultas idénticas no crean otra versión. El selector de sector y período de riegos no modifica estos pronósticos.</p></>}
  </section>;
}
