# Lot nad Rzeką

Prosta zręcznościówka w przeglądarce. Lecisz samolotem nad krętą rzeką, omijasz brzegi i wyspy, a przeszkody w wodzie omijasz albo zestrzeliwujesz. Za złapanie złotej gwiazdki (przelotem) dostajesz +25 punktów. Masz 3 życia, a gra z czasem przyspiesza.

## Zagraj online

👉 **https://konrados1980.github.io/prosta-gra/**

## Jak uruchomić na komputerze

Kliknij dwa razy plik `index.html` i gra otworzy się w przeglądarce. Nic nie trzeba instalować.

## Gra dla 1–4 graczy

W menu wybierz liczbę graczy (1–4) i wpisz imiona. Gracze grają po kolei, każdy ma 3 życia. Po ostatnim graczu pojawiają się wyniki rundy (ze zwycięzcą 🏆) i tabela 10 najlepszych wyników. Rekordy i imiona zapisują się w przeglądarce, więc zostają po zamknięciu strony (na tym samym komputerze i w tej samej przeglądarce). Rekordy można wyczyścić przyciskiem „Wyczyść rekordy”.

Zmiana graczy lub imion: na ekranie wyników kliknij „Zmień graczy / imiona” (albo naciśnij M; w trakcie gry: P, a potem M). Kliknięcie w pole zaznacza stare imię, więc od razu wpisujesz nowe.

## Sterowanie

- ← → lot na boki
- ↑ lot do przodu (szybciej)
- ↓ lot do tyłu (wolniej)
- Spacja lub X strzał (można trzymać)
- P pauza
- Enter start i nowa gra
- F pełny ekran (albo przycisk „Pełny ekran” pod grą; wyjście: F lub Esc)

Plansza dopasowuje się do szerokości okna: na szerokim monitorze widać więcej, a rzeka jest trochę szersza.

Na telefonie: przesuwaj palcem w dowolnym miejscu ekranu gry, a samolot przesuwa się razem z palcem (palec go nie zasłania). Dotknięcie uruchamia grę i wznawia ją po pauzie.

## Przeszkody i punkty

| Przeszkoda | Co robi | Trafienia do rozbicia | Punkty |
|---|---|---|---|
| Skała | stoi w miejscu | 1 | 10 |
| Pień | dryfuje w poprzek rzeki i odbija się od brzegów | 1 | 15 |
| Boja | kołysze się na boki | 1 | 20 |
| Wir | nie rozbija samolotu, ale wciąga go do środka | 2 | 25 |
| Głaz | stoi w miejscu, pęka po każdym trafieniu | 3 | 50 |
| Armatka (na brzegu) | strzela kulami w poprzek rzeki; czerwona lufa = zaraz strzeli | 2 | 40 |
| Kula z armatki | leci poziomo przez rzekę, rozbija samolot | 1 | 5 |
| Gwiazdka | nagroda – zbierasz ją przelotem | – | 25 |

Armatki pojawiają się od ok. 200 punktów dystansu i strzelają tylko wtedy, gdy są przed samolotem, więc zawsze widać je wcześniej.

Przeszkody pojawiają się tylko na szerokich fragmentach rzeki i zawsze zostawiają wolny przejazd. Im dalej lecisz, tym więcej trudniejszych przeszkód (głazy od ok. 150 punktów dystansu, wiry od ok. 300).

## Praca nad projektem

Projekt rozwijamy z AI według stałych zasad zapisanych w repo:

- [AGENTS.md](AGENTS.md) – główne zasady: tryby pracy, formularz zadania, bramki jakości.
- [CLAUDE.md](CLAUDE.md) – jak współpracujemy: przebieg zmiany, definicja „gotowe”, format raportu.
- [tasks/lessons.md](tasks/lessons.md) – wnioski z błędów zamienione w reguły; [ParkingLot.md](ParkingLot.md) – odłożone pomysły.
- [tasks/todo.md](tasks/todo.md) – bieżące zadanie; zamknięte zadania są w `tasks/archive/`.

Potrzebny jest Node.js (bez instalowania paczek). Najważniejsze komendy (na Windows w PowerShell możesz użyć `npm.cmd`):

```sh
npm test                 # testy logiki gry
npm run lint             # sprawdzenie składni kodu gry
npm run task:new -- --slug opis --mode FEATURE --files index.html --outcome "Cel" --success "Warunek"
npm run gate:local       # wszystkie bramki przed zamknięciem zadania
npm run task:close -- --result PASS
```

Szkielet workflow (skrypty w `scripts/`, `docs/`, formularz zadania) pochodzi z projektu [paulcrowski/jakapiosenka](https://github.com/paulcrowski/jakapiosenka) Paula Crowa (klub „PoProstuKoduj”), udostępnionego do nauki. Nasze zmiany: `check-project-gates.js` czyta listę wymaganych komend z `package.json` (`workflowGates`), dodaliśmy `scripts/check-game-syntax.js` i testy w `tests/`.
