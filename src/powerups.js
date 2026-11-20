// bonusy: tarcza, potrójny strzał, spowolnienie, dodatkowe życie (pojawianie się, zbieranie, działanie, rysowanie)
const POWERUP_START = 800;            // pierwszy bonus po ok. 80 pkt dystansu
const POWERUP_GAP = [1800, 2800];     // odstęp między bonusami w jednostkach lotu (ok. 8–15 s)
const MAX_LIVES = 5;
// time = ile sekund działa; weight = jak często się pojawia (życie najrzadziej)
const POWERS = {
  shield: { name: 'Tarcza', time: 10, color: '#4dd0e1', weight: 3 },
  triple: { name: 'Potrójny strzał', time: 8, color: '#ff9800', weight: 3 },
  slow:   { name: 'Spowolnienie', time: 5, color: '#b388ff', weight: 2 },
  life:   { name: '+1 życie', time: 0, color: '#ff5252', weight: 1 },
};
let powerups = [], power = { shield: 0, triple: 0, slow: 0 }, nextPowerup = POWERUP_START;

function resetPowers() { powerups = []; power = { shield: 0, triple: 0, slow: 0 }; nextPowerup = POWERUP_START; }
const worldSpeed = () => (power.slow > 0 ? 0.5 : 1);   // spowolnienie: świat ×0,5, samolot steruje się normalnie

function pickPower() {
  const types = Object.keys(POWERS).filter(t => t !== 'life' || lives < MAX_LIVES);
  let roll = Math.random() * types.reduce((s, t) => s + POWERS[t].weight, 0);
  for (const t of types) { roll -= POWERS[t].weight; if (roll <= 0) return t; }
  return types[0];
}

function updatePowerups(dt) {
  for (const k in power) power[k] = Math.max(0, power[k] - dt);
  while (cam > POWERUP_START - H && nextPowerup < cam + H + 60) {
    const wy = nextPowerup;
    powerups.push({ type: pickPower(), x: randomWaterX(wy, 24), wy });
    nextPowerup += POWERUP_GAP[0] + Math.random() * (POWERUP_GAP[1] - POWERUP_GAP[0]);
  }
  const pwy = toWorldY(plane.y);
  for (const p of powerups) if (Math.hypot(p.x - plane.x, p.wy - pwy) < 28) collectPower(p);
  powerups = powerups.filter(p => !p.got && toScreenY(p.wy) < H + 40);
}

function collectPower(p) {
  p.got = true;
  const P = POWERS[p.type];
  if (p.type === 'life') lives = Math.min(MAX_LIVES, lives + 1);
  else power[p.type] = P.time;
  burst(p.x, toScreenY(p.wy), P.color, 18);
  popup(p.x, toScreenY(p.wy), P.name, P.color, 22);
  sfx('powerup');
}

// Tarcza przyjmuje jedno zderzenie zamiast życia (potem chwila ochrony, żeby odlecieć)
function shieldSaves() {
  if (power.shield <= 0) return false;
  power.shield = 0; invuln = 1.2;
  burst(plane.x, plane.y, '#4dd0e1', 24);
  popup(plane.x, plane.y - 30, 'Tarcza!', '#4dd0e1', 22);
  sfx('hit');
  return true;
}

// Strzał: zwykle 1 pocisk, z bonusem 3 w wachlarz (vx = ruch w bok)
function fireBullets() {
  const wy = toWorldY(plane.y - 18);
  bullets.push({ x: plane.x, wy, vx: 0 });
  if (power.triple > 0) bullets.push({ x: plane.x - 6, wy, vx: -140 }, { x: plane.x + 6, wy, vx: 140 });
}

// Ikona bonusu: świecąca bańka z symbolem
function drawPowerIcon(type, x, y) {
  const P = POWERS[type], pulse = 1 + 0.08 * Math.sin(performance.now() / 150);
  ctx.save(); ctx.translate(x, y); ctx.scale(pulse, pulse);
  ctx.shadowColor = P.color; ctx.shadowBlur = 14;
  circle(0, 0, 14, P.color); ctx.shadowBlur = 0;
  circle(0, 0, 11, 'rgba(255,255,255,.25)');
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  if (type === 'shield') { ctx.moveTo(0, -8); ctx.lineTo(7, -5); ctx.quadraticCurveTo(6, 5, 0, 9); ctx.quadraticCurveTo(-6, 5, -7, -5); ctx.closePath(); ctx.fill(); }
  if (type === 'triple') { for (const a of [-0.45, 0, 0.45]) { ctx.moveTo(0, 7); ctx.lineTo(Math.sin(a) * 10, 7 - Math.cos(a) * 14); } ctx.stroke(); }
  if (type === 'slow') { ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.moveTo(0, 0); ctx.lineTo(0, -5); ctx.moveTo(0, 0); ctx.lineTo(4, 2); ctx.stroke(); }
  if (type === 'life') { ctx.moveTo(0, 7); ctx.bezierCurveTo(-10, -1, -5, -9, 0, -4); ctx.bezierCurveTo(5, -9, 10, -1, 0, 7); ctx.fill(); }
  ctx.restore();
}
function drawPowerups() { for (const p of powerups) drawPowerIcon(p.type, p.x, toScreenY(p.wy)); }

// Bańka tarczy wokół samolotu (miga, gdy zostały ostatnie 2 sekundy)
function drawShield() {
  if (power.shield <= 0 || (power.shield < 2 && Math.floor(power.shield * 8) % 2 === 0)) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(77,208,225,.9)'; ctx.lineWidth = 2.5; ctx.shadowColor = '#4dd0e1'; ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(77,208,225,.12)';
  ctx.beginPath(); ctx.arc(plane.x, plane.y, 26 + Math.sin(performance.now() / 120), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Aktywne bonusy z pozostałym czasem (prawa strona, pod paskiem punktów)
function drawPowerHud() {
  let y = 52;
  ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'right';
  for (const k in power) {
    if (power[k] <= 0) continue;
    const text = `${POWERS[k].name} ${Math.ceil(power[k])} s`;
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(W - ctx.measureText(text).width - 18, y - 15, ctx.measureText(text).width + 18, 21);
    ctx.fillStyle = POWERS[k].color; ctx.fillText(text, W - 9, y);
    y += 24;
  }
}
