# CKW Personeelsapp - Gebruikershandleiding

## 🎉 STATUS: VOLLEDIG OPERATIONEEL (Januari 2025)

**🚀 DE APP IS VOLLEDIG FUNCTIONEEL EN KLAAR VOOR GEBRUIK!**

### ✅ Alle Functionaliteiten Beschikbaar
- **Login & Authenticatie**: Perfect werkend met NextAuth v5
- **Dashboard**: Volledig overzicht van alle functies
- **Tijdregistratie**: Uren invoer en beheer
- **Vakantie & Verlof**: Aanvragen en goedkeuringen
- **Ziekmeldingen**: Registratie en beheer
- **Werknemers**: Overzicht en beheer
- **Goedkeuringen**: Manager workflows
- **Profiel**: Persoonlijke instellingen
- **Systeem Instellingen**: Configuratie

### 🔑 Test Inloggegevens
- **Admin**: admin@ckw.nl / admin123
- **Gebruiker**: gebruiker@ckw.nl / gebruiker123

## Inhoudsopgave

1. [Inleiding](#inleiding)
2. [Aan de slag](#aan-de-slag)
   - [Inloggen](#inloggen)
   - [Wachtwoord vergeten](#wachtwoord-vergeten)
   - [Navigatie](#navigatie)
3. [Dashboard](#dashboard)
   - [Overzicht](#overzicht)
   - [Notificaties](#notificaties)
   - [Snelkoppelingen](#snelkoppelingen)
4. [Tijdregistratie](#tijdregistratie)
   - [Uren invoeren](#uren-invoeren)
   - [RouteVision integratie](#routevision-integratie)
   - [Overzicht tijdregistraties](#overzicht-tijdregistraties)
   - [Correcties aanvragen](#correcties-aanvragen)
5. [Goedkeuringsproces](#goedkeuringsproces)
   - [Tijdregistraties goedkeuren](#tijdregistraties-goedkeuren)
   - [Verlofaanvragen goedkeuren](#verlofaanvragen-goedkeuren)
   - [Ziekteverlof registreren](#ziekteverlof-registreren)
   - [Batch goedkeuringen](#batch-goedkeuringen)
   - [Commentaar toevoegen](#commentaar-toevoegen)
6. [Verlofbeheer](#verlofbeheer)
   - [Vakantie aanvragen](#vakantie-aanvragen)
   - [Tijd-voor-tijd registreren](#tijd-voor-tijd-registreren)
   - [Ziekteverlof melden](#ziekteverlof-melden)
   - [Verlofoverzicht](#verlofoverzicht)
   - [Verlofbalans](#verlofbalans)
7. [Documentbeheer](#documentbeheer)
   - [Documenten uploaden](#documenten-uploaden)
   - [Documenten bekijken](#documenten-bekijken)
   - [Versiebeheer](#versiebeheer)
   - [Interne opmerkingen](#interne-opmerkingen)
8. [Rapportages](#rapportages)
   - [Standaardrapportages](#standaardrapportages)
   - [Aangepaste rapportages](#aangepaste-rapportages)
   - [Exporteren](#exporteren)
9. [Instellingen](#instellingen)
   - [Profielinstellingen](#profielinstellingen)
   - [Notificatie-instellingen](#notificatie-instellingen)
   - [Toegankelijkheidsinstellingen](#toegankelijkheidsinstellingen)
10. [Veelgestelde vragen](#veelgestelde-vragen)
11. [Problemen oplossen](#problemen-oplossen)
12. [Contact en ondersteuning](#contact-en-ondersteuning)

## Inleiding

De CKW Personeelsapp is een uitgebreid HR-managementsysteem ontwikkeld voor Nederlandse bedrijven. Deze gebruikershandleiding biedt gedetailleerde instructies voor alle functionaliteiten van het systeem, van tijdregistratie tot verlofbeheer en documentbeheer.

### Doelgroep

Deze handleiding is bedoeld voor:
- **Werknemers**: Voor het registreren van uren, aanvragen van verlof en bekijken van persoonlijke informatie
- **Leidinggevenden**: Voor het goedkeuren van tijdregistraties en verlofaanvragen
- **HR-medewerkers**: Voor het beheren van personeelsgegevens en genereren van rapportages
- **Beheerders**: Voor het configureren van systeeminstellingen

## Aan de slag

### Inloggen

1. Open de CKW Personeelsapp in uw webbrowser via de URL die door uw organisatie is verstrekt.
2. U ziet het inlogscherm met het CKW-logo.
3. Voer uw e-mailadres en wachtwoord in.
4. Klik op de knop "Inloggen".
5. Bij de eerste keer inloggen wordt u mogelijk gevraagd om uw wachtwoord te wijzigen.

![Inlogscherm](./public/images/login-screen.png)

### Wachtwoord vergeten

1. Klik op de link "Wachtwoord vergeten?" onder het inlogformulier.
2. Voer uw e-mailadres in en klik op "Verstuur herstel-e-mail".
3. U ontvangt een e-mail met een link om uw wachtwoord opnieuw in te stellen.
4. Klik op de link in de e-mail en volg de instructies om een nieuw wachtwoord in te stellen.

### Navigatie

De CKW Personeelsapp heeft een intuïtieve navigatiestructuur:

- **Hoofdmenu**: Links in het scherm vindt u het hoofdmenu met toegang tot alle modules.
- **Topbalk**: Bovenaan het scherm vindt u uw profielinformatie, notificaties en snelle acties.
- **Breadcrumbs**: Onder de topbalk ziet u breadcrumbs die aangeven waar u zich bevindt in de applicatie.
- **Inhoud**: Het hoofdgedeelte van het scherm toont de inhoud van de geselecteerde pagina.
- **Actiebalk**: Onderaan sommige pagina's vindt u een actiebalk met knoppen voor veelgebruikte acties.

## Dashboard

### Overzicht

Het dashboard is het startpunt van de applicatie en biedt een overzicht van:

- Recente activiteiten
- Openstaande taken
- Verlofbalans
- Komende verlofdagen van teamleden
- Snelkoppelingen naar veelgebruikte functies

![Dashboard](./public/images/dashboard.png)

### Notificaties

In de topbalk vindt u het notificatie-icoon. Hier ziet u:

- Nieuwe goedkeuringsverzoeken
- Herinneringen voor tijdregistratie
- Statusupdates van uw aanvragen
- Systeemmeldingen

Klik op een notificatie om naar de betreffende pagina te gaan.

### Snelkoppelingen

Het dashboard bevat snelkoppelingen naar veelgebruikte functies:

- Tijdregistratie invoeren
- Verlof aanvragen
- Openstaande goedkeuringen
- Recente documenten

## Tijdregistratie

### Uren invoeren

1. Ga naar "Tijdregistratie" > "Uren invoeren" in het hoofdmenu.
2. Selecteer de datum waarvoor u uren wilt invoeren.
3. Vul de start- en eindtijd in.
4. Geef de pauzetijd op (indien van toepassing).
5. Voeg een beschrijving toe van de uitgevoerde werkzaamheden.
6. Klik op "Opslaan" om de tijdregistratie op te slaan.

![Uren invoeren](./public/images/timesheet-entry.png)

### RouteVision integratie

De applicatie integreert met RouteVision GPS-data voor automatische verificatie van tijdregistraties:

1. Als u de RouteVision app gebruikt, worden uw locatiegegevens automatisch gekoppeld aan uw tijdregistraties.
2. Bij het invoeren van uren ziet u een indicatie of de locatiegegevens beschikbaar zijn.
3. Groene badge: Locatie geverifieerd
4. Gele badge: Locatie niet volledig geverifieerd
5. Rode badge: Locatie komt niet overeen met verwachte locatie

### Overzicht tijdregistraties

1. Ga naar "Tijdregistratie" > "Overzicht" in het hoofdmenu.
2. Hier ziet u een overzicht van al uw tijdregistraties.
3. Gebruik de filters om specifieke periodes of statussen te bekijken.
4. Klik op een tijdregistratie om de details te bekijken of wijzigingen aan te brengen.

### Correcties aanvragen

Als een tijdregistratie al is goedgekeurd maar gecorrigeerd moet worden:

1. Ga naar het overzicht van tijdregistraties.
2. Klik op de betreffende tijdregistratie.
3. Klik op de knop "Correctie aanvragen".
4. Voer de gewenste wijzigingen in en geef een reden op voor de correctie.
5. Klik op "Versturen" om de correctie ter goedkeuring in te dienen.

## Goedkeuringsproces

### Tijdregistraties goedkeuren

Voor leidinggevenden en managers:

1. Ga naar "Goedkeuringen" > "Tijdregistraties" in het hoofdmenu.
2. U ziet een lijst met alle tijdregistraties die op goedkeuring wachten.
3. Bekijk de details van elke tijdregistratie, inclusief validatiebadges.
4. Gebruik de checkboxes om meerdere items te selecteren of klik op individuele "Goedkeuren" of "Afkeuren" knoppen.
5. Bij afkeuren wordt u gevraagd om een reden op te geven.

![Goedkeuringen](./public/images/approvals.png)

### Verlofaanvragen goedkeuren

1. Ga naar "Goedkeuringen" > "Verlofaanvragen" in het hoofdmenu.
2. Bekijk de details van elke verlofaanvraag, inclusief type verlof en periode.
3. Controleer de verlofbalans van de medewerker en teamplanning.
4. Keur goed of af met eventueel commentaar.

### Ziekteverlof registreren

1. Ga naar "Goedkeuringen" > "Ziekteverlof" in het hoofdmenu.
2. Bekijk de details van gemelde ziekmeldingen.
3. Controleer of UWV-melding vereist is (bij langdurig verzuim).
4. Registreer eventuele vervolgacties of notities.

### Batch goedkeuringen

Voor het efficiënt verwerken van meerdere goedkeuringen:

1. Selecteer meerdere items met de checkboxes.
2. Klik op "Geselecteerde goedkeuren" of "Geselecteerde afkeuren" in de actiebalk.
3. Voeg indien gewenst een algemeen commentaar toe.
4. Bevestig de actie.

### Commentaar toevoegen

Bij elke goedkeuring of afkeuring kunt u commentaar toevoegen:

1. Klik op het commentaarveld of de knop "Commentaar toevoegen".
2. Voer uw commentaar in.
3. Selecteer indien nodig de optie "Intern commentaar" om het alleen zichtbaar te maken voor managers en HR.
4. Klik op "Opslaan" om het commentaar toe te voegen.

## Verlofbeheer

### Vakantie aanvragen

1. Ga naar "Verlof" > "Vakantie aanvragen" in het hoofdmenu.
2. Selecteer de start- en einddatum van uw vakantie.
3. Het systeem berekent automatisch het aantal werkdagen.
4. Voeg eventueel een toelichting toe.
5. Klik op "Aanvragen" om de vakantieaanvraag in te dienen.

![Verlof aanvragen](./public/images/vacation-request.png)

### Tijd-voor-tijd registreren

1. Ga naar "Verlof" > "Tijd-voor-tijd" in het hoofdmenu.
2. Selecteer de datum waarop u tijd-voor-tijd wilt opnemen.
3. Geef het aantal uren op.
4. Voeg eventueel een toelichting toe.
5. Klik op "Aanvragen" om de tijd-voor-tijd aanvraag in te dienen.

### Ziekteverlof melden

1. Ga naar "Verlof" > "Ziekmelding" in het hoofdmenu.
2. Selecteer de startdatum van uw ziekteverlof.
3. Indien bekend, geef de verwachte einddatum op.
4. Voeg eventueel relevante informatie toe (optioneel).
5. Klik op "Melden" om de ziekmelding in te dienen.

### Verlofoverzicht

1. Ga naar "Verlof" > "Overzicht" in het hoofdmenu.
2. Hier ziet u een overzicht van al uw verlofaanvragen en hun status.
3. Gebruik de filters om specifieke types verlof of periodes te bekijken.
4. Klik op een verlofaanvraag om de details te bekijken.

### Verlofbalans

1. Ga naar "Verlof" > "Verlofbalans" in het hoofdmenu.
2. Hier ziet u een overzicht van uw verlofbalans:
   - Beschikbare vakantiedagen
   - Opgebouwde tijd-voor-tijd uren
   - Opgenomen verlofdagen dit jaar
   - Vervaldatums van verlofrechten

## Documentbeheer

### Documenten uploaden

1. Ga naar "Documenten" in het hoofdmenu.
2. Klik op de knop "Document uploaden".
3. Selecteer het bestandstype (contract, loonstrook, certificaat, etc.).
4. Sleep het bestand naar het uploadgebied of klik om een bestand te selecteren.
5. Voeg metadata toe zoals titel, beschrijving en tags.
6. Stel toegangsrechten in (wie het document mag bekijken).
7. Klik op "Uploaden" om het document op te slaan.

### Documenten bekijken

1. Ga naar "Documenten" in het hoofdmenu.
2. Gebruik de filters om specifieke documenttypes of periodes te bekijken.
3. Klik op een document om de details en inhoud te bekijken.
4. Gebruik de knoppen om het document te downloaden, delen of bewerken (indien u de juiste rechten heeft).

### Versiebeheer

Voor documenten die regelmatig worden bijgewerkt:

1. Open een bestaand document.
2. Klik op "Nieuwe versie uploaden".
3. Upload het bijgewerkte bestand.
4. Voeg een beschrijving toe van de wijzigingen.
5. Klik op "Versie opslaan".

U kunt eerdere versies bekijken door op het tabblad "Versiegeschiedenis" te klikken.

### Interne opmerkingen

Voor HR en management:

1. Open een document.
2. Ga naar het tabblad "Interne opmerkingen".
3. Voeg een nieuwe opmerking toe.
4. Stel de zichtbaarheid in (HR, management, of beide).
5. Klik op "Opmerking toevoegen".

Deze opmerkingen zijn alleen zichtbaar voor gebruikers met de juiste rechten.

## Rapportages

### Standaardrapportages

De applicatie bevat verschillende standaardrapportages:

1. Ga naar "Rapportages" in het hoofdmenu.
2. Selecteer een van de beschikbare standaardrapportages:
   - Urenregistratie per medewerker
   - Verlofoverzicht team
   - Ziekteverzuimrapportage
   - Compliance rapportage (arbeidstijdenwet)
   - UWV-rapportage

### Aangepaste rapportages

Voor het maken van aangepaste rapportages:

1. Ga naar "Rapportages" > "Aangepaste rapportage" in het hoofdmenu.
2. Selecteer de gewenste gegevensbronnen.
3. Kies de velden die u wilt opnemen.
4. Stel filters in om de gegevens te beperken.
5. Kies de gewenste sortering en groepering.
6. Klik op "Genereren" om de rapportage te maken.

### Exporteren

Rapportages kunnen worden geëxporteerd in verschillende formaten:

1. Genereer de gewenste rapportage.
2. Klik op de knop "Exporteren".
3. Selecteer het gewenste formaat (PDF, Excel, CSV).
4. Klik op "Downloaden" om het bestand op te slaan.

## Instellingen

### Profielinstellingen

1. Klik op uw naam in de topbalk.
2. Selecteer "Profiel" in het dropdown-menu.
3. Hier kunt u uw persoonlijke gegevens bekijken en bewerken:
   - Contactgegevens
   - Noodcontacten
   - Wachtwoord wijzigen
   - Profielfoto uploaden

### Notificatie-instellingen

1. Klik op uw naam in de topbalk.
2. Selecteer "Instellingen" > "Notificaties" in het dropdown-menu.
3. Hier kunt u instellen welke notificaties u wilt ontvangen en via welke kanalen (e-mail, in-app).

### Toegankelijkheidsinstellingen

1. Klik op uw naam in de topbalk.
2. Selecteer "Instellingen" > "Toegankelijkheid" in het dropdown-menu.
3. Hier kunt u verschillende toegankelijkheidsopties instellen:
   - Hoog contrast
   - Grotere tekst
   - Verminderde beweging
   - Toetsenbordnavigatie

## Veelgestelde vragen

### Algemeen

**V: Hoe wijzig ik mijn wachtwoord?**  
A: Klik op uw naam in de topbalk, selecteer "Profiel" en klik op de knop "Wachtwoord wijzigen".

**V: Wat moet ik doen als ik geen toegang heb tot bepaalde functies?**  
A: Neem contact op met uw leidinggevende of de HR-afdeling om uw toegangsrechten te laten controleren.

### Tijdregistratie

**V: Wat betekenen de verschillende validatiebadges?**  
A: Groene badges geven aan dat alles in orde is, gele badges wijzen op waarschuwingen en rode badges duiden op fouten die gecorrigeerd moeten worden.

**V: Kan ik tijdregistraties van vorige weken nog wijzigen?**  
A: Ja, maar als de periode al is afgesloten, moet u een correctie aanvragen die door uw leidinggevende moet worden goedgekeurd.

### Verlof

**V: Hoe weet ik hoeveel verlofdagen ik nog heb?**  
A: Ga naar "Verlof" > "Verlofbalans" om uw actuele verlofbalans te bekijken.

**V: Wat gebeurt er met mijn verlofaanvraag als mijn leidinggevende afwezig is?**  
A: Het systeem stuurt de aanvraag automatisch door naar de plaatsvervangend leidinggevende.

## Problemen oplossen

### Algemene problemen

**Probleem: De applicatie laadt niet of is traag**  
Oplossing:
1. Ververs de pagina (F5)
2. Wis de browsercache
3. Probeer een andere browser
4. Controleer uw internetverbinding

**Probleem: Foutmelding bij inloggen**  
Oplossing:
1. Controleer of u het juiste e-mailadres en wachtwoord gebruikt
2. Gebruik de "Wachtwoord vergeten" functie om uw wachtwoord opnieuw in te stellen
3. Controleer of uw account niet is geblokkeerd

### Specifieke problemen

**Probleem: RouteVision gegevens worden niet getoond**  
Oplossing:
1. Controleer of de RouteVision app actief was tijdens uw werkzaamheden
2. Wacht enkele minuten, de synchronisatie kan vertraagd zijn
3. Neem contact op met de helpdesk als het probleem aanhoudt

**Probleem: Kan geen documenten uploaden**  
Oplossing:
1. Controleer of het bestandsformaat wordt ondersteund
2. Controleer of het bestand niet te groot is (max. 10 MB)
3. Probeer het bestand in een ander formaat op te slaan

## Contact en ondersteuning

### Helpdesk

Voor technische problemen kunt u contact opnemen met de helpdesk:
- E-mail: helpdesk@ckw.nl
- Telefoon: 030-1234567
- Openingstijden: maandag t/m vrijdag, 8:00 - 17:00 uur

### HR-afdeling

Voor vragen over verlof, tijdregistratie en personeelszaken:
- E-mail: hr@ckw.nl
- Telefoon: 030-7654321
- Openingstijden: maandag t/m vrijdag, 9:00 - 16:00 uur

### Feedback

We stellen uw feedback op prijs! Gebruik de feedbackknop rechtsonder in de applicatie om suggesties of problemen te melden.
