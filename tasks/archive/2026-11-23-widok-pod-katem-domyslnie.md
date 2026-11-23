# Archived Task

Closed At: 2026-11-23T14:10:08.989Z
Result: PASS
Source File: tasks/todo.md

# Current Task

Task ID: 2026-11-23-widok-pod-katem-domyslnie
Task Date: 2026-11-23
Task Status: ACTIVE

## Tryb pracy
MINIMAL_FIX

Uzasadnienie trybu:
Agent wybral najmniejszy bezpieczny tryb pracy.

## Cel / Outcome
Widok pod kątem domyślny dla nowych graczy; V nadal przełącza, zapisany wybór „z góry” jest szanowany

## Kryteria sukcesu
- testy i gate:local przechodzą

## Priorytet / Blocker
Największy blocker teraz: Widok pod kątem domyślny dla nowych graczy; V nadal przełącza, zapisany wybór „z góry” jest szanowany
Dowód blockera: polecenie użytkownika i aktualny task
Czy ten task rusza blocker: TAK
Jeśli NIE, powód: NOT_APPLICABLE
Dlaczego mimo to robimy teraz: nie dotyczy
Warunek powrotu do blockera: nie dotyczy

## Kontekst dla agenta
Moduł: grafika
Tryb zmiany: code-change
Dozwolone pliki do zmiany:
- src/perspective.js
- tests/game.test.js
- index.html
- README.md
- tasks/todo.md
- tasks/archive/**
Kontrakty do przeczytania: tylko pliki potrzebne do taska
Czego nie ruszać: pliki poza zakresem

## Zakres
Moduł: grafika
Pliki: src/perspective.js, tests/game.test.js, index.html, README.md

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
Co zmieniono: view3d domyślnie true (zapisane „gora” zostaje szanowane); przycisk startowo „pod kątem”; test domyślnego widoku zaktualizowany, test perspektywy ustawia widok wprost; wersja 2.8; README.
Jak sprawdzono: npm test PASS; gate:local PASS.
PASS / FAIL: PASS
Ryzyka: gracze, którzy wcześniej nacisnęli V na „z góry”, zostaną przy widoku z góry (tak ma być).
Follow-up: góry na horyzoncie.
