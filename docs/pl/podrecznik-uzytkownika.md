# ADSPersoneelapp - Kompletny podręcznik użytkownika

> Wersja 3.1 | Styczeń 2026

---

## Spis treści

1. [Wprowadzenie](#1-wprowadzenie)
2. [Rozpoczęcie pracy](#2-rozpoczęcie-pracy)
3. [Panel główny (Dashboard)](#3-panel-główny-dashboard)
4. [Rejestracja czasu pracy](#4-rejestracja-czasu-pracy)
5. [Zarządzanie urlopami](#5-zarządzanie-urlopami)
6. [Zwolnienia lekarskie](#6-zwolnienia-lekarskie)
7. [Zarządzanie wydatkami](#7-zarządzanie-wydatkami)
8. [Fleet Tracking (Śledzenie pojazdów)](#8-fleet-tracking-śledzenie-pojazdów)
9. [Zarządzanie pracownikami](#9-zarządzanie-pracownikami)
10. [Zatwierdzanie wniosków](#10-zatwierdzanie-wniosków)
11. [Raporty i eksport](#11-raporty-i-eksport)
12. [Ustawienia](#12-ustawienia)
13. [Plany subskrypcji](#13-plany-subskrypcji)

---

## 1. Wprowadzenie

### Czym jest ADSPersoneelapp?

ADSPersoneelapp to kompletna platforma do zarządzania zasobami ludzkimi (HR), zaprojektowana specjalnie dla organizacji działających w Holandii. System pomaga w:

- **Rejestracji czasu pracy** - Śledzenie godzin pracy z weryfikacją GPS
- **Zarządzaniu urlopami** - Wnioskowanie i zarządzanie dniami wolnymi
- **Zwolnieniach lekarskich** - Rejestracja nieobecności zgodnie z wymogami UWV
- **Wydatkach** - Składanie wniosków o zwrot kosztów i kilometrówki
- **Fleet Tracking** - Automatyczna rejestracja przejazdów służbowych
- **Eksport do Nmbrs** - Bezproblemowa integracja z systemem płacowym

### Dla kogo jest ten podręcznik?

Ten podręcznik jest przeznaczony dla wszystkich użytkowników ADSPersoneelapp:

| Rola | Opis |
|------|------|
| **Pracownik (User)** | Może zarządzać własnymi godzinami, urlopami i wydatkami |
| **Kierownik (Manager)** | Może zarządzać zespołem i zatwierdzać wnioski |
| **Administrator (Tenant Admin)** | Pełne zarządzanie organizacją i ustawieniami |
| **Superużytkownik (Superuser)** | Zarządzanie całą platformą (tylko dla administratorów) |

### Słowniczek holenderskich terminów

W tym podręczniku spotkasz się z holenderskimi terminami prawnymi i administracyjnymi. Oto najważniejsze z nich:

| Termin holenderski | Znaczenie |
|-------------------|-----------|
| **UWV** | Uitvoeringsinstituut Werknemersverzekeringen - holenderska instytucja ds. ubezpieczeń pracowniczych |
| **Poortwachter** | Dosł. "strażnik" - ustawa regulująca procedury zwolnień lekarskich |
| **Wettelijk verlof** | Urlop ustawowy - minimum 20 dni rocznie zgodnie z prawem |
| **Bovenwettelijk verlof** | Urlop dodatkowy - dni ponad ustawowe minimum |
| **CAO** | Collectieve Arbeidsovereenkomst - układ zbiorowy pracy |
| **AVG/GDPR** | Rozporządzenie o ochronie danych osobowych |
| **Nmbrs** | Popularny holenderski system płacowy |
| **TVT** | Tijd voor Tijd - godziny kompensacyjne (czas za czas) |

---

## 2. Rozpoczęcie pracy

### 2.1 Logowanie

1. Przejdź do adresu aplikacji (np. `app.adspersoneelapp.nl`)
2. Wprowadź swój **adres e-mail**
3. Wprowadź swoje **hasło**
4. Kliknij **Zaloguj się** (Inloggen)

> **Wskazówka**: Zapomniałeś hasła? Kliknij "Wachtwoord vergeten" (Zapomniałem hasła), aby otrzymać link do resetu na swój adres e-mail.

### 2.2 Pierwsze logowanie

Przy pierwszym logowaniu:

1. Otrzymasz e-mail powitalny z danymi do logowania
2. Zaloguj się za pomocą tymczasowego hasła
3. Zmień hasło na własne, osobiste hasło
4. Sprawdź swoje dane profilowe

### 2.3 Ustawienia języka

ADSPersoneelapp obsługuje wiele języków:

- 🇳🇱 Nederlands (Holenderski - domyślny)
- 🇬🇧 English (Angielski)
- 🇩🇪 Deutsch (Niemiecki)
- 🇵🇱 Polski

**Zmiana języka:**
1. Przejdź do **Profiel** (Profil) w prawym górnym rogu
2. Wybierz preferowany język
3. Interfejs zostanie natychmiast zaktualizowany

### 2.4 Nawigacja

Główna nawigacja znajduje się po lewej stronie ekranu:

```
┌─────────────────────────────┐
│ 🏠 Dashboard                │ ← Panel główny
│ ⏱️ Tijdregistratie          │ ← Rejestracja czasu
│ 🏖️ Verlof                   │ ← Urlopy
│ 🏥 Ziekmeldingen            │ ← Zwolnienia lekarskie
│ 💰 Declaraties              │ ← Wydatki/Deklaracje
│ 🚗 Ritten                   │ ← Przejazdy
│ 👥 Medewerkers              │ ← Pracownicy (tylko Kierownik+)
│ ✅ Goedkeuringen            │ ← Zatwierdzenia (tylko Kierownik+)
│ ⚙️ Instellingen             │ ← Ustawienia
└─────────────────────────────┘
```

---

## 3. Panel główny (Dashboard)

Panel główny zapewnia szybki przegląd najważniejszych danych.

### 3.1 Osobiste wskaźniki KPI

| KPI | Opis |
|-----|------|
| **Uren deze maand** | Łączna liczba przepracowanych godzin w bieżącym miesiącu |
| **Overwerk** | Godziny nadliczbowe ponad wymiar umowy |
| **Verlof resterend** | Pozostałe dni urlopowe |
| **Openstaande items** | Wnioski oczekujące na rozpatrzenie |

### 3.2 Widget szybkiego logowania/wylogowania

Szybkie rozpoczęcie i zakończenie pracy:

1. Kliknij duży przycisk **Inklokken** (Zaloguj)
2. Zezwól na dostęp do lokalizacji (dla weryfikacji GPS)
3. Twój czas pracy rozpoczyna się
4. Kliknij **Uitklokken** (Wyloguj) po zakończeniu pracy

### 3.3 Widget salda urlopowego

Pokazuje aktualne saldo urlopowe:

- **Wettelijk verlof** - Urlop ustawowy (standardowe dni urlopowe)
- **Bovenwettelijk verlof** - Urlop dodatkowy (ponad minimum ustawowe)
- **Compensatie-uren** - Godziny kompensacyjne (TVT - czas za czas)

### 3.4 Panel kierownika (dodatkowe funkcje)

Jako kierownik widzisz dodatkowo:

- **Team overzicht** - Przegląd zespołu i status pracowników
- **Pending approvals** - Wnioski oczekujące na zatwierdzenie
- **Team verzuim** - Aktualne nieobecności chorobowe w zespole
- **UWV Alerts** - Krytyczne terminy dla chorych pracowników

---

## 4. Rejestracja czasu pracy

### 4.1 Przegląd

Moduł rejestracji czasu pracy pozwala dokładnie śledzić godziny pracy.

### 4.2 Rozpoczęcie pracy (Inklokken)

**Metoda 1: Szybkie logowanie (Dashboard)**
1. Przejdź do Panelu głównego (Dashboard)
2. Kliknij **Inklokken** (Zaloguj)
3. Twoja lokalizacja zostanie automatycznie zapisana

**Metoda 2: Ręczne wprowadzenie**
1. Przejdź do **Tijdregistratie** (Rejestracja czasu)
2. Kliknij **+ Nieuwe registratie** (Nowa rejestracja)
3. Wypełnij dane:
   - Datum (Data)
   - Starttijd (Godzina rozpoczęcia)
   - Eindtijd (Godzina zakończenia)
   - Pauze (Przerwa w minutach)
   - Beschrijving (Opis - opcjonalnie)
4. Kliknij **Opslaan** (Zapisz)

### 4.3 Zakończenie pracy (Uitklokken)

1. Przejdź do Panelu głównego lub Rejestracji czasu
2. Kliknij **Uitklokken** (Wyloguj)
3. Twoja godzina zakończenia i lokalizacja zostaną zapisane
4. Łączny czas pracy zostanie automatycznie obliczony

### 4.4 Przeglądanie rejestracji

1. Przejdź do **Tijdregistratie** (Rejestracja czasu)
2. Użyj filtrów:
   - **Datum range** - Wybierz okres
   - **Status** - Pending/Approved/Rejected (Oczekujące/Zatwierdzone/Odrzucone)
3. Przeglądaj swoje rejestracje na liście

### 4.5 Edycja rejestracji

1. Kliknij na rejestrację na liście
2. Kliknij **Bewerken** (Edytuj)
3. Dostosuj dane
4. Kliknij **Opslaan** (Zapisz)

> **Uwaga**: Zatwierdzone rejestracje nie mogą być edytowane. Skontaktuj się z kierownikiem w sprawie poprawek.

### 4.6 Weryfikacja GPS

Przy logowaniu i wylogowaniu zapisywana jest Twoja lokalizacja:

- **Exact adres** - Dokładny adres określony automatycznie przez GPS
- **Coördinaten** - Współrzędne (szerokość/długość geograficzna) do weryfikacji
- **Verificatie** - Kierownik może sprawdzić lokalizację

### 4.7 Workflow statusów

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ PENDING  │ ──▶ │ APPROVED │ lub │ REJECTED │
│(Oczekuje)│     │(Zatwierd)│     │(Odrzucon)│
└──────────┘     └──────────┘     └──────────┘
    │                                   │
    └── Ocenione przez kierownika ──────┘
```

**Objaśnienie statusów:**

| Status | Znaczenie | Możliwe działania |
|--------|-----------|-------------------|
| 🟡 **Pending** | Oczekuje na zatwierdzenie | Edycja, usunięcie |
| 🟢 **Approved** | Zatwierdzone przez kierownika | Brak zmian |
| 🔴 **Rejected** | Odrzucone (zobacz powód) | Złóż ponownie |

---

## 5. Zarządzanie urlopami

### 5.1 Typy urlopów

| Typ | Opis | Standard |
|-----|------|----------|
| **Wettelijk verlof** | Urlop ustawowy zgodny z CAO | 20 dni/rok |
| **Bovenwettelijk verlof** | Dodatkowe dni ponad minimum | 5 dni/rok |
| **Compensatie-uren** | Czas za czas (TVT) | Zmienny |
| **Bijzonder verlof** | Urlop okolicznościowy (ślub, żałoba itp.) | Wg sytuacji |
| **Onbetaald verlof** | Urlop bezpłatny | Na wniosek |

### 5.2 Sprawdzanie salda urlopowego

1. Przejdź do **Verlof** (Urlopy)
2. U góry strony zobaczysz swoje saldo:
   - Totaal beschikbaar (Łącznie dostępne)
   - Opgenomen dit jaar (Wykorzystane w tym roku)
   - Resterend (Pozostałe)
   - Vervaldatum (Data wygaśnięcia)

### 5.3 Składanie wniosku urlopowego

1. Przejdź do **Verlof** (Urlopy)
2. Kliknij **+ Nieuwe aanvraag** (Nowy wniosek)
3. Wypełnij dane:
   - **Type verlof** - Wybierz typ urlopu
   - **Startdatum** - Pierwszy dzień urlopu
   - **Einddatum** - Ostatni dzień urlopu
   - **Reden** (opcjonalnie) - Powód
4. Kliknij **Indienen** (Złóż wniosek)

### 5.4 Status wniosku

| Status | Znaczenie |
|--------|-----------|
| 🟡 **Pending** | Oczekuje na zatwierdzenie |
| 🟢 **Approved** | Zatwierdzony przez kierownika |
| 🔴 **Rejected** | Odrzucony (zobacz powód) |

### 5.5 Anulowanie wniosku

1. Przejdź do **Verlof** (Urlopy)
2. Znajdź swój wniosek na liście
3. Kliknij **Annuleren** (Anuluj) - tylko przy statusie Pending
4. Potwierdź anulowanie

### 5.6 Przegląd urlopów (kalendarz)

1. Przejdź do **Verlof** (Urlopy)
2. Przełącz na **Kalender weergave** (Widok kalendarza)
3. Zobacz swoje urlopy i urlopy kolegów z zespołu
4. Kliknij na dzień, aby zobaczyć szczegóły

### 5.7 Wygasanie urlopu

Zwróć uwagę na daty wygaśnięcia urlopów:

| Typ urlopu | Data wygaśnięcia |
|------------|------------------|
| **Wettelijk verlof** (ustawowy) | 1 lipca następnego roku |
| **Bovenwettelijk verlof** (dodatkowy) | Po 5 latach |
| **Compensatie-uren** (kompensacyjne) | 31 grudnia bieżącego roku |

> **Wskazówka**: Otrzymasz automatyczne przypomnienia, gdy urlop będzie bliski wygaśnięcia.

---

## 6. Zwolnienia lekarskie

### 6.1 Zgłaszanie choroby

1. Przejdź do **Ziekmeldingen** (Zwolnienia lekarskie)
2. Kliknij **+ Ziek melden** (Zgłoś chorobę)
3. Wypełnij dane:
   - **Startdatum** - Pierwszy dzień choroby
   - **Verwachte duur** (opcjonalnie) - Przewidywany czas trwania
   - **Toelichting** (opcjonalnie) - Dodatkowe informacje
4. Kliknij **Melden** (Zgłoś)

> **Ważne**: Zgłoś chorobę jak najszybciej, najlepiej przed rozpoczęciem godzin pracy.

### 6.2 Zgłaszanie powrotu do zdrowia

1. Przejdź do **Ziekmeldingen** (Zwolnienia lekarskie)
2. Znajdź swoje aktywne zgłoszenie choroby
3. Kliknij **Hersteld melden** (Zgłoś powrót do zdrowia)
4. Wprowadź datę powrotu do zdrowia
5. Kliknij **Bevestigen** (Potwierdź)

### 6.3 Częściowy powrót do pracy

W przypadku częściowego powrotu do zdrowia:

1. Kliknij **Gedeeltelijk herstel** (Częściowe wyzdrowienie)
2. Wprowadź procent zdolności do pracy (np. 50%)
3. Opisz ewentualne ograniczenia
4. Kliknij **Opslaan** (Zapisz)

### 6.4 Zgodność z UWV Poortwachter

ADSPersoneelapp automatycznie monitoruje ustawowe terminy związane ze zwolnieniami lekarskimi:

| Dzień | Działanie |
|-------|-----------|
| **Dzień 0** | Zarejestrowanie zwolnienia lekarskiego |
| **Dzień 35** | ⚠️ Ostrzeżenie: Zbliża się termin UWV |
| **Dzień 39** | 🟡 Pilne: 3 dni do terminu |
| **Dzień 41** | 🔴 Krytyczne: 1 dzień do terminu |
| **Dzień 42** | Obowiązkowe zgłoszenie do UWV |

**Co to jest UWV i Poortwachter?**

UWV (Uitvoeringsinstituut Werknemersverzekeringen) to holenderska instytucja zarządzająca ubezpieczeniami pracowniczymi. Ustawa Poortwachter (Wet Verbetering Poortwachter) nakłada na pracodawców obowiązek zgłoszenia pracownika do UWV po 42 dniach (6 tygodniach) nieprzerwanej choroby.

**Workflow zgodności z UWV:**

```
Dzień 0-6:    Zgłoszenie → Pierwszy kontakt z pracownikiem
     │
     ▼
Dzień 7-14:   Ocena sytuacji zdrowotnej
     │
     ▼
Dzień 14-35:  Monitoring i wsparcie powrotu do pracy
     │
     ▼
Dzień 35-41:  ⚠️ Przygotowanie dokumentacji UWV
     │
     ▼
Dzień 42:     📋 OBOWIĄZKOWE zgłoszenie do UWV
```

### 6.5 Alerty i powiadomienia

Otrzymujesz automatyczne powiadomienia o:

- Zbliżających się terminach UWV
- Wymaganych dokumentach
- Wizytach u lekarza zakładowego (bedrijfsarts)
- Terminach Planu Działania (Plan van Aanpak)

---

## 7. Zarządzanie wydatkami

### 7.1 Przegląd

System deklaracji wydatków obsługuje różne typy kosztów z pełnym procesem zatwierdzania.

### 7.2 Typy wydatków

| Typ | Opis | Stawka zwrotu |
|-----|------|---------------|
| **Kilometervergoeding** | Przejazdy służbowe | €0,23/km |
| **Reiskosten** | Transport publiczny, taksówki, parkingi | Rzeczywiste koszty |
| **Maaltijden** | Służbowe obiady/kolacje | Maks. €50/dzień |
| **Verblijf** | Hotel, zakwaterowanie | Maks. €150/noc |
| **Overig** | Inne koszty służbowe | Do zatwierdzenia |

### 7.3 Składanie wniosku o kilometrówkę

1. Przejdź do **Declaraties** (Wydatki)
2. Kliknij **+ Nieuwe declaratie** (Nowa deklaracja)
3. Wybierz **Kilometervergoeding** (Kilometrówka)
4. Wypełnij:
   - **Datum** - Data przejazdu
   - **Van** - Lokalizacja początkowa
   - **Naar** - Lokalizacja docelowa
   - **Afstand** - Kilometry (lub oblicz automatycznie)
   - **Reden** - Cel przejazdu
5. Opcjonalnie załącz paragon za parking
6. Kliknij **Indienen** (Złóż)

> **Wskazówka**: Przy Fleet Tracking przejazdy są automatycznie sugerowane!

**Obliczanie kilometrówki:**

```
Przykład:
Trasa: Amsterdam → Rotterdam
Dystans: 75 km
Stawka: €0,23/km
─────────────────────
Zwrot: 75 × €0,23 = €17,25
```

### 7.4 Składanie wniosku o zwrot kosztów

1. Przejdź do **Declaraties** (Wydatki)
2. Kliknij **+ Nieuwe declaratie** (Nowa deklaracja)
3. Wybierz typ wydatku
4. Wypełnij:
   - **Datum** - Data zakupu
   - **Bedrag** - Kwota całkowita
   - **Beschrijving** - Co zostało zakupione
   - **Bon** - Załącz zdjęcie/PDF paragonu
5. Kliknij **Indienen** (Złóż)

### 7.5 Załączanie paragonów

Obsługiwane formaty:
- **Obrazy**: JPG, PNG (maks. 5MB)
- **Dokumenty**: PDF (maks. 5MB)

Wskazówki dotyczące paragonów:
- Zadbaj o dobre oświetlenie
- Cały tekst musi być czytelny
- Data i kwota muszą być widoczne

### 7.6 Status deklaracji

| Status | Działanie |
|--------|-----------|
| 🟡 **Pending** | Oczekuje na ocenę kierownika |
| 🟢 **Approved** | Zatwierdzone, zostanie przetworzone w wypłacie |
| 🔴 **Rejected** | Odrzucone, zobacz powód i ewentualnie złóż ponownie |

### 7.7 Eksport do Nmbrs

Zatwierdzone deklaracje są miesięcznie eksportowane do systemu Nmbrs w celu przetworzenia w administracji płacowej.

---

## 8. Fleet Tracking (Śledzenie pojazdów)

### 8.1 Czym jest Fleet Tracking?

Fleet Tracking automatycznie łączy przejazdy Twojego pojazdu służbowego z rejestracją czasu pracy.

### 8.2 Obsługiwane systemy

- RouteVision
- FleetGO
- Samsara
- Webfleet
- TrackJack
- Verizon Connect

### 8.3 Przeglądanie przejazdów

1. Przejdź do **Ritten** (Przejazdy)
2. Wybierz zakres dat
3. Przeglądaj przejazdy z informacjami o:
   - Lokalizacji początkowej i końcowej
   - Dystansie w kilometrach
   - Czasie trwania przejazdu
   - Powiązanej rejestracji czasu

### 8.4 Łączenie przejazdu z rejestracją czasu

1. Przejdź do **Ritten** (Przejazdy)
2. Znajdź żądany przejazd
3. Kliknij **Koppelen** (Połącz)
4. Wybierz odpowiednią rejestrację czasu
5. Przejazd zostanie automatycznie połączony

### 8.5 Automatyczne dopasowywanie

System automatycznie próbuje dopasować przejazdy do rejestracji czasu na podstawie:
- Daty i godziny
- Lokalizacji (porównanie GPS)
- Pracownika

### 8.6 Kilometrówka z przejazdów

1. Wybierz jeden lub więcej przejazdów
2. Kliknij **Declareren** (Zadeklaruj)
3. Kilometry zostaną automatycznie przeniesione
4. Sprawdź i złóż wniosek

---

## 9. Zarządzanie pracownikami

> **Uwaga**: Ta sekcja jest dostępna tylko dla Kierowników i wyższych ról.

### 9.1 Przegląd pracowników

1. Przejdź do **Medewerkers** (Pracownicy)
2. Przeglądaj listę zawierającą:
   - Imię i nazwisko oraz stanowisko
   - Adres e-mail
   - Status (aktywny/nieaktywny)
   - Rola

### 9.2 Dodawanie pracownika

1. Kliknij **+ Nieuwe medewerker** (Nowy pracownik)
2. Wypełnij podstawowe dane:
   - Naam (Imię i nazwisko)
   - E-mailadres
   - Functie (Stanowisko)
   - Afdeling (Dział)
   - Rol (Rola: User/Manager)
   - **Taalvoorkeur** (Preferowany język: NL/EN/DE/PL)
3. Kliknij **Aanmaken** (Utwórz)
4. Pracownik otrzyma e-mail powitalny

### 9.3 Edycja pracownika

1. Kliknij na pracownika
2. Kliknij **Bewerken** (Edytuj)
3. Dostosuj dane
4. Kliknij **Opslaan** (Zapisz)

### 9.4 Dezaktywacja pracownika

1. Kliknij na pracownika
2. Kliknij **Deactiveren** (Dezaktywuj)
3. Potwierdź działanie
4. Pracownik nie będzie mógł się więcej zalogować

### 9.5 Przypisywanie pojazdu

Dla Fleet Tracking:
1. Otwórz profil pracownika
2. Przejdź do **Voertuigen** (Pojazdy)
3. Kliknij **Voertuig toewijzen** (Przypisz pojazd)
4. Wybierz pojazd
5. Kliknij **Opslaan** (Zapisz)

---

## 10. Zatwierdzanie wniosków

> **Uwaga**: Ta sekcja jest dostępna tylko dla Kierowników i wyższych ról.

### 10.1 Przegląd

Ekran zatwierdzeń pokazuje wszystkie otwarte wnioski od Twojego zespołu.

### 10.2 Typy zatwierdzeń

| Typ | Opis |
|-----|------|
| **Timesheets** | Rejestracje czasu pracy |
| **Verlofaanvragen** | Wnioski urlopowe |
| **Declaraties** | Wnioski o zwrot kosztów i kilometrówki |

### 10.3 Pojedyncze zatwierdzenie

1. Przejdź do **Goedkeuringen** (Zatwierdzenia)
2. Kliknij na element
3. Sprawdź szczegóły
4. Kliknij **Goedkeuren** (Zatwierdź) lub **Afwijzen** (Odrzuć)
5. Opcjonalnie dodaj komentarz
6. Potwierdź

### 10.4 Zatwierdzanie zbiorcze

1. Przejdź do **Goedkeuringen** (Zatwierdzenia)
2. Zaznacz wiele elementów
3. Kliknij **Alles goedkeuren** (Zatwierdź wszystko) lub **Alles afwijzen** (Odrzuć wszystko)
4. Potwierdź działanie

### 10.5 Powód odrzucenia

Przy odrzuceniu:
1. Wprowadź jasny powód
2. Pracownik otrzyma powiadomienie
3. Pracownik może w razie potrzeby złożyć wniosek ponownie

### 10.6 Przypomnienia

Otrzymujesz automatyczne przypomnienia o:
- Otwartych zatwierdzeniach starszych niż 3 dni
- Pilnych elementach (np. urlop rozpoczynający się wkrótce)

---

## 11. Raporty i eksport

### 11.1 Dostępne raporty

| Raport | Zawartość |
|--------|-----------|
| **Urenrapport** | Przegląd przepracowanych godzin |
| **Verlofrapport** | Wykorzystany i pozostały urlop |
| **Verzuimrapport** | Przegląd nieobecności chorobowych |
| **Declaratierapport** | Złożone wnioski o zwrot kosztów |

### 11.2 Generowanie raportu

1. Przejdź do odpowiedniego modułu (np. Rejestracja czasu)
2. Ustaw żądane filtry
3. Kliknij **Exporteren** (Eksportuj)
4. Wybierz format:
   - **PDF** - Do druku/archiwizacji
   - **Excel** - Do dalszej analizy
   - **CSV** - Do importu w innych systemach

### 11.3 Eksport do Nmbrs

Do przetwarzania płac:
1. Przejdź do **Instellingen** > **Nmbrs** (Ustawienia > Nmbrs)
2. Wybierz okres
3. Kliknij **Export genereren** (Generuj eksport)
4. Pobierz plik
5. Zaimportuj do Nmbrs

### 11.4 Miesięczne przeglądy

Automatycznie generowane raporty:
- Miesięczny przegląd godzin
- Przegląd urlopów kwartalnie
- Statystyki nieobecności

---

## 12. Ustawienia

### 12.1 Profil

**Zmiana danych osobowych:**
1. Kliknij na swoje imię (prawy górny róg)
2. Kliknij **Profiel** (Profil)
3. Edytuj swoje dane:
   - Naam (Imię i nazwisko)
   - E-mailadres
   - Telefoonnummer (Numer telefonu)
   - Taalvoorkeur (Preferowany język)
4. Kliknij **Opslaan** (Zapisz)

### 12.2 Zmiana hasła

1. Przejdź do **Profiel** (Profil)
2. Kliknij **Wachtwoord wijzigen** (Zmień hasło)
3. Wprowadź obecne hasło
4. Wprowadź nowe hasło (dwukrotnie)
5. Kliknij **Opslaan** (Zapisz)

**Wymagania dotyczące hasła:**
- Minimum 8 znaków
- Co najmniej 1 wielka litera
- Co najmniej 1 cyfra
- Co najmniej 1 znak specjalny

### 12.3 Ustawienia powiadomień

1. Przejdź do **Instellingen** > **Notificaties** (Ustawienia > Powiadomienia)
2. Skonfiguruj preferencje:
   - Powiadomienia e-mail włączone/wyłączone
   - Powiadomienia w aplikacji włączone/wyłączone
   - Częstotliwość przypomnień
3. Kliknij **Opslaan** (Zapisz)

### 12.4 Ustawienia organizacji (Admin)

Jako Administrator:
1. Przejdź do **Instellingen** > **Organisatie** (Ustawienia > Organizacja)
2. Skonfiguruj:
   - Nazwę firmy i logo
   - Standardowe godziny pracy
   - Politykę urlopową
   - Limity wydatków
   - Integrację z Fleet Provider

### 12.5 Konfiguracja Fleet Provider (Admin)

1. Przejdź do **Instellingen** > **Fleet Provider**
2. Wybierz dostawcę
3. Wprowadź dane API
4. Kliknij **Verbinding testen** (Testuj połączenie)
5. Po sukcesie kliknij **Opslaan** (Zapisz)

---

## 13. Plany subskrypcji

### 13.1 Porównanie planów

| Funkcja | Freemium | Standard |
|---------|----------|----------|
| **Cena** | Bezpłatnie | €49,95/miesiąc |
| **Użytkownicy** | Maks. 3 | Nieograniczeni (+€4,95/dodatkowy) |
| **Rejestracja czasu** | ✅ | ✅ |
| **Zarządzanie urlopami** | ✅ | ✅ |
| **Zwolnienia lekarskie** | ✅ | ✅ |
| **Wydatki** | Podstawowe | Pełne |
| **Wielojęzyczność** | Tylko NL | NL/EN/DE/PL |
| **Weryfikacja GPS** | ❌ | ✅ |
| **Fleet Tracking** | ❌ | ✅ |
| **Eksport do Nmbrs** | ❌ | ✅ |
| **Eksport PDF/Excel** | ❌ | ✅ |

### 13.2 Upgrade planu

1. Przejdź do **Instellingen** > **Abonnement** (Ustawienia > Subskrypcja)
2. Kliknij **Upgraden naar Standard** (Ulepsz do Standard)
3. Wprowadź dane płatności
4. Potwierdź

### 13.3 Metody płatności

Obsługiwane metody:
- iDEAL (Holandia)
- Karta kredytowa (Visa, Mastercard)
- SEPA Direct Debit (Polecenie zapłaty)

### 13.4 Faktury

Faktury są automatycznie wysyłane na adres e-mail administratora. Można je również pobrać:
**Instellingen** > **Abonnement** > **Facturen**

---

## Potrzebujesz pomocy?

### Kontakt z pomocą techniczną

- **Chatbot FAQ**: Prawy dolny róg w aplikacji
- **E-mail**: support@adspersoneelapp.nl
- **Telefon**: Dostępny tylko dla klientów planu Standard

### Przydatne skróty

| Skrót | Opis holenderski | Tłumaczenie |
|-------|------------------|-------------|
| **Opslaan** | Zapisz | |
| **Annuleren** | Anuluj | |
| **Bewerken** | Edytuj | |
| **Indienen** | Złóż wniosek | |
| **Goedkeuren** | Zatwierdź | |
| **Afwijzen** | Odrzuć | |
| **Verwijderen** | Usuń | |

---

*© 2026 ADSPersoneelapp - Wszelkie prawa zastrzeżone*
