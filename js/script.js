const clockEl = document.getElementById('liveClock');
function tick() {
  const t = new Date();
  clockEl.textContent = t.toLocaleTimeString('cs-CZ', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
tick(); setInterval(tick, 1000);
