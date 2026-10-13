import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDatabase } from '../server/database.js';
import { weatherConfig, validateForecast, openWeatherStore, updateForecast } from '../server/weather.js';
const env = { WEATHER_PROVIDER: 'open-meteo', WEATHER_LATITUDE: '-34', WEATHER_LONGITUDE: '-58', WEATHER_TIMEZONE: 'America/Argentina/Buenos_Aires', WEATHER_FORECAST_DAYS: '1' };
const config = weatherConfig(env);
function fixture() {
 return { timezone: config.timezone, daily_units: { temperature_2m_max: '°C', temperature_2m_min: '°C', precipitation_sum: 'mm', precipitation_probability_max: '%', et0_fao_evapotranspiration: 'mm' }, hourly_units: { temperature_2m: '°C', relative_humidity_2m: '%' }, daily: { time: ['2026-10-12'], temperature_2m_max: [20], temperature_2m_min: [10], precipitation_sum: [0.9], precipitation_probability_max: [45], et0_fao_evapotranspiration: [1.75] }, hourly: { time: ['2026-10-12T00:00'], temperature_2m: [null], relative_humidity_2m: [80] } };
}
test('configuración y respuesta inválidas se rechazan; null permanece ausente', () => {
 for (const override of [{WEATHER_LATITUDE:''}, {WEATHER_LATITUDE:'91'}, {WEATHER_FORECAST_DAYS:'1.5'}, {WEATHER_TIMEZONE:'no-valida'}]) assert.throws(() => weatherConfig({...env,...override}));
 const data=fixture(); assert.equal(validateForecast(data,config).hourly.temperature_2m[0],null);
 data.daily_units.precipitation_sum='inch'; assert.throws(()=>validateForecast(data,config));
 data.daily_units.precipitation_sum='mm'; data.daily.precipitation_probability_max[0]=101; assert.throws(()=>validateForecast(data,config));
});
test('persistencia, versiones, deduplicación y fallas sin alterar riegos', async () => {
 const dir=await mkdtemp(join(tmpdir(),'weather-')); const path=join(dir,'test.sqlite'); let store;
 try {
 const irrigation=openDatabase(path); const before=irrigation.listIrrigations('s1'); irrigation.close();
 store=openWeatherStore(path); const first=store.save(fixture(),config,'2026-10-11T20:00:00Z'); assert.equal(first.inserted,true);
 store.close(); store=openWeatherStore(path); assert.equal(store.latest(config).id,first.id); assert.equal(store.latest(config).data.hourly.temperature_2m[0],null);
 assert.equal(store.save(fixture(),config,'2026-10-11T21:00:00Z').inserted,false); assert.equal(store.latest(config).fetched_at,'2026-10-11T20:00:00Z'); assert.equal(store.latest(config).last_checked_at,'2026-10-11T21:00:00Z');
 const changed=fixture(); changed.daily.precipitation_sum[0]=2; const second=store.save(changed,config,'2026-10-11T22:00:00Z'); assert.notEqual(second.id,first.id);
 assert.equal(store.history(config).length,2); assert.equal(store.history(config)[0].id,second.id);
 assert.equal(JSON.stringify(store.history(config)).includes('latitude'),false);
 await assert.rejects(updateForecast(store,config,async()=>{throw new Error('offline');}));
 await assert.rejects(updateForecast(store,config,async()=>({ok:false,status:503})));
 const invalid=fixture(); invalid.daily.precipitation_sum[0]=-1;
 await assert.rejects(updateForecast(store,config,async()=>({ok:true,json:async()=>invalid})));
 assert.equal(store.latest(config).id,second.id);
 await updateForecast(store,config,async()=>({ok:true,json:async()=>changed})); assert.equal(store.latest(config).id,second.id);
 assert.equal(store.latest({...config,latitude:-33}),null);
 store.close(); store=null; const reopened=openDatabase(path); assert.deepEqual(reopened.listIrrigations('s1'),before); reopened.close();
 } finally {store?.close(); await rm(dir,{recursive:true,force:true});}
});
