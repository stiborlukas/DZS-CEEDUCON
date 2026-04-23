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
tick(); setInterval(tick, 1000);

// Load data from json file
async function loadData() {
  try {
    const res = await fetch('../data/data.json'); // relative to site root
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('loaded data', data);
    
    SCHEDULE_DATA = data;
    mount(activeDayId);

  } catch (err) {
    console.error('Failed to load JSON:', err);
  }
}

loadData();

function renderGrid(day) {
    if (!day || !day.slots) {
        return '<div class="empty">no data for this day</div>';
    }

    const rooms = day.rooms; 
    let html = '';

    day.slots.forEach(slot => {        
        if (slot.type === 'sessions') {
            rooms.forEach(room => {
                const session = slot.sessions[room];
                
                if (session) {
                    const track = session.track || '';
                    const title = session.title || '';
                    
                    html += `
                        <div class="session" data-track="${track}">
                            <div class="session-title">${title}</div>
                            <div class="session-room">${room}</div>
                        </div>`;
                }
            });
        }
    });

    return html;
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
    //document.getElementById('listView').innerHTML = renderList(day);

    applyFilter();
}
