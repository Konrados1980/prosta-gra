// Lint gry: sprawdza wszystkie skrypty z index.html (pliki <script src> i kod wpisany w <script>).
// 1) czy pliki istnieją i nie mają błędów składni,
// 2) czy na najwyższym poziomie skryptu nie deklarujemy nazw zajętych przez przeglądarkę
//    (np. `let top` wywraca całą grę – lekcja z wersji 1.8, patrz tasks/lessons.md),
// 3) czy dwa skrypty nie deklarują tej samej zmiennej globalnej (w przeglądarce to błąd).
const vm = require("vm");
const { gameScripts } = require("../tests/helpers/load-game");

// Nazwy, których nie wolno deklarować przez let/const/class na górze skryptu w przeglądarce
const RESERVED = ["top", "parent", "self", "window", "frames", "opener", "location", "history",
  "name", "status", "origin", "length", "closed", "document", "navigator", "screen"];

let scripts;
try {
  scripts = gameScripts();
} catch (e) {
  console.error(`lint FAIL - nie można wczytać skryptu: ${e.message}`);
  process.exit(1);
}

let failed = false;
const declaredIn = {};
for (const { name, code } of scripts) {
  try {
    new vm.Script(code, { filename: name });
  } catch (e) {
    console.error(`lint FAIL - ${name}: błąd składni: ${e.message}`);
    failed = true;
  }
  code.split("\n").forEach((line, n) => {
    // tylko deklaracje bez wcięcia, czyli na najwyższym poziomie skryptu
    const m = line.match(/^(?:let|const|class)\s+(.+)/);
    if (!m) return;
    const names = declaredNames(m[1]);
    for (const id of names) {
      if (RESERVED.includes(id)) {
        console.error(`lint FAIL - ${name}:${n + 1}: nazwa "${id}" jest zajęta przez przeglądarkę`);
        failed = true;
      }
      if (declaredIn[id] && declaredIn[id] !== name) {
        console.error(`lint FAIL - ${name}:${n + 1}: "${id}" jest już zadeklarowane w ${declaredIn[id]}`);
        failed = true;
      }
      declaredIn[id] = declaredIn[id] || name;
    }
  });
}

// "a = 1, b = [x, y], c" -> ["a", "b", "c"]: dzielimy po przecinkach poza nawiasami i napisami,
// pomijamy komentarz na końcu linii i wartości po znaku "="
function declaredNames(text) {
  const parts = [];
  let depth = 0, quote = null, cur = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) { cur += ch; if (ch === quote && text[i - 1] !== "\\") quote = null; continue; }
    if (ch === "/" && text[i + 1] === "/") break;
    if (ch === "'" || ch === '"' || ch === "`") quote = ch;
    else if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
    else if ((ch === "," || ch === ";") && depth === 0) { parts.push(cur); cur = ""; continue; }
    cur += ch;
  }
  parts.push(cur);
  return parts.map(p => (p.split("=")[0].match(/^\s*([A-Za-z_$][\w$]*)/) || [])[1]).filter(Boolean);
}

if (failed) process.exit(1);
console.log(`lint PASS - ${scripts.length} skrypt(y): ${scripts.map(s => s.name).join(", ")}; składnia OK, brak zajętych nazw`);
