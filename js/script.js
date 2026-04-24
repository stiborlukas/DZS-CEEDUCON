const TRACK_META = {
    smart:  { label: 'Smart & Sustainable Coop.', color: '#5b6af0' },
    intl:   { label: 'Internationalisation for All', color: '#d6247a' },
    global: { label: 'Global & Regional Partnerships', color: '#e8a020' },
    alumni: { label: 'Alumni - Employability - Future Skills', color: '#0099a8' },
};
 
// Helper functions
function trackLabel(track) {
    return TRACK_META[track]?.label ?? track;
}
function trackColor(track) {
    return TRACK_META[track]?.color ?? '#888';
}

// Constants and state variables
const TRACK_COLORS = {
    smart: '#5b6af0', intl: '#d6247a', global: '#e8a020', alumni: '#0099a8'
};

let SCHEDULE_DATA = null;

let activeTrack = 'all';
let activeDayId = 1;
let viewMode    = 'grid'; // 'grid' | 'list'

// Live clock
const clockEl = document.getElementById('liveClock');
function tick() {
    const t = new Date();
    clockEl.textContent = t.toLocaleTimeString('cs-CZ', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
tick(); 
setInterval(tick, 1000);

// Load data from json file
async function loadData() {
    try {
        const res = await fetch('../data/data.json');
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log('loaded data', data);

        SCHEDULE_DATA = data;
        buildDayTabs();         
        mount(activeDayId);

        setTimeout(highlightNow, 0);

    } catch (err) {
        console.error('Failed to load JSON:', err);
    }
}

loadData();

// build day tabs AFTER data is loaded
function buildDayTabs() {
    const dayTabsEl = document.getElementById('dayTabs');
    if (!dayTabsEl) return console.warn('dayTabs element missing');
    
    dayTabsEl.innerHTML = '';
    (SCHEDULE_DATA?.days || []).forEach((day, i) => {
        const btn = Object.assign(document.createElement('button'), {
        className: 'day-tab' + (String(day.id) === String(activeDayId) || (i === 0 && !activeDayId) ? ' active' : ''),
        textContent: day.label,
    });
    btn.dataset.day = day.id;
    btn.addEventListener('click', () => {
        dayTabsEl.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        mount(day.id);
    });
    
    dayTabsEl.appendChild(btn);
  });
}


 


function variantLabel(v) {
    return { registration: 'Registrace', coffee: 'Přestávka', lunch: 'Oběd' }[v] || v;
}

function esc(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}


// Filters select and toggle
function applyFilter() {
    document.querySelectorAll('.session:not(.plenery)').forEach(s => {
        s.classList.toggle('dimmed', activeTrack !== 'all' && s.dataset.track !== activeTrack);
    });
    document.querySelectorAll('.card:not(.card-special)').forEach(c => {
        c.classList.toggle('dimmed', activeTrack !== 'all' && c.dataset.track !== activeTrack);
    });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const track = btn.dataset.track;
        // Toggle: if clicking the already active filter, revert to default 'all'
        activeTrack = (activeTrack === track) ? 'all' : track;

        // Update active classes
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.filter-btn[data-track="${activeTrack}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        applyFilter();
    });
});

// initialization and day switching
function getDay(id) {
    return SCHEDULE_DATA.days.find(d => d.id === id) || SCHEDULE_DATA.days[0];
}

function mount(dayId) {
    activeDayId = dayId;
    const day = getDay(dayId);
    document.getElementById('gridView').innerHTML = renderGrid(day);
    document.getElementById('listView').innerHTML = renderList(day);

    bindSessionClicks();
    applyFilter();
    highlightNow();
}

// Filter tlačítka — generována z TRACK_META
const filterEl = document.getElementById('filterGroup') || document.querySelector('.filter-group');
if (filterEl) {
    filterEl.innerHTML = `<span class="filter-label">Téma:</span>`;
    [{ key: 'all', label: 'Vše' }, ...Object.entries(TRACK_META).map(([k, v]) => ({ key: k, label: v.label }))].forEach(({ key, label }) => {
        const btn = Object.assign(document.createElement('button'), {
            className: 'filter-btn' + (key === 'all' ? ' active' : ''),
            textContent: key === 'all' ? 'Vše' : label,
        });
        btn.dataset.track = key;
        btn.addEventListener('click', () => {
            activeTrack = key;
            filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter();
        });
        filterEl.appendChild(btn);
    });
} else {
  console.warn('filter element not found (expected id="filterGroup" or class="filter-group")');
}

// Legenda — generována z TRACK_META
const legendEl = document.getElementById('legend') || document.querySelector('.legend');
if (legendEl) {
    legendEl.innerHTML = ''; // reset to avoid duplication
    Object.entries(TRACK_META).forEach(([key, meta]) => {
        legendEl.innerHTML += `<div class="legend-item">
            <div class="legend-dot" style="background:${meta.color}"></div>${meta.label}
        </div>`;
    });
} else {
  console.warn('legend element not found (expected id="legend" or class="legend")');
}

// VIEW TOGGLE — guardované přidání listenerů (prvky mohou v HTML chybět)
const gridViewEl = document.getElementById('gridView');
const listViewEl = document.getElementById('listView');

const btnGrid = document.getElementById('btnGrid');
const btnList = document.getElementById('btnList');

if (btnGrid && gridViewEl && listViewEl) {
    btnGrid.addEventListener('click', () => {
        gridViewEl.classList.remove('hidden');
        listViewEl.classList.remove('visible');
        btnGrid.classList.add('active');
        if (btnList) btnList.classList.remove('active');
    });
} else {
  if (!btnGrid) console.warn('btnGrid not found');
}

if (btnList && gridViewEl && listViewEl) {
    btnList.addEventListener('click', () => {
        gridViewEl.classList.add('hidden');
        listViewEl.classList.add('visible');
        btnList.classList.add('active');
        if (btnGrid) btnGrid.classList.remove('active');
    });
} else {
  if (!btnList) console.warn('btnList not found');
}
 
function highlightNow() {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const day = getDay(activeDayId);

    let top = 0;

    for (const slot of day.slots) {
        const start = timeToMins(slot.time);
        const end = timeToMins(slot.timeEnd);

        if (nowMins >= start && nowMins < end) {
            const slotEl = document.querySelector(`[data-slot="${slot.slotKey}"]`);
            if (!slotEl) return;

            const rect = slotEl.getBoundingClientRect();
            const parentRect = slotEl.closest('.schedule-grid').getBoundingClientRect();

            const progress = (nowMins - start) / (end - start);

            const y = rect.top - parentRect.top + rect.height * progress;

            const line = document.getElementById('nowLine');
            if (line) line.style.top = y + 'px';
            return;
        }
    }
}

function timeToMins(str) {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
}
