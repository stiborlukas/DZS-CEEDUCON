// Render grid
function renderGrid(day) {
    const colTemplate = `86px repeat(${day.rooms.length}, 1fr)`;

    let html = `<div class="schedule-wrapper">
        <div class="schedule-grid" style="grid-template-columns:${colTemplate}">
        <div id="nowLine"></div>`;

 
    // Header row
    html += `<div class="col-header">ČAS / SÁL</div>`;
    day.rooms.forEach(r => { html += `<div class="col-header">${r}</div>`; });
 
    day.slots.forEach(slot => {
        // Time cell
        html += `<div class="time-cell" data-slot="${slot.slotKey}">
        <span class="t-start">${slot.time}</span><span>${slot.timeEnd}</span>
        </div>`;
 
        if (slot.type === 'special') {
            if (slot.variant === 'plenary') {
            const span  = slot.rooms.length;
            const empty = day.rooms.length - span;
                html += `<div class="session plenery" style="grid-column:span ${span}"
                data-track="${slot.track}"
                data-title="${esc(slot.label)}"
                data-room="${slot.rooms.join('–')}"
                data-time="${slot.time}–${slot.timeEnd}">
                <div class="session-title">${esc(slot.label)}</div>
            </div>`;
            for (let i = 0; i < empty; i++) html += `<div class="empty-cell"></div>`;
            } else {
                html += `<div class="span-row ${slot.variant}" style="grid-column:2/-1">${slot.label}</div>`;
            }
 
        } else if (slot.type === 'sessions') {
        if (slot.plenary) {
            const span = slot.plenary.rooms.length;
            html += `<div class="session plenery" style="grid-column:span ${span}"
                data-track="${slot.plenary.track}"
                data-title="${esc(slot.plenary.title)}"
                data-room="${slot.plenary.rooms.join('–')}"
                data-time="${slot.time}–${slot.timeEnd}">
                <div class="session-title">${esc(slot.plenary.title)}</div>
                </div>`;
            // Fill empty cells for non-plenary rooms
            day.rooms
            .filter(r => !slot.plenary.rooms.includes(r))
            .forEach(room => {
                const s = slot.sessions?.[room];
                html += s ? buildSessionCell(s, room, slot) : `<div class="empty-cell"></div>`;
            });
        } else {
            day.rooms.forEach(room => {
                const s = slot.sessions?.[room];
                html += s ? buildSessionCell(s, room, slot) : `<div class="empty-cell"></div>`;
            });
        }
    }
    });
 
    html += `</div></div>`;
    return html;
}

function buildSessionCell(s, room, slot) {
    return `<div class="session"
        data-track="${s.track}"
        data-title="${esc(s.title)}"
        data-room="${room}"
        data-time="${slot.time}–${slot.timeEnd}">
        <div class="session-title">${esc(s.title)}</div>
        <div class="session-room">${room}</div>
    </div>`;
}

// Render list
function renderList(day) {
    let html = '';
 
    day.slots.forEach(slot => {
        html += `<div class="time-block">
        <div class="time-block-header">
            <div class="time-badge" data-slot="${slot.slotKey}">${slot.time} – ${slot.timeEnd}</div>
            <div class="time-block-line"></div>
        </div>
        <div class="cards-grid">`;
 
        if (slot.type === 'special') {
            if (slot.variant === 'plenary') {
                html += `<div class="card card-special">
                <div class="card-room">${slot.rooms.join(' – ')}</div>
                <div class="card-title">${esc(slot.label)}</div>
                </div>`;
            } else {
                html += `<div class="card card-special">
                <div class="card-room">${variantLabel(slot.variant)}</div>
                <div class="card-title">${slot.label}</div>
                </div>`;
            }
        } else if (slot.type === 'sessions') {
            if (slot.plenary) {
                html += `<div class="card card-special">
                <div class="card-room">${slot.plenary.rooms.join(' – ')}</div>
                <div class="card-title">${esc(slot.plenary.title)}</div>
                </div>`;
            }
            Object.entries(slot.sessions ?? {}).forEach(([room, s]) => {
            html += `<div class="card"
                data-track="${s.track}"
                data-title="${esc(s.title)}"
                data-room="${room}"
                data-time="${slot.time}–${slot.timeEnd}">
                <div class="card-room">${room}</div>
                <div class="card-title">${esc(s.title)}</div>
                <div class="card-track">${trackLabel(s.track)}</div>
                </div>`;
            });
        }
        html += `</div></div>`;
    });
 
    return html;
}