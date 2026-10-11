import { createServer } from 'node:http';
import { createApiHandler } from './api.js';
const handler = createApiHandler();
const server = createServer(handler);
server.on('close', () => handler.close());
server.listen(Number(process.env.API_PORT || 3001), '127.0.0.1', () => {
  console.log(`API Agroriego disponible en http://127.0.0.1:${server.address().port}/api`);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
