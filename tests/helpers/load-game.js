// Ładuje kod gry z index.html do "udawanej przeglądarki" w Node.js,
// żeby testy mogły sprawdzać logikę gry bez otwierania okna.
// Rysowanie jest udawane, ale arc/ellipse z ujemnym promieniem rzucają błąd jak w prawdziwej przeglądarce.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function fakeCanvasContext() {
  const gradient = { addColorStop() {} };
  const own = {
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: () => ({ width: 10 }),
    arc(x, y, r) { if (r < 0) throw new Error(`IndexSizeError: arc radius ${r} is negative`); },
    ellipse(x, y, rx, ry) { if (rx < 0 || ry < 0) throw new Error("IndexSizeError: ellipse radius is negative"); },
  };
  return new Proxy(own, {
    get: (t, p) => (p in t ? t[p] : () => {}),
    set: (t, p, v) => { t[p] = v; return true; },
  });
}

function fakeElement(extra = {}) {
  return {
    style: {}, innerHTML: "", value: "", offsetHeight: 40, dataset: {},
    classList: { add() {}, remove() {}, contains: () => false },
    addEventListener() {}, querySelectorAll: () => [], blur() {}, focus() {},
    ...extra,
  };
}

// Skrypty gry w kolejności z index.html: pliki <script src="..."> i kod wpisany w <script>
function gameScripts() {
  const root = path.join(__dirname, "..", "..");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  return [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].map(m => {
    const src = m[1].match(/\bsrc="([^"]+)"/);
    return src
      ? { name: src[1], code: fs.readFileSync(path.join(root, src[1]), "utf8") }
      : { name: "index.html", code: m[2] };
  });
}

function loadGame({ width = 600, height = 800 } = {}) {
  const scripts = gameScripts();

  const ctx2d = fakeCanvasContext();
  const canvas = fakeElement({
    width: 480, height: 640,
    getContext: () => ctx2d,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 480, height: 640 }),
    setPointerCapture() {},
  });
  const elements = { gra: canvas };
  const store = {};
  const sandbox = {
    console,
    innerWidth: width, innerHeight: height, devicePixelRatio: 1,
    addEventListener() {}, requestAnimationFrame() {}, confirm: () => true,
    performance: { now: () => 0 },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
    document: {
      hidden: false, fullscreenElement: null, activeElement: null,
      documentElement: { requestFullscreen: () => Promise.resolve() },
      addEventListener() {},
      exitFullscreen() {},
      getElementById: id => (elements[id] ||= fakeElement()),
    },
  };
  vm.createContext(sandbox);
  // jak w przeglądarce: każdy skrypt osobno, ale wszystkie widzą wspólne zmienne globalne
  for (const s of scripts) vm.runInContext(s.code, sandbox, { filename: s.name });
  // run("wyrażenie") ma dostęp do zmiennych gry (let/const z najwyższego poziomu skryptu)
  return { run: expr => vm.runInContext(expr, sandbox), store };
}

module.exports = { loadGame, gameScripts };
