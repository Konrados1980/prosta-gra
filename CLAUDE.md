# Zasady pracy z Claude w tym projekcie

Najpierw przeczytaj [AGENTS.md](AGENTS.md) – to główne zasady (tryby pracy, formularz zadania, bramki). Ten plik dodaje to, jak współpracujemy z użytkownikiem.

## Kim jest użytkownik i jak z nim rozmawiać

- Użytkownik uczy się programowania z pomocą AI (klub „PoProstuKoduj” Paula). Chce rozumieć nie tylko **co** powstaje, ale też **jak** i **dlaczego tak**.
- Pisz po polsku, prostym językiem, krótko, zaczynaj od wyniku. Trudne słowo wyjaśnij jednym zdaniem.
- Gdy decyzja należy do użytkownika (wygląd, zasady gry, klawisze), zapytaj i daj 2–4 opcje z rekomendacją. Oczywiste rzeczy rób sam i powiedz, co wybrałeś.
- Duże życzenie dziel na kroki; po każdym kroku użytkownik może zagrać i zgłosić uwagi.

## Przebieg każdej zmiany

1. `npm run task:new` z celem, warunkiem zaliczenia i listą plików (patrz AGENTS.md).
2. Przeczytaj kod, którego dotyczy zmiana, i [tasks/lessons.md](tasks/lessons.md).
3. Najmniejsza zmiana, która spełnia cel. Pomysły na później → [ParkingLot.md](ParkingLot.md).
4. Sprawdzenie:
   - `npm run lint` i `npm test` (każda naprawa błędu dostaje nowy test),
   - gra na żywo w przeglądarce: prawdziwe klawisze, zrzut ekranu, konsola bez błędów,
   - wąskie i szerokie okno.
5. Podbij numer wersji pod grą (stopka w `index.html`).
6. `npm run gate:local`, zapis wyników w `tasks/todo.md`, `npm run task:close -- --result PASS|FAIL`.
7. Commit (opis po polsku, co i dlaczego) i push na `main`. Ustalenie z 19.11.2026: po zadaniu z wynikiem PASS commitujemy i wysyłamy na GitHuba bez dodatkowego pytania (użytkownik chce mieć każdą wersję online). Jeśli użytkownik zmieni zdanie, popraw ten punkt.
8. Poczekaj, aż GitHub Pages pokaże nową wersję, i sprawdź ją online.

## Raport po każdej zmianie

```
Zrobione:        co się zmieniło, z punktu widzenia gracza
Pliki:           które pliki
Jak sprawdzono:  konkretne testy i ich wyniki
Wynik:           PASS albo FAIL
Ryzyka:          co nie zostało sprawdzone, co może się źle zachować
```

Zawsze podaj link do gry z numerem wersji, np. `https://konrados1980.github.io/prosta-gra/?v=191` (przeglądarka trzyma starą wersję strony do 10 minut, a `?v=` wymusza świeżą). Na laptopie zamiast Ctrl+F5 podpowiadaj **Ctrl+Shift+R**.

## Czego nie robić

- Nie kopiuj istniejących gier (nazwy, grafiki, poziomów) – robimy własne gry w danym gatunku.
- Nie zmieniaj plików spoza listy w zadaniu.
- Nie wpisuj prywatnego e-maila użytkownika do commitów – w tym repo autor ma adres `noreply` z GitHuba.
- Nie zgłaszaj PASS bez sprawdzenia; jeśli czegoś nie dało się sprawdzić, napisz to w „Ryzykach”.
