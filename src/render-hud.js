// pasek punktów, cząsteczki, napisy na planszy, rysowanie klatki i pętla gry
function drawHud() {
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(0, 0, W, 34);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'left';  ctx.fillText('Punkty: ' + score, 10, 23);
  const rec = 'Rekord: ' + Math.max(bestScore(), score);
  if (players.length > 1 && players[turn]) {
    // kilku graczy: na środku imię, rekord w drugim, mniejszym wierszu
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffd54a';
    ctx.fillText(`${players[turn].name} (${turn + 1}/${players.length})`, W / 2, 23);
    ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 34, 130, 22);
    ctx.fillStyle = '#ddd'; ctx.fillText(rec, 10, 50);
    ctx.font = 'bold 18px system-ui, sans-serif'; ctx.fillStyle = '#fff';
  } else {
    ctx.textAlign = 'center'; ctx.fillText(rec, W / 2, 23);
  }
  ctx.textAlign = 'right'; ctx.fillText('Życia: ' + '♥'.repeat(Math.max(lives, 0)), W - 10, 23);
}

function drawParticles() {
  for (const p of particles) {
    if (p.ring) {                                   // fala uderzeniowa
      ctx.globalAlpha = Math.max(0, p.life * 1.6);
      ctx.strokeStyle = '#fff3e0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, (0.5 - p.life) * 140 + 6, 0, Math.PI * 2); ctx.stroke();
      continue;
    }
    if (p.smoke) {                                  // dym rośnie i blednie
      ctx.globalAlpha = Math.max(0, p.life * 0.5);
      circle(p.x, p.y, p.size * (2 - p.life), p.color);
      continue;
    }
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.8));
    circle(p.x, p.y, (p.size || 2) * (0.5 + p.life), p.color);
  }
  ctx.globalAlpha = 1;
}

function overlay(title, lines) {
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillText(title, W / 2, H / 2 - 60);
  ctx.font = '18px system-ui, sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, W / 2, H / 2 - 10 + i * 30));
}

function draw() {
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  drawWorld();
  if (state === 'play' || state === 'pause') { drawPlane(); drawShield(); }
  drawParticles();
  drawAtmosphere();             // zachód słońca, noc z reflektorem (src/stages.js)
  drawPopups();
  if (state === 'play') drawStageBanner();
  if (state !== 'menu' && state !== 'results') { drawHud(); drawPowerHud(); }
  if (state === 'menu' || state === 'results') { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H); }
  if (state === 'pause') overlay('Pauza', ['Naciśnij P albo dotknij, aby grać dalej', 'M: menu (zmiana graczy i imion)']);
  if (state === 'next') {
    const prev = players[turn - 1], now = players[turn];
    overlay('Koniec tury', [
      `${prev.name}: ${prev.score} pkt`,
      '',
      `Teraz gra: ${now.name} (${turn + 1}/${players.length})`,
      'Enter albo dotknij, aby zacząć',
      'M: menu (zmiana graczy i imion)'
    ]);
  }
}

// ===== Pętla gry =====
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (state === 'play') update(dt);
  else {
    for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    particles = particles.filter(p => p.life > 0);
  }
  // nawet gdyby rysowanie kiedyś rzuciło błąd, pętla gry działa dalej
  requestAnimationFrame(loop);
  try { draw(); } catch (e) { console.error(e); }
  updateEngine(state === 'play');   // szum silnika tylko w trakcie lotu
}
