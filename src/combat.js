// zderzenia, armatki, trafienia, punkty i wybuchy
function crash() {
  explosion(plane.x, plane.y);
  lives--;
  if (lives <= 0) {
    endTurn();
    return;
  }
  // Odrodzenie na środku kanału i usunięcie pobliskich skał
  plane.y = H - 110;
  const wy = toWorldY(plane.y);
  plane.x = channelCenter(wy);
  obstacles = obstacles.filter(o => Math.abs(o.wy - wy) > 250);
  balls = [];
  for (const c of cannons) c.cd = Math.max(c.cd, 2);   // armatki dają chwilę na otrząśnięcie się
  invuln = 2;
  // palec dalej na ekranie: liczymy ruch od nowa; palec puszczony: zatrzymujemy samolot
  if (drag && !drag.released && drag.last) anchorDrag(drag.last);
  else drag = null;
}

// ===== Armatki na brzegu =====
const CANNON_START = 2000;    // pierwsza armatka po ok. 200 punktach dystansu
const CANNON_HP = 2, CANNON_POINTS = 40, BALL_POINTS = 5;
const BALL_R = 6, BALL_SPEED = 190;
const CHARGE_TIME = 0.6;      // tyle sekund lufa świeci na czerwono przed strzałem

// Stawia armatkę na lądzie tuż przy brzegu (lewym albo prawym), lufą w stronę rzeki
function makeCannon(wy) {
  const r = riverAt(wy);
  const sides = Math.random() < 0.5 ? [-1, 1] : [1, -1];
  for (const side of sides) {
    const x = side < 0 ? r.c - r.w - 22 : r.c + r.w + 22;
    if (x < 20 || x > W - 20) continue;
    // cała armatka musi stać na lądzie, także trochę wyżej i niżej
    if ([-16, 0, 16].some(d => inWater(x - 14, wy + d) || inWater(x + 14, wy + d))) continue;
    // cd = czas do pierwszego strzału (zawsze dłuższy niż czerwone ostrzeżenie)
    return { x, wy, dir: -side, hp: CANNON_HP, cd: CHARGE_TIME + 0.1 + Math.random() * 0.5, flash: 0 };
  }
  return null;
}

function updateCannons(dt) {
  // nowe armatki: coraz częściej im dalej lecisz
  while (cam > CANNON_START - H && nextCannon < cam + H + 60) {
    const c = makeCannon(nextCannon);
    if (c) cannons.push(c);
    nextCannon += Math.max(500, 1300 - cam * 0.01) * (0.7 + Math.random() * 0.6);
  }
  for (const c of cannons) {
    c.flash = Math.max(0, c.flash - dt);
    const sy = toScreenY(c.wy);
    // strzela tylko, gdy jest na ekranie i wyraźnie przed samolotem (uczciwie: widzisz ją wcześniej)
    if (sy < 60 || sy > plane.y - 60) continue;
    const before = c.cd;
    c.cd -= dt;
    if (before >= CHARGE_TIME && c.cd < CHARGE_TIME) sfx('warn');   // lufa zaczyna świecić
    if (c.cd <= 0) {
      balls.push({ x: c.x + c.dir * 22, wy: c.wy, vx: c.dir * BALL_SPEED, wet: false });
      sfx('cannon');
      burst(c.x + c.dir * 22, sy, '#ffcc80', 8);
      c.cd = 2.2 + Math.random() * 1.3;
    }
  }
  // kule lecą poziomo przez rzekę i rozbijają się na drugim brzegu albo na wyspie
  for (const k of balls) {
    k.x += k.vx * dt;
    const water = inWater(k.x, k.wy);
    if (water) k.wet = true;
    if (k.x < -20 || k.x > W + 20) k.dead = true;
    else if (k.wet && !water) { k.dead = true; burst(k.x, toScreenY(k.wy), '#a1887f', 8); }
  }
  balls = balls.filter(k => !k.dead && toScreenY(k.wy) < H + 20);
  cannons = cannons.filter(c => !c.dead && toScreenY(c.wy) < H + 40);
}

function hitCannon(c, b) {
  const sy = toScreenY(c.wy);
  b.dead = true;
  c.hp--; c.flash = 0.12;
  if (c.hp > 0) { burst(b.x, sy, '#ffffff', 6); sfx('hit'); return; }
  c.dead = true;
  bonus += CANNON_POINTS;
  explosion(c.x, sy);
  popup(c.x, sy, '+' + CANNON_POINTS, '#ff7043', 30);
}

// Trafienie przeszkody: odejmuje 1 punkt wytrzymałości; przy zerze przeszkoda pęka i daje punkty
function hitObstacle(o, b) {
  const T = TYPES[o.type], sy = toScreenY(o.wy);
  b.dead = true;
  o.hp--; o.flash = 0.12;
  if (o.hp > 0) { burst(b.x, sy, '#ffffff', 6); sfx('hit'); return; }
  o.dead = true;
  sfx('break');
  bonus += T.pts;
  burst(o.x, sy, T.color, 14 + T.pts / 2);
  popup(o.x, sy, '+' + T.pts, T.color, T.pts >= 25 ? 30 : 24);
}

// Napis z punktami: pojawia się duży i szybko maleje do normalnego rozmiaru
function popup(x, y, text, color, size = 22) { popups.push({ x, y, text, color, size, life: 1 }); }

function burst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 160;
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.4 + Math.random() * 0.5, color, size: 1.5 + Math.random() * 2.5 });
  }
}
// Duży wybuch: błysk, rozchodzący się pierścień, ogień i dym
function explosion(x, y) {
  sfx('explosion');
  particles.push({ x, y, vx: 0, vy: 0, life: 0.5, ring: true });
  burst(x, y, '#fff59d', 10);
  burst(x, y, '#ff9800', 18);
  burst(x, y, '#e64a19', 14);
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, v = 15 + Math.random() * 40;
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0.8 + Math.random() * 0.5, color: '#616161', size: 5 + Math.random() * 5, smoke: true });
  }
}
