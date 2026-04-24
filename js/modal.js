function bindSessionClicks() {
    document.querySelectorAll('.session[data-title]:not(.plenery), .card[data-track]:not(.card-special)').forEach(el => {
        el.addEventListener('click', () => {
            const t = el.dataset.track;
            // use helper from script.js (trackColor / trackLabel)
            const color = (typeof trackColor === 'function') ? trackColor(t) : (TRACK_COLORS?.[t] || '#888');
            const label = (typeof trackLabel === 'function') ? trackLabel(t) : (el.dataset.trackLabel || t);

            document.getElementById('modalBar').style.background = color;
            document.getElementById('modalRoom').textContent  = 'Sál ' + (el.dataset.room || '');
            document.getElementById('modalTime').textContent  = '⏱ ' + (el.dataset.time || '');
            document.getElementById('modalTitle').textContent = el.dataset.title || '';
            const lbl = document.getElementById('modalTrackLabel');
            lbl.textContent = label;
            lbl.style.background = color;
            document.getElementById('modal').classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });
}

function closeModal() {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
