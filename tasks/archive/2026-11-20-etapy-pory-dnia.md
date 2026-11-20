# Archived Task

Closed At: 2026-11-20T15:16:30.282Z
Result: PASS
Source File: tasks/todo.md

# Current Task

Task ID: 2026-11-20-etapy-pory-dnia
Task Date: 2026-11-20
Task Status: ACTIVE

## Tryb pracy
FEATURE

Uzasadnienie trybu:
Task utworzony przez task lifecycle.

## Cel / Outcome
Etapy co 1000 pkt dystansu: dzień, zachód słońca, noc z reflektorem, zima z krami; płynne przejścia i napis Etap N

## Kryteria sukcesu
- testy etapów i gate:local przechodzą

## Priorytet / Blocker
Największy blocker teraz: Etapy co 1000 pkt dystansu: dzień, zachód słońca, noc z reflektorem, zima z krami; płynne przejścia i napis Etap N
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
- src/stages.js
- src/render-world.js
- src/render-objects.js
- src/render-hud.js
- src/game.js
- index.html
- tests/game.test.js
- tests/helpers/load-game.js
- README.md
- tasks/todo.md
- tasks/archive/**
Kontrakty do przeczytania: AGENTS.md oraz tylko potrzebne docs dla tego taska
Pliki zakazane: wszystko poza allowlistą
Czego nie ruszać: pliki poza zakresem

## Zakres
Moduł: grafika
Pliki: src/stages.js, src/render-world.js, src/render-objects.js, src/render-hud.js, src/game.js, index.html, tests/game.test.js, tests/helpers/load-game.js, README.md

## Reprodukcja / dowód problemu
Użytkownik chce zmiany tła co ileś punktów; kolory świata były wpisane na sztywno w render-world.js i render-objects.js.

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
Root cause: brak pojęcia etapu i palety kolorów – świat zawsze wyglądał tak samo.
Dowód: stałe kolory (#3d8b3d, #2196f3 itd.) w drawWorld i drawTrees.
Aktualny flow: update() -> updateStage() wykrywa nowy etap; drawWorld() bierze paletę z stageInfo(cam); draw() -> drawAtmosphere() i drawStageBanner().

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
TESTS: 2 nowe testy etapów (kolejność pór, przejście kolorów, napis, rysowanie nocy i zimy, reset po nowej grze).
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
Co zmieniono: nowy src/stages.js (4 palety, płynne przejścia, noc z reflektorem i widocznymi ostrzeżeniami armatek, kry zimą, napis „Etap N”); render-world.js i render-objects.js biorą kolory z palety; game.js wywołuje updateStage; render-hud.js rysuje atmosferę i napis; wersja 2.1; README.
Jak sprawdzono: npm run lint PASS; npm test 13/13 PASS (2 nowe); gate:local PASS (FEATURE 8/12 plików, 184/250 linii); na żywo (localhost:5173, okno 800x450, W ok. 850): zrzuty dnia, zachodu (po poprawce koloru wody), nocy (po wzmocnieniu reflektora) i zimy, napis „Etap 2 / Zachód słońca”, konsola bez błędów.
PASS / FAIL: PASS
Ryzyka: etapy oglądane po przeskoczeniu dystansu w konsoli; dłuższej gry klawiszami przez przejścia nie było, bo panel przeglądarki się ukrył (ukryta strona nie dostaje klatek). Noc jest trudniejsza (mniej widać) – do oceny przez gracza.
Follow-up: dźwięki (osobne zadanie).
