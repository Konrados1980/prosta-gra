# Odłożone decyzje

- **„Trochę 3D” – stan (23.11.2026):** opcja 1 zrobiona (2.4 chmury i wysokość, 2.5 bryły, 2.6 wyraźniejsza wysokość).
  Następna: **opcja 2 – widok pod kątem** (perspektywa, horyzont, niebo) jako przełącznik **V**, domyślnie obecny widok z góry –
  zamiast osobnej gałęzi, bo GitHub Pages pokazuje tylko `main`, a użytkownik gra online.
  Opcja 3 (prawdziwe 3D, Three.js/WebGL) – raczej osobny projekt.
- **typecheck i build**: gra jest już podzielona na pliki w `src/` (wersja 2.0). `typecheck` wymaga zainstalowania TypeScriptu (`tsc --checkJs`, nowa zależność npm) – decyzja użytkownika. `build` nie jest potrzebny, dopóki gra jest stroną statyczną. `workflow/import-boundaries.json` zostaje wyłączone: pliki nie używają `import`, tylko wspólnych zmiennych globalnych (przejście na moduły ES wymagałoby serwera zamiast otwierania pliku z dysku).
- **Wspólna tabela rekordów dla wszystkich graczy** (teraz rekordy są tylko w jednej przeglądarce) – wymaga serwera albo usługi z bazą danych.
- **Strzelanie na telefonie** – teraz dotyk tylko steruje samolotem.
- **Hooki i bramka CI na GitHubie** (GitHub Actions uruchamiające `npm test` przy każdym pushu).
