"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  BookOpen,
  Clock,
  Calendar,
  Thermometer,
  Receipt,
  Car,
  Users,
  CheckSquare,
  FileText,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search
} from "lucide-react";

// Help content organized by topic and language
const helpContent = {
  nl: {
    title: "Hulp & Documentatie",
    subtitle: "Alles wat u moet weten over ADSPersoneelapp",
    searchPlaceholder: "Zoek in de documentatie...",
    sections: {
      gettingStarted: {
        title: "Aan de slag",
        icon: BookOpen,
        items: [
          {
            question: "Hoe log ik in?",
            answer: "Ga naar de inlogpagina, voer uw e-mailadres en wachtwoord in, en klik op 'Inloggen'. Bij uw eerste login ontvangt u een welkomstmail met uw inloggegevens."
          },
          {
            question: "Hoe wijzig ik mijn taal?",
            answer: "Klik rechtsboven op uw naam, ga naar 'Profiel', en selecteer uw gewenste taal onder 'Taalvoorkeur'. De interface wordt direct bijgewerkt."
          },
          {
            question: "Ik ben mijn wachtwoord vergeten",
            answer: "Klik op 'Wachtwoord vergeten' op de inlogpagina. U ontvangt een e-mail met een reset-link die 24 uur geldig is."
          }
        ]
      },
      timeRegistration: {
        title: "Tijdregistratie",
        icon: Clock,
        items: [
          {
            question: "Hoe klok ik in?",
            answer: "Ga naar het Dashboard en klik op de grote 'Inklokken' knop. Sta locatietoegang toe voor GPS-verificatie. U kunt ook handmatig uren invoeren via Tijdregistratie → + Nieuwe registratie."
          },
          {
            question: "Ik ben vergeten uit te klokken",
            answer: "Ga naar Tijdregistratie, vind de openstaande registratie, klik op 'Bewerken' en vul de correcte eindtijd in. Dit werkt alleen als de registratie nog niet is goedgekeurd."
          },
          {
            question: "Wat betekenen de statussen?",
            answer: "🟡 Pending = Wacht op goedkeuring (bewerken mogelijk), 🟢 Approved = Goedgekeurd (geen wijzigingen), 🔴 Rejected = Afgewezen (opnieuw indienen)."
          },
          {
            question: "Kan ik uren met terugwerkende kracht invoeren?",
            answer: "Ja, via Tijdregistratie → + Nieuwe registratie kunt u een datum in het verleden selecteren en de gegevens invullen."
          }
        ]
      },
      leave: {
        title: "Verlofbeheer",
        icon: Calendar,
        items: [
          {
            question: "Hoeveel verlof heb ik?",
            answer: "Ga naar de Verlof pagina. Bovenaan ziet u uw actuele saldo per categorie: wettelijk verlof, bovenwettelijk verlof en compensatie-uren."
          },
          {
            question: "Hoe vraag ik verlof aan?",
            answer: "Ga naar Verlof → + Nieuwe aanvraag. Selecteer het type verlof, de start- en einddatum, voeg optioneel een reden toe, en klik op Indienen."
          },
          {
            question: "Wanneer vervalt mijn verlof?",
            answer: "Wettelijk verlof vervalt op 1 juli van het volgende jaar. Bovenwettelijk verlof vervalt na 5 jaar. Compensatie-uren vervallen aan het einde van het kalenderjaar. U ontvangt automatisch herinneringen."
          },
          {
            question: "Mijn verlof is afgewezen, wat nu?",
            answer: "Bekijk de reden bij de afgewezen aanvraag, overleg eventueel met uw manager, en dien een nieuwe aanvraag in met aangepaste datums."
          }
        ]
      },
      sickLeave: {
        title: "Ziekmeldingen",
        icon: Thermometer,
        items: [
          {
            question: "Hoe meld ik me ziek?",
            answer: "Ga naar Ziekmeldingen → + Ziek melden. Selecteer de startdatum, voeg optioneel een toelichting toe, en klik op Melden. Doe dit zo vroeg mogelijk, bij voorkeur vóór aanvang werktijd."
          },
          {
            question: "Hoe meld ik me beter?",
            answer: "Ga naar Ziekmeldingen, vind uw actieve ziekmelding, klik op 'Hersteld melden', vul de hersteldatum in en bevestig."
          },
          {
            question: "Wat is de UWV 42-dagen regel?",
            answer: "Na 42 dagen (6 weken) ziekte moet uw werkgever u aanmelden bij het UWV. ADSPersoneelapp monitort dit automatisch en stuurt tijdig alerts: ⚠️ 7 dagen, 🟡 3 dagen, 🔴 1 dag voor de deadline."
          }
        ]
      },
      expenses: {
        title: "Declaraties",
        icon: Receipt,
        items: [
          {
            question: "Welke declaratietypes zijn er?",
            answer: "Kilometervergoeding (€0,23/km), Reiskosten (werkelijke kosten), Maaltijden (max €50/dag), Verblijf (max €150/nacht), en Overig (op goedkeuring)."
          },
          {
            question: "Hoe dien ik een kilometervergoeding in?",
            answer: "Ga naar Declaraties → + Nieuwe declaratie → Kilometervergoeding. Vul datum, van, naar, afstand en reden in. Upload eventueel een parkeerbon en klik op Indienen."
          },
          {
            question: "Welke bonnen moet ik uploaden?",
            answer: "Voor declaraties (behalve kilometervergoeding) altijd een bon uploaden. Ondersteunde formaten: JPG, PNG of PDF (max 5MB). Zorg dat datum en bedrag zichtbaar zijn."
          },
          {
            question: "Wanneer wordt mijn declaratie uitbetaald?",
            answer: "Goedgekeurde declaraties worden verwerkt in de eerstvolgende salarisrun (meestal rond de 25e van de maand)."
          }
        ]
      },
      fleet: {
        title: "Fleet Tracking",
        icon: Car,
        items: [
          {
            question: "Wat is Fleet Tracking?",
            answer: "Fleet Tracking koppelt de GPS-data van uw bedrijfsvoertuig automatisch aan uw urenregistratie. Ritten worden automatisch geregistreerd en kilometers nauwkeurig vastgelegd."
          },
          {
            question: "Hoe zie ik mijn ritten?",
            answer: "Ga naar Ritten, selecteer de datumrange. U ziet start/eind locatie, afstand (km), duur en of de rit gekoppeld is aan een timesheet."
          },
          {
            question: "Hoe declareer ik een rit?",
            answer: "Ga naar Ritten, selecteer de gewenste rit(ten), klik op 'Declareren'. De kilometers worden automatisch ingevuld, controleer en dien in."
          }
        ]
      },
      manager: {
        title: "Voor Managers",
        icon: Users,
        items: [
          {
            question: "Hoe keur ik items goed?",
            answer: "Ga naar Goedkeuringen, bekijk openstaande items, klik op een item voor details, en klik op 'Goedkeuren' of 'Afwijzen'. U kunt ook meerdere items tegelijk goedkeuren via batch goedkeuring."
          },
          {
            question: "Hoe voeg ik een nieuwe medewerker toe?",
            answer: "Ga naar Medewerkers → + Nieuwe medewerker. Vul naam, e-mail, functie en rol in. Kies ook de taalvoorkeur. De medewerker ontvangt automatisch een welkomstmail."
          },
          {
            question: "Hoe deactiveer ik een medewerker?",
            answer: "Ga naar Medewerkers, selecteer de medewerker, klik op 'Deactiveren' en bevestig. De medewerker kan niet meer inloggen maar data blijft bewaard."
          }
        ]
      },
      reports: {
        title: "Rapportages & Export",
        icon: FileText,
        items: [
          {
            question: "Hoe exporteer ik gegevens?",
            answer: "Ga naar de betreffende module (bijv. Tijdregistratie), stel filters in, klik op 'Exporteren' en kies het formaat: PDF (printen), Excel (analyse) of CSV (import)."
          },
          {
            question: "Hoe werkt de Nmbrs export?",
            answer: "Ga naar Instellingen → Nmbrs, selecteer de periode, klik op 'Export genereren', download het bestand en importeer in Nmbrs voor salarisverwerking."
          }
        ]
      },
      settings: {
        title: "Instellingen",
        icon: Settings,
        items: [
          {
            question: "Hoe wijzig ik mijn wachtwoord?",
            answer: "Ga naar Profiel → Wachtwoord wijzigen. Voer uw huidige wachtwoord in, daarna het nieuwe wachtwoord (2x). Eisen: min. 8 karakters, 1 hoofdletter, 1 cijfer, 1 speciaal teken."
          },
          {
            question: "Hoe wijzig ik mijn notificatie-instellingen?",
            answer: "Ga naar Instellingen → Notificaties. Configureer e-mail en in-app notificaties, en de frequentie van herinneringen."
          }
        ]
      }
    },
    contact: {
      title: "Nog vragen?",
      chatbot: "Gebruik de FAQ chatbot rechtsonder",
      email: "E-mail: support@adspersoneelapp.nl",
      docs: "Volledige documentatie"
    }
  },
  en: {
    title: "Help & Documentation",
    subtitle: "Everything you need to know about ADSPersoneelapp",
    searchPlaceholder: "Search documentation...",
    sections: {
      gettingStarted: {
        title: "Getting Started",
        icon: BookOpen,
        items: [
          {
            question: "How do I log in?",
            answer: "Go to the login page, enter your email address and password, and click 'Log in'. On your first login, you will receive a welcome email with your credentials."
          },
          {
            question: "How do I change my language?",
            answer: "Click on your name in the top right, go to 'Profile', and select your preferred language under 'Language preference'. The interface will update immediately."
          },
          {
            question: "I forgot my password",
            answer: "Click on 'Forgot password' on the login page. You will receive an email with a reset link that is valid for 24 hours."
          }
        ]
      },
      timeRegistration: {
        title: "Time Registration",
        icon: Clock,
        items: [
          {
            question: "How do I clock in?",
            answer: "Go to the Dashboard and click the large 'Clock In' button. Allow location access for GPS verification. You can also manually enter hours via Time Registration → + New entry."
          },
          {
            question: "I forgot to clock out",
            answer: "Go to Time Registration, find the open entry, click 'Edit' and fill in the correct end time. This only works if the entry hasn't been approved yet."
          },
          {
            question: "What do the statuses mean?",
            answer: "🟡 Pending = Awaiting approval (can edit), 🟢 Approved = Approved (no changes), 🔴 Rejected = Rejected (resubmit)."
          },
          {
            question: "Can I enter hours retroactively?",
            answer: "Yes, via Time Registration → + New entry you can select a date in the past and fill in the details."
          }
        ]
      },
      leave: {
        title: "Leave Management",
        icon: Calendar,
        items: [
          {
            question: "How much leave do I have?",
            answer: "Go to the Leave page. At the top you'll see your current balance by category: statutory leave, extra-statutory leave, and compensation hours."
          },
          {
            question: "How do I request leave?",
            answer: "Go to Leave → + New request. Select the leave type, start and end date, optionally add a reason, and click Submit."
          },
          {
            question: "When does my leave expire?",
            answer: "Statutory leave expires on July 1st of the following year. Extra-statutory leave expires after 5 years. Compensation hours expire at the end of the calendar year. You'll receive automatic reminders."
          },
          {
            question: "My leave was rejected, what now?",
            answer: "Check the reason for the rejected request, discuss with your manager if needed, and submit a new request with adjusted dates."
          }
        ]
      },
      sickLeave: {
        title: "Sick Leave",
        icon: Thermometer,
        items: [
          {
            question: "How do I report sick?",
            answer: "Go to Sick Leave → + Report Sick. Select the start date, optionally add a note, and click Report. Do this as early as possible, preferably before work starts."
          },
          {
            question: "How do I report recovery?",
            answer: "Go to Sick Leave, find your active sick report, click 'Report Recovery', fill in the recovery date and confirm."
          },
          {
            question: "What is the UWV 42-day rule?",
            answer: "After 42 days (6 weeks) of illness, your employer must report you to the UWV (Dutch social security). ADSPersoneelapp monitors this automatically and sends timely alerts: ⚠️ 7 days, 🟡 3 days, 🔴 1 day before the deadline."
          }
        ]
      },
      expenses: {
        title: "Expenses",
        icon: Receipt,
        items: [
          {
            question: "What expense types are available?",
            answer: "Mileage (€0.23/km), Travel costs (actual costs), Meals (max €50/day), Accommodation (max €150/night), and Other (on approval)."
          },
          {
            question: "How do I submit mileage?",
            answer: "Go to Expenses → + New expense → Mileage. Fill in date, from, to, distance and reason. Optionally upload a parking receipt and click Submit."
          },
          {
            question: "Which receipts should I upload?",
            answer: "For expenses (except mileage) always upload a receipt. Supported formats: JPG, PNG or PDF (max 5MB). Make sure date and amount are visible."
          },
          {
            question: "When will my expense be paid?",
            answer: "Approved expenses are processed in the next salary run (usually around the 25th of the month)."
          }
        ]
      },
      fleet: {
        title: "Fleet Tracking",
        icon: Car,
        items: [
          {
            question: "What is Fleet Tracking?",
            answer: "Fleet Tracking automatically links the GPS data from your company vehicle to your time registration. Trips are automatically recorded and kilometers accurately tracked."
          },
          {
            question: "How do I view my trips?",
            answer: "Go to Trips, select the date range. You'll see start/end location, distance (km), duration, and whether the trip is linked to a timesheet."
          },
          {
            question: "How do I claim a trip?",
            answer: "Go to Trips, select the desired trip(s), click 'Claim'. The kilometers are automatically filled in, review and submit."
          }
        ]
      },
      manager: {
        title: "For Managers",
        icon: Users,
        items: [
          {
            question: "How do I approve items?",
            answer: "Go to Approvals, view pending items, click on an item for details, and click 'Approve' or 'Reject'. You can also approve multiple items at once via batch approval."
          },
          {
            question: "How do I add a new employee?",
            answer: "Go to Employees → + New employee. Fill in name, email, function and role. Also choose the language preference. The employee will automatically receive a welcome email."
          },
          {
            question: "How do I deactivate an employee?",
            answer: "Go to Employees, select the employee, click 'Deactivate' and confirm. The employee can no longer log in but data is preserved."
          }
        ]
      },
      reports: {
        title: "Reports & Export",
        icon: FileText,
        items: [
          {
            question: "How do I export data?",
            answer: "Go to the relevant module (e.g., Time Registration), set filters, click 'Export' and choose the format: PDF (printing), Excel (analysis) or CSV (import)."
          },
          {
            question: "How does Nmbrs export work?",
            answer: "Go to Settings → Nmbrs, select the period, click 'Generate export', download the file and import into Nmbrs for salary processing."
          }
        ]
      },
      settings: {
        title: "Settings",
        icon: Settings,
        items: [
          {
            question: "How do I change my password?",
            answer: "Go to Profile → Change password. Enter your current password, then the new password (2x). Requirements: min. 8 characters, 1 uppercase, 1 number, 1 special character."
          },
          {
            question: "How do I change my notification settings?",
            answer: "Go to Settings → Notifications. Configure email and in-app notifications, and the frequency of reminders."
          }
        ]
      }
    },
    contact: {
      title: "More questions?",
      chatbot: "Use the FAQ chatbot in the bottom right",
      email: "Email: support@adspersoneelapp.nl",
      docs: "Full documentation"
    }
  },
  de: {
    title: "Hilfe & Dokumentation",
    subtitle: "Alles, was Sie über ADSPersoneelapp wissen müssen",
    searchPlaceholder: "In der Dokumentation suchen...",
    sections: {
      gettingStarted: {
        title: "Erste Schritte",
        icon: BookOpen,
        items: [
          {
            question: "Wie melde ich mich an?",
            answer: "Gehen Sie zur Anmeldeseite, geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein und klicken Sie auf 'Anmelden'. Bei Ihrer ersten Anmeldung erhalten Sie eine Willkommens-E-Mail mit Ihren Zugangsdaten."
          },
          {
            question: "Wie ändere ich meine Sprache?",
            answer: "Klicken Sie oben rechts auf Ihren Namen, gehen Sie zu 'Profil' und wählen Sie Ihre bevorzugte Sprache unter 'Spracheinstellung'. Die Oberfläche wird sofort aktualisiert."
          },
          {
            question: "Ich habe mein Passwort vergessen",
            answer: "Klicken Sie auf der Anmeldeseite auf 'Passwort vergessen'. Sie erhalten eine E-Mail mit einem Reset-Link, der 24 Stunden gültig ist."
          }
        ]
      },
      timeRegistration: {
        title: "Zeiterfassung",
        icon: Clock,
        items: [
          {
            question: "Wie stempel ich ein?",
            answer: "Gehen Sie zum Dashboard und klicken Sie auf die große Schaltfläche 'Einstempeln'. Erlauben Sie den Standortzugriff für die GPS-Verifizierung. Sie können Stunden auch manuell über Zeiterfassung → + Neuer Eintrag eingeben."
          },
          {
            question: "Ich habe vergessen auszustempeln",
            answer: "Gehen Sie zur Zeiterfassung, finden Sie den offenen Eintrag, klicken Sie auf 'Bearbeiten' und geben Sie die korrekte Endzeit ein. Dies funktioniert nur, wenn der Eintrag noch nicht genehmigt wurde."
          },
          {
            question: "Was bedeuten die Status?",
            answer: "🟡 Ausstehend = Wartet auf Genehmigung (bearbeitbar), 🟢 Genehmigt = Genehmigt (keine Änderungen), 🔴 Abgelehnt = Abgelehnt (erneut einreichen)."
          }
        ]
      },
      leave: {
        title: "Urlaubsverwaltung",
        icon: Calendar,
        items: [
          {
            question: "Wie viel Urlaub habe ich?",
            answer: "Gehen Sie zur Urlaubsseite. Oben sehen Sie Ihren aktuellen Saldo nach Kategorie: gesetzlicher Urlaub, außergesetzlicher Urlaub und Überstundenausgleich."
          },
          {
            question: "Wie beantrage ich Urlaub?",
            answer: "Gehen Sie zu Urlaub → + Neuer Antrag. Wählen Sie den Urlaubstyp, Start- und Enddatum, fügen Sie optional einen Grund hinzu und klicken Sie auf Einreichen."
          },
          {
            question: "Wann verfällt mein Urlaub?",
            answer: "Gesetzlicher Urlaub verfällt am 1. Juli des Folgejahres. Außergesetzlicher Urlaub verfällt nach 5 Jahren. Überstundenausgleich verfällt am Ende des Kalenderjahres."
          }
        ]
      },
      sickLeave: {
        title: "Krankmeldungen",
        icon: Thermometer,
        items: [
          {
            question: "Wie melde ich mich krank?",
            answer: "Gehen Sie zu Krankmeldungen → + Krankmelden. Wählen Sie das Startdatum, fügen Sie optional eine Notiz hinzu und klicken Sie auf Melden. Tun Sie dies so früh wie möglich."
          },
          {
            question: "Was ist die UWV 42-Tage-Regel?",
            answer: "Nach 42 Tagen (6 Wochen) Krankheit muss Ihr Arbeitgeber Sie beim UWV (niederländische Sozialversicherung) melden. ADSPersoneelapp überwacht dies automatisch."
          }
        ]
      },
      expenses: {
        title: "Spesen",
        icon: Receipt,
        items: [
          {
            question: "Welche Spesenarten gibt es?",
            answer: "Kilometergeld (€0,23/km), Reisekosten (tatsächliche Kosten), Mahlzeiten (max €50/Tag), Unterkunft (max €150/Nacht) und Sonstiges (auf Genehmigung)."
          },
          {
            question: "Wie reiche ich Kilometergeld ein?",
            answer: "Gehen Sie zu Spesen → + Neue Ausgabe → Kilometergeld. Füllen Sie Datum, von, nach, Entfernung und Grund aus und klicken Sie auf Einreichen."
          }
        ]
      },
      fleet: {
        title: "Flottenmanagement",
        icon: Car,
        items: [
          {
            question: "Was ist Flottenmanagement?",
            answer: "Flottenmanagement verknüpft automatisch die GPS-Daten Ihres Firmenfahrzeugs mit Ihrer Zeiterfassung. Fahrten werden automatisch erfasst."
          }
        ]
      },
      manager: {
        title: "Für Manager",
        icon: Users,
        items: [
          {
            question: "Wie genehmige ich Einträge?",
            answer: "Gehen Sie zu Genehmigungen, sehen Sie ausstehende Einträge, klicken Sie auf einen Eintrag für Details und klicken Sie auf 'Genehmigen' oder 'Ablehnen'."
          }
        ]
      },
      reports: {
        title: "Berichte & Export",
        icon: FileText,
        items: [
          {
            question: "Wie exportiere ich Daten?",
            answer: "Gehen Sie zum entsprechenden Modul, setzen Sie Filter, klicken Sie auf 'Exportieren' und wählen Sie das Format: PDF, Excel oder CSV."
          }
        ]
      },
      settings: {
        title: "Einstellungen",
        icon: Settings,
        items: [
          {
            question: "Wie ändere ich mein Passwort?",
            answer: "Gehen Sie zu Profil → Passwort ändern. Geben Sie Ihr aktuelles Passwort ein, dann das neue Passwort (2x)."
          }
        ]
      }
    },
    contact: {
      title: "Weitere Fragen?",
      chatbot: "Nutzen Sie den FAQ-Chatbot unten rechts",
      email: "E-Mail: support@adspersoneelapp.nl",
      docs: "Vollständige Dokumentation"
    }
  },
  pl: {
    title: "Pomoc i dokumentacja",
    subtitle: "Wszystko, co musisz wiedzieć o ADSPersoneelapp",
    searchPlaceholder: "Szukaj w dokumentacji...",
    sections: {
      gettingStarted: {
        title: "Pierwsze kroki",
        icon: BookOpen,
        items: [
          {
            question: "Jak się zalogować?",
            answer: "Przejdź do strony logowania, wprowadź swój adres e-mail i hasło, a następnie kliknij 'Zaloguj się'. Przy pierwszym logowaniu otrzymasz powitalny e-mail z danymi dostępowymi."
          },
          {
            question: "Jak zmienić język?",
            answer: "Kliknij swoje imię w prawym górnym rogu, przejdź do 'Profil' i wybierz preferowany język w sekcji 'Preferencje językowe'. Interfejs zostanie natychmiast zaktualizowany."
          },
          {
            question: "Zapomniałem hasła",
            answer: "Kliknij 'Zapomniałem hasła' na stronie logowania. Otrzymasz e-mail z linkiem do resetowania, który jest ważny przez 24 godziny."
          }
        ]
      },
      timeRegistration: {
        title: "Rejestracja czasu",
        icon: Clock,
        items: [
          {
            question: "Jak się zalogować do pracy?",
            answer: "Przejdź do Dashboardu i kliknij duży przycisk 'Rozpocznij pracę'. Zezwól na dostęp do lokalizacji w celu weryfikacji GPS. Możesz też ręcznie wprowadzić godziny przez Rejestracja czasu → + Nowy wpis."
          },
          {
            question: "Zapomniałem się wylogować",
            answer: "Przejdź do Rejestracji czasu, znajdź otwarty wpis, kliknij 'Edytuj' i wprowadź prawidłowy czas zakończenia. Działa to tylko jeśli wpis nie został jeszcze zatwierdzony."
          }
        ]
      },
      leave: {
        title: "Zarządzanie urlopami",
        icon: Calendar,
        items: [
          {
            question: "Ile mam urlopu?",
            answer: "Przejdź do strony Urlopy. Na górze zobaczysz swoje aktualne saldo według kategorii: urlop ustawowy, urlop dodatkowy i godziny kompensacyjne."
          },
          {
            question: "Jak złożyć wniosek o urlop?",
            answer: "Przejdź do Urlopy → + Nowy wniosek. Wybierz rodzaj urlopu, datę rozpoczęcia i zakończenia, opcjonalnie dodaj powód i kliknij Złóż wniosek."
          }
        ]
      },
      sickLeave: {
        title: "Zwolnienia lekarskie",
        icon: Thermometer,
        items: [
          {
            question: "Jak zgłosić chorobę?",
            answer: "Przejdź do Zwolnienia lekarskie → + Zgłoś chorobę. Wybierz datę rozpoczęcia, opcjonalnie dodaj notatkę i kliknij Zgłoś. Zrób to jak najwcześniej, najlepiej przed rozpoczęciem pracy."
          },
          {
            question: "Co to jest zasada UWV 42 dni?",
            answer: "Po 42 dniach (6 tygodni) choroby pracodawca musi zgłosić Cię do UWV (holenderskie ubezpieczenie społeczne). ADSPersoneelapp automatycznie monitoruje to i wysyła powiadomienia."
          }
        ]
      },
      expenses: {
        title: "Wydatki",
        icon: Receipt,
        items: [
          {
            question: "Jakie są rodzaje wydatków?",
            answer: "Kilometrówka (€0,23/km), Koszty podróży (rzeczywiste koszty), Posiłki (max €50/dzień), Zakwaterowanie (max €150/noc) i Inne (do zatwierdzenia)."
          },
          {
            question: "Jak złożyć wniosek o kilometrówkę?",
            answer: "Przejdź do Wydatki → + Nowy wydatek → Kilometrówka. Wypełnij datę, skąd, dokąd, odległość i powód. Kliknij Złóż wniosek."
          }
        ]
      },
      fleet: {
        title: "Śledzenie floty",
        icon: Car,
        items: [
          {
            question: "Co to jest śledzenie floty?",
            answer: "Śledzenie floty automatycznie łączy dane GPS z pojazdu służbowego z rejestracją czasu pracy. Trasy są automatycznie rejestrowane."
          }
        ]
      },
      manager: {
        title: "Dla kierowników",
        icon: Users,
        items: [
          {
            question: "Jak zatwierdzać wpisy?",
            answer: "Przejdź do Zatwierdzenia, zobacz oczekujące wpisy, kliknij na wpis, aby zobaczyć szczegóły, i kliknij 'Zatwierdź' lub 'Odrzuć'."
          }
        ]
      },
      reports: {
        title: "Raporty i eksport",
        icon: FileText,
        items: [
          {
            question: "Jak eksportować dane?",
            answer: "Przejdź do odpowiedniego modułu, ustaw filtry, kliknij 'Eksportuj' i wybierz format: PDF, Excel lub CSV."
          }
        ]
      },
      settings: {
        title: "Ustawienia",
        icon: Settings,
        items: [
          {
            question: "Jak zmienić hasło?",
            answer: "Przejdź do Profil → Zmień hasło. Wprowadź aktualne hasło, a następnie nowe hasło (2x)."
          }
        ]
      }
    },
    contact: {
      title: "Więcej pytań?",
      chatbot: "Użyj chatbota FAQ w prawym dolnym rogu",
      email: "E-mail: support@adspersoneelapp.nl",
      docs: "Pełna dokumentacja"
    }
  }
};

type LocaleKey = keyof typeof helpContent;

export default function HelpPage() {
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const content = helpContent[locale as LocaleKey] || helpContent.nl;

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionKey)
        ? prev.filter(k => k !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const toggleItem = (itemKey: string) => {
    setExpandedItems(prev =>
      prev.includes(itemKey)
        ? prev.filter(k => k !== itemKey)
        : [...prev, itemKey]
    );
  };

  // Filter items based on search query
  const filterItems = (items: { question: string; answer: string }[]) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {content.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {content.subtitle}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={content.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Help Sections */}
      <div className="space-y-4">
        {Object.entries(content.sections).map(([sectionKey, section]) => {
          const Icon = section.icon;
          const filteredItems = filterItems(section.items);

          if (searchQuery && filteredItems.length === 0) return null;

          const isExpanded = expandedSections.includes(sectionKey) || !!searchQuery;

          return (
            <div
              key={sectionKey}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({filteredItems.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map((item, index) => {
                    const itemKey = `${sectionKey}-${index}`;
                    const isItemExpanded = expandedItems.includes(itemKey);

                    return (
                      <div key={itemKey} className="bg-white dark:bg-gray-900">
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full flex items-center justify-between p-4 text-left
                                     hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="font-medium text-gray-800 dark:text-gray-200 pr-4">
                            {item.question}
                          </span>
                          {isItemExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {isItemExpanded && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          {content.contact.title}
        </h2>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p>💬 {content.contact.chatbot}</p>
          <p>📧 {content.contact.email}</p>
          <a
            href={`/docs/${locale}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
          >
            📚 {content.contact.docs}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
