/**
 * Industry-Specific SEO Content
 * Focus: Cost savings & efficiency per niche
 */

import type { Locale, Industry } from './config';

export interface IndustryContent {
  heroTitle: string;
  heroSubtitle: string;
  challenges: { icon: string; title: string; description: string }[];
  solutions: { title: string; description: string; saving: string }[];
  stats: { value: string; label: string }[];
  testimonial: { quote: string; author: string; company: string; role: string };
  useCases: { title: string; description: string }[];
  roi: { before: string; after: string; savings: string; timeframe: string };
}

export const industryContent: Record<Industry, Record<Locale, IndustryContent>> = {
  bouw: {
    nl: {
      heroTitle: 'Urenregistratie voor de Bouw',
      heroSubtitle: 'Bespaar tot 45% op administratiekosten met GPS-gevalideerde urenregistratie op de bouwplaats',
      challenges: [
        { icon: '🏗️', title: 'Verspreide locaties', description: 'Medewerkers werken op verschillende bouwplaatsen, moeilijk te controleren' },
        { icon: '📝', title: 'Papieren urenstaten', description: 'Tijdrovende handmatige verwerking en foutgevoelige administratie' },
        { icon: '💰', title: 'Projectkosten', description: 'Onduidelijk hoeveel uren per project worden besteed' },
      ],
      solutions: [
        { title: 'GPS Klokken', description: 'Automatische locatieverificatie bij in- en uitklokken', saving: '€2.400/jaar' },
        { title: 'Project Urenregistratie', description: 'Koppel uren direct aan projecten en kostenplaatsen', saving: '€1.800/jaar' },
        { title: 'Digitale Goedkeuring', description: 'Voorman keurt uren goed via app', saving: '€1.200/jaar' },
      ],
      stats: [
        { value: '45%', label: 'minder administratietijd' },
        { value: '8 uur', label: 'bespaard per week' },
        { value: '€5.400', label: 'jaarlijkse besparing' },
      ],
      testimonial: {
        quote: 'Voorheen waren we uren kwijt aan het verzamelen van urenbriefjes. Nu hebben we realtime inzicht in alle projecturen.',
        author: 'Jan de Vries',
        company: 'Bouwbedrijf De Vries',
        role: 'Directeur',
      },
      useCases: [
        { title: 'Dagelijkse urenregistratie', description: 'Timmerman klokt in bij aankomst op bouwplaats, GPS bevestigt locatie automatisch' },
        { title: 'Projectwisseling', description: 'Bij wisseling van project eenvoudig nieuwe projectcode selecteren' },
        { title: 'Weekrapportage', description: 'Voorman ontvangt automatisch weekoverzicht ter goedkeuring' },
      ],
      roi: { before: '€12.000/jaar', after: '€6.600/jaar', savings: '€5.400/jaar', timeframe: '3 maanden' },
    },
    en: {
      heroTitle: 'Time Tracking for Construction',
      heroSubtitle: 'Save up to 45% on administration costs with GPS-validated time tracking on the construction site',
      challenges: [
        { icon: '🏗️', title: 'Scattered locations', description: 'Employees work on different construction sites, difficult to monitor' },
        { icon: '📝', title: 'Paper timesheets', description: 'Time-consuming manual processing and error-prone administration' },
        { icon: '💰', title: 'Project costs', description: 'Unclear how many hours are spent per project' },
      ],
      solutions: [
        { title: 'GPS Clocking', description: 'Automatic location verification when clocking in and out', saving: '€2,400/year' },
        { title: 'Project Time Tracking', description: 'Link hours directly to projects and cost centers', saving: '€1,800/year' },
        { title: 'Digital Approval', description: 'Foreman approves hours via app', saving: '€1,200/year' },
      ],
      stats: [
        { value: '45%', label: 'less admin time' },
        { value: '8 hours', label: 'saved per week' },
        { value: '€5,400', label: 'annual savings' },
      ],
      testimonial: {
        quote: 'We used to spend hours collecting timesheets. Now we have real-time insight into all project hours.',
        author: 'John Smith',
        company: 'Smith Construction',
        role: 'Director',
      },
      useCases: [
        { title: 'Daily time tracking', description: 'Carpenter clocks in upon arrival at construction site, GPS automatically confirms location' },
        { title: 'Project switching', description: 'Easy to select new project code when switching projects' },
        { title: 'Weekly reporting', description: 'Foreman automatically receives weekly overview for approval' },
      ],
      roi: { before: '€12,000/year', after: '€6,600/year', savings: '€5,400/year', timeframe: '3 months' },
    },
    de: {
      heroTitle: 'Zeiterfassung für das Bauwesen',
      heroSubtitle: 'Sparen Sie bis zu 45% an Verwaltungskosten mit GPS-validierter Zeiterfassung auf der Baustelle',
      challenges: [
        { icon: '🏗️', title: 'Verteilte Standorte', description: 'Mitarbeiter arbeiten auf verschiedenen Baustellen' },
        { icon: '📝', title: 'Papier-Stundenzettel', description: 'Zeitaufwändige manuelle Verarbeitung' },
        { icon: '💰', title: 'Projektkosten', description: 'Unklar wie viele Stunden pro Projekt aufgewendet werden' },
      ],
      solutions: [
        { title: 'GPS-Stempeln', description: 'Automatische Standortverifizierung beim Ein- und Ausstempeln', saving: '€2.400/Jahr' },
        { title: 'Projekt-Zeiterfassung', description: 'Stunden direkt mit Projekten verknüpfen', saving: '€1.800/Jahr' },
        { title: 'Digitale Genehmigung', description: 'Vorarbeiter genehmigt Stunden per App', saving: '€1.200/Jahr' },
      ],
      stats: [
        { value: '45%', label: 'weniger Verwaltungszeit' },
        { value: '8 Stunden', label: 'pro Woche gespart' },
        { value: '€5.400', label: 'jährliche Ersparnis' },
      ],
      testimonial: {
        quote: 'Früher haben wir Stunden mit dem Sammeln von Stundenzetteln verbracht. Jetzt haben wir Echtzeit-Einblick.',
        author: 'Hans Müller',
        company: 'Müller Bau GmbH',
        role: 'Geschäftsführer',
      },
      useCases: [
        { title: 'Tägliche Zeiterfassung', description: 'Zimmermann stempelt bei Ankunft ein, GPS bestätigt automatisch' },
        { title: 'Projektwechsel', description: 'Einfache Auswahl eines neuen Projektcodes' },
        { title: 'Wochenberichte', description: 'Vorarbeiter erhält automatisch Wochenübersicht' },
      ],
      roi: { before: '€12.000/Jahr', after: '€6.600/Jahr', savings: '€5.400/Jahr', timeframe: '3 Monate' },
    },
    pl: {
      heroTitle: 'Rejestracja Czasu dla Budownictwa',
      heroSubtitle: 'Zaoszczędź do 45% na kosztach administracyjnych dzięki walidacji GPS na placu budowy',
      challenges: [
        { icon: '🏗️', title: 'Rozproszone lokalizacje', description: 'Pracownicy pracują na różnych placach budowy' },
        { icon: '📝', title: 'Papierowe karty czasu', description: 'Czasochłonne ręczne przetwarzanie' },
        { icon: '💰', title: 'Koszty projektów', description: 'Niejasne ile godzin przypada na projekt' },
      ],
      solutions: [
        { title: 'Rejestracja GPS', description: 'Automatyczna weryfikacja lokalizacji', saving: '€2.400/rok' },
        { title: 'Śledzenie projektów', description: 'Powiązanie godzin z projektami', saving: '€1.800/rok' },
        { title: 'Cyfrowe zatwierdzanie', description: 'Brygadzista zatwierdza przez aplikację', saving: '€1.200/rok' },
      ],
      stats: [
        { value: '45%', label: 'mniej czasu na administrację' },
        { value: '8 godzin', label: 'zaoszczędzonych tygodniowo' },
        { value: '€5.400', label: 'roczne oszczędności' },
      ],
      testimonial: {
        quote: 'Wcześniej traciliśmy godziny na zbieranie kart czasu. Teraz mamy wgląd w czasie rzeczywistym.',
        author: 'Piotr Kowalski',
        company: 'Kowalski Budowa',
        role: 'Dyrektor',
      },
      useCases: [
        { title: 'Codzienna rejestracja', description: 'Cieśla rejestruje się po przybyciu, GPS potwierdza lokalizację' },
        { title: 'Zmiana projektu', description: 'Łatwy wybór nowego kodu projektu' },
        { title: 'Raporty tygodniowe', description: 'Brygadzista automatycznie otrzymuje przegląd tygodniowy' },
      ],
      roi: { before: '€12.000/rok', after: '€6.600/rok', savings: '€5.400/rok', timeframe: '3 miesiące' },
    },
    fr: {
      heroTitle: 'Suivi du Temps pour la Construction',
      heroSubtitle: 'Économisez jusqu\'à 45% sur les coûts d\'administration avec le suivi GPS sur le chantier',
      challenges: [
        { icon: '🏗️', title: 'Sites dispersés', description: 'Employés travaillent sur différents chantiers' },
        { icon: '📝', title: 'Feuilles papier', description: 'Traitement manuel chronophage' },
        { icon: '💰', title: 'Coûts des projets', description: 'Heures par projet peu claires' },
      ],
      solutions: [
        { title: 'Pointage GPS', description: 'Vérification automatique de la localisation', saving: '€2.400/an' },
        { title: 'Suivi par projet', description: 'Lier les heures aux projets', saving: '€1.800/an' },
        { title: 'Approbation digitale', description: 'Le chef approuve via l\'app', saving: '€1.200/an' },
      ],
      stats: [
        { value: '45%', label: 'moins de temps admin' },
        { value: '8 heures', label: 'économisées par semaine' },
        { value: '€5.400', label: 'économies annuelles' },
      ],
      testimonial: {
        quote: 'Avant, nous passions des heures à collecter les feuilles de temps. Maintenant nous avons une vision en temps réel.',
        author: 'Pierre Dupont',
        company: 'Dupont Construction',
        role: 'Directeur',
      },
      useCases: [
        { title: 'Suivi quotidien', description: 'Le charpentier pointe à l\'arrivée, GPS confirme automatiquement' },
        { title: 'Changement de projet', description: 'Sélection facile d\'un nouveau code projet' },
        { title: 'Rapports hebdomadaires', description: 'Le chef reçoit automatiquement l\'aperçu hebdomadaire' },
      ],
      roi: { before: '€12.000/an', after: '€6.600/an', savings: '€5.400/an', timeframe: '3 mois' },
    },
  },
  transport: {
    nl: {
      heroTitle: 'Urenregistratie voor Transport',
      heroSubtitle: 'Integreer rijtijden automatisch met fleet tracking - bespaar 50% op administratie',
      challenges: [
        { icon: '🚛', title: 'Rijtijdenwet', description: 'Complexe regelgeving rond rij- en rusttijden' },
        { icon: '📊', title: 'Dubbele registratie', description: 'Aparte systemen voor fleet tracking en urenregistratie' },
        { icon: '⏰', title: 'Overuren', description: 'Lastig bij te houden met wisselende routes' },
      ],
      solutions: [
        { title: 'Fleet Integratie', description: 'Automatische import van ritten uit TomTom/Webfleet', saving: '€3.600/jaar' },
        { title: 'Automatische Uren', description: 'Rijtijden worden automatisch omgezet naar werkuren', saving: '€2.400/jaar' },
        { title: 'Compliance Alerts', description: 'Automatische waarschuwingen bij overschrijding rijtijden', saving: '€1.200/jaar' },
      ],
      stats: [
        { value: '50%', label: 'minder administratie' },
        { value: '€7.200', label: 'jaarlijkse besparing' },
        { value: '100%', label: 'rijtijdenwet compliant' },
      ],
      testimonial: {
        quote: 'De koppeling met onze fleet tracking heeft de administratie gehalveerd. Alles klopt nu automatisch.',
        author: 'Pieter Jansen',
        company: 'Jansen Transport BV',
        role: 'Operationeel Manager',
      },
      useCases: [
        { title: 'Rit registratie', description: 'Chauffeur start app, ritten worden automatisch geïmporteerd uit Webfleet' },
        { title: 'Laad- en lostijd', description: 'Extra werkzaamheden apart registreren naast rijtijd' },
        { title: 'Weekstaat', description: 'Automatische weekstaat met rijtijden, pauzes en overuren' },
      ],
      roi: { before: '€14.400/jaar', after: '€7.200/jaar', savings: '€7.200/jaar', timeframe: '2 maanden' },
    },
    en: {
      heroTitle: 'Time Tracking for Transport',
      heroSubtitle: 'Integrate driving times automatically with fleet tracking - save 50% on administration',
      challenges: [
        { icon: '🚛', title: 'Driving regulations', description: 'Complex regulations around driving and rest times' },
        { icon: '📊', title: 'Double registration', description: 'Separate systems for fleet tracking and time registration' },
        { icon: '⏰', title: 'Overtime', description: 'Difficult to track with changing routes' },
      ],
      solutions: [
        { title: 'Fleet Integration', description: 'Automatic import of trips from TomTom/Webfleet', saving: '€3,600/year' },
        { title: 'Automatic Hours', description: 'Driving times automatically converted to work hours', saving: '€2,400/year' },
        { title: 'Compliance Alerts', description: 'Automatic warnings when exceeding driving times', saving: '€1,200/year' },
      ],
      stats: [
        { value: '50%', label: 'less administration' },
        { value: '€7,200', label: 'annual savings' },
        { value: '100%', label: 'driving law compliant' },
      ],
      testimonial: {
        quote: 'The integration with our fleet tracking has halved the administration. Everything is now automatic.',
        author: 'Peter Johnson',
        company: 'Johnson Transport Ltd',
        role: 'Operations Manager',
      },
      useCases: [
        { title: 'Trip registration', description: 'Driver starts app, trips are automatically imported from Webfleet' },
        { title: 'Loading time', description: 'Register additional work separately from driving time' },
        { title: 'Weekly statement', description: 'Automatic weekly statement with driving times, breaks and overtime' },
      ],
      roi: { before: '€14,400/year', after: '€7,200/year', savings: '€7,200/year', timeframe: '2 months' },
    },
    de: {
      heroTitle: 'Zeiterfassung für Transport',
      heroSubtitle: 'Fahrzeiten automatisch mit Flottenmanagement integrieren - 50% Verwaltung sparen',
      challenges: [
        { icon: '🚛', title: 'Lenk- und Ruhezeiten', description: 'Komplexe Vorschriften' },
        { icon: '📊', title: 'Doppelte Erfassung', description: 'Separate Systeme für Flotte und Zeit' },
        { icon: '⏰', title: 'Überstunden', description: 'Schwer zu verfolgen bei wechselnden Routen' },
      ],
      solutions: [
        { title: 'Flotten-Integration', description: 'Automatischer Import von Fahrten aus TomTom/Webfleet', saving: '€3.600/Jahr' },
        { title: 'Automatische Stunden', description: 'Fahrzeiten werden automatisch in Arbeitsstunden umgewandelt', saving: '€2.400/Jahr' },
        { title: 'Compliance-Alerts', description: 'Automatische Warnungen bei Überschreitung', saving: '€1.200/Jahr' },
      ],
      stats: [
        { value: '50%', label: 'weniger Verwaltung' },
        { value: '€7.200', label: 'jährliche Ersparnis' },
        { value: '100%', label: 'gesetzeskonform' },
      ],
      testimonial: {
        quote: 'Die Integration mit unserem Flottenmanagement hat die Verwaltung halbiert.',
        author: 'Hans Schmidt',
        company: 'Schmidt Transport GmbH',
        role: 'Betriebsleiter',
      },
      useCases: [
        { title: 'Fahrterfassung', description: 'Fahrer startet App, Fahrten werden automatisch importiert' },
        { title: 'Ladezeit', description: 'Zusätzliche Arbeiten separat von Fahrzeit erfassen' },
        { title: 'Wochennachweis', description: 'Automatischer Wochennachweis mit allen Zeiten' },
      ],
      roi: { before: '€14.400/Jahr', after: '€7.200/Jahr', savings: '€7.200/Jahr', timeframe: '2 Monate' },
    },
    pl: {
      heroTitle: 'Rejestracja Czasu dla Transportu',
      heroSubtitle: 'Automatyczna integracja czasów jazdy z flotą - oszczędź 50% na administracji',
      challenges: [
        { icon: '🚛', title: 'Przepisy o czasie jazdy', description: 'Złożone regulacje' },
        { icon: '📊', title: 'Podwójna rejestracja', description: 'Osobne systemy dla floty i czasu' },
        { icon: '⏰', title: 'Nadgodziny', description: 'Trudne do śledzenia przy zmiennych trasach' },
      ],
      solutions: [
        { title: 'Integracja floty', description: 'Automatyczny import tras z TomTom/Webfleet', saving: '€3.600/rok' },
        { title: 'Automatyczne godziny', description: 'Czasy jazdy automatycznie przeliczane na godziny pracy', saving: '€2.400/rok' },
        { title: 'Alerty zgodności', description: 'Automatyczne ostrzeżenia przy przekroczeniach', saving: '€1.200/rok' },
      ],
      stats: [
        { value: '50%', label: 'mniej administracji' },
        { value: '€7.200', label: 'roczne oszczędności' },
        { value: '100%', label: 'zgodność z przepisami' },
      ],
      testimonial: {
        quote: 'Integracja ze śledzeniem floty zmniejszyła administrację o połowę.',
        author: 'Tomasz Nowak',
        company: 'Nowak Transport',
        role: 'Kierownik Operacyjny',
      },
      useCases: [
        { title: 'Rejestracja tras', description: 'Kierowca uruchamia aplikację, trasy importowane automatycznie' },
        { title: 'Czas załadunku', description: 'Dodatkowe prace rejestrowane oddzielnie' },
        { title: 'Zestawienie tygodniowe', description: 'Automatyczne zestawienie z wszystkimi czasami' },
      ],
      roi: { before: '€14.400/rok', after: '€7.200/rok', savings: '€7.200/rok', timeframe: '2 miesiące' },
    },
    fr: {
      heroTitle: 'Suivi du Temps pour le Transport',
      heroSubtitle: 'Intégrez les temps de conduite automatiquement - économisez 50% sur l\'admin',
      challenges: [
        { icon: '🚛', title: 'Réglementation', description: 'Règles complexes sur les temps de conduite' },
        { icon: '📊', title: 'Double saisie', description: 'Systèmes séparés pour flotte et temps' },
        { icon: '⏰', title: 'Heures supplémentaires', description: 'Difficile à suivre avec des routes variables' },
      ],
      solutions: [
        { title: 'Intégration flotte', description: 'Import automatique des trajets depuis TomTom/Webfleet', saving: '€3.600/an' },
        { title: 'Heures automatiques', description: 'Temps de conduite convertis en heures de travail', saving: '€2.400/an' },
        { title: 'Alertes conformité', description: 'Avertissements automatiques en cas de dépassement', saving: '€1.200/an' },
      ],
      stats: [
        { value: '50%', label: 'moins d\'admin' },
        { value: '€7.200', label: 'économies annuelles' },
        { value: '100%', label: 'conforme réglementation' },
      ],
      testimonial: {
        quote: 'L\'intégration avec notre gestion de flotte a réduit l\'administration de moitié.',
        author: 'Pierre Martin',
        company: 'Martin Transport',
        role: 'Responsable Opérations',
      },
      useCases: [
        { title: 'Enregistrement trajets', description: 'Le chauffeur démarre l\'app, trajets importés automatiquement' },
        { title: 'Temps de chargement', description: 'Travaux supplémentaires enregistrés séparément' },
        { title: 'Relevé hebdomadaire', description: 'Relevé automatique avec tous les temps' },
      ],
      roi: { before: '€14.400/an', after: '€7.200/an', savings: '€7.200/an', timeframe: '2 mois' },
    },
  },
  // Simplified entries for other industries - same structure
  horeca: {
    nl: {
      heroTitle: 'Urenregistratie voor Horeca',
      heroSubtitle: 'Flexibele roosters, wisselende diensten - 35% administratiebesparing',
      challenges: [
        { icon: '🍽️', title: 'Flexibele roosters', description: 'Wisselende diensten en last-minute wijzigingen' },
        { icon: '👥', title: 'Veel parttimers', description: 'Groot aantal medewerkers met variabele uren' },
        { icon: '📅', title: 'Piekdrukte', description: 'Seizoensgebonden drukte en evenementen' },
      ],
      solutions: [
        { title: 'Rooster Integratie', description: 'Koppeling met roosterplanning', saving: '€1.800/jaar' },
        { title: 'Mobiel Klokken', description: 'In- en uitklokken via smartphone', saving: '€1.200/jaar' },
        { title: 'Realtime Overzicht', description: 'Direct inzicht in bezetting en kosten', saving: '€900/jaar' },
      ],
      stats: [
        { value: '35%', label: 'minder administratie' },
        { value: '€3.900', label: 'jaarlijkse besparing' },
        { value: '90%', label: 'minder fouten' },
      ],
      testimonial: { quote: 'Eindelijk geen gedoe meer met briefjes en Excel. Alles gaat nu automatisch.', author: 'Lisa Bakker', company: 'Restaurant De Smulhoek', role: 'Eigenaar' },
      useCases: [
        { title: 'Dienst starten', description: 'Ober klokt in via tablet bij bar, systeem registreert starttijd' },
        { title: 'Pauze registratie', description: 'Automatische pauze na 5,5 uur conform wetgeving' },
        { title: 'Maandoverzicht', description: 'Automatische export naar loonadministratie' },
      ],
      roi: { before: '€7.800/jaar', after: '€3.900/jaar', savings: '€3.900/jaar', timeframe: '1 maand' },
    },
    en: { heroTitle: 'Time Tracking for Hospitality', heroSubtitle: 'Flexible schedules, varying shifts - 35% admin savings', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    de: { heroTitle: 'Zeiterfassung für Gastronomie', heroSubtitle: 'Flexible Dienstpläne - 35% Verwaltungseinsparung', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    pl: { heroTitle: 'Rejestracja Czasu dla Gastronomii', heroSubtitle: 'Elastyczne grafiki - 35% oszczędności na administracji', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    fr: { heroTitle: 'Suivi du Temps pour l\'Hôtellerie', heroSubtitle: 'Horaires flexibles - 35% d\'économies admin', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
  },
  zorg: {
    nl: {
      heroTitle: 'Urenregistratie voor de Zorg',
      heroSubtitle: 'CAO-compliant, 24/7 diensten, declarabel maken - 40% efficiënter',
      challenges: [
        { icon: '🏥', title: 'CAO Complexiteit', description: 'Verschillende toeslagen en regelingen per CAO' },
        { icon: '🌙', title: '24/7 Bezetting', description: 'Nacht-, weekend- en feestdagdiensten' },
        { icon: '📋', title: 'Declaraties', description: 'Uren koppelen aan cliënten voor facturatie' },
      ],
      solutions: [
        { title: 'CAO Toeslagen', description: 'Automatische berekening ORT en andere toeslagen', saving: '€2.400/jaar' },
        { title: 'Cliënt Registratie', description: 'Uren direct koppelen aan cliënten', saving: '€1.800/jaar' },
        { title: 'Rooster Sync', description: 'Integratie met zorgplanning software', saving: '€1.200/jaar' },
      ],
      stats: [
        { value: '40%', label: 'efficiënter' },
        { value: '€5.400', label: 'jaarlijkse besparing' },
        { value: '100%', label: 'CAO compliant' },
      ],
      testimonial: { quote: 'De automatische toeslagenberekening bespaart ons enorm veel tijd.', author: 'Sandra de Groot', company: 'Zorggroep Nieuw Leven', role: 'HR Manager' },
      useCases: [
        { title: 'Dienst registratie', description: 'Verpleegkundige klokt in, systeem herkent nachtdienst en past toeslag toe' },
        { title: 'Cliënt koppeling', description: 'Per handeling aangeven bij welke cliënt gewerkt' },
        { title: 'Maandafsluiting', description: 'Automatische export met alle toeslagen naar salarisadministratie' },
      ],
      roi: { before: '€10.800/jaar', after: '€5.400/jaar', savings: '€5.400/jaar', timeframe: '2 maanden' },
    },
    en: { heroTitle: 'Time Tracking for Healthcare', heroSubtitle: 'Compliant, 24/7 shifts, billable hours - 40% more efficient', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    de: { heroTitle: 'Zeiterfassung für Gesundheitswesen', heroSubtitle: 'Tarifkonform, 24/7 Schichten - 40% effizienter', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    pl: { heroTitle: 'Rejestracja Czasu dla Opieki Zdrowotnej', heroSubtitle: 'Zgodność, dyżury 24/7 - 40% wydajniej', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    fr: { heroTitle: 'Suivi du Temps pour la Santé', heroSubtitle: 'Conforme, services 24/7 - 40% plus efficace', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
  },
  retail: {
    nl: {
      heroTitle: 'Urenregistratie voor Retail',
      heroSubtitle: 'Meerdere vestigingen, flexkrachten, seizoensdrukte - 30% kostenbesparing',
      challenges: [
        { icon: '🏪', title: 'Multi-vestiging', description: 'Overzicht over alle winkels behouden' },
        { icon: '📊', title: 'Flex personeel', description: 'Veel parttimers en oproepkrachten' },
        { icon: '🎄', title: 'Seizoenspieken', description: 'Kerst, uitverkoop, andere drukte periodes' },
      ],
      solutions: [
        { title: 'Multi-locatie Dashboard', description: 'Overzicht van alle vestigingen in één scherm', saving: '€1.500/jaar' },
        { title: 'Flex Registratie', description: 'Eenvoudig in- en uitklokken voor flexkrachten', saving: '€1.200/jaar' },
        { title: 'Kostenbewaking', description: 'Realtime inzicht in personeelskosten per vestiging', saving: '€900/jaar' },
      ],
      stats: [
        { value: '30%', label: 'kostenbesparing' },
        { value: '€3.600', label: 'jaarlijkse besparing' },
        { value: '15 min', label: 'setup per vestiging' },
      ],
      testimonial: { quote: 'Met 12 winkels was het chaos. Nu zie ik in één oogopslag waar we staan.', author: 'Mark van den Berg', company: 'Fashion Outlet Groep', role: 'Regiomanager' },
      useCases: [
        { title: 'Winkel openen', description: 'Filiaalmanager klokt in, team volgt gedurende de dag' },
        { title: 'Pauze planning', description: 'Systeem waarschuwt bij onderbezetting door pauzes' },
        { title: 'Weekrapport', description: 'Automatisch overzicht van alle vestigingen' },
      ],
      roi: { before: '€7.200/jaar', after: '€3.600/jaar', savings: '€3.600/jaar', timeframe: '1 maand' },
    },
    en: { heroTitle: 'Time Tracking for Retail', heroSubtitle: 'Multiple locations, flex workers, seasonal peaks - 30% cost savings', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    de: { heroTitle: 'Zeiterfassung für Einzelhandel', heroSubtitle: 'Mehrere Filialen, Flexkräfte - 30% Kosteneinsparung', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    pl: { heroTitle: 'Rejestracja Czasu dla Handlu Detalicznego', heroSubtitle: 'Wiele lokalizacji, pracownicy tymczasowi - 30% oszczędności', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    fr: { heroTitle: 'Suivi du Temps pour le Commerce', heroSubtitle: 'Multi-sites, intérimaires - 30% d\'économies', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
  },
  schoonmaak: {
    nl: {
      heroTitle: 'Urenregistratie voor Schoonmaak',
      heroSubtitle: 'Klantlocaties, flexibele teams, declarabel - 45% efficiënter werken',
      challenges: [
        { icon: '🧹', title: 'Veel locaties', description: 'Teams werken op verschillende klantlocaties' },
        { icon: '⏱️', title: 'Korte diensten', description: 'Veel kleine klussen op verschillende adressen' },
        { icon: '💶', title: 'Facturatie', description: 'Uren moeten declarabel zijn per klant' },
      ],
      solutions: [
        { title: 'Locatie Check-in', description: 'GPS verificatie bij aankomst op klantlocatie', saving: '€2.100/jaar' },
        { title: 'Klant Koppeling', description: 'Direct uren boeken op juiste klant', saving: '€1.500/jaar' },
        { title: 'Auto-facturatie', description: 'Automatisch facturen genereren uit gewerkte uren', saving: '€900/jaar' },
      ],
      stats: [
        { value: '45%', label: 'efficiënter' },
        { value: '€4.500', label: 'jaarlijkse besparing' },
        { value: '0', label: 'gemiste facturatie' },
      ],
      testimonial: { quote: 'Geen discussies meer over gewerkte uren. GPS bewijst precies wanneer en waar gewerkt is.', author: 'Fatima El Amrani', company: 'Clean & Fresh BV', role: 'Directeur' },
      useCases: [
        { title: 'Object starten', description: 'Schoonmaker arriveert, klokt in met GPS verificatie' },
        { title: 'Meerdere objecten', description: 'Per object apart registreren voor correcte facturatie' },
        { title: 'Maandfacturatie', description: 'Automatische overzichten per klant voor facturatie' },
      ],
      roi: { before: '€9.000/jaar', after: '€4.500/jaar', savings: '€4.500/jaar', timeframe: '1 maand' },
    },
    en: { heroTitle: 'Time Tracking for Cleaning Services', heroSubtitle: 'Client locations, flexible teams - 45% more efficient', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    de: { heroTitle: 'Zeiterfassung für Reinigungsdienste', heroSubtitle: 'Kundenstandorte, flexible Teams - 45% effizienter', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    pl: { heroTitle: 'Rejestracja Czasu dla Usług Sprzątających', heroSubtitle: 'Lokalizacje klientów, elastyczne zespoły - 45% wydajniej', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    fr: { heroTitle: 'Suivi du Temps pour le Nettoyage', heroSubtitle: 'Sites clients, équipes flexibles - 45% plus efficace', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
  },
  beveiliging: {
    nl: {
      heroTitle: 'Urenregistratie voor Beveiliging',
      heroSubtitle: '24/7 bewaking, rondes vastleggen, rapportage - 40% administratiebesparing',
      challenges: [
        { icon: '🔐', title: '24/7 Diensten', description: 'Continue bezetting met wisselende ploegen' },
        { icon: '📍', title: 'Rondes', description: 'Bewijs van uitgevoerde controlepunten' },
        { icon: '📝', title: 'Rapportage', description: 'Uitgebreide rapportage naar opdrachtgevers' },
      ],
      solutions: [
        { title: 'Ronde Registratie', description: 'GPS checkpoints bij rondes', saving: '€1.800/jaar' },
        { title: 'Incident Logging', description: 'Incidenten direct vastleggen met foto', saving: '€1.200/jaar' },
        { title: 'Klant Rapportage', description: 'Automatische rapportages naar opdrachtgevers', saving: '€900/jaar' },
      ],
      stats: [
        { value: '40%', label: 'minder administratie' },
        { value: '€3.900', label: 'jaarlijkse besparing' },
        { value: '100%', label: 'bewijslast compleet' },
      ],
      testimonial: { quote: 'Opdrachtgevers waarderen de gedetailleerde rapportages. Dat onderscheidt ons van de concurrent.', author: 'Robert Smit', company: 'SecureGuard BV', role: 'Operations Director' },
      useCases: [
        { title: 'Dienst starten', description: 'Beveiliger meldt zich aan object, GPS bevestigt aanwezigheid' },
        { title: 'Ronde lopen', description: 'Bij elk checkpoint GPS registratie met tijdstempel' },
        { title: 'Incidentmelding', description: 'Direct foto en beschrijving toevoegen aan rapport' },
      ],
      roi: { before: '€7.800/jaar', after: '€3.900/jaar', savings: '€3.900/jaar', timeframe: '2 maanden' },
    },
    en: { heroTitle: 'Time Tracking for Security Services', heroSubtitle: '24/7 surveillance, patrol logging - 40% admin savings', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    de: { heroTitle: 'Zeiterfassung für Sicherheitsdienste', heroSubtitle: '24/7 Überwachung, Rundgangsprotokollierung - 40% Einsparung', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    pl: { heroTitle: 'Rejestracja Czasu dla Usług Ochrony', heroSubtitle: 'Nadzór 24/7, rejestracja patroli - 40% oszczędności', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
    fr: { heroTitle: 'Suivi du Temps pour la Sécurité', heroSubtitle: 'Surveillance 24/7, rondes - 40% d\'économies admin', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } },
  },
  // Minimal entries for remaining industries
  logistiek: { nl: { heroTitle: 'Urenregistratie voor Logistiek', heroSubtitle: 'Warehouse, picking, verzending - 35% efficiënter', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, en: { heroTitle: 'Time Tracking for Logistics', heroSubtitle: 'Warehouse, picking, shipping - 35% more efficient', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, de: { heroTitle: 'Zeiterfassung für Logistik', heroSubtitle: 'Lager, Kommissionierung - 35% effizienter', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, pl: { heroTitle: 'Rejestracja Czasu dla Logistyki', heroSubtitle: 'Magazyn, kompletacja - 35% wydajniej', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, fr: { heroTitle: 'Suivi du Temps pour la Logistique', heroSubtitle: 'Entrepôt, préparation - 35% plus efficace', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } } },
  productie: { nl: { heroTitle: 'Urenregistratie voor Productie', heroSubtitle: 'Ploegendienst, machine-uren, productieorders - 40% besparing', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, en: { heroTitle: 'Time Tracking for Manufacturing', heroSubtitle: 'Shift work, machine hours - 40% savings', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, de: { heroTitle: 'Zeiterfassung für Produktion', heroSubtitle: 'Schichtarbeit, Maschinenstunden - 40% Einsparung', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, pl: { heroTitle: 'Rejestracja Czasu dla Produkcji', heroSubtitle: 'Praca zmianowa, godziny maszyn - 40% oszczędności', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, fr: { heroTitle: 'Suivi du Temps pour la Production', heroSubtitle: 'Travail posté, heures machine - 40% d\'économies', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } } },
  techniek: { nl: { heroTitle: 'Urenregistratie voor Techniek', heroSubtitle: 'Servicemonteurs, projecten, nacalculatie - 45% nauwkeuriger', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, en: { heroTitle: 'Time Tracking for Technical Services', heroSubtitle: 'Service engineers, projects - 45% more accurate', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, de: { heroTitle: 'Zeiterfassung für Technik', heroSubtitle: 'Servicetechniker, Projekte - 45% genauer', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, pl: { heroTitle: 'Rejestracja Czasu dla Usług Technicznych', heroSubtitle: 'Serwisanci, projekty - 45% dokładniej', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, fr: { heroTitle: 'Suivi du Temps pour les Services Techniques', heroSubtitle: 'Techniciens, projets - 45% plus précis', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } } },
  agrarisch: { nl: { heroTitle: 'Urenregistratie voor Agrarisch', heroSubtitle: 'Seizoenswerk, oogst, hoveniers - 35% besparing', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, en: { heroTitle: 'Time Tracking for Agriculture', heroSubtitle: 'Seasonal work, harvest - 35% savings', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, de: { heroTitle: 'Zeiterfassung für Landwirtschaft', heroSubtitle: 'Saisonarbeit, Ernte - 35% Einsparung', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, pl: { heroTitle: 'Rejestracja Czasu dla Rolnictwa', heroSubtitle: 'Praca sezonowa, żniwa - 35% oszczędności', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, fr: { heroTitle: 'Suivi du Temps pour l\'Agriculture', heroSubtitle: 'Travail saisonnier, récolte - 35% d\'économies', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } } },
  uitzendbureau: { nl: { heroTitle: 'Urenregistratie voor Uitzendbureaus', heroSubtitle: 'Flexkrachten, inleners, facturatie - 50% administratiebesparing', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, en: { heroTitle: 'Time Tracking for Staffing Agencies', heroSubtitle: 'Temp workers, clients, billing - 50% admin savings', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, de: { heroTitle: 'Zeiterfassung für Zeitarbeit', heroSubtitle: 'Zeitarbeiter, Entleiher, Abrechnung - 50% Einsparung', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, pl: { heroTitle: 'Rejestracja Czasu dla Agencji Pracy', heroSubtitle: 'Pracownicy tymczasowi, klienci - 50% oszczędności', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } }, fr: { heroTitle: 'Suivi du Temps pour Agences d\'Intérim', heroSubtitle: 'Intérimaires, clients - 50% d\'économies admin', challenges: [], solutions: [], stats: [], testimonial: { quote: '', author: '', company: '', role: '' }, useCases: [], roi: { before: '', after: '', savings: '', timeframe: '' } } },
};

export function getIndustryContent(industry: Industry, locale: Locale): IndustryContent {
  return industryContent[industry]?.[locale] || industryContent[industry]?.nl || industryContent.bouw.nl;
}

export function hasIndustryContent(industry: Industry, locale: Locale): boolean {
  const content = industryContent[industry]?.[locale];
  // Check if content exists and has meaningful data (not empty arrays)
  return !!(
    content &&
    content.heroTitle &&
    content.challenges?.length > 0 &&
    content.solutions?.length > 0 &&
    content.stats?.length > 0
  );
}
