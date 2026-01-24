# ADSPersoneelapp - Vollständiges Benutzerhandbuch

> Version 3.1 | Januar 2026

---

## Inhaltsverzeichnis

1. [Einführung](#1-einführung)
2. [Erste Schritte](#2-erste-schritte)
3. [Dashboard](#3-dashboard)
4. [Zeiterfassung](#4-zeiterfassung)
5. [Urlaubsverwaltung](#5-urlaubsverwaltung)
6. [Krankmeldungen](#6-krankmeldungen)
7. [Spesenverwaltung](#7-spesenverwaltung)
8. [Flottenmanagement](#8-flottenmanagement)
9. [Mitarbeiterverwaltung](#9-mitarbeiterverwaltung)
10. [Genehmigungsworkflow](#10-genehmigungsworkflow)
11. [Berichte und Export](#11-berichte-und-export)
12. [Einstellungen](#12-einstellungen)
13. [Häufig gestellte Fragen](#13-häufig-gestellte-fragen)

---

## 1. Einführung

### Was ist ADSPersoneelapp?

ADSPersoneelapp ist eine umfassende HR-Management-Plattform, die speziell für Organisationen in den Niederlanden entwickelt wurde. Das System unterstützt Sie bei:

- **Zeiterfassung** - Arbeitsstunden mit GPS-Verifizierung erfassen
- **Urlaubsverwaltung** - Urlaub und freie Tage beantragen und verwalten
- **Krankmeldungen** - Abwesenheit mit UWV-Compliance registrieren
- **Spesenverwaltung** - Ausgaben und Kilometerentschädigung einreichen
- **Flottenmanagement** - Geschäftsfahrten automatisch erfassen
- **Nmbrs-Export** - Nahtlose Integration in die Gehaltsabrechnung

### Für wen ist dieses Handbuch?

Dieses Handbuch richtet sich an alle Benutzer von ADSPersoneelapp:

| Rolle | Beschreibung |
|-------|--------------|
| **Mitarbeiter** | Kann eigene Arbeitszeiten, Urlaub und Spesen verwalten |
| **Manager** | Kann das Team verwalten und Genehmigungen erteilen |
| **Tenant-Administrator** | Vollständige Organisationsverwaltung und Einstellungen |
| **Superuser** | Plattformweite Verwaltung (nur für Administratoren) |

---

## 2. Erste Schritte

### 2.1 Anmeldung

1. Navigieren Sie zur Anwendungs-URL (z.B. `app.adspersoneelapp.nl`)
2. Geben Sie Ihre **E-Mail-Adresse** ein
3. Geben Sie Ihr **Passwort** ein
4. Klicken Sie auf **Anmelden**

> **Tipp**: Haben Sie Ihr Passwort vergessen? Klicken Sie auf "Passwort vergessen", um einen Reset-Link per E-Mail zu erhalten.

### 2.2 Erstmalige Anmeldung

Bei Ihrer ersten Anmeldung:

1. Sie erhalten eine Willkommens-E-Mail mit Anmeldedaten
2. Melden Sie sich mit dem temporären Passwort an
3. Ändern Sie Ihr Passwort in ein persönliches Passwort
4. Überprüfen Sie Ihre Profildaten

### 2.3 Spracheinstellung

ADSPersoneelapp unterstützt mehrere Sprachen:

- :de: Deutsch
- :netherlands: Nederlands (Standard)
- :gb: English
- :poland: Polski

**Sprache ändern:**
1. Gehen Sie zu **Profil** (oben rechts)
2. Wählen Sie Ihre gewünschte Sprache
3. Die Benutzeroberfläche wird sofort aktualisiert

### 2.4 Navigation

Die Hauptnavigation befindet sich auf der linken Seite:

```
+-------------------------+
| [Haus] Dashboard        |
| [Uhr] Zeiterfassung     |
| [Palme] Urlaub          |
| [Kreuz] Krankmeldungen  |
| [Euro] Spesen           |
| [Auto] Fahrten          |
| [Personen] Mitarbeiter  |  <- Nur Manager+
| [Haken] Genehmigungen   |  <- Nur Manager+
| [Zahnrad] Einstellungen |
+-------------------------+
```

---

## 3. Dashboard

Das Dashboard bietet Ihnen einen direkten Überblick über Ihre wichtigsten Daten.

### 3.1 Persönliche KPIs

| KPI | Beschreibung |
|-----|--------------|
| **Stunden diesen Monat** | Gesamte Arbeitsstunden im aktuellen Monat |
| **Überstunden** | Stunden über Ihren Vertragsstunden |
| **Resturlaub** | Verfügbare Urlaubstage |
| **Offene Posten** | Zu bearbeitende Anträge |

### 3.2 Schnelles Ein-/Ausstempeln

Schnelles Ein- und Ausstempeln:

1. Klicken Sie auf die große **Einstempeln**-Schaltfläche
2. Erlauben Sie den Standortzugriff (für GPS-Verifizierung)
3. Ihre Arbeitszeit läuft jetzt
4. Klicken Sie auf **Ausstempeln**, wenn Sie fertig sind

### 3.3 Urlaubssaldo-Widget

Zeigt Ihr aktuelles Urlaubssaldo:

- **Gesetzlicher Urlaub** - Ihre Standard-Urlaubstage
- **Außergesetzlicher Urlaub** - Zusätzliche Tage über dem Minimum
- **Überstundenausgleich** - Zeitausgleich-Aufbau

### 3.4 Manager-Dashboard (Zusätzlich)

Als Manager sehen Sie zusätzlich:

- **Teamübersicht** - Anzahl der Teammitglieder und deren Status
- **Ausstehende Genehmigungen** - Offene Genehmigungsanfragen
- **Teamabwesenheit** - Aktuelle Krankheitsquote
- **UWV-Warnungen** - Kritische Fristen für kranke Mitarbeiter

---

## 4. Zeiterfassung

### 4.1 Übersicht

Das Zeiterfassungsmodul ermöglicht Ihnen eine präzise Erfassung Ihrer Arbeitsstunden.

### 4.2 Einstempeln

**Methode 1: Schnelles Einstempeln (Dashboard)**
1. Gehen Sie zum Dashboard
2. Klicken Sie auf **Einstempeln**
3. Ihr Standort wird automatisch erfasst

**Methode 2: Manuelle Eingabe**
1. Gehen Sie zu **Zeiterfassung**
2. Klicken Sie auf **+ Neue Erfassung**
3. Füllen Sie die Daten aus:
   - Datum
   - Startzeit
   - Endzeit
   - Pause (in Minuten)
   - Beschreibung (optional)
4. Klicken Sie auf **Speichern**

### 4.3 Ausstempeln

1. Gehen Sie zum Dashboard oder zur Zeiterfassung
2. Klicken Sie auf **Ausstempeln**
3. Ihre Endzeit und Ihr Standort werden erfasst
4. Die Gesamtarbeitszeit wird automatisch berechnet

### 4.4 Zeiterfassungen anzeigen

1. Gehen Sie zu **Zeiterfassung**
2. Verwenden Sie die Filter:
   - **Datumsbereich** - Zeitraum auswählen
   - **Status** - Ausstehend/Genehmigt/Abgelehnt
3. Sehen Sie Ihre Erfassungen in der Liste

### 4.5 Zeiterfassung bearbeiten

1. Klicken Sie auf eine Erfassung in der Liste
2. Klicken Sie auf **Bearbeiten**
3. Passen Sie die Daten an
4. Klicken Sie auf **Speichern**

> **Hinweis**: Genehmigte Erfassungen können nicht mehr bearbeitet werden. Wenden Sie sich an Ihren Vorgesetzten für Korrekturen.

### 4.6 GPS-Verifizierung

Beim Ein- und Ausstempeln wird Ihr Standort erfasst:

- **Genaue Adresse** - Wird automatisch per GPS ermittelt
- **Koordinaten** - Latitude/Longitude zur Verifizierung
- **Verifizierung** - Manager kann den Standort überprüfen

### 4.7 Status-Workflow

```
+------------+       +------------+       +------------+
| AUSSTEHEND | ----> | GENEHMIGT  |  oder | ABGELEHNT  |
+------------+       +------------+       +------------+
      |                                         |
      +------ Vom Manager bearbeitet -----------+
```

---

## 5. Urlaubsverwaltung

### 5.1 Urlaubsarten

| Art | Beschreibung | Standard |
|-----|--------------|----------|
| **Gesetzlicher Urlaub** | Urlaubstage gemäß Tarifvertrag | 20 Tage/Jahr |
| **Außergesetzlicher Urlaub** | Zusätzliche Tage über dem Minimum | 5 Tage/Jahr |
| **Überstundenausgleich** | Zeitausgleich (ZA) | Variabel |
| **Sonderurlaub** | Hochzeit, Trauerfall, etc. | Je nach Situation |
| **Unbezahlter Urlaub** | Urlaub ohne Gehalt | Auf Antrag |

### 5.2 Urlaubssaldo anzeigen

1. Gehen Sie zu **Urlaub**
2. Sehen Sie Ihr Saldo oben auf der Seite:
   - Insgesamt verfügbar
   - Genommen in diesem Jahr
   - Verbleibend
   - Verfallsdatum

### 5.3 Urlaub beantragen

1. Gehen Sie zu **Urlaub**
2. Klicken Sie auf **+ Neuer Antrag**
3. Füllen Sie die Daten aus:
   - **Urlaubsart** - Wählen Sie die Art
   - **Startdatum** - Erster Urlaubstag
   - **Enddatum** - Letzter Urlaubstag
   - **Grund** (optional) - Erläuterung
4. Klicken Sie auf **Einreichen**

### 5.4 Antragsstatus

| Status | Bedeutung |
|--------|-----------|
| :yellow_circle: **Ausstehend** | Wartet auf Genehmigung |
| :green_circle: **Genehmigt** | Vom Manager genehmigt |
| :red_circle: **Abgelehnt** | Abgelehnt (siehe Grund) |

### 5.5 Antrag stornieren

1. Gehen Sie zu **Urlaub**
2. Finden Sie Ihren Antrag in der Liste
3. Klicken Sie auf **Stornieren** (nur bei Status "Ausstehend")
4. Bestätigen Sie die Stornierung

### 5.6 Urlaubsübersicht (Kalender)

1. Gehen Sie zu **Urlaub**
2. Wechseln Sie zur **Kalenderansicht**
3. Sehen Sie Ihren Urlaub und den Ihrer Teammitglieder
4. Klicken Sie auf einen Tag für Details

### 5.7 Urlaubsverfall

Beachten Sie die Verfallsdaten Ihres Urlaubs:

- **Gesetzlicher Urlaub** - Verfällt am 1. Juli des Folgejahres
- **Außergesetzlicher Urlaub** - Verfällt nach 5 Jahren
- **Überstundenausgleich** - Verfällt am Ende des Kalenderjahres

> **Tipp**: Sie erhalten automatisch Erinnerungen, wenn Urlaub zu verfallen droht.

---

## 6. Krankmeldungen

### 6.1 Krankmeldung einreichen

1. Gehen Sie zu **Krankmeldungen**
2. Klicken Sie auf **+ Krankmeldung**
3. Füllen Sie die Daten aus:
   - **Startdatum** - Erster Krankheitstag
   - **Voraussichtliche Dauer** (optional)
   - **Erläuterung** (optional)
4. Klicken Sie auf **Melden**

> **Hinweis**: Melden Sie sich so schnell wie möglich krank, vorzugsweise vor Arbeitsbeginn.

### 6.2 Genesung melden

1. Gehen Sie zu **Krankmeldungen**
2. Finden Sie Ihre aktive Krankmeldung
3. Klicken Sie auf **Genesen melden**
4. Geben Sie das Genesungsdatum ein
5. Klicken Sie auf **Bestätigen**

### 6.3 Teilweise Arbeitsaufnahme

Bei teilweiser Genesung:

1. Klicken Sie auf **Teilweise genesen**
2. Geben Sie den Genesungsprozentsatz ein (z.B. 50%)
3. Beschreiben Sie eventuelle Einschränkungen
4. Klicken Sie auf **Speichern**

### 6.4 UWV Poortwachter Compliance (Niederländisches Gesetz)

ADSPersoneelapp überwacht automatisch die gesetzlichen Fristen nach niederländischem Recht:

| Tag | Aktion |
|-----|--------|
| **Tag 0** | Krankmeldung registriert |
| **Tag 35** | :warning: Warnung: UWV-Frist nähert sich |
| **Tag 39** | :yellow_circle: Dringend: 3 Tage bis zur Frist |
| **Tag 41** | :red_circle: Kritisch: 1 Tag bis zur Frist |
| **Tag 42** | UWV-Meldung verpflichtend |

> **Erläuterung**: In den Niederlanden muss der Arbeitgeber einen kranken Mitarbeiter nach 42 Tagen (6 Wochen) beim UWV (Niederländische Sozialversicherungsanstalt) melden.

### 6.5 Warnungen und Benachrichtigungen

Sie erhalten automatisch Benachrichtigungen über:

- Nahende UWV-Fristen
- Erforderliche Dokumente
- Termine mit dem Betriebsarzt
- Fristen für Maßnahmenpläne

---

## 7. Spesenverwaltung

### 7.1 Übersicht

Das Spesensystem unterstützt verschiedene Ausgabenarten mit vollständigem Workflow.

### 7.2 Spesenarten

| Art | Beschreibung | Erstattung |
|-----|--------------|------------|
| **Kilometerentschädigung** | Geschäftsfahrten | 0,23 EUR/km |
| **Reisekosten** | ÖPNV, Taxi, Parken | Tatsächliche Kosten |
| **Verpflegung** | Geschäftsessen | Max. 50 EUR/Tag |
| **Unterkunft** | Hotel, Übernachtung | Max. 150 EUR/Nacht |
| **Sonstiges** | Andere Geschäftskosten | Nach Genehmigung |

### 7.3 Kilometerentschädigung einreichen

1. Gehen Sie zu **Spesen**
2. Klicken Sie auf **+ Neue Spesenabrechnung**
3. Wählen Sie **Kilometerentschädigung**
4. Füllen Sie aus:
   - **Datum** - Fahrtdatum
   - **Von** - Startort
   - **Nach** - Zielort
   - **Entfernung** - Kilometer (oder automatisch berechnet)
   - **Grund** - Zweck der Fahrt
5. Laden Sie ggf. einen Parkbeleg hoch
6. Klicken Sie auf **Einreichen**

> **Tipp**: Bei aktiviertem Flottenmanagement werden Fahrten automatisch vorgeschlagen!

### 7.4 Ausgaben einreichen

1. Gehen Sie zu **Spesen**
2. Klicken Sie auf **+ Neue Spesenabrechnung**
3. Wählen Sie die Ausgabenart
4. Füllen Sie aus:
   - **Datum** - Kaufdatum
   - **Betrag** - Gesamtbetrag
   - **Beschreibung** - Was wurde gekauft
   - **Beleg** - Foto/PDF des Belegs hochladen
5. Klicken Sie auf **Einreichen**

### 7.5 Beleg hochladen

Unterstützte Formate:
- **Bilder**: JPG, PNG (max. 5 MB)
- **Dokumente**: PDF (max. 5 MB)

Tipps für gute Belege:
- Achten Sie auf gute Beleuchtung
- Alle Texte müssen lesbar sein
- Datum und Betrag müssen sichtbar sein

### 7.6 Spesenstatus

| Status | Aktion |
|--------|--------|
| :yellow_circle: **Ausstehend** | Wartet auf Bearbeitung durch Manager |
| :green_circle: **Genehmigt** | Genehmigt, wird im Gehalt verarbeitet |
| :red_circle: **Abgelehnt** | Abgelehnt, siehe Grund und reichen Sie ggf. erneut ein |

### 7.7 Export nach Nmbrs

Genehmigte Spesen werden monatlich nach Nmbrs exportiert, um in der Gehaltsabrechnung verarbeitet zu werden.

---

## 8. Flottenmanagement

### 8.1 Was ist Flottenmanagement?

Das Flottenmanagement verknüpft die Fahrten Ihres Firmenwagens automatisch mit Ihrer Zeiterfassung.

### 8.2 Unterstützte Systeme

- RouteVision
- FleetGO
- Samsara
- Webfleet
- TrackJack
- Verizon Connect

### 8.3 Fahrten anzeigen

1. Gehen Sie zu **Fahrten**
2. Wählen Sie den Datumsbereich
3. Sehen Sie Ihre Fahrten mit:
   - Start- und Zielort
   - Entfernung in Kilometern
   - Dauer der Fahrt
   - Verknüpfter Zeiterfassung

### 8.4 Fahrt mit Zeiterfassung verknüpfen

1. Gehen Sie zu **Fahrten**
2. Finden Sie die gewünschte Fahrt
3. Klicken Sie auf **Verknüpfen**
4. Wählen Sie die zugehörige Zeiterfassung
5. Die Fahrt wird automatisch verknüpft

### 8.5 Automatische Zuordnung

Das System versucht automatisch, Fahrten mit Zeiterfassungen zu verknüpfen basierend auf:
- Datum und Uhrzeit
- Standort (GPS-Vergleich)
- Mitarbeiter

### 8.6 Kilometerentschädigung aus Fahrten

1. Wählen Sie eine oder mehrere Fahrten aus
2. Klicken Sie auf **Abrechnen**
3. Die Kilometer werden automatisch übernommen
4. Überprüfen Sie und reichen Sie ein

---

## 9. Mitarbeiterverwaltung

> **Hinweis**: Dieser Abschnitt ist nur für Manager und höhere Rollen verfügbar.

### 9.1 Mitarbeiterübersicht

1. Gehen Sie zu **Mitarbeiter**
2. Sehen Sie die Liste mit:
   - Name und Position
   - E-Mail-Adresse
   - Status (aktiv/inaktiv)
   - Rolle

### 9.2 Mitarbeiter hinzufügen

1. Klicken Sie auf **+ Neuer Mitarbeiter**
2. Füllen Sie die Basisdaten aus:
   - Name
   - E-Mail-Adresse
   - Position
   - Abteilung
   - Rolle (Benutzer/Manager)
   - **Spracheinstellung** (NL/EN/DE/PL)
3. Klicken Sie auf **Erstellen**
4. Der Mitarbeiter erhält eine Willkommens-E-Mail

### 9.3 Mitarbeiter bearbeiten

1. Klicken Sie auf einen Mitarbeiter
2. Klicken Sie auf **Bearbeiten**
3. Passen Sie die Daten an
4. Klicken Sie auf **Speichern**

### 9.4 Mitarbeiter deaktivieren

1. Klicken Sie auf einen Mitarbeiter
2. Klicken Sie auf **Deaktivieren**
3. Bestätigen Sie die Aktion
4. Der Mitarbeiter kann sich nicht mehr anmelden

### 9.5 Fahrzeug zuweisen

Für das Flottenmanagement:
1. Öffnen Sie das Mitarbeiterprofil
2. Gehen Sie zu **Fahrzeuge**
3. Klicken Sie auf **Fahrzeug zuweisen**
4. Wählen Sie das Fahrzeug
5. Klicken Sie auf **Speichern**

---

## 10. Genehmigungsworkflow

> **Hinweis**: Dieser Abschnitt ist nur für Manager und höhere Rollen verfügbar.

### 10.1 Übersicht

Der Genehmigungsbildschirm zeigt alle ausstehenden Anfragen Ihres Teams.

### 10.2 Genehmigungsarten

| Art | Beschreibung |
|-----|--------------|
| **Zeiterfassungen** | Arbeitszeiterfassungen |
| **Urlaubsanträge** | Urlaub und Sonderurlaub |
| **Spesenabrechnungen** | Ausgaben und Kilometerentschädigung |

### 10.3 Einzelgenehmigung

1. Gehen Sie zu **Genehmigungen**
2. Klicken Sie auf einen Eintrag
3. Sehen Sie die Details
4. Klicken Sie auf **Genehmigen** oder **Ablehnen**
5. Fügen Sie ggf. eine Bemerkung hinzu
6. Bestätigen Sie

### 10.4 Stapelgenehmigung

1. Gehen Sie zu **Genehmigungen**
2. Markieren Sie mehrere Einträge
3. Klicken Sie auf **Alle genehmigen** oder **Alle ablehnen**
4. Bestätigen Sie die Aktion

### 10.5 Ablehnungsgrund

Bei Ablehnung:
1. Geben Sie einen klaren Grund an
2. Der Mitarbeiter erhält eine Benachrichtigung
3. Der Mitarbeiter kann bei Bedarf erneut einreichen

### 10.6 Erinnerungen

Sie erhalten automatische Erinnerungen für:
- Ausstehende Genehmigungen älter als 3 Tage
- Dringende Einträge (z.B. Urlaub, der bald beginnt)

---

## 11. Berichte und Export

### 11.1 Verfügbare Berichte

| Bericht | Inhalt |
|---------|--------|
| **Stundenbericht** | Übersicht der geleisteten Stunden |
| **Urlaubsbericht** | Genommener und verbleibender Urlaub |
| **Abwesenheitsbericht** | Übersicht der Krankheitsabwesenheit |
| **Spesenbericht** | Eingereichte Spesen |

### 11.2 Bericht erstellen

1. Gehen Sie zum entsprechenden Modul (z.B. Zeiterfassung)
2. Stellen Sie die gewünschten Filter ein
3. Klicken Sie auf **Exportieren**
4. Wählen Sie das Format:
   - **PDF** - Zum Drucken/Archivieren
   - **Excel** - Zur weiteren Analyse
   - **CSV** - Zum Import in andere Systeme

### 11.3 Nmbrs-Export

Für die Gehaltsabrechnung:
1. Gehen Sie zu **Einstellungen** > **Nmbrs**
2. Wählen Sie den Zeitraum
3. Klicken Sie auf **Export generieren**
4. Laden Sie die Datei herunter
5. Importieren Sie in Nmbrs

### 11.4 Monatliche Übersichten

Automatisch erstellte Berichte:
- Monatliche Stundenübersicht
- Quartalsweise Urlaubsübersicht
- Abwesenheitsstatistiken

---

## 12. Einstellungen

### 12.1 Profil

**Persönliche Daten ändern:**
1. Klicken Sie auf Ihren Namen (oben rechts)
2. Klicken Sie auf **Profil**
3. Bearbeiten Sie Ihre Daten:
   - Name
   - E-Mail-Adresse
   - Telefonnummer
   - Spracheinstellung
4. Klicken Sie auf **Speichern**

### 12.2 Passwort ändern

1. Gehen Sie zu **Profil**
2. Klicken Sie auf **Passwort ändern**
3. Geben Sie Ihr aktuelles Passwort ein
4. Geben Sie das neue Passwort ein (2x)
5. Klicken Sie auf **Speichern**

**Passwortanforderungen:**
- Mindestens 8 Zeichen
- Mindestens 1 Großbuchstabe
- Mindestens 1 Ziffer
- Mindestens 1 Sonderzeichen

### 12.3 Benachrichtigungseinstellungen

1. Gehen Sie zu **Einstellungen** > **Benachrichtigungen**
2. Konfigurieren Sie Ihre Präferenzen:
   - E-Mail-Benachrichtigungen ein/aus
   - In-App-Benachrichtigungen ein/aus
   - Häufigkeit der Erinnerungen
3. Klicken Sie auf **Speichern**

### 12.4 Mandanteneinstellungen (Administrator)

Als Mandanten-Administrator:
1. Gehen Sie zu **Einstellungen** > **Organisation**
2. Konfigurieren Sie:
   - Firmenname und Logo
   - Standard-Arbeitszeiten
   - Urlaubsrichtlinien
   - Spesengrenzwerte
   - Flottenanbieter-Verknüpfung

### 12.5 Flottenanbieter konfigurieren (Administrator)

1. Gehen Sie zu **Einstellungen** > **Flottenanbieter**
2. Wählen Sie Ihren Anbieter
3. Geben Sie die API-Zugangsdaten ein
4. Klicken Sie auf **Verbindung testen**
5. Bei Erfolg klicken Sie auf **Speichern**

---

## 13. Häufig gestellte Fragen

### Allgemein

**F: Ich habe mein Passwort vergessen, was jetzt?**
A: Klicken Sie auf "Passwort vergessen" auf der Anmeldeseite und folgen Sie den Anweisungen in der E-Mail.

**F: Wie ändere ich meine Sprache?**
A: Gehen Sie zu Profil und wählen Sie Ihre gewünschte Sprache unter "Spracheinstellung".

**F: Funktioniert die App auch mobil?**
A: Ja, ADSPersoneelapp ist vollständig responsiv und funktioniert auf allen Geräten.

### Zeiterfassung

**F: Warum wird nach meinem Standort gefragt?**
A: Die GPS-Verifizierung sorgt für eine genaue und zuverlässige Zeiterfassung.

**F: Kann ich Stunden rückwirkend erfassen?**
A: Ja, über die manuelle Eingabe können Sie auch frühere Tage erfassen.

**F: Was, wenn ich vergessen habe auszustempeln?**
A: Sie können die Erfassung nachträglich bearbeiten, solange sie noch nicht genehmigt ist.

### Urlaub

**F: Wie viel Urlaub habe ich noch?**
A: Sehen Sie Ihr aktuelles Saldo oben auf der Urlaubsseite.

**F: Wann verfällt mein Urlaub?**
A: Gesetzlicher Urlaub verfällt am 1. Juli des Folgejahres. Sie erhalten rechtzeitig Erinnerungen.

**F: Kann ich einen Urlaubsantrag ändern?**
A: Nur ausstehende Anträge können geändert werden. Stornieren Sie und reichen Sie bei Bedarf erneut ein.

### Krankmeldungen

**F: Wie schnell muss ich mich krankmelden?**
A: Melden Sie sich so schnell wie möglich, vorzugsweise vor Arbeitsbeginn.

**F: Was ist die UWV 42-Tage-Frist?**
A: Nach 42 Tagen Krankheit muss Ihr Arbeitgeber Sie beim UWV melden. Das System überwacht dies automatisch.

### Spesen

**F: Welche Belege muss ich hochladen?**
A: Laden Sie immer den Originalbeleg mit sichtbarem Datum und Betrag hoch.

**F: Wie hoch ist die Kilometerentschädigung?**
A: Standard 0,23 EUR pro Kilometer (steuerfrei in 2026).

**F: Wann wird meine Spesenabrechnung ausgezahlt?**
A: Genehmigte Spesen werden in der nächsten Gehaltsabrechnung verarbeitet.

### Technisch

**F: Welche Browser werden unterstützt?**
A: Chrome, Firefox, Safari und Edge (jeweils die letzten 2 Versionen).

**F: Sind meine Daten sicher?**
A: Ja, alle Daten sind verschlüsselt (AES-256) und entsprechen den AVG/DSGVO-Anforderungen.

---

## Benötigen Sie Hilfe?

- **In-App-Support**: Verwenden Sie den FAQ-Chatbot unten rechts
- **E-Mail**: support@adspersoneelapp.nl
- **Telefon**: Verfügbar für Standard-Plan-Kunden

---

*Copyright 2026 ADSPersoneelapp - Alle Rechte vorbehalten*
