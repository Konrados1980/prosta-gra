# Archived Task

Closed At: 2026-11-23T14:12:46.657Z
Result: PASS
Source File: tasks/todo.md

# Current Task

Task ID: 2026-11-23-gory-na-horyzoncie
Task Date: 2026-11-23
Task Status: ACTIVE

## Tryb pracy
FEATURE

Uzasadnienie trybu:
Task utworzony przez task lifecycle.

## Cel / Outcome
Góry i pagórki na horyzoncie w widoku pod kątem: dwie warstwy z paralaksą na boki przy skręcaniu, kolory pory dnia, zimą śnieżne czubki

## Kryteria sukcesu
- testy i gate:local przechodzą

## Priorytet / Blocker
Największy blocker teraz: Góry i pagórki na horyzoncie w widoku pod kątem: dwie warstwy z paralaksą na boki przy skręcaniu, kolory pory dnia, zimą śnieżne czubki
Dowód blockera: polecenie użytkownika i aktualny task
Czy ten task rusza blocker: TAK
Jeśli NIE, powód: NOT_APPLICABLE
Dlaczego mimo to robimy teraz: nie dotyczy
Warunek powrotu do blockera: nie dotyczy

## Kontekst dla agenta
Moduł: grafika
Tryb zmiany: code-change
Maksymalny zakres plików: allowlista z taska
Dozwolone pliki do zmiany:
- src/perspective.js
- index.html
- tests/game.test.js
- README.md
- tasks/todo.md
- tasks/archive/**
Kontrakty do przeczytania: AGENTS.md oraz tylko potrzebne docs dla tego taska
Pliki zakazane: wszystko poza allowlistą
Czego nie ruszać: pliki poza zakresem

## Zakres
Moduł: grafika
Pliki: src/perspective.js, index.html, tests/game.test.js, README.md

## Reprodukcja / dowód problemu
Użytkownik wybrał ozdobienie horyzontu w widoku pod kątem.

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
Root cause: nad horyzontem było tylko gładkie niebo.
Dowód: drawAngled – sam gradient nieba.
Aktualny flow: drawAngled: niebo -> drawMountains (2 warstwy, przesunięcie = −(plane.x − W/2)·shift) -> ląd -> paski świata -> mgiełka.

## Granice
Moduły dotknięte: grafika
Kontrakty dotknięte: do uzupełnienia, jeśli dotyczy.
Poza zakresem: wszystko poza allowlistą.

## Kontrakt
INPUT: polecenie użytkownika i pliki z allowlisty.
SUCCESS: spełnione kryteria sukcesu.
ERRORS: brak dowodu, zmiana poza scope albo failujące gate'y.
STATUSES: PASS / FAIL.
SIDE EFFECTS: tylko zmiany w plikach z allowlisty.
LOGS: komendy weryfikacyjne.
TESTS: nowy test (bliższa warstwa przesuwa się bardziej; góry mieszczą się nad horyzontem; rysowanie wszystkich pór ze skrętem).
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
NOT_NEEDED

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
NIE

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
npm run gate:local
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
Co zmieniono: src/perspective.js – drawMountains: dalekie góry (niebieskawe, za mgiełką, śnieżne czubki powyżej 55% wysokości, zimą bielsze) i bliższe pagórki; paralaksa na boki przy skręcaniu; kolory mieszane z niebem, nocą ciemniej; wersja 2.9; README.
Jak sprawdzono: npm run lint PASS; npm test 24/24 PASS (1 nowy); gate:local PASS; podgląd (localhost:5173): dzień (góry i pagórki widoczne) i zima (śnieżne czubki widoczne po obniżeniu progu z 70% do 55%); domyślny widok pod kątem potwierdzony; konsola bez błędów.
PASS / FAIL: PASS
Ryzyka: przesuwanie gór przy skręcaniu oglądane tylko w teście i na pojedynczych klatkach, nie w ruchu.
Follow-up: brak.
