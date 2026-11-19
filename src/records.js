// gracze, rekordy (zapis w przeglądarce) i menu
// ===== Gracze, tury i tabela rekordów =====
// Gra dla 1–4 osób po kolei (każdy ma swoją turę z 3 życiami).
// Rekordy zapisują się w przeglądarce (localStorage), więc zostają po zamknięciu strony.
const TOP_KEY = 'lotNadRzeka_top', NAMES_KEY = 'lotNadRzeka_names';
let players = [{ name: 'Gracz 1', score: 0 }];
let turn = 0;
let menuCount = 1;
let menuNames = ['Gracz 1', 'Gracz 2', 'Gracz 3', 'Gracz 4'];
let topList = [];             // najlepsze wyniki: [{ name, score, date }]
let personal = {};        // rekord każdego gracza: { imię: punkty }
let lastRound = [];       // wyniki ostatniej rundy (do ekranu wyników)

function loadRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(TOP_KEY) || 'null');
    if (saved) { topList = saved.top || []; personal = saved.personal || {}; }
    else {
      // przeniesienie dawnego rekordu z wersji dla 1 gracza
      const old = Number(localStorage.getItem('lotNadRzeka_best')) || 0;
      if (old > 0) topList = [{ name: 'Dawny rekord', score: old, date: '' }];
    }
    const names = JSON.parse(localStorage.getItem(NAMES_KEY) || 'null');
    if (names) { menuCount = names.count || 1; names.list.forEach((n, i) => { if (n) menuNames[i] = n; }); }
  } catch (e) {}
}
function saveRecords() {
  try {
    localStorage.setItem(TOP_KEY, JSON.stringify({ top: topList, personal }));
    localStorage.setItem(NAMES_KEY, JSON.stringify({ count: menuCount, list: menuNames }));
  } catch (e) {}
}
const bestScore = () => (topList[0] ? topList[0].score : 0);
// zabezpieczenie: imię wstawiane do HTML nie może zawierać znaczników
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const panel = document.getElementById('panel'), okno = document.getElementById('okno');
function showPanel(html) { okno.innerHTML = html; panel.classList.remove('ukryty'); }
function hidePanel() { panel.classList.add('ukryty'); }

function topTable(limit, highlight = []) {
  if (!topList.length) return '<p>Jeszcze nikt nie zagrał. Bądź pierwszy!</p>';
  const rows = topList.slice(0, limit).map((t, i) =>
    `<tr${highlight.includes(t) ? ' class="zwyciezca"' : ''}><td>${i + 1}.</td><td>${esc(t.name)}</td><td class="liczba">${t.score}</td><td class="liczba">${esc(t.date)}</td></tr>`).join('');
  return `<table><tr><th>#</th><th>Gracz</th><th class="liczba">Punkty</th><th class="liczba">Data</th></tr>${rows}</table>`;
}

function showMenu() {
  state = 'menu';
  const countBtns = [1, 2, 3, 4].map(n => `<button type="button" data-n="${n}" class="${n === menuCount ? 'wybrany' : ''}">${n}</button>`).join('');
  const inputs = menuNames.slice(0, menuCount).map((n, i) =>
    `<label>Gracz ${i + 1}: <input data-i="${i}" maxlength="12" value="${esc(n)}"></label>`).join('');
  showPanel(`
    <h1>Lot nad Rzeką</h1>
    <div class="rzad">Liczba graczy: ${countBtns}</div>
    <div class="rzad">${inputs}</div>
    <p>Gracze grają po kolei, każdy ma 3 życia. Na końcu rundy zobaczycie wyniki i tabelę rekordów.</p>
    <div class="rzad"><button type="button" class="glowny" id="startBtn">▶ Start (Enter)</button></div>
    <h2>Sterowanie</h2>
    <p>← → na boki · ↑ szybciej · ↓ wolniej · Spacja lub X: strzał · P: pauza · F: pełny ekran</p>
    <h2>Punkty</h2>
    <p>gwiazdka 25 (przelotem) · skała 10 · pień 15 · boja 20 · wir 25 (2 trafienia, wciąga!) · głaz 50 (3 trafienia) ·
       armatka 40 (2 trafienia, czerwona lufa = zaraz strzeli) · kula z armatki 5</p>
    <h2>🏆 Najlepsze wyniki</h2>
    ${topTable(5)}
  `);
  okno.querySelectorAll('button[data-n]').forEach(b => b.onclick = () => { readNames(); menuCount = Number(b.dataset.n); showMenu(); });
  okno.querySelectorAll('input').forEach(inp => {
    inp.oninput = () => { menuNames[inp.dataset.i] = inp.value; };
    inp.onfocus = () => inp.select();   // kliknięcie zaznacza stare imię, więc od razu wpisujesz nowe
  });
  document.getElementById('startBtn').onclick = startFromMenu;
}
function readNames() { okno.querySelectorAll('input').forEach(inp => { menuNames[inp.dataset.i] = inp.value; }); }
