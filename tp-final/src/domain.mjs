export const estimatedVolume = (duration, flow) => Math.round(duration * flow * 100) / 100;
export function buenosAiresDay(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function buenosAiresNow() {
  const date = new Date();
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  return `${buenosAiresDay(date)}T${time}`;
}
export function dailyLiters(records, now = new Date()) {
  return Math.round(records.filter(r => buenosAiresDay(r.start) === buenosAiresDay(now)).reduce((total, r) => total + r.volume, 0) * 100) / 100;
}
export function filterRecords(records, sectorId, period, now = new Date()) {
  const days = { '24h': 1, '7d': 7, '30d': 30 };
  const end = new Date(now).getTime();
  return records.filter(r => {
    if (sectorId !== 'todos' && r.sectorId !== sectorId) return false;
    if (period === 'todo') return true;
    const time = new Date(r.start).getTime();
    return time <= end && time >= end - days[period] * 86400000;
  });
}
