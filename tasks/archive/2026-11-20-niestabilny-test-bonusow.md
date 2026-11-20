# Archived Task

Closed At: 2026-11-20T15:48:57.875Z
Result: PASS
Source File: tasks/todo.md

# Current Task

Task ID: 2026-11-20-niestabilny-test-bonusow
Task Date: 2026-11-20
Task Status: ACTIVE

## Tryb pracy
MINIMAL_FIX

Uzasadnienie trybu:
Agent wybral najmniejszy bezpieczny tryb pracy.

## Cel / Outcome
Naprawić losowo padający test bonusów i odnotować, że poprzednie zadanie zamknięto mimo FAIL bramki

## Kryteria sukcesu
- npm test przechodzi 10 razy z rzędu

## Priorytet / Blocker
Największy blocker teraz: Naprawić losowo padający test bonusów i odnotować, że poprzednie zadanie zamknięto mimo FAIL bramki
Dowód blockera: polecenie użytkownika i aktualny task
Czy ten task rusza blocker: TAK
Jeśli NIE, powód: NOT_APPLICABLE
Dlaczego mimo to robimy teraz: nie dotyczy
Warunek powrotu do blockera: nie dotyczy

## Kontekst dla agenta
Moduł: testy
Tryb zmiany: code-change
Dozwolone pliki do zmiany:
- tests/game.test.js
- tasks/lessons.md
- tasks/todo.md
- tasks/archive/**
Kontrakty do przeczytania: tylko pliki potrzebne do taska
Czego nie ruszać: pliki poza zakresem

## Zakres
Moduł: testy
Pliki: tests/game.test.js, tasks/lessons.md

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
Test: najmniejsza komenda potwierdzajaca fix.

## Plan
- [ ] Przeczytać tylko pliki potrzebne do zmiany.
- [ ] Wykonać minimalny diff.
- [ ] Uruchomić weryfikację.

## Weryfikacja
Komendy:
ustali agent przed zamknieciem taska
Expected result: PASS.

## Review / Wyniki
Co zmieniono: test „bonusy: pojawiają się na wodzie” sprawdza tylko poprawne rodzaje (bez wymogu, by rzadkie życie wypadło w 2 min); nowy test losowania pickPower() na 3000 próbach (wszystkie rodzaje, życie najrzadsze, brak życia przy 5); lekcja 12; sprostowanie w archiwum zadania plan-3d-na-jutro.
Jak sprawdzono: log bramki z FAIL (actual bez 'life'); npm test 10 razy z rzędu bez błędu (18/18); gate:local PASS.
PASS / FAIL: PASS
Ryzyka: brak zmian w kodzie gry.
Follow-up: opcja 1 efektów 3D (ParkingLot.md).
