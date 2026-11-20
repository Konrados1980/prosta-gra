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
