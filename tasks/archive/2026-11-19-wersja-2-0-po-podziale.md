# Archived Task

Closed At: 2026-11-19T14:18:11.523Z
Result: PASS
Source File: tasks/todo.md

# Current Task

Task ID: 2026-11-19-wersja-2-0-po-podziale
Task Date: 2026-11-19
Task Status: ACTIVE

## Tryb pracy
CONTENT_FIX

Uzasadnienie trybu:
Agent wybral najmniejszy bezpieczny tryb pracy.

## Cel / Outcome
Wydać wersję 2.0 po podziale gry na pliki: numer wersji, opisy struktury, nowe lekcje, sprawdzenie na żywo i online

## Kryteria sukcesu
- gate:local przechodzi

## Priorytet / Blocker
Największy blocker teraz: Wydać wersję 2.0 po podziale gry na pliki: numer wersji, opisy struktury, nowe lekcje, sprawdzenie na żywo i online
Dowód blockera: polecenie użytkownika i aktualny task
Czy ten task rusza blocker: TAK
Jeśli NIE, powód: NOT_APPLICABLE
Dlaczego mimo to robimy teraz: nie dotyczy
Warunek powrotu do blockera: nie dotyczy

## Kontekst dla agenta
Moduł: dokumentacja
Tryb zmiany: code-change
Dozwolone pliki do zmiany:
- index.html
- AGENTS.md
- CLAUDE.md
- README.md
- ParkingLot.md
- tasks/lessons.md
- tasks/todo.md
- tasks/archive/**
Kontrakty do przeczytania: tylko pliki potrzebne do taska
Czego nie ruszać: pliki poza zakresem

## Zakres
Moduł: dokumentacja
Pliki: index.html, AGENTS.md, CLAUDE.md, README.md, ParkingLot.md, tasks/lessons.md

## Escalation
Czy brakuje danych do bezpiecznej zmiany?
NIE

Jeśli TAK:
Status: BLOCKED_BY_MISSING_EVIDENCE
Najmniejszy następny krok: audit albo test reprodukcyjny

## Klasyfikacja
REQUIRED

Uzasadnienie:
Zmiana jest wymagana dla aktualnego outcome.

## Diagnoza
Root cause: ustalic przed kodem.
Dowód: wskazac przed finalnym PASS.
Minimalny fix: najmniejszy diff w allowliscie.
Test: komenda albo visual/render proof dobrany przez agenta.

## Plan
- [ ] Przeczytać tylko pliki potrzebne do zmiany.
- [ ] Wykonać minimalny diff.
- [ ] Uruchomić weryfikację.

## Weryfikacja
Komendy:
ustali agent przed zamknieciem taska
Expected result: PASS.

## Review / Wyniki
Co zmieniono: wersja 2.0 w stopce; AGENTS.md opisuje strukturę src/ i zasady kolejności skryptów; README ma mapę plików; CLAUDE.md – podgląd przez serwer; ParkingLot – typecheck/build/import-boundaries z uzasadnieniem; lessons.md – lekcje 9 i 10.
Jak sprawdzono: npm run gate:local PASS (CONTENT_FIX 1/3 plików, 2/80 linii); w przeglądarce (http://localhost:5173): 13 skryptów wczytanych, brak błędów, 2 graczy: lot 40 s ze strzałami, koniec tury i wyniki; okno 1400x800 (W=1212) i wąskie (W=480) – rzeka widoczna po zmianie okna. Panel przeglądarki był w tle (strona ukryta), więc czas gry przesuwany ręcznie zamiast grania klawiszami.
PASS / FAIL: PASS
Ryzyka: na żywo klawiszami grałem tylko w kroku A (przed przeniesieniem JS); po podziale logika sprawdzona testami i ręcznym przesuwaniem czasu w prawdziwej przeglądarce.
Follow-up: typecheck (decyzja o TypeScript), CI na GitHubie.
