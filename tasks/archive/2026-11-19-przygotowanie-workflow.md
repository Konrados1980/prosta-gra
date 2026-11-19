# Archived Task

Closed At: 2026-11-19T13:46:05.357Z
Result: PASS
Source File: tasks/todo.md

# Current Task

Task ID: 2026-11-19-przygotowanie-workflow
Task Date: 2026-11-19
Task Status: ACTIVE

## Tryb pracy
STRUCTURE_FIX

Uzasadnienie trybu:
Task utworzony przez task lifecycle.

## Cel / Outcome
Przejąć szkielet workflow Paula i zapisać nasze zasady pracy (CLAUDE.md, lekcje) w repo

## Kryteria sukcesu
- Bramka startera i check:scope przechodzą
- npm run lint i npm test przechodzą (testy łapią cofnięte dawne poprawki)
- AGENTS.md, CLAUDE.md, tasks/lessons.md i ParkingLot.md opisują nasz projekt

## Priorytet / Blocker
Największy blocker teraz: Przejąć szkielet workflow Paula i zapisać nasze zasady pracy (CLAUDE.md, lekcje) w repo
Dowód blockera: polecenie użytkownika i aktualny task
Czy ten task rusza blocker: TAK
Jeśli NIE, powód: NOT_APPLICABLE
Dlaczego mimo to robimy teraz: nie dotyczy
Warunek powrotu do blockera: nie dotyczy

## Kontekst dla agenta
Moduł: workflow
Tryb zmiany: code-change
Maksymalny zakres plików: allowlista z taska
Dozwolone pliki do zmiany:
- AGENTS.md
- CLAUDE.md
- README.md
- package.json
- .gitignore
- ParkingLot.md
- docs/**
- tasks/lessons.md
- scripts/**
- tests/**
- workflow/**
- tasks/todo.md
- tasks/archive/**
Kontrakty do przeczytania: AGENTS.md oraz tylko potrzebne docs dla tego taska
Pliki zakazane: wszystko poza allowlistą
Czego nie ruszać: pliki poza zakresem

## Zakres
Moduł: workflow
Pliki: AGENTS.md, CLAUDE.md, README.md, package.json, .gitignore, ParkingLot.md, docs/**, tasks/lessons.md, scripts/**, tests/**, workflow/**

## Reprodukcja / dowód problemu
Zasady pracy istniały tylko w rozmowie; w repo nie było instrukcji dla agenta, rejestru zadań, bramek ani zapisanych testów. Użytkownik poprosił o przejęcie szkieletu Paula (udostępniony do nauki).

## Escalation
Czy brakuje danych do bezpiecznej zmiany?
NIE

Jeśli TAK:
Brakujące dane: brak
Czego nie da się potwierdzić: brak
Ryzyko kodowania teraz: niskie po utrzymaniu scope locka
Najmniejszy następny krok: wykonać najmniejszą zmianę z allowlisty

## Klasyfikacja
REQUIRED

Uzasadnienie:
Zmiana jest wymagana dla aktualnego stanu workflow.

## Diagnoza
Root cause: brak zapisanych standardów i powtarzalnych testów w repo.
Dowód: repo zawierało tylko index.html i README.md; wcześniejsze testy były jednorazowymi skryptami w przeglądarce.
Aktualny flow: task:new -> zmiana -> npm test / przeglądarka -> gate -> task:close -> commit/push -> sprawdzenie online.

## Granice
Moduły dotknięte: workflow
Kontrakty dotknięte: do uzupełnienia, jeśli dotyczy.
Poza zakresem: wszystko poza allowlistą.

## Kontrakt
INPUT: polecenie użytkownika i pliki z allowlisty.
SUCCESS: spełnione kryteria sukcesu.
ERRORS: brak dowodu, zmiana poza scope albo failujące gate'y.
STATUSES: PASS / FAIL.
SIDE EFFECTS: tylko zmiany w plikach z allowlisty.
LOGS: komendy weryfikacyjne.
TESTS: npm run lint, npm test (11 testów), gate:starter, check:scope, check:godfiles.
DONE: review ma konkretny wynik.

## Failure modes
Timeout: przerwać i pokazać ostatni bezpieczny stan.
Null/missing data: nie zgadywać, użyć ESCALATION.
Invalid schema: nie dotyczy, chyba że task dotyka danych.
Duplicate request: sprawdzić idempotencję, jeśli task ma side effecty.
Concurrent request: nie dotyczy, chyba że task dotyka runtime.
Partial write: nie zostawiać pustego sukcesu.
Worker crash: nie dotyczy, chyba że task dotyka workera.
Retry loop: nie dodawać retry bez klasyfikacji błędów.
Provider unavailable: nie dotyczy, chyba że task dotyka providera.

## Guard Scope
REQUIRED GUARDS:
- trzymać się allowlisty.
- uruchomić testy wskazane w tasku.

NICE_TO_HAVE GUARDS:
- pomysły poza zakresem zapisać do ParkingLot.md.

OVERBUILD GUARDS:
- nie tworzyć nowego subsystemu bez osobnego taska.

ParkingLot.md updated:
YES (podział index.html, typecheck/build, wspólne rekordy, CI)

## Runtime guards
State machine: do uzupełnienia, jeśli dotyczy.
Error classification: do uzupełnienia, jeśli dotyczy.
Idempotency: do uzupełnienia, jeśli dotyczy.
Single-flight: do uzupełnienia, jeśli dotyczy.
Worker lock: do uzupełnienia, jeśli dotyczy.
Circuit breaker: do uzupełnienia, jeśli dotyczy.
Backpressure: do uzupełnienia, jeśli dotyczy.
UI truth: do uzupełnienia, jeśli dotyczy.
Observability: komendy weryfikacyjne jako dowód.

## Code Structure Guard
Czy dotykamy pliku >300 LOC?
NIE (index.html ma ok. 1100 linii, ale ten task go nie zmienia; podział zapisany w ParkingLot.md)

Jeśli TAK:
Plik: brak
LOC: brak
Dlaczego zmiana trafia tutaj: brak
Czy plik ma wiele odpowiedzialności: brak
Minimalny fix: brak
Czy potrzebne wydzielenie odpowiedzialności: brak
Ryzyko: brak

## GOD_FILE_CHECK
Wymagane, jeśli plik >500 LOC.

Plik: brak
LOC: brak
Obecne odpowiedzialności: brak
Czy task dokłada nową odpowiedzialność: brak
Minimalny fix bez rozbicia: brak
Małe wydzielenie odpowiedzialności: brak
Ryzyko minimalnego fixu: brak
Ryzyko wydzielenia: brak
Rekomendacja: brak

## Dependency Direction Guard
Czy zmiana odwraca zależność?
NIE

Czy Business Logic importuje UI/DB/framework?
NIE

Czy adapter przecieka do core?
NIE

## Change Isolation
Ile modułów dotyka zmiana: jeden wskazany obszar.
Czy to naturalne: tak.
Czy da się ograniczyć zmianę do jednego kontraktu: tak.

## Plan
- [ ] Przeczytać pliki z allowlisty.
- [ ] Wykonać najmniejszą bezpieczną zmianę.
- [ ] Uruchomić weryfikację.

## Weryfikacja
Komendy:
npm run lint
npm test
npm run gate:starter
npm run check:scope
npm run check:godfiles
Expected result: PASS.

## Definition of Done
- [ ] test PASS
- [ ] build PASS albo NOT_NEEDED z uzasadnieniem
- [ ] brak ERROR w logach
- [ ] zmiana nie wychodzi poza zakres
- [ ] brak refaktoru przy okazji
- [ ] failure modes obsłużone
- [ ] brak silent fallbacków
- [ ] brak empty success
- [ ] UI truth zachowane, jeśli dotyczy
- [ ] dependency direction zachowany
- [ ] brak cyklicznych zależności
- [ ] duże pliki nie zostały powiększone bez uzasadnienia
- [ ] implementowano tylko REQUIRED GUARDS

## Review / Wyniki
Co zmieniono: przejęty szkielet workflow Paula (AGENTS.md, docs, scripts, tasks, workflow, package.json); dodane CLAUDE.md (nasze zasady i format raportu), tasks/lessons.md (8 lekcji z dotychczasowej pracy), ParkingLot.md, lint gry (scripts/check-game-syntax.js) i 11 testów logiki gry (tests/game.test.js). check-project-gates.js czyta listę komend z package.json (workflowGates). index.html bez zmian.
Jak sprawdzono: npm run lint PASS; npm test 11/11 PASS; mutacja: po cofnięciu dwóch dawnych poprawek w index.html dokładnie 2 testy FAIL, po przywróceniu 11/11 PASS; npm run gate:starter PASS; npm run check:scope PASS (21 plików w allowliście); npm run check:godfiles PASS.
PASS / FAIL: PASS
Ryzyka: check:diff-size FAIL (13 plików / limit 12, ponad 1000 linii skryptów) – dotyczy jednorazowego importu samego workflow, tak jak w zadaniu startowym Paula; kolejne zadania muszą przejść pełne gate:local. typecheck i build nie są jeszcze wymagane (brak modułów i buildu) – zapisane w ParkingLot.md.
Follow-up: podział index.html na moduły z testami (pierwsze zadanie według nowych zasad).
