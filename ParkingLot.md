# Odłożone decyzje

- **„Trochę 3D” – zrobione (23.11.2026):** opcja 1 (2.4–2.6: chmury, wysokość, bryły) i opcja 2 (2.7–2.9: widok pod kątem, domyślny, góry na horyzoncie).
- **NASTĘPNY KROK (ustalone 23.11.2026): prawdziwe 3D (Three.js) – zaczynamy od małej próby.**
  - **Próba (zadania 0–3), potem decyzja użytkownika, czy iść dalej:**
    0. Przygotowanie: Three.js w repo (bez CDN), ładowanie jako moduł (działa online i przez `node scripts/serve.js`, nie z pliku z dysku – widoki 2D zostają dla pliku), tryb „3D (beta)” pod klawiszem; plan awaryjny, gdy brak WebGL.
    1. Scena: kamera za i nad samolotem, światło słoneczne, niebo, mgła w oddali, ziemia.
    2. Rzeka jako siatka 3D budowana w locie z `riverAt()` (plaże, wyspy), usuwana za samolotem – najtrudniejsza część.
    3. Samolot 3D z prostych brył (przechył, wysokość).
  - **Reszta, jeśli próba się spodoba:** 4 drzewa (wiele naraz – InstancedMesh), 5 przeszkody, 6 armatki/kule/pociski, 7 gwiazdki/bonusy/wybuchy, 8 pory dnia (światło, noc z reflektorem, zima), 9 chmury, płynność, zmiana okna, 10 testy i dokumentacja. Razem ok. 12–15 zadań (2–4 sesje).
  - **Zasada:** logika gry (src/river.js, obstacles.js, game.js, combat.js, powerups.js…) bez zmian – 3D tylko pokazuje te same dane (x → szerokość, odległość → głębokość).
  - **Ryzyka:** dwa sposoby rysowania do utrzymania (każda nowa rzecz w 2D i 3D); wygląd 3D sprawdzany tylko zrzutami (Node nie rysuje WebGL – testy dalej sprawdzają logikę); wydajność na słabszych laptopach; ok. 170 KB więcej do pobrania.
  - Najpierw przeczytaj tasks/lessons.md (szczególnie 9–12: Git Bash i `//`, limit zmiany przy przenoszeniu, panel w tle, testy zależne od losowości i zamykanie zadania tylko po PASS bramki).
- **typecheck i build**: gra jest już podzielona na pliki w `src/` (wersja 2.0). `typecheck` wymaga zainstalowania TypeScriptu (`tsc --checkJs`, nowa zależność npm) – decyzja użytkownika. `build` nie jest potrzebny, dopóki gra jest stroną statyczną. `workflow/import-boundaries.json` zostaje wyłączone: pliki nie używają `import`, tylko wspólnych zmiennych globalnych (przejście na moduły ES wymagałoby serwera zamiast otwierania pliku z dysku).
- **Wspólna tabela rekordów dla wszystkich graczy** (teraz rekordy są tylko w jednej przeglądarce) – wymaga serwera albo usługi z bazą danych.
- **Strzelanie na telefonie** – teraz dotyk tylko steruje samolotem.
- **Hooki i bramka CI na GitHubie** (GitHub Actions uruchamiające `npm test` przy każdym pushu).
