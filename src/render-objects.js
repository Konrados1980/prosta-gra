// rysowanie drzew, armatek i przeszkód
// Drzewa na lądzie i na wyspach; stoją zawsze w tych samych miejscach świata.
// Widok lekko z ukosa („trochę 3D”): pień, korona uniesiona nad ziemią, długi cień w prawo w dół
// (słońce z lewej góry, jak przy samolocie). Bliższe drzewa (niżej na ekranie) zasłaniają dalsze.
function drawTrees() {
  const ROW = 30, list = [];
  for (let i = Math.floor(cam / ROW) - 2; i <= Math.floor((cam + H) / ROW) + 3; i++) {
    const n = Math.round((2 + hash(i, 1) * 3) * W / 480);
    for (let k = 0; k < n; k++) {
      const x = hash(i, k + 40) * W, wy = i * ROW + hash(i, k + 60) * ROW;
      const size = 8 + hash(i, k + 80) * 9;
      // nie stawiamy drzew na plaży ani w wodzie
      const r = riverAt(wy), d = Math.abs(x - r.c);
      const onLand = d > r.w + size + 10, onIsland = r.iw > 0 && d < r.iw - size - 3;
      if (onLand || onIsland) list.push({ x, y: toScreenY(wy), size, pine: hash(i, k + 90) < 0.3 });
    }
  }
  const shadow = `rgba(0,0,0,${0.24 * (1 - 0.5 * pal.dark)})`;
  for (const t of list) ellipse(t.x + t.size * 0.9, t.y + t.size * 0.35, t.size * 1.25, t.size * 0.55, 0.45, shadow);
  list.sort((a, b) => a.y - b.y);
  for (const t of list) drawTree(t);
}
function drawTree({ x, y, size, pine }) {
  if (pine) size *= 1.35;                                  // iglaki są wyższe i szersze od liściastych
  const h = size * 1.2, c = pine ? pal.pine : pal.tree;   // kolory zależą od pory dnia (zimą ośnieżone czubki)
  ctx.fillStyle = '#5d4037'; ctx.fillRect(x - 1.5, y - h * 0.55, 3, h * 0.55);   // pień
  if (pine) {
    // iglak: trzy piętra stożka, lewa strona jaśniejsza (słońce), prawa ciemniejsza
    for (let k = 0; k < 3; k++) {
      const base = y - h * 0.35 - k * size * 0.55, top = base - size * 0.95, half = size * (0.95 - k * 0.22);
      tri(x - half, base, x, top, x, base, rgba(c[1]));
      tri(x, top, x + half, base, x, base, rgba(c[0]));
    }
    tri(x - size * 0.22, y - h * 0.35 - size * 1.55, x, y - h * 0.35 - size * 2.05, x + size * 0.22, y - h * 0.35 - size * 1.55, rgba(c[2]));
  } else {
    const cy = y - h * 0.75;
    circle(x + size * 0.12, cy + size * 0.12, size, rgba(c[0]));                    // ciemny spód i prawa strona
    circle(x - size * 0.15, cy - size * 0.15, size * 0.78, rgba(c[1]));
    circle(x - size * 0.4, cy - size * 0.4, size * 0.32, rgba(c[2]));               // odblask słońca
  }
}
function tri(x1, y1, x2, y2, x3, y3, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
}
function ellipse(x, y, rx, ry, rot, color) {
  if (!(rx > 0 && ry > 0)) return;
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
}

function circle(x, y, r, color) {
  if (!(r > 0)) return;          // ujemny promień wywróciłby rysowanie (i zatrzymał grę)
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function drawCannon(c) {
  const x = c.x, y = toScreenY(c.wy), d = c.dir;
  ellipse(x + 10, y + 9, 20, 10, 0.3, 'rgba(0,0,0,.25)');                // cień
  ctx.fillStyle = '#3e2723'; ctx.fillRect(x - 14, y + 6, 28, 6);              // bok podstawy
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
  // skała i głaz jako bryły: cień, piana przy podstawie, ciemny bok, jasny wierzch uniesiony o wysokość
  if (o.type === 'rock' || o.type === 'boulder') {
    const big = o.type === 'boulder', hgt = r * 0.45;
    ellipse(x + r * 0.55, y + r * 0.35, r * 1.15, r * 0.7, 0.4, 'rgba(0,0,0,.3)');
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y + r * 0.2, r + 3, (r + 3) * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
    ellipse(x, y, r, r * 0.8, 0, big ? '#4a3c30' : '#424242');                    // bok
    ellipse(x, y - hgt, r * 0.95, r * 0.75, 0, big ? '#7d6b5a' : '#6e6e6e');      // wierzch
    ellipse(x - r * 0.3, y - hgt - r * 0.2, r * 0.38, r * 0.25, -0.4, big ? '#a08c78' : '#9e9e9e');
  }
  if (o.type === 'boulder') {
    const ty = y - r * 0.45;                               // rysy na wierzchu głazu
    // rysy: im więcej trafień, tym więcej pęknięć
    const damage = TYPES.boulder.hp - o.hp;
    ctx.strokeStyle = '#2b2118'; ctx.lineWidth = 2;
    for (let i = 0; i < damage * 2; i++) {
      const a = i * 2.4 + 0.5;
      ctx.beginPath(); ctx.moveTo(x, ty);
      ctx.lineTo(x + Math.cos(a) * r * 0.5, ty + Math.sin(a) * r * 0.4 + 3);
      ctx.lineTo(x + Math.cos(a + 0.3) * r * 0.95, ty + Math.sin(a + 0.3) * r * 0.7);
      ctx.stroke();
    }
  }
  if (o.type === 'log') {
    const L = o.len / 2;
    ellipse(x + 6, y + 6, L + 2, r, 0, 'rgba(0,0,0,.25)');            // cień na wodzie
    const lg = ctx.createLinearGradient(0, y - r, 0, y + r);       // walec: jasna góra, ciemny dół
    lg.addColorStop(0, '#a1887f'); lg.addColorStop(0.5, '#6d4c41'); lg.addColorStop(1, '#3e2723');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.roundRect(x - L, y - r, o.len, r * 2, r); ctx.fill();
    ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 1.5;                     // kora
    for (let i = -L + 10; i < L - 6; i += 12) { ctx.beginPath(); ctx.moveTo(x + i, y - r + 2); ctx.lineTo(x + i + 6, y + r - 2); ctx.stroke(); }
    circle(x - L + 2, y, r - 1, '#d7b48a'); circle(x + L - 2, y, r - 1, '#d7b48a');   // słoje na końcach
    circle(x - L + 2, y, r * 0.35, '#a1784e'); circle(x + L - 2, y, r * 0.35, '#a1784e');
  }
  if (o.type === 'buoy') {
    const tilt = Math.sin(gt * 3.2 + o.ph) * 0.25;
    ellipse(x + 5, y + 5, r, r * 0.7, 0, 'rgba(0,0,0,.25)');          // cień
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    circle(0, 0, r, '#e53935');
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(0, 0, r, 0.2, Math.PI - 0.2); ctx.fill();   // ciemniejszy dół
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
