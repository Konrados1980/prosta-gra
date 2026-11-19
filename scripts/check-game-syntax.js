// Lint gry: sprawdza kod JavaScript wpisany w index.html.
// 1) czy nie ma błędów składni,
// 2) czy na najwyższym poziomie skryptu nie deklarujemy nazw zajętych przez przeglądarkę
//    (np. `let top` wywraca całą grę – lekcja z wersji 1.8, patrz tasks/lessons.md).
const fs = require("fs");
const vm = require("vm");

const file = process.argv[2] || "index.html";
const html = fs.readFileSync(file, "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);

if (!scripts.length) {
  console.error(`lint FAIL - ${file}: brak skryptów do sprawdzenia`);
  process.exit(1);
}

// Nazwy, których nie wolno deklarować przez let/const/class na górze skryptu w przeglądarce
const RESERVED = ["top", "parent", "self", "window", "frames", "opener", "location", "history",
  "name", "status", "origin", "length", "closed", "document", "navigator", "screen"];

let failed = false;
scripts.forEach((code, i) => {
  try {
    new vm.Script(code, { filename: `${file} <script #${i + 1}>` });
  } catch (e) {
    console.error(`lint FAIL - błąd składni: ${e.message}`);
    failed = true;
  }
  const lines = code.split("\n");
  lines.forEach((line, n) => {
    // tylko deklaracje bez wcięcia, czyli na najwyższym poziomie skryptu
    const m = line.match(/^(?:let|const|class)\s+([A-Za-z_$][\w$]*)/);
    if (m && RESERVED.includes(m[1])) {
      console.error(`lint FAIL - ${file}: linia skryptu ${n + 1}: nazwa "${m[1]}" jest zajęta przez przeglądarkę`);
      failed = true;
    }
  });
});

if (failed) process.exit(1);
console.log(`lint PASS - ${file}: ${scripts.length} skrypt(y), składnia OK, brak zajętych nazw`);
