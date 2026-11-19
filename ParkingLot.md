# Odłożone decyzje

- **Podział `index.html` na mniejsze pliki** (np. `src/river.js`, `src/obstacles.js`, `src/render.js`, `src/players.js`). Plik ma ok. 1100 linii, a bramka `check:godfiles` ostrzega od 300 i blokuje od 1000 linii zmienianego pliku `.js`. Po podziale: włączyć `workflow/import-boundaries.json` i dodać `typecheck` (np. `tsc --checkJs`) oraz `build` do `workflowGates.requiredScripts`.
- **Wspólna tabela rekordów dla wszystkich graczy** (teraz rekordy są tylko w jednej przeglądarce) – wymaga serwera albo usługi z bazą danych.
- **Strzelanie na telefonie** – teraz dotyk tylko steruje samolotem.
- **Hooki i bramka CI na GitHubie** (GitHub Actions uruchamiające `npm test` przy każdym pushu).
