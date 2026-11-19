// rysowanie drzew, armatek i przeszkód
// Drzewa na lądzie i na wyspach (z cieniem); stoją zawsze w tych samych miejscach świata
function drawTrees() {
  const ROW = 30;
  for (let i = Math.floor(cam / ROW) - 2; i <= Math.floor((cam + H) / ROW) + 2; i++) {
    const n = Math.round((2 + hash(i, 1) * 3) * W / 480);
    for (let k = 0; k < n; k++) {
      const x = hash(i, k + 40) * W, wy = i * ROW + hash(i, k + 60) * ROW;
      const size = 8 + hash(i, k + 80) * 9;
      // nie stawiamy drzew na plaży ani w wodzie
      const r = riverAt(wy), d = Math.abs(x - r.c);
      const onLand = d > r.w + size + 10, onIsland = r.iw > 0 && d < r.iw - size - 3;
      if (!onLand && !onIsland) continue;
      const y = toScreenY(wy);
      const dark = hash(i, k + 90) < 0.3;          // część drzew to ciemne iglaki
      circle(x + 5, y + 6, size, 'rgba(0,0,0,.22)');                         // cień
      circle(x, y, size, dark ? '#1b5e20' : '#2e7d32');
      circle(x - size * 0.25, y - size * 0.25, size * 0.65, dark ? '#2e7d32' : '#43a047');
      circle(x - size * 0.4, y - size * 0.4, size * 0.3, dark ? '#388e3c' : '#66bb6a');
    }
  }
}

function circle(x, y, r, color) {
  if (!(r > 0)) return;          // ujemny promień wywróciłby rysowanie (i zatrzymał grę)
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function drawCannon(c) {
  const x = c.x, y = toScreenY(c.wy), d = c.dir;
  ctx.fillStyle = '#5d4037';                                          // drewniana podstawa
  ctx.fillRect(x - 14, y - 10, 28, 20);
  // lufa: świeci na czerwono, gdy armatka zaraz wystrzeli
  const sy = y;
  const aiming = sy >= 60 && sy <= plane.y - 60 && c.cd < CHARGE_TIME;
  ctx.fillStyle = aiming && Math.floor(gt * 12) % 2 === 0 ? '#ff1744' : '#37474f';
  ctx.fillRect(d > 0 ? x : x - 24, y - 5, 24, 10);
  circle(x, y, 9, '#263238');                                         // korpus
  circle(x - 8, y + 10, 4, '#3e2723'); circle(x + 8, y + 10, 4, '#3e2723');   // kółka
  if (c.hp < CANNON_HP) { ctx.strokeStyle = '#ffab91'; ctx.lineWidth = 2;  // rysa po trafieniu
    ctx.beginPath(); ctx.moveTo(x - 5, y - 6); ctx.lineTo(x + 2, y); ctx.lineTo(x - 2, y + 6); ctx.stroke(); }
  if (c.flash > 0) { ctx.globalAlpha = 0.7; circle(x, y, 14, '#fff'); ctx.globalAlpha = 1; }
}

function drawObstacle(o) {
  const x = o.x, y = toScreenY(o.wy), r = o.r;
  if (o.type === 'rock') {
    circle(x, y, r, '#5d5d5d');
    circle(x - r * 0.3, y - r * 0.3, r * 0.45, '#8a8a8a');
  }
  if (o.type === 'boulder') {
    circle(x + 3, y + 4, r, 'rgba(0,0,0,.25)');            // cień
    circle(x, y, r, '#6d5c4d');
    circle(x - r * 0.3, y - r * 0.35, r * 0.5, '#8d7b6a');
    // rysy: im więcej trafień, tym więcej pęknięć
    const damage = TYPES.boulder.hp - o.hp;
    ctx.strokeStyle = '#2b2118'; ctx.lineWidth = 2;
    for (let i = 0; i < damage * 2; i++) {
      const a = i * 2.4 + 0.5;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5 + 3);
      ctx.lineTo(x + Math.cos(a + 0.3) * r * 0.95, y + Math.sin(a + 0.3) * r * 0.95);
      ctx.stroke();
    }
  }
  if (o.type === 'log') {
    const L = o.len / 2;
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath(); ctx.roundRect(x - L, y - r, o.len, r * 2, r); ctx.fill();
    ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 1.5;                     // kora
    for (let i = -L + 10; i < L - 6; i += 12) { ctx.beginPath(); ctx.moveTo(x + i, y - r + 2); ctx.lineTo(x + i + 6, y + r - 2); ctx.stroke(); }
    circle(x - L + 2, y, r - 1, '#d7b48a'); circle(x + L - 2, y, r - 1, '#d7b48a');   // słoje na końcach
    circle(x - L + 2, y, r * 0.35, '#a1784e'); circle(x + L - 2, y, r * 0.35, '#a1784e');
  }
  if (o.type === 'buoy') {
    const tilt = Math.sin(gt * 3.2 + o.ph) * 0.25;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    circle(0, 0, r, '#e53935');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-r, -3, r * 2, 6);
    circle(0, -r + 1, 3, '#263238');
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;        // fale wokół boi
    ctx.beginPath(); ctx.arc(x, y, r + 5 + Math.sin(gt * 4) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  if (o.type === 'whirl') {
    ctx.fillStyle = 'rgba(13,71,161,.25)';                               // strefa wciągania
    ctx.beginPath(); ctx.arc(x, y, o.pull, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.7 - i * 0.2})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, r + i * 12, o.spin + i * 2, o.spin + i * 2 + 4); ctx.stroke();
    }
    circle(x, y, r * 0.7 * (o.hp / TYPES.whirl.hp + 0.3), '#0d47a1');
  }
  // krótki biały błysk po trafieniu
  if (o.flash > 0) {
    ctx.globalAlpha = 0.7;
    if (o.type === 'log') { ctx.fillStyle = '#fff'; ctx.fillRect(x - o.len / 2, y - r, o.len, r * 2); }
    else circle(x, y, r, '#fff');
    ctx.globalAlpha = 1;
  }
}
