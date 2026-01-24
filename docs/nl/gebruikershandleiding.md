# ADSPersoneelapp - Volledige Gebruikershandleiding

> Versie 3.1 | Januari 2026

---

## Inhoudsopgave

1. [Introductie](#1-introductie)
2. [Aan de slag](#2-aan-de-slag)
3. [Dashboard](#3-dashboard)
4. [Tijdregistratie](#4-tijdregistratie)
5. [Verlofbeheer](#5-verlofbeheer)
6. [Ziekmeldingen](#6-ziekmeldingen)
7. [Declaratiebeheer](#7-declaratiebeheer)
8. [Fleet Tracking](#8-fleet-tracking)
9. [Medewerkersbeheer](#9-medewerkersbeheer)
10. [Goedkeuringen](#10-goedkeuringen)
11. [Rapportages & Export](#11-rapportages--export)
12. [Instellingen](#12-instellingen)
13. [Veelgestelde Vragen](#13-veelgestelde-vragen)

---

## 1. Introductie

### Wat is ADSPersoneelapp?

ADSPersoneelapp is een compleet HR-managementplatform speciaal ontwikkeld voor Nederlandse organisaties. Het systeem helpt u bij:

- **Tijdregistratie** - Uren bijhouden met GPS-verificatie
- **Verlofbeheer** - Vakantie en vrije dagen aanvragen en beheren
- **Ziekmeldingen** - Verzuim registreren met UWV-compliance
- **Declaraties** - Onkosten en kilometervergoeding indienen
- **Fleet Tracking** - Zakelijke ritten automatisch registreren
- **Nmbrs Export** - Naadloze salarisverwerking integratie

### Voor wie is deze handleiding?

Deze handleiding is bedoeld voor alle gebruikers van ADSPersoneelapp:

| Rol | Beschrijving |
|-----|--------------|
| **Medewerker** | Kan eigen uren, verlof en declaraties beheren |
| **Manager** | Kan team beheren en goedkeuringen geven |
| **Tenant Admin** | Volledige organisatiebeheer en instellingen |
| **Superuser** | Platform-breed beheer (alleen voor beheerders) |

---

## 2. Aan de slag

### 2.1 Inloggen

1. Ga naar de applicatie URL (bijv. `app.adspersoneelapp.nl`)
2. Voer uw **e-mailadres** in
3. Voer uw **wachtwoord** in
4. Klik op **Inloggen**

> **Tip**: Bent u uw wachtwoord vergeten? Klik op "Wachtwoord vergeten" om een reset-link te ontvangen per e-mail.

### 2.2 Eerste keer inloggen

Bij uw eerste login:

1. U ontvangt een welkomstmail met inloggegevens
2. Log in met het tijdelijke wachtwoord
3. Wijzig uw wachtwoord naar een persoonlijk wachtwoord
4. Controleer uw profielgegevens

### 2.3 Taalinstelling

ADSPersoneelapp ondersteunt meerdere talen:

- 🇳🇱 Nederlands (standaard)
- 🇬🇧 English
- 🇩🇪 Deutsch
- 🇵🇱 Polski

**Taal wijzigen:**
1. Ga naar **Profiel** (rechtsboven)
2. Selecteer uw gewenste taal
3. De interface wordt direct bijgewerkt

### 2.4 Navigatie

De hoofdnavigatie bevindt zich aan de linkerzijde:

```
┌─────────────────────┐
│ 🏠 Dashboard        │
│ ⏱️ Tijdregistratie  │
│ 🏖️ Verlof           │
│ 🏥 Ziekmeldingen    │
│ 💰 Declaraties      │
│ 🚗 Ritten           │
│ 👥 Medewerkers      │  ← Alleen Manager+
│ ✅ Goedkeuringen    │  ← Alleen Manager+
│ ⚙️ Instellingen     │
└─────────────────────┘
```

---

## 3. Dashboard

Het dashboard geeft u een direct overzicht van uw belangrijkste gegevens.

### 3.1 Persoonlijke KPI's

| KPI | Beschrijving |
|-----|--------------|
| **Uren deze maand** | Totaal gewerkte uren in de huidige maand |
| **Overwerk** | Uren boven uw contracturen |
| **Verlof resterend** | Beschikbare vakantiedagen |
| **Openstaande items** | Te verwerken aanvragen |

### 3.2 Quick Clock-In Widget

Snel in- en uitklokken:

1. Klik op de grote **Inklokken** knop
2. Sta locatietoegang toe (voor GPS-verificatie)
3. Uw werktijd begint nu te lopen
4. Klik op **Uitklokken** wanneer u klaar bent

### 3.3 Verlofsaldo Widget

Toont uw actuele verlofsaldo:

- **Wettelijk verlof** - Uw standaard vakantiedagen
- **Bovenwettelijk verlof** - Extra dagen boven het minimum
- **Compensatie-uren** - Tijd-voor-tijd opbouw

### 3.4 Manager Dashboard (Extra)

Als manager ziet u aanvullend:

- **Team overzicht** - Aantal teamleden en hun status
- **Pending approvals** - Openstaande goedkeuringen
- **Team verzuim** - Actueel ziekteverzuim
- **UWV Alerts** - Kritieke deadlines voor zieke medewerkers

---

## 4. Tijdregistratie

### 4.1 Overzicht

De tijdregistratie module stelt u in staat om uw werkuren nauwkeurig bij te houden.

### 4.2 Inklokken

**Methode 1: Quick Clock-In (Dashboard)**
1. Ga naar het Dashboard
2. Klik op **Inklokken**
3. Uw locatie wordt automatisch vastgelegd

**Methode 2: Handmatige invoer**
1. Ga naar **Tijdregistratie**
2. Klik op **+ Nieuwe registratie**
3. Vul de gegevens in:
   - Datum
   - Starttijd
   - Eindtijd
   - Pauze (in minuten)
   - Beschrijving (optioneel)
4. Klik op **Opslaan**

### 4.3 Uitklokken

1. Ga naar het Dashboard of Tijdregistratie
2. Klik op **Uitklokken**
3. Uw eindtijd en locatie worden vastgelegd
4. De totale werkuren worden automatisch berekend

### 4.4 Tijdregistraties bekijken

1. Ga naar **Tijdregistratie**
2. Gebruik de filters:
   - **Datum range** - Selecteer periode
   - **Status** - Pending/Approved/Rejected
3. Bekijk uw registraties in de lijst

### 4.5 Tijdregistratie bewerken

1. Klik op een registratie in de lijst
2. Klik op **Bewerken**
3. Pas de gegevens aan
4. Klik op **Opslaan**

> **Let op**: Goedgekeurde registraties kunnen niet meer worden bewerkt. Neem contact op met uw manager voor correcties.

### 4.6 GPS-verificatie

Bij het in- en uitklokken wordt uw locatie vastgelegd:

- **Exact adres** - Wordt automatisch bepaald via GPS
- **Coördinaten** - Latitude/Longitude voor verificatie
- **Verificatie** - Manager kan locatie controleren

### 4.7 Status workflow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ PENDING  │ ──▶ │ APPROVED │  of │ REJECTED │
└──────────┘     └──────────┘     └──────────┘
    │                                   │
    └── Door manager beoordeeld ────────┘
```

---

## 5. Verlofbeheer

### 5.1 Verloftypes

| Type | Beschrijving | Standaard |
|------|--------------|-----------|
| **Wettelijk verlof** | Vakantiedagen conform CAO | 20 dagen/jaar |
| **Bovenwettelijk verlof** | Extra dagen boven minimum | 5 dagen/jaar |
| **Compensatie-uren** | Tijd-voor-tijd (TVT) | Variabel |
| **Bijzonder verlof** | Huwelijk, rouw, etc. | Per situatie |
| **Onbetaald verlof** | Verlof zonder salaris | Op aanvraag |

### 5.2 Verlofsaldo bekijken

1. Ga naar **Verlof**
2. Bekijk uw saldo bovenaan de pagina:
   - Totaal beschikbaar
   - Opgenomen dit jaar
   - Resterend
   - Vervaldatum

### 5.3 Verlof aanvragen

1. Ga naar **Verlof**
2. Klik op **+ Nieuwe aanvraag**
3. Vul de gegevens in:
   - **Type verlof** - Selecteer het type
   - **Startdatum** - Eerste dag verlof
   - **Einddatum** - Laatste dag verlof
   - **Reden** (optioneel) - Toelichting
4. Klik op **Indienen**

### 5.4 Aanvraag status

| Status | Betekenis |
|--------|-----------|
| 🟡 **Pending** | Wacht op goedkeuring |
| 🟢 **Approved** | Goedgekeurd door manager |
| 🔴 **Rejected** | Afgewezen (zie reden) |

### 5.5 Aanvraag annuleren

1. Ga naar **Verlof**
2. Vind uw aanvraag in de lijst
3. Klik op **Annuleren** (alleen bij pending status)
4. Bevestig de annulering

### 5.6 Verlofoverzicht (kalender)

1. Ga naar **Verlof**
2. Schakel naar **Kalender weergave**
3. Bekijk uw verlof en dat van teamgenoten
4. Klik op een dag voor details

### 5.7 Verlof verloopt!

Let op de vervaldatums van uw verlof:

- **Wettelijk verlof** - Vervalt op 1 juli van het volgende jaar
- **Bovenwettelijk verlof** - Vervalt na 5 jaar
- **Compensatie-uren** - Vervalt aan het einde van het kalenderjaar

> **Tip**: U ontvangt automatisch herinneringen wanneer verlof dreigt te vervallen.

---

## 6. Ziekmeldingen

### 6.1 Ziek melden

1. Ga naar **Ziekmeldingen**
2. Klik op **+ Ziek melden**
3. Vul de gegevens in:
   - **Startdatum** - Eerste ziektedag
   - **Verwachte duur** (optioneel)
   - **Toelichting** (optioneel)
4. Klik op **Melden**

> **Let op**: Meld u zo snel mogelijk ziek, bij voorkeur vóór aanvang werktijd.

### 6.2 Herstel melden

1. Ga naar **Ziekmeldingen**
2. Vind uw actieve ziekmelding
3. Klik op **Hersteld melden**
4. Vul de hersteldatum in
5. Klik op **Bevestigen**

### 6.3 Gedeeltelijke werkhervatting

Bij gedeeltelijk herstel:

1. Klik op **Gedeeltelijk herstel**
2. Vul het herstelpercentage in (bijv. 50%)
3. Beschrijf eventuele beperkingen
4. Klik op **Opslaan**

### 6.4 UWV Poortwachter Compliance

ADSPersoneelapp monitort automatisch de wettelijke deadlines:

| Dag | Actie |
|-----|-------|
| **Dag 0** | Ziekmelding geregistreerd |
| **Dag 35** | ⚠️ Waarschuwing: UWV deadline nadert |
| **Dag 39** | 🟡 Urgent: 3 dagen tot deadline |
| **Dag 41** | 🔴 Kritiek: 1 dag tot deadline |
| **Dag 42** | UWV melding verplicht |

### 6.5 Alerts en notificaties

U ontvangt automatisch notificaties over:

- Naderende UWV deadlines
- Vereiste documenten
- Afspraken met bedrijfsarts
- Plan van Aanpak deadlines

---

## 7. Declaratiebeheer

### 7.1 Overzicht

Het declaratiesysteem ondersteunt diverse onkostentypes met volledige workflow.

### 7.2 Declaratietypes

| Type | Beschrijving | Vergoeding |
|------|--------------|------------|
| **Kilometervergoeding** | Zakelijke ritten | €0,23/km |
| **Reiskosten** | OV, taxi, parkeren | Werkelijk |
| **Maaltijden** | Zakelijke lunch/diner | Max €50/dag |
| **Verblijf** | Hotel, accommodatie | Max €150/nacht |
| **Overig** | Andere zakelijke kosten | Op goedkeuring |

### 7.3 Kilometervergoeding indienen

1. Ga naar **Declaraties**
2. Klik op **+ Nieuwe declaratie**
3. Selecteer **Kilometervergoeding**
4. Vul in:
   - **Datum** - Ritdatum
   - **Van** - Startlocatie
   - **Naar** - Eindlocatie
   - **Afstand** - Kilometers (of automatisch berekend)
   - **Reden** - Doel van de rit
5. Upload eventueel een parkeerbon
6. Klik op **Indienen**

> **Tip**: Bij Fleet Tracking worden ritten automatisch voorgesteld!

### 7.4 Onkosten indienen

1. Ga naar **Declaraties**
2. Klik op **+ Nieuwe declaratie**
3. Selecteer het onkostentype
4. Vul in:
   - **Datum** - Aankoopdatum
   - **Bedrag** - Totaalbedrag
   - **Beschrijving** - Wat is gekocht
   - **Bon** - Upload foto/PDF van bon
5. Klik op **Indienen**

### 7.5 Bon uploaden

Ondersteunde formaten:
- **Afbeeldingen**: JPG, PNG (max 5MB)
- **Documenten**: PDF (max 5MB)

Tips voor goede bonnen:
- Zorg voor goede belichting
- Alle tekst moet leesbaar zijn
- Datum en bedrag moeten zichtbaar zijn

### 7.6 Declaratie status

| Status | Actie |
|--------|-------|
| 🟡 **Pending** | Wacht op beoordeling door manager |
| 🟢 **Approved** | Goedgekeurd, wordt verwerkt in salaris |
| 🔴 **Rejected** | Afgewezen, zie reden en dien evt. opnieuw in |

### 7.7 Export naar Nmbrs

Goedgekeurde declaraties worden maandelijks geëxporteerd naar Nmbrs voor verwerking in de salarisadministratie.

---

## 8. Fleet Tracking

### 8.1 Wat is Fleet Tracking?

Fleet Tracking koppelt de ritten van uw bedrijfsvoertuig automatisch aan uw urenregistratie.

### 8.2 Ondersteunde systemen

- RouteVision
- FleetGO
- Samsara
- Webfleet
- TrackJack
- Verizon Connect

### 8.3 Ritten bekijken

1. Ga naar **Ritten**
2. Selecteer de datum range
3. Bekijk uw ritten met:
   - Start- en eindlocatie
   - Afstand in kilometers
   - Duur van de rit
   - Gekoppelde timesheet

### 8.4 Rit koppelen aan timesheet

1. Ga naar **Ritten**
2. Vind de gewenste rit
3. Klik op **Koppelen**
4. Selecteer de bijbehorende timesheet
5. De rit wordt automatisch gekoppeld

### 8.5 Automatische matching

Het systeem probeert automatisch ritten te koppelen aan timesheets op basis van:
- Datum en tijd
- Locatie (GPS vergelijking)
- Medewerker

### 8.6 Kilometervergoeding vanuit ritten

1. Selecteer een of meerdere ritten
2. Klik op **Declareren**
3. De kilometers worden automatisch overgenomen
4. Controleer en dien in

---

## 9. Medewerkersbeheer

> **Let op**: Deze sectie is alleen beschikbaar voor Managers en hoger.

### 9.1 Medewerkersoverzicht

1. Ga naar **Medewerkers**
2. Bekijk de lijst met:
   - Naam en functie
   - E-mailadres
   - Status (actief/inactief)
   - Rol

### 9.2 Medewerker toevoegen

1. Klik op **+ Nieuwe medewerker**
2. Vul de basisgegevens in:
   - Naam
   - E-mailadres
   - Functie
   - Afdeling
   - Rol (User/Manager)
   - **Taalvoorkeur** (NL/EN/DE/PL)
3. Klik op **Aanmaken**
4. De medewerker ontvangt een welkomstmail

### 9.3 Medewerker bewerken

1. Klik op een medewerker
2. Klik op **Bewerken**
3. Pas de gegevens aan
4. Klik op **Opslaan**

### 9.4 Medewerker deactiveren

1. Klik op een medewerker
2. Klik op **Deactiveren**
3. Bevestig de actie
4. De medewerker kan niet meer inloggen

### 9.5 Voertuig toewijzen

Voor Fleet Tracking:
1. Open het medewerker profiel
2. Ga naar **Voertuigen**
3. Klik op **Voertuig toewijzen**
4. Selecteer het voertuig
5. Klik op **Opslaan**

---

## 10. Goedkeuringen

> **Let op**: Deze sectie is alleen beschikbaar voor Managers en hoger.

### 10.1 Overzicht

Het goedkeuringsscherm toont alle openstaande verzoeken van uw team.

### 10.2 Goedkeuringstypes

| Type | Beschrijving |
|------|--------------|
| **Timesheets** | Urenregistraties |
| **Verlofaanvragen** | Vakantie en bijzonder verlof |
| **Declaraties** | Onkosten en kilometervergoeding |

### 10.3 Individuele goedkeuring

1. Ga naar **Goedkeuringen**
2. Klik op een item
3. Bekijk de details
4. Klik op **Goedkeuren** of **Afwijzen**
5. Voeg eventueel een opmerking toe
6. Bevestig

### 10.4 Batch goedkeuring

1. Ga naar **Goedkeuringen**
2. Vink meerdere items aan
3. Klik op **Alles goedkeuren** of **Alles afwijzen**
4. Bevestig de actie

### 10.5 Afwijzingsreden

Bij afwijzing:
1. Voer een duidelijke reden in
2. De medewerker ontvangt een notificatie
3. De medewerker kan indien nodig opnieuw indienen

### 10.6 Herinneringen

U ontvangt automatische herinneringen voor:
- Openstaande goedkeuringen ouder dan 3 dagen
- Dringende items (bijv. verlof dat binnenkort ingaat)

---

## 11. Rapportages & Export

### 11.1 Beschikbare rapportages

| Rapport | Inhoud |
|---------|--------|
| **Urenrapport** | Overzicht van gewerkte uren |
| **Verlofrapport** | Opgenomen en resterend verlof |
| **Verzuimrapport** | Ziekteverzuim overzicht |
| **Declaratierapport** | Ingediende declaraties |

### 11.2 Rapport genereren

1. Ga naar de betreffende module (bijv. Tijdregistratie)
2. Stel de gewenste filters in
3. Klik op **Exporteren**
4. Kies het formaat:
   - **PDF** - Voor printen/archiveren
   - **Excel** - Voor verdere analyse
   - **CSV** - Voor import in andere systemen

### 11.3 Nmbrs Export

Voor salarisverwerking:
1. Ga naar **Instellingen** > **Nmbrs**
2. Selecteer de periode
3. Klik op **Export genereren**
4. Download het bestand
5. Importeer in Nmbrs

### 11.4 Maandelijkse overzichten

Automatisch gegenereerde rapporten:
- Maandelijks uuroverzicht
- Verlofoverzicht per kwartaal
- Verzuimstatistieken

---

## 12. Instellingen

### 12.1 Profiel

**Persoonlijke gegevens wijzigen:**
1. Klik op uw naam (rechtsboven)
2. Klik op **Profiel**
3. Bewerk uw gegevens:
   - Naam
   - E-mailadres
   - Telefoonnummer
   - Taalvoorkeur
4. Klik op **Opslaan**

### 12.2 Wachtwoord wijzigen

1. Ga naar **Profiel**
2. Klik op **Wachtwoord wijzigen**
3. Voer uw huidige wachtwoord in
4. Voer het nieuwe wachtwoord in (2x)
5. Klik op **Opslaan**

**Wachtwoord eisen:**
- Minimaal 8 karakters
- Ten minste 1 hoofdletter
- Ten minste 1 cijfer
- Ten minste 1 speciaal teken

### 12.3 Notificatie-instellingen

1. Ga naar **Instellingen** > **Notificaties**
2. Configureer uw voorkeuren:
   - E-mail notificaties aan/uit
   - In-app notificaties aan/uit
   - Frequentie van herinneringen
3. Klik op **Opslaan**

### 12.4 Tenant Instellingen (Admin)

Als Tenant Admin:
1. Ga naar **Instellingen** > **Organisatie**
2. Configureer:
   - Bedrijfsnaam en logo
   - Standaard werkuren
   - Verlofbeleid
   - Declaratielimieten
   - Fleet provider koppeling

### 12.5 Fleet Provider configureren (Admin)

1. Ga naar **Instellingen** > **Fleet Provider**
2. Selecteer uw provider
3. Voer de API credentials in
4. Klik op **Verbinding testen**
5. Bij succes, klik op **Opslaan**

---

## 13. Veelgestelde Vragen

### Algemeen

**V: Ik ben mijn wachtwoord vergeten, wat nu?**
A: Klik op "Wachtwoord vergeten" op de inlogpagina en volg de instructies in de e-mail.

**V: Hoe wijzig ik mijn taal?**
A: Ga naar Profiel en selecteer uw gewenste taal onder "Taalvoorkeur".

**V: Werkt de app ook op mobiel?**
A: Ja, ADSPersoneelapp is volledig responsive en werkt op alle apparaten.

### Tijdregistratie

**V: Waarom wordt mijn locatie gevraagd?**
A: GPS-verificatie zorgt voor nauwkeurige en betrouwbare urenregistratie.

**V: Kan ik uren met terugwerkende kracht invoeren?**
A: Ja, via handmatige invoer kunt u ook eerdere dagen registreren.

**V: Wat als ik vergeten ben uit te klokken?**
A: U kunt de registratie achteraf bewerken zolang deze nog niet is goedgekeurd.

### Verlof

**V: Hoeveel verlof heb ik nog?**
A: Bekijk uw actuele saldo op de Verlof pagina bovenaan.

**V: Wanneer vervalt mijn verlof?**
A: Wettelijk verlof vervalt op 1 juli van het volgende jaar. U ontvangt tijdig herinneringen.

**V: Kan ik een verlofaanvraag wijzigen?**
A: Alleen pending aanvragen kunnen worden aangepast. Annuleer en dien opnieuw in indien nodig.

### Ziekmeldingen

**V: Hoe snel moet ik me ziek melden?**
A: Meld u zo snel mogelijk, bij voorkeur vóór aanvang werktijd.

**V: Wat is de UWV 42-dagen deadline?**
A: Na 42 dagen ziekte moet uw werkgever u aanmelden bij het UWV. Het systeem monitort dit automatisch.

### Declaraties

**V: Welke bonnen moet ik uploaden?**
A: Upload altijd het originele aankoopbewijs met datum en bedrag zichtbaar.

**V: Wat is de kilometervergoeding?**
A: Standaard €0,23 per kilometer (belastingvrij in 2026).

**V: Wanneer wordt mijn declaratie uitbetaald?**
A: Goedgekeurde declaraties worden verwerkt in de eerstvolgende salarisrun.

### Technisch

**V: Welke browsers worden ondersteund?**
A: Chrome, Firefox, Safari en Edge (laatste 2 versies).

**V: Is mijn data veilig?**
A: Ja, alle data is versleuteld (AES-256) en voldoet aan AVG/GDPR eisen.

---

## Hulp nodig?

- **In-app support**: Gebruik de FAQ chatbot rechtsonder
- **E-mail**: support@adspersoneelapp.nl
- **Telefoon**: Beschikbaar voor Standard plan klanten

---

*© 2026 ADSPersoneelapp - Alle rechten voorbehouden*
