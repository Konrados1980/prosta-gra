# Wnioski z pracy

Zapisuj tu powtarzalne problemy ujawnione podczas pracy. Każdy wpis powinien wskazać przyczynę, regułę zapobiegawczą oraz sposób jej sprawdzenia.

## 1. Gracz widzi starą wersję gry (wersje 1.4–1.5)

- **Przyczyna:** GitHub Pages pozwala przeglądarce trzymać stronę do 10 minut (`Cache-Control: max-age=600`). Użytkownik zgłaszał „nie działa”, a miał starą wersję.
- **Reguła:** pod grą zawsze widać numer wersji; przy każdej zmianie podbij go i podaj link z `?v=<wersja>`. Na laptopie podpowiadaj Ctrl+Shift+R (F5 bywa klawiszem jasności).
- **Sprawdzenie:** po pushu `curl` na stronę online szuka nowego numeru wersji; raport zawiera link z `?v=`.

## 2. Spacja „nie strzela” (wersja 1.3)

- **Przyczyna:** krótkie stuknięcie mieściło się między klatkami gry, a część klawiatur nie rejestruje Spacji przy dwóch wciśniętych strzałkach.
- **Reguła:** klawisze czytamy po `e.code`; pojedyncze naciśnięcie zapamiętujemy (`wantShot`), nie tylko stan „wciśnięty”; ważne akcje mają drugi klawisz (X).
- **Sprawdzenie:** w przeglądarce prawdziwe stuknięcie klawisza (nie tylko ustawienie zmiennej w teście).

## 3. Środek rzeki „nie jest wodą” (wersje 1.0–1.3)

- **Przyczyna:** warunek `d > r.iw` był fałszywy dla `d = 0`, gdy wyspy nie ma (`iw = 0`).
- **Reguła:** przy porównaniach sprawdzaj wartości brzegowe (0, dokładnie środek, dokładnie krawędź).
- **Sprawdzenie:** test „środek rzeki bez wyspy to woda” w `tests/game.test.js`.

## 4. Zmienna `top` wywraca całą grę (wersja 1.8)

- **Przyczyna:** `let top` na najwyższym poziomie skryptu koliduje z `window.top` w przeglądarce (błąd składni, gra się nie uruchamia).
- **Reguła:** nie używaj nazw zajętych przez przeglądarkę (`top`, `name`, `status`, `parent`, `self`, `location`…) dla zmiennych globalnych.
- **Sprawdzenie:** `npm run lint` (scripts/check-game-syntax.js) wyłapuje takie nazwy.

## 5. Ujemny promień zatrzymuje pętlę gry (wersja 1.9)

- **Przyczyna:** cząsteczka wybuchu miała ujemne `life`, więc `arc()` dostało ujemny promień i rzuciło wyjątek; wyjątek w pętli `requestAnimationFrame` zatrzymał grę na zawsze.
- **Reguła:** rozmiary rysowanych kształtów zabezpieczaj (`circle()` pomija promień ≤ 0); pętla gry planuje następną klatkę przed rysowaniem i łapie błędy rysowania.
- **Sprawdzenie:** test „ujemny promień nie wywraca rysowania”; atrapa canvasu w testach rzuca błąd przy ujemnym promieniu jak prawdziwa przeglądarka.

## 6. Rzeka ucieka poza ekran po zmianie okna (wersje 1.6–1.8)

- **Przyczyna:** szerokość planszy zależy od okna, a pozycje rzeki były liczone dla starej szerokości.
- **Reguła:** po zmianie szerokości przesuń cały świat (`recenterWorld`); każdą zmianę związaną z rozmiarem testuj, zmieniając okno **w trakcie gry**.
- **Sprawdzenie:** test „zmiana szerokości okna w trakcie gry zostawia rzekę na ekranie”.

## 7. Za wąskie zwężenia i odnogi (wersje 1.0–1.9)

- **Przyczyna:** szerokość rzeki była losowana bez minimum dopasowanego do samolotu i bez ograniczenia szybkości zmian.
- **Reguła:** wymiary ważne dla grywalności (min. szerokość rzeki 220, odnoga 100, wolny przejazd przy przeszkodzie 80) trzymaj w nazwanych stałych i pilnuj testem.
- **Sprawdzenie:** test „rzeka jest szeroka i mieści się na ekranie” dla wąskiego i szerokiego okna.

## 8. Testy były jednorazowe (do wersji 1.9.1)

- **Przyczyna:** sprawdzanie odbywało się skryptami wklejanymi do przeglądarki; po zmianie nikt ich nie powtarzał.
- **Reguła:** każdy sprawdzony scenariusz, który może się zepsuć ponownie, zapisz w `tests/game.test.js`.
- **Sprawdzenie:** `npm test` w bramce `gate:local` (przez `check:project-gates`).

## 9. Git Bash zamienia argumenty zaczynające się od `//` (wersja 2.0)

- **Przyczyna:** na Windows Git Bash (MSYS) traktuje argument `"// ===== Stan gry ====="` jak ścieżkę i go przerabia; skrypt nie znalazł znacznika.
- **Reguła:** w Git Bash uruchamiaj takie komendy z `MSYS_NO_PATHCONV=1` albo podawaj znaczniki bez `//` na początku.
- **Sprawdzenie:** skrypt przerywa pracę z błędem, gdy nie znajdzie znacznika (nic nie zmienia w plikach).

## 10. Przenoszenie kodu liczy się podwójnie w limicie zmiany (wersja 2.0)

- **Przyczyna:** `check:diff-size` liczy linie usunięte z `index.html` i dodane w nowym pliku, więc przeniesienie 125 linii to ok. 250 linii zmiany.
- **Reguła:** duży plik dziel w kilku zadaniach, po ok. 120 linii, zawsze od góry skryptu, żeby kolejność wykonania kodu się nie zmieniła.
- **Sprawdzenie:** `npm run gate:local` po każdym kroku (podział na 13 plików: 12 zadań, wszystkie PASS).
