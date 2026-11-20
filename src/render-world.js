// rysowanie świata: trawa, rzeka, plaże, fale, wyspy
// ===== Rysowanie =====
// Stała "losowość": ta sama liczba dla tego samego miejsca, więc drzewa i fale nie skaczą
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

// Kontur rzeki: lewy brzeg z góry na dół, prawy z dołu do góry; "half" mówi, jak szeroko
function riverPath(rows, half) {
  ctx.beginPath();
  rows.forEach((p, i) => { const x = p.r.c - half(p.r); i ? ctx.lineTo(x, p.y) : ctx.moveTo(x, p.y); });
  for (let i = rows.length - 1; i >= 0; i--) ctx.lineTo(rows[i].r.c + half(rows[i].r), rows[i].y);
  ctx.closePath();
}
function edgeLine(rows, xOf) {
  ctx.beginPath();
  rows.forEach((p, i) => { const x = xOf(p.r); i ? ctx.lineTo(x, p.y) : ctx.moveTo(x, p.y); });
}

function drawWorld() {
  const anim = performance.now() / 1000;
  pal = stageInfo(cam).pal;                     // kolory bieżącej pory dnia (src/stages.js)
  // Ląd: trawa z jaśniejszymi i ciemniejszymi kępami
  ctx.fillStyle = rgba(pal.grass);
  ctx.fillRect(0, 0, W, H);
  const PATCH = 70;
  for (let i = Math.floor(cam / PATCH) - 1; i <= Math.floor((cam + H) / PATCH) + 1; i++) {
    for (let k = 0; k < 3 + W / 300; k++) {
      const x = hash(i, k) * W, sy = toScreenY(i * PATCH + hash(i, k + 9) * PATCH);
      ctx.fillStyle = rgba(hash(i, k + 3) < 0.5 ? pal.patchDark : pal.patchLight);
      ctx.beginPath(); ctx.ellipse(x, sy, 20 + hash(i, k + 5) * 30, 12 + hash(i, k + 7) * 16, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Punkty brzegu co 6 jednostek (z zapasem poza ekranem)
  const rows = [];
  for (let y = -12; y <= H + 12; y += 6) rows.push({ y, r: riverAt(toWorldY(y)) });

  // Piaszczysta plaża, woda, głębia na środku
  riverPath(rows, r => r.w + 8);  ctx.fillStyle = rgba(pal.sand); ctx.fill();
  riverPath(rows, r => r.w + 3);  ctx.fillStyle = rgba(pal.wetSand); ctx.fill();
  riverPath(rows, r => r.w);      ctx.fillStyle = rgba(pal.water); ctx.fill();
  riverPath(rows, r => r.w * 0.6); ctx.fillStyle = rgba(pal.deep); ctx.fill();
  riverPath(rows, r => r.w * 0.3); ctx.fillStyle = rgba(pal.deep); ctx.globalAlpha = 0.65; ctx.fill(); ctx.globalAlpha = 1;
  // Piana przy brzegach
  ctx.strokeStyle = rgba(pal.foam); ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  edgeLine(rows, r => r.c - r.w + 1); ctx.stroke();
  edgeLine(rows, r => r.c + r.w - 1); ctx.stroke();

  // Fale: krótkie jasne łuki, które lekko się kołyszą
  const WAVE = 44;
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = Math.floor(cam / WAVE) - 1; i <= Math.floor((cam + H) / WAVE) + 1; i++) {
    for (let k = 0; k < 4; k++) {
      const wy = i * WAVE + hash(i, k + 20) * WAVE, r = riverAt(wy);
      const x = r.c + (hash(i, k + 30) * 2 - 1) * r.w * 0.8 + Math.sin(anim * 1.5 + i + k) * 4;
      if (!inWater(x - 10, wy) || !inWater(x + 10, wy)) continue;
      const sy = toScreenY(wy);
      ctx.beginPath(); ctx.arc(x, sy - 6, 8, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
    }
  }

  // Wyspy: każdy ciągły kawałek z wyspą rysujemy jako osobny gładki kształt
  let run = [];
  const flush = () => {
    if (run.length > 1) {
      riverPath(run, r => r.iw + 6 * Math.min(1, r.iw / 6)); ctx.fillStyle = rgba(pal.sand); ctx.fill();   // końce wyspy zwężają się w szpic
      ctx.strokeStyle = rgba(pal.foam); ctx.lineWidth = 2.5; ctx.stroke();
      riverPath(run, r => Math.max(0, r.iw - 1)); ctx.fillStyle = rgba(pal.grass); ctx.fill();
    }
    run = [];
  };
  for (const p of rows) { if (p.r.iw > 0.5) run.push(p); else flush(); }
  flush();
  drawIce();

  drawTrees();
  // Przeszkody (wiry najpierw, bo leżą "pod" resztą)
  for (const o of obstacles) if (o.type === 'whirl') drawObstacle(o);
  for (const o of obstacles) if (o.type !== 'whirl') drawObstacle(o);
  for (const c of cannons) drawCannon(c);
  for (const k of balls) {
    const sy = toScreenY(k.wy);
    ctx.fillStyle = 'rgba(255,255,255,.35)';                          // smuga za kulą
    ctx.fillRect(k.vx > 0 ? k.x - 22 : k.x, sy - 2, 22, 4);
    circle(k.x, sy, BALL_R, '#212121');
    circle(k.x - 2, sy - 2, 2, '#757575');
  }
  // Złote gwiazdki (nagroda: zbierasz je przelotem)
  const t = performance.now() / 1000;
  for (const g of rings) drawStar(g.x, toScreenY(g.wy), 16, t * 2 + g.x);
  // Pociski: świecące smugi
  ctx.save();
  ctx.shadowColor = '#ffeb3b'; ctx.shadowBlur = 8; ctx.lineCap = 'round';
  for (const b of bullets) {
    const sy = toScreenY(b.wy);
    const g = ctx.createLinearGradient(0, sy - 8, 0, sy + 10);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#fff176'); g.addColorStop(1, 'rgba(255,152,0,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(b.x, sy - 8); ctx.lineTo(b.x, sy + 10); ctx.stroke();
  }
  ctx.restore();
}
