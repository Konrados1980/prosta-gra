// nowa gra i logika każdej klatki (ruch, strzały, zderzenia)
// ===== Nowa gra =====
function newGame() {
  cam = 0; lives = 3; score = 0; bonus = 0;
  obstacles = []; rings = []; particles = []; segments = []; gt = 0;
  cannons = []; balls = []; nextCannon = CANNON_START;
  bullets = []; shotCd = 0; wantShot = false; popups = [];
  plane = { x: W / 2, y: H - 110, roll: 0, boost: 0 };
  invuln = 1.5; nextSpawn = 400;
  state = 'play';
}

// ===== Logika =====
function update(dt) {
  // Sterowanie: lewo/prawo = na boki, góra/dół = do przodu/do tyłu
  const side = 260, fwd = 200;
  if (keys.ArrowLeft) plane.x -= side * dt;
  if (keys.ArrowRight) plane.x += side * dt;
  if (keys.ArrowUp) plane.y -= fwd * dt;
  if (keys.ArrowDown) plane.y += fwd * dt;
  if (drag) {
    // samolot goni pozycję palca, ale nie szybciej niż przy strzałkach (×1.3)
    const dx = drag.tx - plane.x, dy = drag.ty - plane.y;
    const mx = side * 1.3 * dt, my = fwd * 1.3 * dt;
    plane.x += Math.max(-mx, Math.min(mx, dx));
    plane.y += Math.max(-my, Math.min(my, dy));
    if (drag.released && Math.abs(dx) <= mx && Math.abs(dy) <= my) drag = null;
  }
  // Wiry wciągają samolot do środka (da się wyrwać, lecąc w bok)
  for (const o of obstacles) {
    if (o.type !== 'whirl') continue;
    const dx = plane.x - o.x, dy = plane.y - toScreenY(o.wy), d = Math.hypot(dx, dy);
    if (d < o.pull && d > 1) {
      const f = 120 * (1 - d / o.pull);
      plane.x -= dx / d * f * dt;
      plane.y -= dy / d * f * dt;
    }
  }
  // Przechył skrzydeł przy skręcaniu (tylko wygląd): liczony z tego, jak szybko samolot leci w bok
  const vx = (plane.x - (plane.px ?? plane.x)) / Math.max(dt, 1e-6);
  plane.roll += (Math.max(-1, Math.min(1, vx / 260)) - plane.roll) * Math.min(1, dt * 10);
  plane.boost = keys.ArrowUp ? 1 : 0;
  plane.x = Math.max(15, Math.min(W - 15, plane.x));
  plane.px = plane.x;
  plane.y = Math.max(120, Math.min(H - 40, plane.y));

  // Prędkość: rośnie z dystansem, a lot "do przodu" dodatkowo przyspiesza
  const base = Math.min(110 + cam * 0.012, 300);
  const speed = base + (H - 40 - plane.y) * 0.35;
  cam += speed * dt;
  gt += dt;
  score = Math.floor(cam / 10) + bonus;
  updateStage(dt);                // nowy etap = nowa pora dnia (src/stages.js)
  moveObstacles(dt);

  // Strzelanie: Spacja albo X (można trzymać)
  shotCd -= dt;
  if ((keys.Space || keys.KeyX || wantShot) && shotCd <= 0) {
    bullets.push({ x: plane.x, wy: toWorldY(plane.y - 18) });
    sfx('shot');
    shotCd = SHOT_DELAY;
    wantShot = false;
  }
  // Pociski lecą w górę; znikają poza ekranem albo nad lądem
  for (const b of bullets) {
    b.wy += (speed + SHOT_SPEED) * dt;
    if (toScreenY(b.wy) < 34) { b.dead = true; continue; }
    // armatki stoją na brzegu, więc sprawdzamy je przed lądem
    const cn = cannons.find(c => !c.dead && Math.hypot(c.x - b.x, c.wy - b.wy) < 18);
    if (cn) { hitCannon(cn, b); continue; }
    const ball = balls.find(k => !k.dead && Math.hypot(k.x - b.x, k.wy - b.wy) < BALL_R + 5);
    if (ball) {
      ball.dead = true; b.dead = true; bonus += BALL_POINTS; sfx('hit');
      burst(ball.x, toScreenY(ball.wy), '#bdbdbd', 10);
      popup(ball.x, toScreenY(ball.wy), '+' + BALL_POINTS, '#bdbdbd', 18);
      continue;
    }
    if (!inWater(b.x, b.wy)) { b.dead = true; burst(b.x, toScreenY(b.wy), '#a1887f', 5); continue; }
    const o = obstacles.find(o => !o.dead && bodyDist(o, b.x, b.wy) < (o.type === 'whirl' ? 8 : 4));
    if (o) hitObstacle(o, b);
  }
  bullets = bullets.filter(b => !b.dead);
  obstacles = obstacles.filter(o => !o.dead);

  updateCannons(dt);

  // Nowe przeszkody i gwiazdki pojawiają się nad ekranem
  while (nextSpawn < cam + H + 60) {
    const wy = nextSpawn;
    const o = Math.random() < 0.55 ? makeObstacle(wy) : null;
    if (o) obstacles.push(o);
    else rings.push({ x: randomWaterX(wy, 20), wy, got: false });
    nextSpawn += Math.max(90, 220 - cam * 0.004) * (0.6 + Math.random() * 0.8);
  }
  obstacles = obstacles.filter(o => toScreenY(o.wy) < H + 60);
  rings = rings.filter(o => toScreenY(o.wy) < H + 40 && !o.got);

  // Gwiazdki: +25 pkt za przelot
  const pwy = toWorldY(plane.y);
  for (const g of rings) {
    if (Math.hypot(g.x - plane.x, g.wy - pwy) < 26) {
      g.got = true; bonus += 25; sfx('star');
      burst(g.x, toScreenY(g.wy), '#ffd54a', 14);
      popup(g.x, toScreenY(g.wy), '+25', '#ffd54a');
    }
  }
  // Napisy z punktami unoszą się do góry i znikają
  for (const p of popups) { p.y -= 40 * dt; p.life -= dt; }
  popups = popups.filter(p => p.life > 0);

  // Zderzenia (gdy nie ma chwilowej ochrony)
  if (invuln > 0) { invuln -= dt; }
  else {
    const pts = [[0, -16], [-15, 2], [15, 2], [0, 12], [-6, 12], [6, 12]];
    let hit = pts.some(([dx, dy]) => !inWater(plane.x + dx, toWorldY(plane.y + dy)));
    if (!hit) hit = obstacles.some(o => o.type !== 'whirl' && bodyDist(o, plane.x, pwy) < 11);
    if (!hit) hit = balls.some(k => Math.hypot(k.x - plane.x, k.wy - pwy) < BALL_R + 11);
    if (hit) crash();
  }

  // Cząsteczki (wybuchy, błyski)
  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  particles = particles.filter(p => p.life > 0);
}
