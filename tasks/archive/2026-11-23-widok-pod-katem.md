# Archived Task

Closed At: 2026-11-23T14:05:32.343Z
Result: PASS
Source File: tasks/todo.md

# Current Task

Task ID: 2026-11-23-widok-pod-katem
Task Date: 2026-11-23
Task Status: ACTIVE

## Tryb pracy
FEATURE

Uzasadnienie trybu:
Task utworzony przez task lifecycle.

## Cel / Outcome
Widok pod kątem (pseudo-3D): perspektywa, niebo i horyzont w kolorach pory dnia, mgiełka oddalenia, samolot rysowany w przeliczonym miejscu; przełącznik V i przycisk, wybór zapamiętany, domyślnie widok z góry

## Kryteria sukcesu
- testy i gate:local przechodzą

## Priorytet / Blocker
Największy blocker teraz: Widok pod kątem (pseudo-3D): perspektywa, niebo i horyzont w kolorach pory dnia, mgiełka oddalenia, samolot rysowany w przeliczonym miejscu; przełącznik V i przycisk, wybór zapamiętany, domyślnie widok z góry
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
- src/render-hud.js
- src/screen.js
- src/input.js
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
Pliki: src/perspective.js, src/render-hud.js, src/screen.js, src/input.js, index.html, tests/game.test.js, README.md

## Reprodukcja / dowód problemu
Plan z ParkingLot.md: opcja 2 „trochę 3D” – widok pod kątem jako przełącznik V (GitHub Pages pokazuje tylko main).

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
Root cause: gra miała tylko widok z góry.
Dowód: draw() rysował świat wprost na ekran, bez perspektywy.
Aktualny flow: draw(): view3d ? drawAngled() (świat na płótnie w pamięci -> paski ze skalą s, niebo, mgiełka, samolot i chmury przez project()) : dotychczasowe rysowanie.

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
TESTS: 2 nowe (domyślnie widok z góry, V przełącza i zapisuje; perspektywa: skala 1 na dole, 0,5 na horyzoncie, horyzont ok. 28%, rysowanie wszystkich pór i menu).
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
Co zmieniono: nowy src/perspective.js (widok pod kątem: płótno w pamięci, przenoszenie pasków ze skalą, niebo w kolorze pory dnia, mgiełka przy horyzoncie, samolot i chmury w perspektywie, reflektor nocą w miejscu samolotu, przełącznik V i przycisk, zapis w localStorage, domyślnie widok z góry); screen.js – ctx jako let; render-hud.js – wybór widoku w draw(); input.js – klawisz V; index.html – przycisk, stopka, wersja 2.7; README.
Jak sprawdzono: npm run lint PASS; npm test 23/23 PASS (2 nowe); gate:local PASS; podgląd (localhost:5173): pierwsza wersja rozciągała przedmioty w pionie i miała płaskie wielkie chmury – zmienione na perspektywę bez rozciągania (d = L·ln(1/s)) i chmury w perspektywie; zrzuty dzień, noc, zima; prawdziwy klawisz V przełącza i zapisuje; konsola bez błędów.
PASS / FAIL: PASS
Ryzyka: w widoku pod kątem sterowanie palcem (telefon) wskazuje miejsca w starym układzie; brak dłuższej gry klawiszami (panel bywa wstrzymywany); dalekie przeszkody są mniejsze, więc trudniej je zauważyć – do oceny przez gracza.
Follow-up: ocena użytkownika; ewentualnie dalsze strojenie (FAR_SCALE, mgiełka, góry na horyzoncie).
