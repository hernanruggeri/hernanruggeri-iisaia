import { randomUUID } from 'node:crypto';
import { openDatabase } from './database.js';

// Tests request a fresh, isolated SQLite connection explicitly.
export const createApiState = () => openDatabase(':memory:');
const allowedInputFields = new Set(['inicio', 'duracion_minutos', 'volumen_litros', 'caudal_litros_minuto', 'observaciones']);
function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}
const error = (response, status, codigo, mensaje) => json(response, status, { codigo, mensaje });
async function readJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (Buffer.byteLength(raw) > 100_000) throw new Error('PAYLOAD_TOO_LARGE');
  }
  return JSON.parse(raw || '{}');
}
function validDate(value) {
  if (typeof value !== 'string') return false;
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/);
  if (!parts || !Number.isFinite(Date.parse(value))) return false;
  const [, y, m, d, h, min, sec] = parts.map((x, i) => i > 0 && i < 7 ? Number(x) : x);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return y >= 1900 && m >= 1 && m <= 12 && d >= 1 && d <= lastDay && h < 24 && min < 60 && sec < 60;
}
export function validateIrrigationInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'El cuerpo debe ser un objeto JSON.';
  const extra = Object.keys(input).find(field => !allowedInputFields.has(field));
  if (extra) return `El campo '${extra}' no está permitido.`;
  if (!validDate(input.inicio)) return 'inicio debe ser una fecha y hora válidas con zona horaria.';
  if (!Number.isSafeInteger(input.duracion_minutos) || input.duracion_minutos < 1) return 'duracion_minutos debe ser un entero mayor o igual que 1.';
  if (!Number.isFinite(input.volumen_litros) || input.volumen_litros <= 0) return 'volumen_litros debe ser un número finito mayor que 0.';
  if (input.caudal_litros_minuto !== undefined) {
    if (!Number.isFinite(input.caudal_litros_minuto) || input.caudal_litros_minuto <= 0) return 'caudal_litros_minuto debe ser un número finito mayor que 0.';
    const volume = Math.round(input.duracion_minutos * input.caudal_litros_minuto * 100) / 100;
    if (!Number.isFinite(volume) || volume <= 0 || Math.abs(volume - input.volumen_litros) > 0.010000001)
      return 'El volumen debe coincidir con duración × caudal, con tolerancia de 0,01 litros.';
  }
  if (input.observaciones !== undefined && (typeof input.observaciones !== 'string' || input.observaciones.length > 300))
    return 'observaciones debe ser un texto de hasta 300 caracteres.';
  return null;
}
export function createApiHandler(store = openDatabase()) {
  const handler = async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (request.method === 'OPTIONS') {
        response.writeHead(204, { Allow: 'GET,POST,DELETE,OPTIONS' }); response.end(); return;
      }
      if (url.pathname === '/api/sectores') {
        if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); error(response, 405, 'METODO_NO_PERMITIDO', 'Usar GET.'); return; }
        json(response, 200, store.listSectors()); return;
      }
      const match = url.pathname.match(/^\/api\/sectores\/([^/]+)\/riegos(?:\/([^/]+))?$/);
      if (!match) { error(response, 404, 'RUTA_NO_ENCONTRADA', 'La ruta solicitada no existe.'); return; }
      let sectorId, irrigationId;
      try { sectorId = decodeURIComponent(match[1]); irrigationId = match[2] ? decodeURIComponent(match[2]) : null; }
      catch { error(response, 400, 'RUTA_INVALIDA', 'Identificador inválido.'); return; }
      if (!store.findSector(sectorId)) { error(response, 404, 'SECTOR_NO_ENCONTRADO', 'El sector solicitado no existe.'); return; }
      if (irrigationId) {
        if (request.method !== 'DELETE') { response.setHeader('Allow', 'DELETE'); error(response, 405, 'METODO_NO_PERMITIDO', 'Usar DELETE.'); return; }
        if (!store.deleteIrrigation(sectorId, irrigationId)) { error(response, 404, 'RIEGO_NO_ENCONTRADO', 'El riego no existe en este sector.'); return; }
        response.writeHead(204); response.end(); return;
      }
      if (request.method === 'GET') { json(response, 200, store.listIrrigations(sectorId)); return; }
      if (request.method !== 'POST') { response.setHeader('Allow', 'GET, POST'); error(response, 405, 'METODO_NO_PERMITIDO', 'Usar GET o POST.'); return; }
      let input;
      try { input = await readJson(request); }
      catch (cause) {
        const large = cause.message === 'PAYLOAD_TOO_LARGE';
        error(response, large ? 413 : 400, large ? 'CUERPO_DEMASIADO_GRANDE' : 'CUERPO_INVALIDO', large ? 'El cuerpo supera 100 KB.' : 'El cuerpo debe contener JSON válido.'); return;
      }
      const invalid = validateIrrigationInput(input);
      if (invalid) { error(response, 400, 'RIEGO_INVALIDO', invalid); return; }
      const irrigation = store.addIrrigation({ ...input, id: randomUUID(), sector_id: sectorId, inicio: new Date(input.inicio).toISOString() });
      json(response, 201, irrigation);
    } catch (cause) {
      console.error('Fallo interno de la API:', cause.name);
      error(response, 500, 'ERROR_INTERNO', 'No se pudo completar la operación.');
    }
  };
  handler.close = () => store.close();
  return handler;
}
