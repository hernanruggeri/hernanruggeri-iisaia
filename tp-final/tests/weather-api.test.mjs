import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createWeatherHandler } from '../server/weather-api.js';
async function serve(handler, check) {const server=createServer(handler);await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await check(`http://127.0.0.1:${server.address().port}/api/meteorologia`);}finally{await new Promise(r=>server.close(r));handler.close();}}
test('API oculta ubicación, rechaza formularios y conserva datos ante falla',async()=>{
 const config={latitude:-34,longitude:-58,timezone:'America/Argentina/Buenos_Aires',days:1};
 const saved={last_checked_at:new Date().toISOString(),data:{latitude:-34,longitude:-58,daily:{time:['2026-10-12'],precipitation_sum:[0]}}};
 const handler=createWeatherHandler({config,autoUpdate:false,store:{latest:()=>saved,history:()=>[{id:"version",daily:saved.data.daily}],close:()=>{}},fetcher:async()=>{throw new Error('offline');}});
 await serve(handler,async url=>{const data=await(await fetch(url)).json();assert.equal(data.daily.precipitation_sum[0],0);assert.equal(JSON.stringify(data).includes('latitude'),false);assert.equal(JSON.stringify(data).includes('longitude'),false);
 const history=await(await fetch(`${url}?history=1`)).json(); assert.equal(history.versions.length,1);assert.equal(JSON.stringify(history).includes('latitude'),false);
 assert.equal((await fetch(url,{method:'POST'})).status,415);
 const update=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'}});assert.equal(update.status,502);assert.deepEqual((await update.json()).daily,data.daily);assert.equal((await fetch(url,{method:'DELETE'})).status,405);});
});
test('sin configuración devuelve ausencia y no actualiza',async()=>{
 const previous=process.env.WEATHER_PROVIDER;delete process.env.WEATHER_PROVIDER;const handler=createWeatherHandler({autoUpdate:false});if(previous!==undefined)process.env.WEATHER_PROVIDER=previous;
 await serve(handler,async url=>{const data=await(await fetch(url)).json();assert.equal(data.configured,false);assert.equal(data.daily,null);assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'}})).status,503);});
});

test('selecciona hora y día de Buenos Aires; datos faltantes no se sustituyen por simulados', async () => {
 const { weatherForNow } = await import('../server/weather-api.js');
 const data={hourly:{time:['2026-10-11T20:00'],temperature_2m:[18],relative_humidity_2m:[70]},daily:{time:['2026-10-11'],precipitation_sum:[0]}};
 const current=weatherForNow(data,'America/Argentina/Buenos_Aires',new Date('2026-10-11T23:30:00Z'));
 assert.equal(current.temperature,18);assert.equal(current.humidity,70);assert.equal(current.precipitation,0);
 const missing=weatherForNow(data,'America/Argentina/Buenos_Aires',new Date('2026-10-12T23:30:00Z'));
 assert.equal(missing.temperature,null);assert.equal(missing.precipitation,null);
});

test('demo pública al iniciar, intervalo de tres horas, cierre y precedencia privada', async () => {
 const {weatherIntervalMs,demoWeatherConfig}=await import('../server/weather-api.js');
 let tick,scheduledMs,cleared=false,closed=false,calls=0;
 const handler=createWeatherHandler({demo:true,store:{latest:()=>null,close:()=>{closed=true;}},
   fetcher:async url=>{calls++;assert.equal(url.searchParams.get('latitude'),String(demoWeatherConfig.latitude));throw new Error('offline');},
   schedule:(cb,ms)=>{tick=cb;scheduledMs=ms;return 7;},unschedule:id=>{assert.equal(id,7);cleared=true;}});
 await new Promise(r=>setImmediate(r));assert.equal(calls,1);assert.equal(scheduledMs,weatherIntervalMs);assert.equal(scheduledMs,10800000);
 tick();await new Promise(r=>setImmediate(r));assert.equal(calls,2);
 handler.close();assert.equal(cleared,true);assert.equal(closed,true);tick();assert.equal(calls,2);
 const names=['WEATHER_PROVIDER','WEATHER_LATITUDE','WEATHER_LONGITUDE','WEATHER_TIMEZONE','WEATHER_FORECAST_DAYS'];
 const previous=Object.fromEntries(names.map(n=>[n,process.env[n]]));
 Object.assign(process.env,{WEATHER_PROVIDER:'open-meteo',WEATHER_LATITUDE:'-33',WEATHER_LONGITUDE:'-57',WEATHER_TIMEZONE:'America/Argentina/Buenos_Aires',WEATHER_FORECAST_DAYS:'1'});
 try{const privateHandler=createWeatherHandler({demo:true,autoUpdate:false,store:{latest:()=>null,close:()=>{}}});
 await serve(privateHandler,async url=>{const data=await(await fetch(url)).json();assert.equal(data.mode,'privada');assert.equal(data.locationLabel.includes('Obelisco'),false);});}
 finally{for(const n of names){if(previous[n]===undefined)delete process.env[n];else process.env[n]=previous[n];}}
});
