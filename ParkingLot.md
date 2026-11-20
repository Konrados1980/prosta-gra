# Odłożone decyzje

- **NASTĘPNY KROK (ustalone 20.11.2026): „trochę 3D” – zaczynamy od opcji 1.**
  - **Opcja 1 – efekty głębi w obecnym widoku z góry** (małe zadania, logika gry bez zmian):
    chmury na dwóch wysokościach przesuwające się szybciej niż ziemia (paralaksa), samolot lekko wznoszący się i opadający
    (cień na wodzie oddala się / zbliża, samolot rośnie), drzewa i głazy jako bryły z bokiem zamiast płaskich kółek.
  - **Potem opcja 2 – widok pod kątem („pseudo-3D”)** na osobnej gałęzi git do porównania: kamera z ukosa za samolotem,
    perspektywa (dalej = mniejsze), horyzont i niebo; przeliczenie pozycji na ekranie, strojenie sterowania.
  - Opcja 3 (prawdziwe 3D, Three.js/WebGL) – raczej osobny projekt.

- **typecheck i build**: gra jest już podzielona na pliki w `src/` (wersja 2.0). `typecheck` wymaga zainstalowania TypeScriptu (`tsc --checkJs`, nowa zależność npm) – decyzja użytkownika. `build` nie jest potrzebny, dopóki gra jest stroną statyczną. `workflow/import-boundaries.json` zostaje wyłączone: pliki nie używają `import`, tylko wspólnych zmiennych globalnych (przejście na moduły ES wymagałoby serwera zamiast otwierania pliku z dysku).
- **Wspólna tabela rekordów dla wszystkich graczy** (teraz rekordy są tylko w jednej przeglądarce) – wymaga serwera albo usługi z bazą danych.
- **Strzelanie na telefonie** – teraz dotyk tylko steruje samolotem.
- **Hooki i bramka CI na GitHubie** (GitHub Actions uruchamiające `npm test` przy każdym pushu).
