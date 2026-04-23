// Constants and state variables
const TRACK_COLORS = {
  smart: '#5b6af0', intl: '#d6247a', global: '#e8a020', alumni: '#0099a8'
};

let activeTrack = 'all';
let activeDayId = 1;
let viewMode    = 'grid'; // 'grid' | 'list'

// Live clock
const clockEl = document.getElementById('liveClock');
function tick() {
  const t = new Date();
  clockEl.textContent = t.toLocaleTimeString('cs-CZ', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
tick(); setInterval(tick, 1000);

// Load data from json file
async function loadData() {
  try {
    const res = await fetch('../data/data.json'); // relative to site root
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('loaded data', data);
    renderData(data);
  } catch (err) {
    console.error('Failed to load JSON:', err);
  }
}

loadData();

// Render data into the page