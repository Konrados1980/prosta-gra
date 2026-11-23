# Archived Task

Closed At: 2026-11-23T13:33:59.232Z
Result: PASS
Source File: tasks/todo.md

# Current Task

Task ID: 2026-11-23-chmury-i-wysokosc
Task Date: 2026-11-23
Task Status: ACTIVE

## Tryb pracy
FEATURE

Uzasadnienie trybu:
Task utworzony przez task lifecycle.

## Cel / Outcome
Efekt głębi: dwie warstwy chmur nad samolotem (paralaksa) z cieniami na ziemi oraz samolot wznoszący się i opadający (cień i rozmiar zależne od wysokości)

## Kryteria sukcesu
- testy i gate:local przechodzą

## Priorytet / Blocker
Największy blocker teraz: Efekt głębi: dwie warstwy chmur nad samolotem (paralaksa) z cieniami na ziemi oraz samolot wznoszący się i opadający (cień i rozmiar zależne od wysokości)
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
- src/depth.js
- src/render-plane.js
- src/render-hud.js
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
Pliki: src/depth.js, src/render-plane.js, src/render-hud.js, index.html, tests/game.test.js, README.md

## Reprodukcja / dowód problemu
Plan z ParkingLot.md (opcja 1, krok 1): gra wyglądała płasko – brak warstw nad samolotem, stały cień samolotu.

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
Root cause: wszystko rysowane na jednej płaszczyźnie i przesuwane z tą samą prędkością co ziemia.
Dowód: drawPlane – stały cień (x+16, y+24); brak obiektów nad samolotem.
Aktualny flow: draw(): drawWorld -> drawCloudShadows -> drawPlane (planeAltitude) -> drawParticles -> drawClouds -> drawAtmosphere.

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
TESTS: 2 nowe (prędkość warstw chmur 1,35× i 1,8× ziemi; wysokość 0–1, wyżej przy przyspieszaniu, zderzenie niezależne od wysokości, rysowanie wszystkich pór).
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
Co zmieniono: nowy src/depth.js (2 warstwy chmur z paralaksą, cienie chmur, puszysty wierzch, ciemniejsze nocą; wysokość lotu samolotu); render-plane.js – cień i rozmiar zależne od wysokości (liczonej także podczas migania); render-hud.js – kolejność rysowania; wersja 2.4; README.
Jak sprawdzono: npm run lint PASS; npm test 20/20 PASS (2 nowe; test wyłapał brak wysokości podczas migania – poprawione; pierwszy gate:local FAIL – test zderzenia miał skałę za daleko (20 przy progu 21), przy szybkim locie mijała samolot; skała przesunięta na 5, npm test 8× bez błędu); gate:local PASS; podgląd na żywo (localhost:5173): gra rusza Enterem, chmury i ich cienie widoczne, zrzut porównawczy samolotu nisko/wysoko; konsola bez błędów.
PASS / FAIL: PASS
Ryzyka: panel dawał grze klatki z przerwami, więc dłuższej gry klawiszami nie było; gęstość i przezroczystość chmur ustawione na oko (mogą przeszkadzać w dostrzeganiu przeszkód).
Follow-up: krok 2 – drzewa i głazy jako bryły.
