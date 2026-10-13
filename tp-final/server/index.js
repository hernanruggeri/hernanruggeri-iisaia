import { createWeatherHandler } from './weather-api.js';
import { createServer } from 'node:http';
import { createApiHandler } from './api.js';
const handler = createApiHandler();
const weatherHandler = createWeatherHandler();
const server = createServer((request, response) => {
  if (new URL(request.url, 'http://localhost').pathname === '/api/meteorologia') return weatherHandler(request, response);
  return handler(request, response);
});
server.on('close', () => { handler.close(); weatherHandler.close(); });
server.listen(Number(process.env.API_PORT || 3001), '127.0.0.1', () => {
  console.log(`API Agroriego disponible en http://127.0.0.1:${server.address().port}/api`);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
