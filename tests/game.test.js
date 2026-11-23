// Testy logiki gry "Lot nad Rzeką". Uruchom: npm test
// Każdy test pilnuje czegoś, co już raz się zepsuło albo o co prosił gracz (patrz tasks/lessons.md).
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadGame } = require("./helpers/load-game");

test("gra się ładuje i startuje w menu", () => {
  const g = loadGame();
  assert.equal(g.run("state"), "menu");
});

test("pierwsza klatka gry rysuje się bez błędu (rzeka poniżej startu)", () => {
  const g = loadGame();
  g.run("menuCount = 1; startFromMenu(); draw()");
  assert.equal(g.run("state"), "play");
});

test("środek rzeki bez wyspy to woda (błąd z wersji 1.0–1.3)", () => {
  const g = loadGame();
  g.run("newGame()");
  assert.equal(g.run("inWater(riverAt(100).c, 100)"), true);
});

for (const width of [480, 1212]) {
  test(`rzeka jest szeroka i mieści się na ekranie (W=${width})`, () => {
    const g = loadGame();
    const r = g.run(`
      W = ${width}; segments = []; cam = 0;
      let minRiver = 1e9, minChannel = 1e9, outside = 0;
      for (let wy = 0; wy < 160 * 400; wy += 8) {
        const r = riverAt(wy);
        minRiver = Math.min(minRiver, 2 * r.w);
        if (r.iw > 0.5) minChannel = Math.min(minChannel, r.w - r.iw);
        if (r.c - r.w < 0 || r.c + r.w > W) outside++;
      }
      ({ minRiver, minChannel, outside })`);
    assert.ok(r.minRiver >= 220, `najwęższa rzeka ${r.minRiver} < 220`);
    assert.ok(r.minChannel >= 100, `najwęższa odnoga ${r.minChannel} < 100`);
    assert.equal(r.outside, 0, "rzeka wychodzi poza ekran");
  });
}

test("2 minuty gry bez błędów, przeszkody tylko na szerokiej wodzie, armatki na lądzie", () => {
  const g = loadGame();
  const r = g.run(`
    menuCount = 1; startFromMenu();
    let bad = 0, cannonsInWater = 0;
    for (let i = 0; i < 60 * 120; i++) {
      update(1 / 60);
      plane.x = channelCenter(toWorldY(plane.y)); invuln = 1;   // "autopilot" bez zderzeń
      for (const o of obstacles) if (!wideRiver(o.wy)) bad++;
      for (const c of cannons) if (inWater(c.x, c.wy)) cannonsInWater++;
      if (i % 30 === 0) draw();
    }
    ({ bad, cannonsInWater, state })`);
  assert.equal(r.bad, 0, "przeszkoda na wąskiej wodzie");
  assert.equal(r.cannonsInWater, 0, "armatka w wodzie");
  assert.equal(r.state, "play");
});

test("ujemny promień nie wywraca rysowania (błąd z wersji 1.9)", () => {
  const g = loadGame();
  assert.doesNotThrow(() => g.run("circle(10, 10, -0.5, '#000')"));
  // wybuch, a potem ekran wyników: cząsteczki dalej się rysują
  g.run("menuCount = 1; startFromMenu(); explosion(100, 100); lives = 1; invuln = 0; crash()");
  assert.equal(g.run("state"), "results");
  assert.doesNotThrow(() => g.run("for (let i = 0; i < 120; i++) { loop(i * 16); }"));
});

test("punkty za przeszkody i liczba trafień", () => {
  const g = loadGame();
  const r = g.run(`
    newGame();
    const res = {};
    for (const type of Object.keys(TYPES)) {
      const o = { type, x: 0, wy: 0, hp: TYPES[type].hp, flash: 0 };
      const b0 = bonus; let hits = 0;
      while (!o.dead && hits < 10) { hitObstacle(o, {}); hits++; }
      res[type] = { hits, points: bonus - b0 };
    }
    res`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), {
    rock: { hits: 1, points: 10 }, log: { hits: 1, points: 15 }, buoy: { hits: 1, points: 20 },
    whirl: { hits: 2, points: 25 }, boulder: { hits: 3, points: 50 },
  });
});

test("zmiana szerokości okna w trakcie gry zostawia rzekę na ekranie (błąd z wersji 1.6)", () => {
  const g = loadGame({ width: 1400, height: 800 });
  const r = g.run(`
    resize(); menuCount = 1; startFromMenu();
    for (let i = 0; i < 60 * 40; i++) { update(1 / 60); plane.x = channelCenter(toWorldY(plane.y)); invuln = 1; }
    const before = W;
    innerWidth = 500; innerHeight = 800; resize();
    let visible = true;
    for (let y = 0; y < H; y += 20) { const r = riverAt(toWorldY(y)); if (r.c + r.w < 0 || r.c - r.w > W) visible = false; }
    ({ before, after: W, visible })`);
  assert.ok(r.before > r.after, "okno się nie zwęziło");
  assert.equal(r.visible, true, "rzeka uciekła poza ekran");
});

test("4 graczy: tury po kolei, wyniki i zapis rekordów", () => {
  const g = loadGame();
  const r = g.run(`
    menuCount = 4; menuNames = ['Ania', 'Bartek', 'Ola', 'Kuba']; showMenu(); startFromMenu();
    const scores = [300, 900, 100, 500];
    for (const s of scores) { if (state === 'next') startTurn(); score = s; lives = 1; crash(); }
    ({ state, winner: lastRound[0].name, top: topList.map(t => t.score) })`);
  assert.equal(r.state, "results");
  assert.equal(r.winner, "Bartek");
  assert.deepEqual([...r.top].slice(0, 4), [900, 500, 300, 100]);
  assert.ok(g.store.lotNadRzeka_top.includes("Bartek"), "rekordy nie zapisały się w localStorage");
});

test("imię gracza nie może wstrzyknąć HTML", () => {
  const g = loadGame();
  assert.equal(g.run("esc('<b>Ola</b>')"), "&lt;b&gt;Ola&lt;/b&gt;");
});

test("etapy: co 1000 pkt dystansu nowa pora dnia, po zimie wraca dzień", () => {
  const g = loadGame();
  const r = g.run(`[0, 9000, 10000, 20000, 30000, 40000].map(c => { const s = stageInfo(c); return s.n + ':' + s.name; })`);
  assert.deepEqual([...r], ["1:Dzień", "1:Dzień", "2:Zachód słońca", "3:Noc", "4:Zima", "5:Dzień"]);
  // płynne przejście: w połowie zmiany kolor trawy jest między dniem a zachodem
  const mid = g.run(`stageInfo(STAGE_LENGTH - STAGE_BLEND / 2).pal.grass[0]`);
  assert.ok(mid > 61 && mid < 92, `kolor w przejściu: ${mid}`);
});

test("etapy: napis „Etap N” przy zmianie i rysowanie każdej pory bez błędu (noc, zima)", () => {
  const g = loadGame();
  const r = g.run(`
    menuCount = 1; startFromMenu();
    cam = STAGE_LENGTH - 5; update(1 / 60);
    const before = stageBanner;
    cam = STAGE_LENGTH + 5; update(1 / 60);
    const banner = stageBanner && stageBanner.text + ' ' + stageBanner.sub;
    for (const c of [5000, 15000, 25000, 35000, 29000]) { cam = c; invuln = 1; update(1 / 60); draw(); }
    newGame(); update(1 / 60);
    ({ before, banner, afterNewGame: curStage })`);
  assert.equal(r.before, null);
  assert.equal(r.banner, "Etap 2 Zachód słońca");
  assert.equal(r.afterNewGame, 1, "nowa gra nie wraca do etapu 1");
});

// Udawany „syntezator” przeglądarki: liczy utworzone dźwięki
function fakeAudio() {
  const stats = { oscillators: 0, noises: 0 };
  const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime(v) { this.value = v; } });
  const node = extra => ({ connect() {}, start() {}, stop() {}, gain: param(), frequency: param(), ...extra });
  class AudioContext {
    constructor() { this.currentTime = 0; this.sampleRate = 8000; this.destination = {}; this.state = "running"; }
    createGain() { return node(); }
    createOscillator() { stats.oscillators++; return node(); }
    createBiquadFilter() { return node(); }
    createBufferSource() { stats.noises++; return node(); }
    createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; }
  }
  return { AudioContext, stats };
}

test("dźwięki: bez obsługi dźwięku w przeglądarce gra działa dalej", () => {
  const g = loadGame();
  assert.doesNotThrow(() => g.run("initAudio(); sfx('shot'); sfx('explosion'); updateEngine(true)"));
  assert.deepEqual([...g.run("soundLog")], ["shot", "explosion"]);
});

test("dźwięki: strzał, gwiazdka, ostrzeżenie i strzał armatki, wyciszanie klawiszem D", () => {
  const fa = fakeAudio();
  const g = loadGame({ extra: { AudioContext: fa.AudioContext } });
  const r = g.run(`
    initAudio(); menuCount = 1; startFromMenu(); invuln = 1e9;
    obstacles = []; rings = []; nextSpawn = 1e12; nextCannon = 1e12;
    keys.Space = true; update(1 / 60); keys.Space = false;                     // strzał
    rings.push({ x: plane.x, wy: toWorldY(plane.y), got: false }); update(1 / 60);   // gwiazdka
    const rr = riverAt(cam + 400);
    cannons.push({ x: rr.c - rr.w - 22, wy: cam + 400, dir: 1, hp: 2, cd: CHARGE_TIME + 0.05, flash: 0 });
    for (let i = 0; i < 60; i++) update(1 / 60);                               // ostrzeżenie, potem strzał
    const log = soundLog.slice();
    toggleMute();
    ({ log, mutedGain: master.gain.value, saved: localStorage.getItem('lotNadRzeka_mute') })`);
  for (const s of ["shot", "star", "warn", "cannon"]) assert.ok(r.log.includes(s), `brak dźwięku ${s}: ${r.log}`);
  assert.ok(r.log.indexOf("warn") < r.log.indexOf("cannon"), "ostrzeżenie musi być przed strzałem armatki");
  assert.ok(fa.stats.oscillators > 0 && fa.stats.noises > 0, "dźwięki nie zostały zagrane");
  assert.equal(r.mutedGain, 0);
  assert.equal(r.saved, "1");
});

test("bonusy: pojawiają się na wodzie co kilka sekund lotu", () => {
  const g = loadGame();
  const r = g.run(`
    menuCount = 1; startFromMenu();
    const seen = new Set(); let onLand = 0;
    for (let i = 0; i < 60 * 120; i++) {
      update(1 / 60); plane.x = channelCenter(toWorldY(plane.y)); invuln = 1;
      for (const p of powerups) if (!seen.has(p)) { seen.add(p); if (!inWater(p.x, p.wy)) onLand++; }
      powerups = powerups.filter(p => Math.hypot(p.x - plane.x, p.wy - toWorldY(plane.y)) > 40);   // nie zbieramy
    }
    ({ count: seen.size, onLand, types: [...new Set([...seen].map(p => p.type))].sort() })`);
  assert.ok(r.count >= 8, `za mało bonusów w 2 minuty: ${r.count}`);
  assert.equal(r.onLand, 0, "bonus na lądzie");
  // życie jest rzadkie (1 na 9), więc w 2 minuty może się nie trafić – tu sprawdzamy tylko poprawne rodzaje
  for (const t of r.types) assert.ok(["life", "shield", "slow", "triple"].includes(t), `nieznany bonus: ${t}`);
});

test("bonusy: losowanie – są wszystkie rodzaje, życie najrzadsze i znika przy 5 życiach", () => {
  const g = loadGame();
  const r = g.run(`
    newGame();
    const count = n => { const c = {}; for (let i = 0; i < n; i++) { const t = pickPower(); c[t] = (c[t] || 0) + 1; } return c; };
    lives = 3; const normal = count(3000);
    lives = MAX_LIVES; const full = count(1000);
    ({ normal, full })`);
  for (const t of ["life", "shield", "slow", "triple"]) assert.ok(r.normal[t] > 0, `brak bonusu ${t} w 3000 losowaniach`);
  assert.ok(r.normal.life < r.normal.slow && r.normal.slow < r.normal.shield, "życie ma być najrzadsze");
  assert.equal(r.full.life, undefined, "przy 5 życiach nie powinno losować życia");
});

test("bonusy: tarcza ratuje życie, potrójny strzał, spowolnienie, życie max 5, reset w nowej grze", () => {
  const g = loadGame();
  const r = g.run(`
    menuCount = 1; startFromMenu(); obstacles = []; rings = []; nextSpawn = 1e12; nextCannon = 1e12; nextPowerup = 1e12;
    const grab = type => { powerups.push({ type, x: plane.x, wy: toWorldY(plane.y) }); update(1 / 60); };
    // tarcza: uderzenie w skałę nie zabiera życia, tarcza znika
    grab('shield'); invuln = 0;
    obstacles.push({ type: 'rock', x: plane.x, wy: toWorldY(plane.y), r: 14, hp: 1, flash: 0 });
    const l0 = lives; update(1 / 60);
    const shield = { livesLost: l0 - lives, shieldLeft: power.shield };
    obstacles = []; invuln = 1e9;
    // potrójny strzał
    grab('triple'); bullets = []; shotCd = 0; keys.Space = true; update(1 / 60); keys.Space = false;
    const triple = bullets.length;
    // spowolnienie: świat leci o połowę wolniej
    const c0 = cam; update(1 / 60); const normal = cam - c0;
    grab('slow'); const c1 = cam; update(1 / 60); const slowed = cam - c1;
    // życie: najwyżej 5
    for (let i = 0; i < 6; i++) grab('life');
    const maxLives = lives;
    newGame();
    ({ shield, triple, ratio: slowed / normal, maxLives, afterNew: power.triple + power.slow + power.shield + powerups.length })`);
  assert.deepEqual({ ...r.shield }, { livesLost: 0, shieldLeft: 0 });
  assert.equal(r.triple, 3);
  assert.ok(r.ratio > 0.45 && r.ratio < 0.55, `spowolnienie: ${r.ratio}`);
  assert.equal(r.maxLives, 5);
  assert.equal(r.afterNew, 0);
});

test("głębia: chmury przesuwają się szybciej niż ziemia, wyższa warstwa najszybciej", () => {
  const g = loadGame();
  const r = g.run(`
    newGame(); cam = 3000;
    const before = CLOUD_LAYERS.map((l, i) => cloudsOf(l, i)[0]);
    cam += 10;                                  // ziemia przesuwa się o 10
    const moved = CLOUD_LAYERS.map((l, i) => { const c = cloudsOf(l, i).find(c => Math.abs(c.x - before[i].x) < 1e-9); return c.y - before[i].y; });
    ({ moved })`);
  assert.ok(Math.abs(r.moved[0] - 13.5) < 1e-6, `niższe chmury: ${r.moved[0]}`);
  assert.ok(Math.abs(r.moved[1] - 18) < 1e-6, `wyższe chmury: ${r.moved[1]}`);
});

test("głębia: wysokość samolotu tylko zmienia wygląd – zderzenia bez zmian, rysowanie każdej pory bez błędu", () => {
  const g = loadGame();
  const r = g.run(`
    menuCount = 1; startFromMenu(); obstacles = []; nextSpawn = 1e12; nextCannon = 1e12; nextPowerup = 1e12;
    const alts = [];
    for (let i = 0; i < 600; i++) { keys.ArrowUp = i > 300; update(1 / 60); plane.x = channelCenter(toWorldY(plane.y)); invuln = 1; draw(); alts.push(plane.alt); }
    keys.ArrowUp = false;
    for (const c of [15000, 25000, 35000]) { cam = c; draw(); }
    // skała tuż obok samolotu rozbija go niezależnie od wysokości
    invuln = 0; plane.alt = 1;
    obstacles.push({ type: 'rock', x: plane.x + 5, wy: toWorldY(plane.y), r: 10, hp: 1, flash: 0 });   // blisko: wynik nie zależy od prędkości
    const l0 = lives; update(1 / 60);
    ({ min: Math.min(...alts), max: Math.max(...alts), early: alts[250], boosted: alts[599], livesLost: l0 - lives })`);
  assert.ok(r.min >= 0 && r.max <= 1, `wysokość poza 0–1: ${r.min}–${r.max}`);
  assert.ok(r.boosted > r.early, "przy przyspieszaniu samolot powinien być wyżej");
  assert.equal(r.livesLost, 1, "wysokość nie może chronić przed zderzeniem");
});

test("bryły: każda przeszkoda (także popękany głaz), armatka i drzewa rysują się bez błędu we wszystkich porach", () => {
  const g = loadGame();
  assert.doesNotThrow(() => g.run(`
    newGame(); obstacles = []; nextSpawn = 1e12;
    for (const c of [2000, 15000, 25000, 35000]) {
      cam = c; const wy = cam + 300, r = riverAt(wy);
      obstacles = Object.keys(TYPES).map((type, i) => ({ type, x: r.c, wy: wy + i * 40, bx: r.c, hp: 1, flash: i % 2 ? 0.1 : 0,
        r: type === 'boulder' ? 24 : type === 'log' ? 6 : 12, len: 56, vx: 0, amp: 0, ph: 0, pull: 90, spin: 0 }));
      cannons = [{ x: r.c - r.w - 22, wy, dir: 1, hp: 1, cd: 0.1, flash: 0.1 }];
      drawWorld();
    }`));
});
