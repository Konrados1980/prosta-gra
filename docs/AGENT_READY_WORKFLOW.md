# Praca nad zadaniem

Ustal wynik i najmniejszy dowód jego osiągnięcia. Przy błędzie odtwórz go przed zmianą. Przy nowej funkcji określ scenariusz, którego projekt jeszcze nie obsługuje. W obu przypadkach uruchom tę samą weryfikację po zmianie.

## Otwarcie i zakres

```sh
npm run task:new -- --slug opis-zmiany --mode CONTENT_FIX --files README.md --outcome "Poprawić instrukcję uruchomienia" --success "Instrukcja podaje komendę i jej wymagania"
```

`--files` przyjmuje ścieżki oddzielone przecinkami. Używaj ukośników `/` również w PowerShell. W katalogach dopuszcza wpisy typu `docs/**`. Generator dodaje ścieżki bieżącego zadania i archiwum. Do audytu użyj `--mode AUDIT`. Generator utworzy krótki formularz i ustawi `audit-only`. Bramka zakresu dopuści wtedy zmiany w formularzu i archiwum tego zadania.

Dla zadania opisz stan wyjściowy, wynik, dowód największej przeszkody i weryfikację. Jeśli wybierasz zadanie, które jej nie usuwa, uzasadnij kolejność i wskaż warunek powrotu. Dla zmian zachowania i integracji opisz tylko ryzyka adekwatne do kodu. Zapisz, jakie wejście jest poprawne, co oznacza sukces, skąd pochodzi wynik i jak użytkownik dowie się o błędzie. Wybierz scenariusze do sprawdzenia. Dla zmian struktury wskaż granice odpowiedzialności i kierunek zależności. Prowadź szczegóły w zadaniu, a instrukcje ogólne w `AGENTS.md`.

## Weryfikacja i zamknięcie

Przy aktywnym zadaniu uruchom test właściwy dla zmiany oraz bramkę z README. Zadanie aktywne ma datę UTC i pozostaje świeże przez trzy dni. Jeśli praca trwa dłużej, odnotuj aktualny stan i ponownie sprawdź zakres przed odświeżeniem daty i identyfikatora.

Zapisz komendy i rzeczywiste wyniki w `Review / Wyniki`. Zamknięcie archiwizuje zapis i ustawia bieżący formularz na `READY_FOR_NEXT_TASK`. Gdy musisz ponownie sprawdzić otwarte zmiany po zamknięciu, ustaw `CHECK_TASK_FILE` na ścieżkę odpowiadającego im archiwum.

```sh
npm run task:close -- --result PASS
```

Użyj `FAIL`, jeśli warunek zaliczenia nie został spełniony. Przed rozpoczęciem kolejnego zadania odnotuj, co blokuje wynik.
