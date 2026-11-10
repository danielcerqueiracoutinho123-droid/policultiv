'use strict';

/* =============================================================
   Policultiva — lógica da aplicação
   - Dados salvos no próprio navegador (localStorage)
   - Previsão do tempo: Open-Meteo (gratuita, sem chave de API)
   - Dispositivos: placas ESP32 na rede local, via HTTP
   ============================================================= */

/* ---------------- Ícones (Lucide — licença ISC) ---------------- */
const ICONS = {
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  droplets: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  up: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  down: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  rain: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
  shovel: '<path d="M2 22v-5l5-5 5 5-5 5z"/><path d="M9.5 14.5 16 8"/><path d="m17 2 5 5-.5.5a3.53 3.53 0 0 1-5 0s0 0 0 0a3.53 3.53 0 0 1 0-5L17 2"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
};

function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/** Insere o SVG nos elementos estáticos marcados com data-icon="nome". */
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (el.dataset.iconReady) return;
    el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon));
    el.dataset.iconReady = '1';
  });
}

/* ---------------- Catálogo agronômico ----------------
   cycle: dias até a colheita · min/max: umidade ideal do solo (%)
   companions: bons consórcios · avoid: evitar no mesmo talhão      */
const CATALOG = {
  'Feijão':   { cycle: 90,   min: 40, max: 60, companions: ['Milho', 'Mandioca', 'Abóbora', 'Couve', 'Ervilha'], avoid: ['Cebola', 'Alho'] },
  'Milho':    { cycle: 120,  min: 45, max: 65, companions: ['Feijão', 'Abóbora', 'Ervilha', 'Amendoim'], avoid: ['Tomate'] },
  'Mandioca': { cycle: 300,  min: 30, max: 50, companions: ['Feijão', 'Milho', 'Amendoim'], avoid: [] },
  'Abóbora':  { cycle: 110,  min: 50, max: 70, companions: ['Milho', 'Feijão'], avoid: ['Batata'] },
  'Couve':    { cycle: 80,   min: 60, max: 80, companions: ['Feijão', 'Alface', 'Cebola', 'Beterraba'], avoid: ['Tomate', 'Morango'] },
  'Ervilha':  { cycle: 70,   min: 50, max: 70, companions: ['Milho', 'Cenoura', 'Feijão'], avoid: ['Cebola', 'Alho'] },
  'Tomate':   { cycle: 110,  min: 60, max: 80, companions: ['Manjericão', 'Cenoura', 'Alface', 'Cebola'], avoid: ['Milho', 'Couve', 'Batata'] },
  'Alface':   { cycle: 50,   min: 60, max: 80, companions: ['Cenoura', 'Rabanete', 'Tomate', 'Couve'], avoid: ['Salsa'] },
  'Cebola':   { cycle: 140,  min: 50, max: 70, companions: ['Tomate', 'Cenoura', 'Alface', 'Beterraba'], avoid: ['Feijão', 'Ervilha'] },
  'Cenoura':  { cycle: 100,  min: 50, max: 70, companions: ['Alface', 'Cebola', 'Ervilha', 'Tomate'], avoid: [] },
  'Beterraba':{ cycle: 70,   min: 55, max: 75, companions: ['Alface', 'Cebola', 'Couve'], avoid: [] },
  'Batata':   { cycle: 100,  min: 60, max: 80, companions: ['Feijão', 'Milho', 'Couve'], avoid: ['Tomate', 'Abóbora'] },
  'Amendoim': { cycle: 120,  min: 40, max: 60, companions: ['Milho', 'Mandioca'], avoid: [] },
  'Pimentão': { cycle: 120,  min: 60, max: 75, companions: ['Cebola', 'Cenoura', 'Manjericão'], avoid: ['Feijão'] },
  'Melancia': { cycle: 90,   min: 45, max: 65, companions: ['Milho'], avoid: ['Batata'] },
  'Soja':     { cycle: 120,  min: 45, max: 65, companions: ['Milho'], avoid: [] },
  'Arroz':    { cycle: 120,  min: 70, max: 90, companions: [], avoid: [] },
  'Banana':   { cycle: 365,  min: 55, max: 75, companions: ['Mandioca', 'Café', 'Cacau', 'Açaí'], avoid: [] },
  'Café':     { cycle: 730,  min: 45, max: 65, companions: ['Banana', 'Feijão', 'Milho'], avoid: [] },
  'Cacau':    { cycle: 1095, min: 60, max: 80, companions: ['Banana', 'Açaí'], avoid: [] },
  'Açaí':     { cycle: 1095, min: 65, max: 85, companions: ['Banana', 'Mandioca', 'Cacau'], avoid: [] },
};

const SOILS = ['Arenoso', 'Argiloso', 'Areno-argiloso', 'Siltoso', 'Orgânico', 'Humoso', 'Calcário', 'Misto'];
const IRRIGATION = ['Automática', 'Manual'];

const DEVICE_TYPES = {
  sensor:   { label: 'Sensor de umidade', icon: 'gauge' },
  regador:  { label: 'Regador',           icon: 'droplets' },
  drenador: { label: 'Drenador',          icon: 'waves' },
};

/* Estados brasileiros (coordenadas da capital, usadas na previsão do tempo) */
const UFS = [
  ['AC', 'Acre', -9.97, -67.81], ['AL', 'Alagoas', -9.67, -35.74], ['AP', 'Amapá', 0.03, -51.07],
  ['AM', 'Amazonas', -3.12, -60.02], ['BA', 'Bahia', -12.97, -38.5], ['CE', 'Ceará', -3.73, -38.53],
  ['DF', 'Distrito Federal', -15.79, -47.88], ['ES', 'Espírito Santo', -20.32, -40.34], ['GO', 'Goiás', -16.68, -49.25],
  ['MA', 'Maranhão', -2.53, -44.3], ['MT', 'Mato Grosso', -15.6, -56.1], ['MS', 'Mato Grosso do Sul', -20.47, -54.62],
  ['MG', 'Minas Gerais', -19.92, -43.94], ['PA', 'Pará', -1.46, -48.49], ['PB', 'Paraíba', -7.12, -34.86],
  ['PR', 'Paraná', -25.43, -49.27], ['PE', 'Pernambuco', -8.05, -34.88], ['PI', 'Piauí', -5.09, -42.8],
  ['RJ', 'Rio de Janeiro', -22.91, -43.17], ['RN', 'Rio Grande do Norte', -5.79, -35.21], ['RS', 'Rio Grande do Sul', -30.03, -51.23],
  ['RO', 'Rondônia', -8.76, -63.9], ['RR', 'Roraima', 2.82, -60.67], ['SC', 'Santa Catarina', -27.6, -48.55],
  ['SP', 'São Paulo', -23.55, -46.63], ['SE', 'Sergipe', -10.91, -37.07], ['TO', 'Tocantins', -10.18, -48.33],
].map(([uf, name, lat, lon]) => ({ uf, name, lat, lon }));

const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const WEEK_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TABS = ['visao', 'recomendacoes', 'irrigacao', 'dispositivos', 'financeiro', 'culturas'];

/* ---------------- Utilidades ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p = 'id') => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const round1 = (v) => Math.round(Number(v) * 10) / 10;
const round2 = (v) => Math.round(Number(v) * 100) / 100;
const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
const toBool = (v) => v === true || v === 1 || ['1', 'on', 'true', 'ligado', 'high'].includes(String(v).toLowerCase());
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const fmtNum = (v) => String(round2(Number(v) || 0));
const money = (v) => `R$ ${(Number(v) || 0).toFixed(2)}`;
const fmtMm = (v) => `${String(round1(v)).replace('.', ',')} mm`;
const fmtK = (litros) => `${((Number(litros) || 0) / 1000).toFixed(1)}k L`;

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => toISO(new Date());
const parseISO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtDate = (iso) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const fmtShort = (iso) => { const [, m, d] = iso.split('-'); return `${d}/${m}`; };
const fmtDateTime = (v) => { const d = new Date(v); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

const catalogKey = (name) => Object.keys(CATALOG).find((k) => norm(k) === norm(name));
const resolveRegion = (text) => {
  const n = norm(text);
  return UFS.find((u) => norm(u.name) === n || norm(u.uf) === n)
    || UFS.find((u) => n && norm(u.name).startsWith(n))
    || UFS.find((u) => u.uf === 'DF');
};

/* ---------------- Estado e persistência ---------------- */
const STORAGE_KEY = 'policultiva:v1';
const busy = new Set(); // dispositivos com requisição em andamento

function emptyData() {
  return { version: 1, user: { name: '', region: 'Pará' }, plots: [], crops: [], transactions: [], devices: [], forecast: null };
}

/** Dados de exemplo — os mesmos das telas originais. */
function sampleData() {
  return {
    version: 1,
    user: { name: 'daniel', region: 'Pará' },
    plots: [
      { id: 'plot-cebola', name: 'cebola', area: 32, soil: 'Arenoso', state: 'para', water: 0, irrigation: 'Automática' },
      { id: 'plot-pinda', name: 'pindamoiangaba resenha', area: 5000, soil: 'Orgânico', state: 'Pará', water: 0, irrigation: 'Automática' },
    ],
    crops: [
      { id: 'crop-feijao', plotId: 'plot-pinda', name: 'Feijão', variety: 'carioca', area: 200, plantedAt: '2026-12-08', harvestAt: '2026-11-24', moisture: 50, min: 40, max: 60, target: 50 },
    ],
    transactions: [
      { id: 'tx-aipim', desc: 'vendadendo aimpim', type: 'receita', value: 67000, category: 'turberculo', date: '2026-11-09', cropId: '', cropName: '', createdAt: 2 },
      { id: 'tx-tomate', desc: 'tomate', type: 'despesa', value: 42000, category: 'fruto', date: '2026-11-09', cropId: '', cropName: '', createdAt: 1 },
    ],
    devices: [],
    forecast: null,
  };
}

function normalize(d) {
  const base = emptyData();
  const arr = (v) => (Array.isArray(v) ? v : []);
  return {
    ...base,
    ...d,
    user: { ...base.user, ...(d && d.user) },
    plots: arr(d && d.plots),
    crops: arr(d && d.crops),
    transactions: arr(d && d.transactions),
    devices: arr(d && d.devices),
    forecast: (d && d.forecast) || null,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (err) {
    console.warn('Não foi possível ler os dados salvos:', err);
  }
  return sampleData();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Não foi possível salvar:', err);
  }
}

let state = load();

/* ---------------- Consultas ---------------- */
const findPlot = (id) => state.plots.find((p) => p.id === id);
const findCrop = (id) => state.crops.find((c) => c.id === id);
const findDevice = (id) => state.devices.find((d) => d.id === id);
const cropsOf = (plotId) => state.crops.filter((c) => c.plotId === plotId);
const plotName = (id) => findPlot(id)?.name ?? '—';

function cropStatus(c) {
  if (c.moisture < c.min) return { key: 'low', label: 'Precisa regar', icon: 'droplets' };
  if (c.moisture > c.max) return { key: 'high', label: 'Encharcado', icon: 'waves' };
  return { key: 'ok', label: 'Tudo certo', icon: 'check' };
}

function totals() {
  let income = 0;
  let expense = 0;
  state.transactions.forEach((t) => {
    if (t.type === 'receita') income += Number(t.value) || 0;
    else expense += Number(t.value) || 0;
  });
  return { income, expense, balance: income - expense };
}

function cropOptions(selected = '') {
  return state.crops.map((c) => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${esc(c.name)}${c.variety ? ' · ' + esc(c.variety) : ''} — ${esc(plotName(c.plotId))}</option>`).join('');
}

const emptyCard = (ic, text, btn = '') => `<div class="card empty">${icon(ic)}<p>${text}</p>${btn}</div>`;

/* =============================================================
   Renderização
   ============================================================= */
function render() {
  renderHeader();
  renderOverview();
  renderRecommendations();
  renderIrrigation();
  renderDevices();
  renderFinance();
  renderCrops();
}

function renderHeader() {
  $('#greeting').textContent = state.user.name ? `Olá, ${state.user.name}!` : 'Olá!';
}

/* ---------- Visão geral ---------- */
function renderOverview() {
  const area = state.plots.reduce((s, p) => s + (Number(p.area) || 0), 0);
  const water = state.plots.reduce((s, p) => s + (Number(p.water) || 0), 0);
  const alerts = state.crops.filter((c) => cropStatus(c).key !== 'ok').length;
  const { balance } = totals();

  const stat = (ic, tone, label, value) => `
    <div class="card stat">
      <div class="stat__icon ${tone}">${icon(ic)}</div>
      <p class="stat__label">${label}</p>
      <p class="stat__value">${value}</p>
    </div>`;

  $('#stats').innerHTML = [
    stat('layers', 'tone-emerald', 'Área total', `${area.toFixed(1)} ha`),
    stat('droplets', 'tone-blue', 'Água disponível', fmtK(water)),
    stat('sprout', 'tone-green', 'Culturas ativas', state.crops.length),
    stat('alert', 'tone-amber', 'Alertas de umidade', alerts),
    stat('wallet', 'tone-emerald', 'Saldo financeiro', money(balance)),
  ].join('');

  $('#plotGrid').innerHTML = state.plots.length
    ? state.plots.map(plotCard).join('')
    : `<div style="grid-column:1/-1">${emptyCard('layers', 'Nenhum talhão cadastrado ainda. Cadastre o primeiro para organizar suas culturas.',
      `<button class="btn btn--primary" type="button" data-action="new-plot">${icon('plus')} Talhão</button>`)}</div>`;
}

function plotCard(p) {
  const crops = cropsOf(p.id);
  return `
    <article class="card plot-card" data-action="edit-plot" data-id="${p.id}" tabindex="0" role="button" aria-label="Editar talhão ${esc(p.name)}">
      <div class="plot-card__head">
        <h3>${esc(p.name)}</h3>
        <span class="muted">${esc(p.state)}</span>
      </div>
      <p class="plot-card__meta">
        <span>${fmtNum(p.area)} ha</span>
        <span>Solo: ${esc(p.soil)}</span>
        <span>Água: ${fmtK(p.water)}</span>
        <span>Irrigação: ${esc(p.irrigation)}</span>
      </p>
      ${crops.length
        ? `<div class="chips">${crops.map((c) => `<span class="chip chip--${cropStatus(c).key}">${esc(c.name)} · ${Math.round(c.moisture)}%</span>`).join('')}</div>`
        : '<p class="muted">Sem culturas neste talhão.</p>'}
    </article>`;
}

/* ---------- Recomendações ---------- */
function renderCompanions() {
  const box = $('#companions');
  const planted = [...new Set(state.crops.map((c) => catalogKey(c.name) || c.name))];
  const title = `<h3 class="companions__title">${icon('leaf')} Consórcios — o que dá certo plantar junto</h3>`;

  if (!planted.length) {
    box.innerHTML = `${title}<p class="companions__text">Cadastre uma cultura para ver o que combina com ela.</p>`;
    return;
  }

  const suggestions = [];
  planted.forEach((name) => (CATALOG[name]?.companions || []).forEach((s) => {
    if (!planted.includes(s) && !suggestions.includes(s)) suggestions.push(s);
  }));

  // Combinações ruins dentro de um mesmo talhão
  const conflicts = [];
  state.plots.forEach((p) => {
    const names = [...new Set(cropsOf(p.id).map((c) => catalogKey(c.name) || c.name))];
    names.forEach((a, i) => names.slice(i + 1).forEach((b) => {
      if (CATALOG[a]?.avoid.includes(b) || CATALOG[b]?.avoid.includes(a)) conflicts.push(`${a} + ${b} (${p.name})`);
    }));
  });

  box.innerHTML = `
    ${title}
    ${suggestions.length
      ? `<p class="companions__subtitle">🌱 Considere plantar junto ao que você já tem</p>
         <div class="chips">${suggestions.map((s) => `<button class="pill" type="button" data-action="plant-suggestion" data-name="${esc(s)}" title="Plantar ${esc(s)}">${esc(s)}</button>`).join('')}</div>`
      : '<p class="companions__text">Suas culturas atuais já formam bons consórcios.</p>'}
    ${conflicts.length ? `<p class="companions__warn">${icon('alert')} Evite no mesmo talhão: ${esc(conflicts.join(' · '))}</p>` : ''}`;
}

function renderRecommendations() {
  renderCompanions();

  const box = $('#recoResult');
  const fc = state.forecast;
  const today = todayISO();
  const days = fc ? fc.days.filter((d) => d.date >= today) : [];

  if (!fc || !days.length) {
    box.innerHTML = emptyCard('sparkles', fc
      ? 'A previsão salva ficou desatualizada. Clique em "Gerar recomendações" para atualizar.'
      : 'Clique em "Gerar recomendações" para receber o melhor dia de cada atividade, baseado na previsão do tempo da sua região.');
    return;
  }

  const items = buildRecommendations(days);
  const tagsByDate = {};
  items.forEach((it) => {
    const key = days[it.day].date;
    (tagsByDate[key] = tagsByDate[key] || []).push(it);
  });

  box.innerHTML = `
    ${fc.source === 'simulada' ? `<div class="note note--amber">${icon('alert')}<span>Não foi possível acessar a previsão online — exibindo uma estimativa simulada para ${esc(fc.region)}. Tente gerar novamente mais tarde.</span></div>` : ''}
    <div class="reco-grid">${items.map((it) => recoCard(it, days)).join('')}</div>
    <section class="card forecast">
      <div class="forecast__head">
        <h3>Previsão — ${esc(fc.region)}</h3>
        <span class="muted small">${fc.source === 'simulada' ? 'Estimativa simulada' : 'Fonte: Open-Meteo'} · gerada em ${fmtDateTime(fc.generatedAt)}</span>
      </div>
      <div class="forecast__days">${days.map((d) => forecastDay(d, today, tagsByDate[d.date] || [])).join('')}</div>
    </section>`;
}

function dayLabel(iso) {
  const n = diffDays(todayISO(), iso);
  if (n === 0) return 'Hoje';
  if (n === 1) return 'Amanhã';
  return cap(WEEKDAYS[parseISO(iso).getDay()]);
}

function relText(iso) {
  const n = diffDays(todayISO(), iso);
  if (n === 0) return 'hoje';
  if (n === 1) return 'amanhã';
  return `${WEEKDAYS[parseISO(iso).getDay()]} (${fmtShort(iso)})`;
}

const weatherIcon = (d) => (d.rain >= 2 ? 'rain' : d.rain >= 0.3 || (d.prob ?? 0) >= 50 ? 'cloud' : 'sun');
const weatherText = (d) => `${d.rain >= 0.5 ? fmtMm(d.rain) + ' de chuva' : 'sem chuva'} · ${Math.round(d.tmin)}–${Math.round(d.tmax)} °C`;

function recoCard(it, days) {
  const d = days[it.day];
  return `
    <article class="card reco-card reco--${it.key}">
      <div class="reco-card__head">
        <span class="reco-icon">${icon(it.icon)}</span>
        <h3>${it.title}</h3>
        ${it.urgent ? '<span class="badge badge--low">Atenção</span>' : ''}
      </div>
      <p class="reco-card__day">${dayLabel(d.date)}</p>
      <p class="reco-card__date">${fmtDate(d.date)} · ${weatherText(d)}</p>
      <p class="reco-card__reason">${it.reason}</p>
    </article>`;
}

function forecastDay(d, today, tags) {
  const w = weatherIcon(d);
  return `
    <div class="fday${d.date === today ? ' is-today' : ''}">
      <p class="fday__wd">${d.date === today ? 'Hoje' : WEEK_SHORT[parseISO(d.date).getDay()]}</p>
      <p class="fday__date">${fmtShort(d.date)}</p>
      <span class="fday__icon wx-${w}">${icon(w)}</span>
      <p class="fday__temp"><strong>${Math.round(d.tmax)}°</strong> <span>${Math.round(d.tmin)}°</span></p>
      <p class="fday__rain">${icon('droplets')} ${fmtMm(d.rain)}${d.prob != null ? ` · ${d.prob}%` : ''}</p>
      ${tags.length ? `<div class="ftags">${tags.map((t) => `<span class="ftag ftag--${t.key}">${t.title}</span>`).join('')}</div>` : ''}
    </div>`;
}

/**
 * Escolhe o melhor dia de cada atividade a partir da previsão
 * e da umidade atual das culturas cadastradas.
 */
function buildRecommendations(days) {
  const crops = state.crops;
  const rainAt = (i) => days[i]?.rain ?? 0;
  const prob = (d) => d.prob ?? (d.rain >= 1 ? 70 : 10);
  const pick = (score) => days.reduce((best, d, i) => {
    const s = score(d, i);
    return s < best.s ? { i, s } : best;
  }, { i: 0, s: Infinity }).i;
  const list = (cs) => cs.map((c) => `${esc(c.name)} (${Math.round(c.moisture)}%)`).join(', ');
  const items = [];

  // Plantar: chuva moderada nos dias seguintes, sem temporal nem calor extremo
  const iP = pick((d, i) => {
    const ahead = rainAt(i + 1) + rainAt(i + 2);
    return Math.abs(ahead - 12)
      + (d.rain > 20 ? 25 : 0)
      + Math.max(0, d.tmax - 33) * 2
      + Math.max(0, 14 - d.tmin) * 2
      + (i >= days.length - 2 ? 6 : 0)
      + i * 0.4;
  });
  const aheadP = rainAt(iP + 1) + rainAt(iP + 2);
  items.push({
    key: 'plantar', title: 'Plantar', icon: 'sprout', day: iP,
    reason: aheadP >= 3
      ? `${fmtMm(aheadP)} de chuva prevista nos dois dias seguintes mantém o solo úmido para a germinação, sem encharcar.`
      : 'Sem chuva forte e com temperatura adequada. Como deve chover pouco depois, irrigue logo após o plantio.',
  });

  // Cultivar: dia seco para capina, adubação e manejo
  const iC = pick((d, i) => d.rain * 5 + prob(d) * 0.3 + Math.max(0, d.tmax - 32) * 2 + i * 0.3);
  const dC = days[iC];
  items.push({
    key: 'cultivar', title: 'Cultivar', icon: 'shovel', day: iC,
    reason: `${dC.rain < 1 ? 'Dia seco' : 'Dia com pouca chuva'} (${prob(dC)}% de chance de chuva) — bom para capina, adubação de cobertura e manejo do solo.`,
  });

  // Regar
  const thirsty = crops.filter((c) => c.moisture < c.min);
  let iR;
  let reasonR;
  if (thirsty.length) {
    iR = 0;
    reasonR = days[0].rain >= 5
      ? `${list(thirsty)} abaixo do ideal, mas há ${fmtMm(days[0].rain)} de chuva prevista para hoje. Confira a umidade depois da chuva antes de irrigar.`
      : `${list(thirsty)} abaixo do ideal. Regue hoje, de preferência cedo ou no fim da tarde.`;
  } else {
    iR = pick((d, i) => d.rain * 4 + prob(d) * 0.3 - Math.max(0, d.tmax - 26) * 1.5 + i * 0.5);
    reasonR = `Umidade ideal agora. Se precisar irrigar, prefira este dia: ${days[iR].rain < 1 ? 'sem chuva' : 'pouca chuva'} e máxima de ${Math.round(days[iR].tmax)} °C. Regue cedo ou no fim da tarde.`;
  }
  items.push({ key: 'regar', title: 'Regar', icon: 'droplets', day: iR, urgent: thirsty.length > 0, reason: reasonR });

  // Drenar
  const soggy = crops.filter((c) => c.moisture > c.max);
  const iW = days.reduce((b, d, i) => (d.rain > days[b].rain ? i : b), 0);
  let iD;
  let reasonD;
  if (soggy.length) {
    iD = 0;
    reasonD = `${list(soggy)} acima do ideal. Abra os drenos hoje para evitar encharcamento e apodrecimento das raízes.`;
  } else if (days[iW].rain >= 15) {
    iD = Math.max(0, iW - 1);
    reasonD = iD === iW
      ? `Chuva forte prevista para hoje (${fmtMm(days[iW].rain)}). Desobstrua os canais de drenagem logo cedo.`
      : `Chuva forte prevista para ${relText(days[iW].date)} (${fmtMm(days[iW].rain)}). Limpe e abra os canais de drenagem na véspera.`;
  } else {
    iD = pick((d, i) => d.rain * 3 + prob(d) * 0.2 + i * 0.5);
    reasonD = `Nenhuma chuva forte prevista (máximo de ${fmtMm(days[iW].rain)} em um dia). Aproveite este dia seco para a manutenção dos canais.`;
  }
  items.push({ key: 'drenar', title: 'Drenar', icon: 'waves', day: iD, urgent: soggy.length > 0, reason: reasonD });

  return items;
}

async function fetchForecast(region) {
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${region.lat}&longitude=${region.lon}`
    + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max'
    + '&timezone=auto&forecast_days=7';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { daily } = await res.json();
    return daily.time.map((date, i) => ({
      date,
      tmax: round1(daily.temperature_2m_max[i]),
      tmin: round1(daily.temperature_2m_min[i]),
      rain: round1(daily.precipitation_sum[i] ?? 0),
      prob: daily.precipitation_probability_max?.[i] ?? null,
    }));
  } finally {
    clearTimeout(timer);
  }
}

/** Previsão estimada (usada quando não há internet). Determinística por dia/estado. */
function simulateForecast(region) {
  let seed = [...(todayISO() + region.uf)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const wet = ['AC', 'AM', 'AP', 'PA', 'RR', 'RO', 'MA', 'TO'].includes(region.uf) ? 0.6 : 0.4;
  const base = 31 - Math.max(0, -region.lat - 15) * 0.6;
  return Array.from({ length: 7 }, (_, i) => {
    const raining = rnd() < wet;
    const tmax = round1(base + rnd() * 4 - (raining ? 2 : 0));
    return {
      date: addDays(todayISO(), i),
      tmax,
      tmin: round1(tmax - 8 - rnd() * 3),
      rain: raining ? round1(rnd() * 28) : 0,
      prob: raining ? Math.round(50 + rnd() * 45) : Math.round(rnd() * 30),
    };
  });
}

async function generateRecommendations() {
  const btn = $('#btnGenerate');
  const label = $('.btn__label', btn);
  const region = resolveRegion(state.user.region || state.plots[0]?.state);

  btn.disabled = true;
  btn.classList.add('is-loading');
  label.textContent = 'Gerando…';

  let days;
  let source = 'open-meteo';
  try {
    days = await fetchForecast(region);
    if (!days.length) throw new Error('Previsão vazia');
  } catch (err) {
    console.warn('Previsão online indisponível, usando estimativa:', err);
    days = simulateForecast(region);
    source = 'simulada';
  }

  state.forecast = { generatedAt: new Date().toISOString(), region: region.name, source, days };
  save();
  renderRecommendations();

  btn.disabled = false;
  btn.classList.remove('is-loading');
  label.textContent = 'Gerar recomendações';
  toast(source === 'simulada' ? 'Sem conexão: usando previsão estimada' : `Recomendações geradas para ${region.name}`, source === 'simulada' ? 'error' : 'success');
}

/* ---------- Irrigação ---------- */
function renderIrrigationStatus() {
  const el = $('#irrigationStatus');
  const alerts = state.crops.filter((c) => cropStatus(c).key !== 'ok').length;
  if (!state.crops.length) {
    el.innerHTML = `<span class="muted">${icon('info')}</span> Nenhuma cultura para monitorar`;
  } else if (!alerts) {
    el.innerHTML = `<span class="text-emerald">${icon('check')}</span> Todas as culturas com umidade ideal`;
  } else {
    el.innerHTML = `<span class="text-amber">${icon('alert')}</span> ${alerts} ${alerts === 1 ? 'cultura precisa' : 'culturas precisam'} de atenção`;
  }
}

function renderIrrigation() {
  renderIrrigationStatus();
  $('#irrigationGrid').innerHTML = state.crops.length
    ? `<div class="card-grid">${state.crops.map(irrigationCard).join('')}</div>`
    : emptyCard('droplets', 'Nenhuma cultura cadastrada. Plante uma cultura para acompanhar a umidade do solo.',
      `<button class="btn btn--primary" type="button" data-action="new-crop">${icon('plus')} Nova cultura</button>`);
}

function irrigationCard(c) {
  const st = cropStatus(c);
  const m = Math.round(c.moisture);
  return `
    <article class="card crop-card status-${st.key}" data-crop="${c.id}">
      <div class="crop-card__bar"></div>
      <div class="crop-card__head">
        <div class="crop-ident">
          <span class="crop-ident__icon">${icon('sprout')}</span>
          <div><h3>${esc(c.name)}</h3><p>${esc(c.variety || '—')}</p></div>
        </div>
        <span class="badge badge--${st.key}" data-role="badge">${icon(st.icon)} ${st.label}</span>
      </div>
      <div class="moisture">
        <div>
          <p class="moisture__label">Umidade do solo</p>
          <p class="moisture__value"><span data-role="value">${m}</span><small>%</small></p>
        </div>
        <div class="moisture__range">
          <p>Ideal: ${c.min}% a ${c.max}%</p>
          <p>Alvo: ${c.target}%</p>
        </div>
      </div>
      <div class="progress"><div class="progress__fill" data-role="fill" style="width:${m}%"></div></div>
      <label class="measure">
        <span>Medir:</span>
        <input class="range" type="range" min="0" max="100" step="1" value="${m}" style="--val:${m}%"
               data-role="slider" data-id="${c.id}" aria-label="Umidade medida de ${esc(c.name)}">
      </label>
      <div class="crop-card__foot">
        <span>Talhão: ${esc(plotName(c.plotId))}</span>
        <button class="link-btn link-btn--danger" type="button" data-action="delete-crop" data-id="${c.id}">${icon('trash')} Tirar</button>
      </div>
    </article>`;
}

/** Atualiza só o cartão enquanto o controle "Medir" é arrastado. */
function updateIrrigationCard(card, crop) {
  const st = cropStatus(crop);
  const m = Math.round(crop.moisture);
  card.className = card.className.replace(/status-\w+/, `status-${st.key}`);
  $('[data-role="value"]', card).textContent = m;
  $('[data-role="fill"]', card).style.width = `${m}%`;
  $('[data-role="slider"]', card).style.setProperty('--val', `${m}%`);
  const badge = $('[data-role="badge"]', card);
  badge.className = `badge badge--${st.key}`;
  badge.innerHTML = `${icon(st.icon)} ${st.label}`;
}

/* ---------- Dispositivos ---------- */
function renderDevices() {
  $('#deviceCount').textContent = `(${state.devices.length})`;
  $('#btnRefreshAll').hidden = !state.devices.length;
  $('#deviceList').innerHTML = state.devices.length
    ? `<div class="card-grid">${state.devices.map(deviceCard).join('')}</div>`
    : emptyCard('wifi', 'Nenhum dispositivo registrado. Adicione sensores de umidade, regadores e drenadores para conectar via Wi-Fi.');
}

function deviceCard(d) {
  const type = DEVICE_TYPES[d.type] || DEVICE_TYPES.sensor;
  const r = d.reading || {};
  const crop = d.cropId ? findCrop(d.cropId) : null;
  const isBusy = busy.has(d.id);
  const [stKey, stLabel] = { online: ['online', 'Online'], offline: ['offline', 'Offline'] }[d.status] || ['unknown', 'Não verificado'];

  return `
    <article class="card device-card">
      <div class="device-card__head">
        <span class="device-icon device-icon--${esc(d.type)}">${icon(type.icon)}</span>
        <div class="device-card__title">
          <h3>${esc(d.name)}</h3>
          <p class="muted small">${type.label} · ${esc(d.ip)}</p>
        </div>
        <span class="dot-status dot-status--${stKey}">${stLabel}</span>
      </div>
      <div class="device-readings">
        <div><span>Umidade</span><strong>${r.moisture != null ? Math.round(r.moisture) + '%' : '—'}</strong></div>
        <div><span>Bateria</span><strong>${r.battery != null ? Math.round(r.battery) + '%' : '—'}</strong></div>
        <div><span>Relé</span><strong>${r.relay == null ? '—' : r.relay ? 'Ligado' : 'Desligado'}</strong></div>
      </div>
      <p class="muted small">Cultura: ${crop ? esc(crop.name) + (crop.variety ? ' · ' + esc(crop.variety) : '') : 'nenhuma'} · Última leitura: ${r.at ? fmtDateTime(r.at) : 'nunca'}</p>
      ${d.error ? `<p class="device-error">${esc(d.error)}</p>` : ''}
      <div class="device-card__actions">
        <button class="btn btn--outline btn--sm${isBusy ? ' is-loading' : ''}" type="button" data-action="device-refresh" data-id="${d.id}" ${isBusy ? 'disabled' : ''}>${icon('refresh')} Atualizar</button>
        ${d.type !== 'sensor'
          ? `<button class="btn btn--sm ${r.relay ? 'btn--danger-soft' : 'btn--primary'}" type="button" data-action="device-relay" data-id="${d.id}" ${isBusy ? 'disabled' : ''}>${icon('power')} ${r.relay ? 'Desligar' : 'Ligar'}</button>`
          : ''}
        <button class="link-btn link-btn--danger" type="button" data-action="delete-device" data-id="${d.id}">${icon('trash')} Remover</button>
      </div>
    </article>`;
}

/** Requisição HTTP para o ESP32 com tempo limite. */
async function espRequest(ip, path, options = {}) {
  const base = /^https?:\/\//i.test(ip) ? ip.replace(/\/+$/, '') : `http://${ip}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(base + path, { ...options, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    try { return JSON.parse(text); } catch { return {}; }
  } finally {
    clearTimeout(timer);
  }
}

function connectionError(err) {
  if (location.protocol === 'https:') return 'Esta página está em HTTPS e o navegador bloqueia acesso HTTP ao ESP32. Abra o site pela rede local em HTTP ou use o app nativo.';
  if (err && err.name === 'AbortError') return 'Tempo esgotado: o dispositivo não respondeu.';
  return 'Não foi possível conectar. Verifique o IP, se a placa está na mesma rede Wi-Fi e se o firmware libera CORS.';
}

async function refreshDevice(id, { silent = false } = {}) {
  const d = findDevice(id);
  if (!d || busy.has(id)) return false;
  busy.add(id);
  renderDevices();
  let ok = false;
  try {
    const data = await espRequest(d.ip, '/status');
    d.status = 'online';
    d.error = '';
    d.reading = {
      moisture: num(data.moisture),
      battery: num(data.battery),
      relay: data.relay == null ? null : toBool(data.relay),
      at: Date.now(),
    };
    // Sensor vinculado atualiza a umidade da cultura
    const crop = d.cropId && findCrop(d.cropId);
    if (crop && d.reading.moisture != null) crop.moisture = clamp(Math.round(d.reading.moisture), 0, 100);
    ok = true;
    if (!silent) toast(`${d.name}: leitura atualizada`);
  } catch (err) {
    d.status = 'offline';
    d.error = connectionError(err);
    if (!silent) toast(`${d.name}: sem conexão`, 'error');
  } finally {
    busy.delete(id);
    save();
    render();
  }
  return ok;
}

async function toggleRelay(id) {
  const d = findDevice(id);
  if (!d || busy.has(id)) return;
  const next = !(d.reading && d.reading.relay);
  busy.add(id);
  renderDevices();
  try {
    // Corpo em form-urlencoded evita a requisição de pré-verificação (CORS preflight)
    const data = await espRequest(d.ip, '/relay', { method: 'POST', body: new URLSearchParams({ state: next ? 'on' : 'off' }) });
    const relay = data && data.relay != null ? toBool(data.relay) : next;
    d.reading = { ...(d.reading || {}), relay, at: Date.now() };
    d.status = 'online';
    d.error = '';
    toast(`${d.name}: relé ${relay ? 'ligado' : 'desligado'}`);
  } catch (err) {
    d.status = 'offline';
    d.error = connectionError(err);
    toast(`${d.name}: não foi possível acionar o relé`, 'error');
  } finally {
    busy.delete(id);
    save();
    renderDevices();
  }
}

async function refreshAllDevices() {
  const results = await Promise.all(state.devices.map((d) => refreshDevice(d.id, { silent: true })));
  const online = results.filter(Boolean).length;
  toast(`${online} de ${results.length} ${results.length === 1 ? 'dispositivo respondeu' : 'dispositivos responderam'}`, online ? 'success' : 'error');
}

/* ---------- Financeiro ---------- */
function renderFinance() {
  const { income, expense, balance } = totals();
  $('#financeStats').innerHTML = `
    <div class="card mini-stat">
      <span class="mini-stat__icon text-emerald">${icon('up')}</span>
      <p class="mini-stat__label">Receitas</p>
      <p class="mini-stat__value text-emerald">${money(income)}</p>
    </div>
    <div class="card mini-stat">
      <span class="mini-stat__icon text-red">${icon('down')}</span>
      <p class="mini-stat__label">Despesas</p>
      <p class="mini-stat__value text-red">${money(expense)}</p>
    </div>
    <div class="card mini-stat">
      <span class="mini-stat__icon text-emerald">${icon('wallet')}</span>
      <p class="mini-stat__label">Saldo</p>
      <p class="mini-stat__value ${balance < 0 ? 'text-red' : 'text-emerald'}">${money(balance)}</p>
    </div>`;

  const sel = $('#txCrop');
  const current = sel.value;
  sel.innerHTML = `<option value="">Nenhuma</option>${cropOptions(current)}`;

  const list = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  $('#statement').innerHTML = list.length
    ? list.map((t) => `
      <li class="tx">
        <div class="tx__info">
          <p class="tx__desc">${esc(t.desc)}</p>
          <p class="tx__meta">${fmtDate(t.date)}${t.category ? ' · ' + esc(t.category) : ''}${t.cropName ? ' · ' + esc(t.cropName) : ''}</p>
        </div>
        <span class="tx__value ${t.type === 'receita' ? 'tx__value--in' : 'tx__value--out'}">${t.type === 'receita' ? '+' : '-'} ${money(t.value)}</span>
        <button class="icon-btn" type="button" data-action="delete-tx" data-id="${t.id}" aria-label="Excluir ${esc(t.desc)}" title="Excluir">${icon('trash')}</button>
      </li>`).join('')
    : '<li class="statement__empty">Nenhuma movimentação registrada.</li>';
}

function submitTransaction(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const f = new FormData(form);
  const desc = String(f.get('desc')).trim();
  const value = num(f.get('value'));
  if (!desc) return invalid(form, 'desc', 'Informe a descrição.');
  if (!(value > 0)) return invalid(form, 'value', 'Informe um valor maior que zero.');

  const crop = findCrop(f.get('cropId'));
  state.transactions.push({
    id: uid('tx'),
    desc,
    type: f.get('type') === 'receita' ? 'receita' : 'despesa',
    value: round2(value),
    category: String(f.get('category')).trim(),
    date: f.get('date') || todayISO(),
    cropId: crop ? crop.id : '',
    cropName: crop ? crop.name : '',
    createdAt: Date.now(),
  });
  save();
  render();
  form.reset();
  form.elements.namedItem('date').value = todayISO();
  toast('Movimentação registrada');
  return true;
}

/* ---------- Culturas ---------- */
function renderCrops() {
  const box = $('#cropsByPlot');
  if (!state.plots.length) {
    box.innerHTML = emptyCard('sprout', 'Cadastre um talhão para começar a plantar.',
      `<button class="btn btn--primary" type="button" data-action="new-plot">${icon('plus')} Talhão</button>`);
    return;
  }
  box.innerHTML = state.plots.map((p) => {
    const crops = cropsOf(p.id);
    return `
      <section class="plot-group">
        <h3 class="plot-group__title">
          <span class="text-green">${icon('pin')}</span>
          <strong>${esc(p.name)}</strong>
          <span class="muted">· ${esc(p.soil)} · ${esc(p.state)}</span>
        </h3>
        ${crops.length ? `<div class="card-grid">${crops.map(cropTile).join('')}</div>` : ''}
      </section>`;
  }).join('');
}

function cropTile(c) {
  const st = cropStatus(c);
  return `
    <article class="card crop-tile" data-action="edit-crop" data-id="${c.id}" tabindex="0" role="button" aria-label="Editar ${esc(c.name)}">
      <div class="crop-card__head">
        <div class="crop-ident">
          <span class="crop-ident__icon">${icon('sprout')}</span>
          <div><h3>${esc(c.name)}</h3><p>${esc(c.variety || '—')}</p></div>
        </div>
        <span class="badge badge--${st.key}">${st.label}</span>
      </div>
      <p class="crop-tile__meta">${icon('ruler')} ${fmtNum(c.area)} ha</p>
      <p class="crop-tile__meta">${icon('calendar')} ${fmtDate(c.plantedAt)} → colheita ${fmtDate(c.harvestAt)}</p>
      <div class="crop-tile__foot">
        <button class="link-btn link-btn--danger" type="button" data-action="delete-crop" data-id="${c.id}">${icon('trash')} Remover</button>
      </div>
    </article>`;
}

/* =============================================================
   Modais
   ============================================================= */
const modalEl = $('#modal');
let modalCtx = null;

function openModal({ title, body, submitLabel = 'Salvar', danger = false, footLeft = '', onSubmit, onCancel, onOpen }) {
  // Se outro modal estiver aberto, ele é substituído
  const returnFocus = modalCtx ? modalCtx.returnFocus : document.activeElement;
  if (modalCtx && modalCtx.onCancel) modalCtx.onCancel();
  modalCtx = { onSubmit, onCancel, returnFocus };

  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = `
    <form class="form" id="modalForm" novalidate>
      ${body}
      <div class="modal__foot">
        ${footLeft}
        <span class="spacer"></span>
        <button type="button" class="btn btn--outline" data-close>Cancelar</button>
        <button type="submit" class="btn ${danger ? 'btn--danger' : 'btn--primary'}">${submitLabel}</button>
      </div>
    </form>`;

  modalEl.hidden = false;
  document.body.classList.add('no-scroll');

  const form = $('#modalForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ctx = modalCtx;
    const result = ctx && ctx.onSubmit ? ctx.onSubmit(new FormData(form), form) : true;
    if (result === false) return;
    if (modalCtx === ctx) closeModal(true);
  });
  if (onOpen) onOpen(form);

  requestAnimationFrame(() => {
    const first = form.querySelector('input:not([type=hidden]), select, textarea') || form.querySelector('button[type=submit]');
    if (first) first.focus();
  });
}

function closeModal(submitted = false) {
  if (modalEl.hidden) return;
  const ctx = modalCtx;
  modalCtx = null;
  modalEl.hidden = true;
  document.body.classList.remove('no-scroll');
  $('#modalBody').innerHTML = '';
  if (!submitted && ctx && ctx.onCancel) ctx.onCancel();
  if (ctx && ctx.returnFocus && document.contains(ctx.returnFocus)) ctx.returnFocus.focus();
}

function confirmDialog(message, confirmLabel = 'Remover') {
  return new Promise((resolve) => {
    openModal({
      title: 'Confirmar',
      body: `<p class="confirm-text">${esc(message)}</p>`,
      submitLabel: confirmLabel,
      danger: true,
      onSubmit: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

function invalid(form, name, message) {
  const el = form.elements.namedItem(name);
  if (el) {
    el.classList.add('is-invalid');
    el.focus();
    el.addEventListener('input', () => el.classList.remove('is-invalid'), { once: true });
  }
  toast(message, 'error');
  return false;
}

/* ---------- Talhão ---------- */
function openPlotModal(plot = null) {
  const p = plot || { name: '', area: '', soil: 'Arenoso', state: state.user.region || '', water: '', irrigation: 'Automática' };
  const soils = [...new Set([...SOILS, p.soil].filter(Boolean))];

  openModal({
    title: plot ? 'Editar talhão' : 'Novo talhão',
    submitLabel: plot ? 'Salvar' : 'Adicionar',
    footLeft: plot ? `<button type="button" class="link-btn link-btn--danger" data-action="delete-plot" data-id="${plot.id}">${icon('trash')} Excluir talhão</button>` : '',
    body: `
      <label class="field"><span>Nome do talhão</span>
        <input name="name" value="${esc(p.name)}" placeholder="Ex: Talhão norte" autocomplete="off">
      </label>
      <div class="row">
        <label class="field"><span>Área (ha)</span>
          <input name="area" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(p.area)}" placeholder="Ex: 12">
        </label>
        <label class="field"><span>Tipo de solo</span>
          <select name="soil">${soils.map((s) => `<option ${s === p.soil ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
        </label>
      </div>
      <div class="row">
        <label class="field"><span>Estado</span>
          <input name="state" list="ufList" value="${esc(p.state)}" placeholder="Ex: Pará" autocomplete="off">
        </label>
        <label class="field"><span>Água disponível (L)</span>
          <input name="water" type="number" min="0" step="1" inputmode="numeric" value="${esc(p.water)}" placeholder="Ex: 20000">
        </label>
      </div>
      <label class="field"><span>Irrigação</span>
        <select name="irrigation">${IRRIGATION.map((i) => `<option ${i === p.irrigation ? 'selected' : ''}>${i}</option>`).join('')}</select>
      </label>
      <datalist id="ufList">${UFS.map((u) => `<option value="${u.name}">`).join('')}</datalist>`,
    onSubmit: (f, form) => {
      const name = String(f.get('name')).trim();
      const area = num(f.get('area'));
      if (!name) return invalid(form, 'name', 'Dê um nome ao talhão.');
      if (area == null || area <= 0) return invalid(form, 'area', 'Informe a área em hectares.');

      const used = plot ? cropsOf(plot.id).reduce((s, c) => s + (Number(c.area) || 0), 0) : 0;
      if (area < used) return invalid(form, 'area', `As culturas deste talhão já ocupam ${fmtNum(used)} ha.`);

      const data = {
        name,
        area: round2(area),
        soil: f.get('soil'),
        state: String(f.get('state')).trim(),
        water: Math.max(0, num(f.get('water')) || 0),
        irrigation: f.get('irrigation'),
      };
      if (plot) Object.assign(plot, data);
      else state.plots.push({ id: uid('plot'), ...data });
      save();
      render();
      toast(plot ? 'Talhão atualizado' : 'Talhão adicionado');
      return true;
    },
  });
}

async function deletePlot(id) {
  const p = findPlot(id);
  if (!p) return;
  const n = cropsOf(id).length;
  const msg = `Excluir o talhão "${p.name}"${n ? ` e ${n === 1 ? 'a cultura' : `as ${n} culturas`} plantadas nele` : ''}?`;
  if (!(await confirmDialog(msg, 'Excluir'))) return;
  const removed = new Set(cropsOf(id).map((c) => c.id));
  state.plots = state.plots.filter((x) => x.id !== id);
  state.crops = state.crops.filter((c) => !removed.has(c.id));
  state.devices.forEach((d) => { if (removed.has(d.cropId)) d.cropId = ''; });
  save();
  render();
  toast('Talhão excluído');
}

/* ---------- Cultura ---------- */
function openCropModal(crop = null, preset = {}) {
  if (!state.plots.length) {
    toast('Cadastre um talhão antes de plantar.', 'error');
    openPlotModal();
    return;
  }

  const c = crop || {
    plotId: preset.plotId || state.plots[0].id,
    name: preset.name || '',
    variety: '',
    area: '',
    plantedAt: todayISO(),
    harvestAt: '',
    moisture: '',
    min: '',
    max: '',
  };

  openModal({
    title: crop ? 'Editar cultura' : 'Plantar cultura',
    submitLabel: crop ? 'Salvar' : 'Plantar',
    footLeft: crop ? `<button type="button" class="link-btn link-btn--danger" data-action="delete-crop" data-id="${crop.id}">${icon('trash')} Remover</button>` : '',
    body: `
      <label class="field"><span>Talhão</span>
        <select name="plotId">${state.plots.map((p) => `<option value="${p.id}" ${p.id === c.plotId ? 'selected' : ''}>${esc(p.name)} (${fmtNum(p.area)} ha)</option>`).join('')}</select>
      </label>
      <div class="row">
        <label class="field"><span>Cultura</span>
          <input name="name" list="catalogList" value="${esc(c.name)}" placeholder="Ex: Feijão" autocomplete="off">
        </label>
        <label class="field"><span>Variedade</span>
          <input name="variety" value="${esc(c.variety)}" placeholder="Ex: carioca" autocomplete="off">
        </label>
      </div>
      <p class="hint" id="cropHint"></p>
      <div class="row">
        <label class="field"><span>Área (ha)</span>
          <input name="area" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(c.area)}" placeholder="Ex: 10">
        </label>
        <label class="field"><span>Umidade atual (%)</span>
          <input name="moisture" type="number" min="0" max="100" step="1" value="${esc(c.moisture)}" placeholder="Alvo">
        </label>
      </div>
      <div class="row">
        <label class="field"><span>Plantio</span>
          <input name="plantedAt" type="date" value="${esc(c.plantedAt)}">
        </label>
        <label class="field"><span>Colheita prevista</span>
          <input name="harvestAt" type="date" value="${esc(c.harvestAt)}">
        </label>
      </div>
      <div class="row">
        <label class="field"><span>Umidade mínima (%)</span>
          <input name="min" type="number" min="0" max="100" step="1" value="${esc(c.min)}">
        </label>
        <label class="field"><span>Umidade máxima (%)</span>
          <input name="max" type="number" min="0" max="100" step="1" value="${esc(c.max)}">
        </label>
      </div>
      <datalist id="catalogList">${Object.keys(CATALOG).map((n) => `<option value="${n}">`).join('')}</datalist>`,

    onOpen: (form) => {
      const field = (n) => form.elements.namedItem(n);
      const touched = new Set(crop ? ['min', 'max', 'harvestAt'] : []);
      ['min', 'max', 'harvestAt'].forEach((n) => field(n).addEventListener('input', () => touched.add(n)));
      const hint = $('#cropHint', form);

      const apply = () => {
        const key = catalogKey(field('name').value);
        const info = key && CATALOG[key];
        if (!info) {
          hint.textContent = field('name').value.trim() ? 'Cultura fora do catálogo: preencha a umidade ideal e a colheita manualmente.' : '';
          return;
        }
        if (!touched.has('min')) field('min').value = info.min;
        if (!touched.has('max')) field('max').value = info.max;
        if (!touched.has('harvestAt') && field('plantedAt').value) field('harvestAt').value = addDays(field('plantedAt').value, info.cycle);
        hint.innerHTML = `${icon('info')}<span>Ciclo médio de ${info.cycle} dias · umidade ideal de ${info.min}% a ${info.max}%${info.companions.length ? ` · combina com ${info.companions.join(', ')}` : ''}.</span>`;
      };

      field('name').addEventListener('input', apply);
      field('plantedAt').addEventListener('change', apply);
      apply();
    },

    onSubmit: (f, form) => {
      const rawName = String(f.get('name')).trim();
      if (!rawName) return invalid(form, 'name', 'Informe qual cultura será plantada.');
      const key = catalogKey(rawName);
      const info = key ? CATALOG[key] : null;

      const min = clamp(num(f.get('min')) ?? info?.min ?? 40, 0, 100);
      const max = clamp(num(f.get('max')) ?? info?.max ?? 60, 0, 100);
      if (min > max) return invalid(form, 'max', 'A umidade máxima deve ser maior que a mínima.');

      const plotId = f.get('plotId');
      const plot = findPlot(plotId);
      const area = Math.max(0, num(f.get('area')) || 0);
      const used = cropsOf(plotId).filter((x) => !crop || x.id !== crop.id).reduce((s, x) => s + (Number(x.area) || 0), 0);
      if (plot && used + area > plot.area) {
        return invalid(form, 'area', `Área maior que o espaço livre no talhão (${fmtNum(Math.max(0, plot.area - used))} ha).`);
      }

      const target = Math.round((min + max) / 2);
      const moisture = num(f.get('moisture'));
      const data = {
        plotId,
        name: key || rawName,
        variety: String(f.get('variety')).trim(),
        area: round2(area),
        plantedAt: f.get('plantedAt') || todayISO(),
        harvestAt: f.get('harvestAt') || (info ? addDays(f.get('plantedAt') || todayISO(), info.cycle) : ''),
        min,
        max,
        target,
        moisture: clamp(Math.round(moisture ?? (crop ? crop.moisture : target)), 0, 100),
      };

      if (crop) Object.assign(crop, data);
      else state.crops.push({ id: uid('crop'), ...data });
      save();
      render();
      toast(crop ? 'Cultura atualizada' : `${data.name} plantado em ${plotName(plotId)}`);
      return true;
    },
  });
}

async function deleteCrop(id) {
  const c = findCrop(id);
  if (!c) return;
  const label = `${c.name}${c.variety ? ` (${c.variety})` : ''}`;
  if (!(await confirmDialog(`Tirar ${label} do talhão "${plotName(c.plotId)}"?`, 'Tirar'))) return;
  state.crops = state.crops.filter((x) => x.id !== id);
  state.devices.forEach((d) => { if (d.cropId === id) d.cropId = ''; });
  save();
  render();
  toast('Cultura removida');
}

/* ---------- Dispositivo ---------- */
function openDeviceModal() {
  openModal({
    title: 'Conectar dispositivo',
    submitLabel: 'Conectar',
    body: `
      <label class="field"><span>Nome</span>
        <input name="name" placeholder="Ex: Sensor talhão norte" autocomplete="off">
      </label>
      <div class="row">
        <label class="field"><span>Tipo</span>
          <select name="type">${Object.entries(DEVICE_TYPES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select>
        </label>
        <label class="field"><span>IP local</span>
          <input name="ip" placeholder="192.168.0.50" inputmode="url" autocomplete="off" spellcheck="false">
        </label>
      </div>
      <label class="field"><span>Cultura vinculada (opcional)</span>
        <select name="cropId"><option value="">Nenhuma</option>${cropOptions()}</select>
      </label>
      <p class="hint">${icon('info')}<span>Um sensor vinculado atualiza a umidade da cultura a cada leitura.</span></p>`,
    onSubmit: (f, form) => {
      const name = String(f.get('name')).trim();
      const ip = String(f.get('ip')).trim().replace(/\/+$/, '');
      if (!name) return invalid(form, 'name', 'Dê um nome ao dispositivo.');
      if (!/^(https?:\/\/)?[\w.-]+(:\d{1,5})?$/i.test(ip)) return invalid(form, 'ip', 'Informe um IP válido, ex: 192.168.0.50');

      const device = { id: uid('dev'), name, type: f.get('type'), ip, cropId: f.get('cropId') || '', status: 'unknown', reading: null, error: '' };
      state.devices.push(device);
      save();
      render();
      toast('Dispositivo cadastrado. Testando conexão…');
      setTimeout(() => refreshDevice(device.id), 50);
      return true;
    },
  });
}

async function deleteDevice(id) {
  const d = findDevice(id);
  if (!d) return;
  if (!(await confirmDialog(`Remover o dispositivo "${d.name}" (${d.ip})?`))) return;
  state.devices = state.devices.filter((x) => x.id !== id);
  save();
  renderDevices();
  toast('Dispositivo removido');
}

async function deleteTransaction(id) {
  const t = state.transactions.find((x) => x.id === id);
  if (!t) return;
  if (!(await confirmDialog(`Excluir a movimentação "${t.desc}" (${money(t.value)})?`, 'Excluir'))) return;
  state.transactions = state.transactions.filter((x) => x.id !== id);
  save();
  render();
  toast('Movimentação excluída');
}

/* ---------- Configurações ---------- */
function openSettings() {
  const current = resolveRegion(state.user.region).name;
  openModal({
    title: 'Configurações',
    body: `
      <label class="field"><span>Seu nome</span>
        <input name="name" value="${esc(state.user.name)}" placeholder="Ex: daniel" autocomplete="given-name">
      </label>
      <label class="field"><span>Região para a previsão do tempo</span>
        <select name="region">${UFS.map((u) => `<option ${u.name === current ? 'selected' : ''}>${u.name}</option>`).join('')}</select>
      </label>
      <div class="settings-data">
        <p class="settings-data__title">Seus dados</p>
        <p class="muted small">Tudo fica salvo neste navegador. Faça um backup para levar a outro aparelho.</p>
        <div class="btn-row">
          <button type="button" class="btn btn--outline btn--sm" data-action="export">${icon('download')} Exportar backup</button>
          <button type="button" class="btn btn--outline btn--sm" data-action="import">${icon('upload')} Importar backup</button>
          <button type="button" class="btn btn--outline btn--sm" data-action="reset-sample">${icon('rotate')} Restaurar exemplo</button>
          <button type="button" class="btn btn--danger-soft btn--sm" data-action="clear-all">${icon('trash')} Apagar tudo</button>
        </div>
      </div>`,
    onSubmit: (f) => {
      const region = f.get('region');
      if (region !== state.user.region) state.forecast = null; // previsão antiga é de outra região
      state.user.name = String(f.get('name')).trim();
      state.user.region = region;
      save();
      render();
      toast('Configurações salvas');
      return true;
    },
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `policultiva-backup-${todayISO()}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Backup exportado');
}

async function importData(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.plots)) throw new Error('Formato inválido');
    state = normalize(data);
    save();
    closeModal();
    render();
    toast('Backup importado');
  } catch (err) {
    console.warn(err);
    toast('Arquivo de backup inválido', 'error');
  }
}

/* =============================================================
   Notificações
   ============================================================= */
function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerHTML = `${icon(type === 'error' ? 'alert' : 'check')}<span>${esc(message)}</span>`;
  $('#toasts').append(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* =============================================================
   Abas
   ============================================================= */
function setTab(name, { focus = false } = {}) {
  if (!TABS.includes(name)) name = 'visao';
  $$('.tab').forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on) {
      if (focus) t.focus();
      t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  });
  $$('.panel').forEach((p) => { p.hidden = p.id !== `tab-${name}`; });
  if (location.hash !== `#${name}`) {
    try { history.replaceState(null, '', `#${name}`); } catch { /* file:// em alguns navegadores */ }
  }
}

/* =============================================================
   Eventos
   ============================================================= */
function handleAction(el) {
  const { action, id, name } = el.dataset;
  switch (action) {
    case 'open-settings': openSettings(); break;
    case 'new-plot': openPlotModal(); break;
    case 'edit-plot': openPlotModal(findPlot(id)); break;
    case 'delete-plot': deletePlot(id); break;
    case 'new-crop': openCropModal(); break;
    case 'edit-crop': openCropModal(findCrop(id)); break;
    case 'delete-crop': deleteCrop(id); break;
    case 'plant-suggestion': openCropModal(null, { name }); break;
    case 'new-device': openDeviceModal(); break;
    case 'device-refresh': refreshDevice(id); break;
    case 'device-relay': toggleRelay(id); break;
    case 'delete-device': deleteDevice(id); break;
    case 'refresh-all-devices': refreshAllDevices(); break;
    case 'delete-tx': deleteTransaction(id); break;
    case 'export': exportData(); break;
    case 'import': $('#importFile').click(); break;
    case 'reset-sample':
      confirmDialog('Substituir todos os dados atuais pelos dados de exemplo?', 'Restaurar').then((ok) => {
        if (!ok) return;
        state = sampleData();
        save();
        render();
        toast('Dados de exemplo restaurados');
      });
      break;
    case 'clear-all':
      confirmDialog('Apagar todos os talhões, culturas, dispositivos e movimentações? Esta ação não pode ser desfeita.', 'Apagar tudo').then((ok) => {
        if (!ok) return;
        state = { ...emptyData(), user: state.user };
        save();
        render();
        toast('Todos os dados foram apagados');
      });
      break;
    default: break;
  }
}

function bindEvents() {
  // Cliques: fechar modal e ações com data-action
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    const el = e.target.closest('[data-action]');
    if (el && !el.disabled) handleAction(el);
  });

  // Teclado: cartões clicáveis, Esc e foco preso no modal
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('[role="button"][data-action]')) {
      e.preventDefault();
      handleAction(t);
      return;
    }
    if (modalEl.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'Tab') {
      const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', $('.modal__dialog'))
        .filter((el) => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Abas (clique e setas do teclado)
  const tabs = $('.tabs');
  tabs.addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (t) setTab(t.dataset.tab);
  });
  tabs.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const current = TABS.indexOf(($('.tab.is-active') || {}).dataset?.tab);
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % TABS.length;
    if (e.key === 'ArrowLeft') next = (current - 1 + TABS.length) % TABS.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = TABS.length - 1;
    setTab(TABS[next], { focus: true });
  });
  window.addEventListener('hashchange', () => setTab(location.hash.slice(1)));

  // Recomendações
  $('#btnGenerate').addEventListener('click', generateRecommendations);

  // Irrigação: controle "Medir"
  const grid = $('#irrigationGrid');
  grid.addEventListener('input', (e) => {
    const slider = e.target.closest('[data-role="slider"]');
    if (!slider) return;
    const crop = findCrop(slider.dataset.id);
    if (!crop) return;
    crop.moisture = Number(slider.value);
    updateIrrigationCard(slider.closest('.crop-card'), crop);
  });
  grid.addEventListener('change', (e) => {
    if (!e.target.closest('[data-role="slider"]')) return;
    save();
    renderIrrigationStatus();
    renderOverview();
    renderCrops();
    renderRecommendations();
  });

  // Financeiro
  $('#txForm').addEventListener('submit', submitTransaction);

  // Backup
  $('#importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) importData(file);
  });

  // Mantém várias abas do navegador sincronizadas
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    state = load();
    render();
  });
}

/* =============================================================
   Início
   ============================================================= */
function init() {
  hydrateIcons();
  $('#txForm').elements.namedItem('date').value = todayISO();
  bindEvents();
  render();
  setTab(location.hash.slice(1) || 'visao');
}

init();
