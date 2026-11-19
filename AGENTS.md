# Instrukcje dla agentów

To jest główny punkt wejścia. Z polecenia użytkownika ustal oczekiwany wynik, kryteria sukcesu i ograniczenia. Sprawdź stan projektu, nazwij najważniejszą przeszkodę i wybierz najmniejszą zmianę, która przybliża wynik.

Projekt to gra **„Lot nad Rzeką”**: prosta zręcznościówka w przeglądarce (samolot nad krętą rzeką, przeszkody, strzelanie, armatki, 1–4 graczy). Gra to strona statyczna bez instalacji i bez buildu: `index.html` (szkielet strony), `style.css` i skrypty w `src/` ładowane zwykłym `<script src>` w ustalonej kolejności (wszystkie dzielą zmienne globalne; nie używamy modułów ES, bo nie działają po otwarciu pliku z dysku). Mapa plików jest w [README](README.md#gdzie-jest-kod). Gra jest publikowana na GitHub Pages: https://konrados1980.github.io/prosta-gra/. Przed zmianą przeczytaj plik w `src/`, którego dotyczy zmiana, oraz [tasks/lessons.md](tasks/lessons.md). Nowy plik w `src/` dopisz do `index.html` we właściwej kolejności (używane przy wczytywaniu musi być wcześniej; `src/main.js` zawsze ostatni). Podgląd: `node scripts/serve.js` → http://localhost:5173.

Szkielet workflow (tryby, formularz zadania, bramki) pochodzi z projektu [paulcrowski/jakapiosenka](https://github.com/paulcrowski/jakapiosenka) – klub „PoProstuKoduj”.

## Tryby pracy

| Tryb | Kiedy użyć | Limit zmiany |
| --- | --- | --- |
| `MINIMAL_FIX` | Drobna poprawka bez zmiany kontraktu | 3 pliki, 50 linii |
| `CONTENT_FIX` | Tekst lub statyczny wygląd | 3 pliki, 80 linii |
| `RUNTIME_FIX` | Zachowanie aplikacji, integracja, dane lub stan | 12 plików, 250 linii |
| `STRUCTURE_FIX` | Zmiana granic kodu lub workflow | 12 plików, 250 linii |
| `FEATURE` | Nowe zachowanie | 12 plików, 250 linii |
| `AUDIT` | Diagnoza | 0 plików projektu |

Pliki workflow (`README.md`, `AGENTS.md`, `CLAUDE.md`, `ParkingLot.md`, `docs/`, `tasks/`, `workflow/`) nie liczą się do limitu linii.

## Przebieg zadania

1. Agent tworzy zadanie przez `npm run task:new`. Wpisuje wynik, warunek zaliczenia, dowód najważniejszej przeszkody i listę dozwolonych plików. Użytkownik podaje cel w zwykłym języku.
2. Przy drobnej zmianie wystarczy przyczyna i najbliższy test. Przy zmianie zachowania, struktury lub integracji opisz kontrakt, przypadki błędów i sposób sprawdzenia wyniku przed kodowaniem. Szczegóły są w [przewodniku workflow](docs/AGENT_READY_WORKFLOW.md).
3. Zmieniaj tylko pliki z listy. `audit-only` dopuszcza wyłącznie formularz i archiwum danego zadania. Pomysły odłożone zapisz w [ParkingLot.md](ParkingLot.md), jeśli warto do nich wrócić.
4. Uruchom najmniejszy test potwierdzający wynik (`npm test`, sprawdzenie w przeglądarce), a następnie bramkę `npm run gate:local`. Przed zamknięciem zapisz komendy, wynik i pozostałe ograniczenia w `tasks/todo.md`. Zamknij zadanie przez `npm run task:close -- --result PASS` lub `FAIL`.

Jeśli brakuje danych do bezpiecznej zmiany, zapisz brakujący dowód i najmniejszy sposób jego zebrania.

## Zasady specyficzne dla gry

- **Gotowe** = `npm test` i `npm run gate:local` przechodzą, gra działa w przeglądarce (sprawdzone na żywo), numer wersji pod grą jest podbity, zmiana jest wysłana na GitHuba i wersja online ją pokazuje.
- Każda naprawa błędu dostaje test w `tests/game.test.js`, który przed naprawą by nie przeszedł.
- Każda zmiana zachowania sprawdzana jest także w wąskim (480) i szerokim (ok. 1200) oknie.
- Ustawienia gry (prędkości, szerokości, punkty) trzymaj w nazwanych stałych z komentarzem.
- Plik w `src/` powyżej 300 linii (ostrzeżenie `check:godfiles`) podziel przed dokładaniem nowej odpowiedzialności.
- Przenoszenie kodu liczy się podwójnie w `check:diff-size` (usunięte + dodane linie) – przenoś najwyżej ok. 120 linii na zadanie.

W raporcie podaj zmienione pliki, wynik weryfikacji i otwarte decyzje. Po korekcie, która ujawnia powtarzalny problem, dopisz regułę zapobiegawczą w [tasks/lessons.md](tasks/lessons.md).
