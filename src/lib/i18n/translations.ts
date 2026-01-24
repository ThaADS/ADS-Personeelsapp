/**
 * Translations Dictionary
 * Complete translations for all SEO content
 */

import type { Locale } from './config';

interface Translation {
  meta: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
  };
  nav: {
    features: string;
    pricing: string;
    sectors: string;
    cases: string;
    blog: string;
    contact: string;
    login: string;
    startFree: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    secondaryCta: string;
    trustBadge: string;
  };
  benefits: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  features: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  industry: {
    title: string;
    subtitle: string;
    viewSolution: string;
    challengesTitle: string;
    solutionTitle: string;
    benefitsTitle: string;
    roiTitle: string;
    testimonialsTitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
    note: string;
  };
  footer: {
    product: string;
    sectors: string;
    support: string;
    helpCenter: string;
    contact: string;
    legal: string;
    privacy: string;
    terms: string;
    rights: string;
  };
}

export const translations: Record<Locale, Translation> = {
  nl: {
    meta: {
      siteName: 'ADSPersoneelapp',
      defaultTitle: 'HR Software voor MKB | Urenregistratie & Personeelsbeheer',
      defaultDescription: 'Bespaar tot 40% op administratiekosten met onze slimme HR software. GPS-urenregistratie, verlofbeheer en personeelsadministratie in één app.',
      keywords: ['urenregistratie', 'personeelsbeheer', 'hr software', 'verlofbeheer', 'tijdregistratie', 'gps tracking', 'mkb'],
    },
    nav: {
      features: 'Functies',
      pricing: 'Prijzen',
      sectors: 'Sectoren',
      cases: 'Klantcases',
      blog: 'Blog',
      contact: 'Contact',
      login: 'Inloggen',
      startFree: 'Start Gratis',
    },
    hero: {
      title: 'Bespaar tot 40% op Personeelsadministratie',
      subtitle: 'Slimme urenregistratie met GPS-verificatie, automatisch verlofbeheer en realtime inzicht in je personeelskosten. Speciaal ontwikkeld voor Nederlandse bedrijven.',
      cta: 'Start 14 Dagen Gratis',
      secondaryCta: 'Bekijk Demo',
      trustBadge: 'Vertrouwd door 2.500+ bedrijven in Nederland',
    },
    benefits: {
      title: 'Waarom ADSPersoneelapp?',
      items: [
        { icon: '💰', title: 'Tot 40% Kostenbesparing', description: 'Automatiseer je administratie en bespaar direct op personeelskosten' },
        { icon: '⏱️', title: '8 Uur Per Week Bespaard', description: 'Geen handmatige urenregistratie meer, alles automatisch' },
        { icon: '📱', title: 'Werkt Overal', description: 'Mobiele app voor iOS en Android, werkt offline' },
      ],
    },
    features: {
      title: 'Alles Wat Je Nodig Hebt',
      items: [
        { icon: '⏰', title: 'GPS Urenregistratie', description: 'Automatische locatieverificatie bij in- en uitklokken' },
        { icon: '🏖️', title: 'Verlofbeheer', description: 'Digitale verlofaanvragen met automatische goedkeuring' },
        { icon: '🚗', title: 'Fleet Tracking', description: 'Integratie met TomTom, Webfleet en meer' },
        { icon: '📊', title: 'Rapportages', description: 'Realtime inzicht in personeelskosten en uren' },
        { icon: '✅', title: 'Goedkeuringsworkflow', description: 'Managers keuren uren goed via de app' },
        { icon: '🔗', title: 'Integraties', description: 'Koppeling met salarisadministratie en boekhouding' },
      ],
    },
    industry: {
      title: 'Oplossingen Per Sector',
      subtitle: 'Specifieke functionaliteit voor jouw branche',
      viewSolution: 'Bekijk oplossing',
      challengesTitle: 'Uitdagingen',
      solutionTitle: 'Onze Oplossing',
      benefitsTitle: 'Voordelen',
      roiTitle: 'ROI Berekening',
      testimonialsTitle: 'Wat Klanten Zeggen',
      ctaTitle: 'Start Vandaag Nog',
      ctaSubtitle: 'Probeer 14 dagen gratis, geen creditcard nodig',
    },
    cta: {
      title: 'Klaar om te Besparen?',
      subtitle: 'Start vandaag nog met ADSPersoneelapp en ontdek hoeveel tijd en geld je kunt besparen.',
      button: 'Start 14 Dagen Gratis',
      note: 'Geen creditcard nodig • Annuleer wanneer je wilt',
    },
    footer: {
      product: 'Product',
      sectors: 'Sectoren',
      support: 'Support',
      helpCenter: 'Helpcentrum',
      contact: 'Contact',
      legal: 'Juridisch',
      privacy: 'Privacybeleid',
      terms: 'Algemene Voorwaarden',
      rights: 'Alle rechten voorbehouden.',
    },
  },
  en: {
    meta: {
      siteName: 'ADSPersoneelapp',
      defaultTitle: 'HR Software for SMB | Time Tracking & Personnel Management',
      defaultDescription: 'Save up to 40% on administration costs with our smart HR software. GPS time tracking, leave management and HR administration in one app.',
      keywords: ['time tracking', 'personnel management', 'hr software', 'leave management', 'gps tracking', 'smb'],
    },
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      sectors: 'Industries',
      cases: 'Case Studies',
      blog: 'Blog',
      contact: 'Contact',
      login: 'Login',
      startFree: 'Start Free',
    },
    hero: {
      title: 'Save up to 40% on HR Administration',
      subtitle: 'Smart time tracking with GPS verification, automated leave management and real-time insight into your personnel costs.',
      cta: 'Start 14-Day Free Trial',
      secondaryCta: 'Watch Demo',
      trustBadge: 'Trusted by 2,500+ companies',
    },
    benefits: {
      title: 'Why ADSPersoneelapp?',
      items: [
        { icon: '💰', title: 'Up to 40% Cost Savings', description: 'Automate your administration and save directly on personnel costs' },
        { icon: '⏱️', title: '8 Hours Saved Per Week', description: 'No more manual time registration, everything automated' },
        { icon: '📱', title: 'Works Everywhere', description: 'Mobile app for iOS and Android, works offline' },
      ],
    },
    features: {
      title: 'Everything You Need',
      items: [
        { icon: '⏰', title: 'GPS Time Tracking', description: 'Automatic location verification when clocking in and out' },
        { icon: '🏖️', title: 'Leave Management', description: 'Digital leave requests with automatic approval' },
        { icon: '🚗', title: 'Fleet Tracking', description: 'Integration with TomTom, Webfleet and more' },
        { icon: '📊', title: 'Reports', description: 'Real-time insight into personnel costs and hours' },
        { icon: '✅', title: 'Approval Workflow', description: 'Managers approve hours via the app' },
        { icon: '🔗', title: 'Integrations', description: 'Connection with payroll and accounting' },
      ],
    },
    industry: {
      title: 'Solutions By Industry',
      subtitle: 'Specific functionality for your sector',
      viewSolution: 'View solution',
      challengesTitle: 'Challenges',
      solutionTitle: 'Our Solution',
      benefitsTitle: 'Benefits',
      roiTitle: 'ROI Calculation',
      testimonialsTitle: 'What Customers Say',
      ctaTitle: 'Start Today',
      ctaSubtitle: 'Try 14 days free, no credit card required',
    },
    cta: {
      title: 'Ready to Save?',
      subtitle: 'Start today with ADSPersoneelapp and discover how much time and money you can save.',
      button: 'Start 14-Day Free Trial',
      note: 'No credit card required • Cancel anytime',
    },
    footer: {
      product: 'Product',
      sectors: 'Industries',
      support: 'Support',
      helpCenter: 'Help Center',
      contact: 'Contact',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      rights: 'All rights reserved.',
    },
  },
  de: {
    meta: {
      siteName: 'ADSPersoneelapp',
      defaultTitle: 'HR Software für KMU | Zeiterfassung & Personalverwaltung',
      defaultDescription: 'Sparen Sie bis zu 40% an Verwaltungskosten mit unserer intelligenten HR-Software. GPS-Zeiterfassung, Urlaubsverwaltung und HR-Administration in einer App.',
      keywords: ['zeiterfassung', 'personalverwaltung', 'hr software', 'urlaubsverwaltung', 'gps tracking', 'kmu'],
    },
    nav: {
      features: 'Funktionen',
      pricing: 'Preise',
      sectors: 'Branchen',
      cases: 'Kundenfälle',
      blog: 'Blog',
      contact: 'Kontakt',
      login: 'Anmelden',
      startFree: 'Kostenlos Starten',
    },
    hero: {
      title: 'Sparen Sie bis zu 40% bei der HR-Verwaltung',
      subtitle: 'Intelligente Zeiterfassung mit GPS-Verifizierung, automatisierte Urlaubsverwaltung und Echtzeit-Einblick in Ihre Personalkosten.',
      cta: '14 Tage Kostenlos Testen',
      secondaryCta: 'Demo Ansehen',
      trustBadge: 'Vertraut von 2.500+ Unternehmen',
    },
    benefits: {
      title: 'Warum ADSPersoneelapp?',
      items: [
        { icon: '💰', title: 'Bis zu 40% Kosteneinsparung', description: 'Automatisieren Sie Ihre Verwaltung und sparen Sie direkt Personalkosten' },
        { icon: '⏱️', title: '8 Stunden Pro Woche Gespart', description: 'Keine manuelle Zeiterfassung mehr, alles automatisch' },
        { icon: '📱', title: 'Funktioniert Überall', description: 'Mobile App für iOS und Android, funktioniert offline' },
      ],
    },
    features: {
      title: 'Alles Was Sie Brauchen',
      items: [
        { icon: '⏰', title: 'GPS-Zeiterfassung', description: 'Automatische Standortverifizierung beim Ein- und Ausstempeln' },
        { icon: '🏖️', title: 'Urlaubsverwaltung', description: 'Digitale Urlaubsanträge mit automatischer Genehmigung' },
        { icon: '🚗', title: 'Flottenmanagement', description: 'Integration mit TomTom, Webfleet und mehr' },
        { icon: '📊', title: 'Berichte', description: 'Echtzeit-Einblick in Personalkosten und Stunden' },
        { icon: '✅', title: 'Genehmigungsworkflow', description: 'Manager genehmigen Stunden über die App' },
        { icon: '🔗', title: 'Integrationen', description: 'Verbindung mit Lohnbuchhaltung und Buchhaltung' },
      ],
    },
    industry: {
      title: 'Lösungen Nach Branche',
      subtitle: 'Spezifische Funktionalität für Ihre Branche',
      viewSolution: 'Lösung ansehen',
      challengesTitle: 'Herausforderungen',
      solutionTitle: 'Unsere Lösung',
      benefitsTitle: 'Vorteile',
      roiTitle: 'ROI-Berechnung',
      testimonialsTitle: 'Was Kunden Sagen',
      ctaTitle: 'Heute Starten',
      ctaSubtitle: '14 Tage kostenlos testen, keine Kreditkarte erforderlich',
    },
    cta: {
      title: 'Bereit zu Sparen?',
      subtitle: 'Starten Sie heute mit ADSPersoneelapp und entdecken Sie, wie viel Zeit und Geld Sie sparen können.',
      button: '14 Tage Kostenlos Testen',
      note: 'Keine Kreditkarte erforderlich • Jederzeit kündbar',
    },
    footer: {
      product: 'Produkt',
      sectors: 'Branchen',
      support: 'Support',
      helpCenter: 'Hilfezentrum',
      contact: 'Kontakt',
      legal: 'Rechtliches',
      privacy: 'Datenschutz',
      terms: 'AGB',
      rights: 'Alle Rechte vorbehalten.',
    },
  },
  pl: {
    meta: {
      siteName: 'ADSPersoneelapp',
      defaultTitle: 'Oprogramowanie HR dla MŚP | Rejestracja Czasu i Zarządzanie Personelem',
      defaultDescription: 'Zaoszczędź do 40% na kosztach administracyjnych dzięki naszemu inteligentnemu oprogramowaniu HR. Rejestracja czasu GPS, zarządzanie urlopami i administracja HR w jednej aplikacji.',
      keywords: ['rejestracja czasu', 'zarządzanie personelem', 'oprogramowanie hr', 'zarządzanie urlopami', 'śledzenie gps', 'mśp'],
    },
    nav: {
      features: 'Funkcje',
      pricing: 'Cennik',
      sectors: 'Branże',
      cases: 'Case Studies',
      blog: 'Blog',
      contact: 'Kontakt',
      login: 'Zaloguj',
      startFree: 'Zacznij Za Darmo',
    },
    hero: {
      title: 'Zaoszczędź do 40% na Administracji HR',
      subtitle: 'Inteligentna rejestracja czasu z weryfikacją GPS, automatyczne zarządzanie urlopami i wgląd w czasie rzeczywistym w koszty personelu.',
      cta: 'Rozpocznij 14-Dniowy Bezpłatny Okres',
      secondaryCta: 'Zobacz Demo',
      trustBadge: 'Zaufało nam ponad 2500 firm',
    },
    benefits: {
      title: 'Dlaczego ADSPersoneelapp?',
      items: [
        { icon: '💰', title: 'Do 40% Oszczędności', description: 'Zautomatyzuj administrację i oszczędzaj na kosztach personelu' },
        { icon: '⏱️', title: '8 Godzin Tygodniowo Zaoszczędzonych', description: 'Koniec z ręczną rejestracją czasu, wszystko automatycznie' },
        { icon: '📱', title: 'Działa Wszędzie', description: 'Aplikacja mobilna na iOS i Android, działa offline' },
      ],
    },
    features: {
      title: 'Wszystko Czego Potrzebujesz',
      items: [
        { icon: '⏰', title: 'Rejestracja Czasu GPS', description: 'Automatyczna weryfikacja lokalizacji przy rozpoczęciu i zakończeniu pracy' },
        { icon: '🏖️', title: 'Zarządzanie Urlopami', description: 'Cyfrowe wnioski urlopowe z automatycznym zatwierdzaniem' },
        { icon: '🚗', title: 'Śledzenie Floty', description: 'Integracja z TomTom, Webfleet i innymi' },
        { icon: '📊', title: 'Raporty', description: 'Wgląd w czasie rzeczywistym w koszty personelu i godziny' },
        { icon: '✅', title: 'Workflow Zatwierdzeń', description: 'Menedżerowie zatwierdzają godziny przez aplikację' },
        { icon: '🔗', title: 'Integracje', description: 'Połączenie z systemem płac i księgowością' },
      ],
    },
    industry: {
      title: 'Rozwiązania Według Branży',
      subtitle: 'Specyficzna funkcjonalność dla Twojego sektora',
      viewSolution: 'Zobacz rozwiązanie',
      challengesTitle: 'Wyzwania',
      solutionTitle: 'Nasze Rozwiązanie',
      benefitsTitle: 'Korzyści',
      roiTitle: 'Kalkulacja ROI',
      testimonialsTitle: 'Co Mówią Klienci',
      ctaTitle: 'Zacznij Dzisiaj',
      ctaSubtitle: 'Wypróbuj 14 dni za darmo, karta kredytowa nie jest wymagana',
    },
    cta: {
      title: 'Gotowy na Oszczędności?',
      subtitle: 'Zacznij już dziś z ADSPersoneelapp i odkryj, ile czasu i pieniędzy możesz zaoszczędzić.',
      button: 'Rozpocznij 14-Dniowy Bezpłatny Okres',
      note: 'Karta kredytowa nie jest wymagana • Anuluj w dowolnym momencie',
    },
    footer: {
      product: 'Produkt',
      sectors: 'Branże',
      support: 'Wsparcie',
      helpCenter: 'Centrum Pomocy',
      contact: 'Kontakt',
      legal: 'Prawne',
      privacy: 'Polityka Prywatności',
      terms: 'Regulamin',
      rights: 'Wszelkie prawa zastrzeżone.',
    },
  },
  fr: {
    meta: {
      siteName: 'ADSPersoneelapp',
      defaultTitle: 'Logiciel RH pour PME | Suivi du Temps & Gestion du Personnel',
      defaultDescription: 'Économisez jusqu\'à 40% sur les coûts administratifs avec notre logiciel RH intelligent. Suivi du temps GPS, gestion des congés et administration RH en une seule application.',
      keywords: ['suivi du temps', 'gestion du personnel', 'logiciel rh', 'gestion des congés', 'suivi gps', 'pme'],
    },
    nav: {
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      sectors: 'Secteurs',
      cases: 'Études de Cas',
      blog: 'Blog',
      contact: 'Contact',
      login: 'Connexion',
      startFree: 'Essai Gratuit',
    },
    hero: {
      title: 'Économisez jusqu\'à 40% sur l\'Administration RH',
      subtitle: 'Suivi du temps intelligent avec vérification GPS, gestion automatisée des congés et aperçu en temps réel de vos coûts de personnel.',
      cta: 'Essai Gratuit de 14 Jours',
      secondaryCta: 'Voir la Démo',
      trustBadge: 'Fait confiance par plus de 2 500 entreprises',
    },
    benefits: {
      title: 'Pourquoi ADSPersoneelapp?',
      items: [
        { icon: '💰', title: 'Jusqu\'à 40% d\'Économies', description: 'Automatisez votre administration et économisez directement sur les coûts de personnel' },
        { icon: '⏱️', title: '8 Heures Économisées Par Semaine', description: 'Plus de saisie manuelle du temps, tout est automatisé' },
        { icon: '📱', title: 'Fonctionne Partout', description: 'Application mobile pour iOS et Android, fonctionne hors ligne' },
      ],
    },
    features: {
      title: 'Tout Ce Dont Vous Avez Besoin',
      items: [
        { icon: '⏰', title: 'Suivi du Temps GPS', description: 'Vérification automatique de la localisation lors du pointage' },
        { icon: '🏖️', title: 'Gestion des Congés', description: 'Demandes de congés numériques avec approbation automatique' },
        { icon: '🚗', title: 'Suivi de Flotte', description: 'Intégration avec TomTom, Webfleet et plus' },
        { icon: '📊', title: 'Rapports', description: 'Aperçu en temps réel des coûts de personnel et des heures' },
        { icon: '✅', title: 'Workflow d\'Approbation', description: 'Les managers approuvent les heures via l\'application' },
        { icon: '🔗', title: 'Intégrations', description: 'Connexion avec la paie et la comptabilité' },
      ],
    },
    industry: {
      title: 'Solutions Par Secteur',
      subtitle: 'Fonctionnalités spécifiques pour votre industrie',
      viewSolution: 'Voir la solution',
      challengesTitle: 'Défis',
      solutionTitle: 'Notre Solution',
      benefitsTitle: 'Avantages',
      roiTitle: 'Calcul du ROI',
      testimonialsTitle: 'Ce Que Disent Nos Clients',
      ctaTitle: 'Commencez Aujourd\'hui',
      ctaSubtitle: 'Essayez 14 jours gratuitement, pas de carte de crédit requise',
    },
    cta: {
      title: 'Prêt à Économiser?',
      subtitle: 'Commencez aujourd\'hui avec ADSPersoneelapp et découvrez combien de temps et d\'argent vous pouvez économiser.',
      button: 'Essai Gratuit de 14 Jours',
      note: 'Pas de carte de crédit requise • Annulez à tout moment',
    },
    footer: {
      product: 'Produit',
      sectors: 'Secteurs',
      support: 'Support',
      helpCenter: 'Centre d\'Aide',
      contact: 'Contact',
      legal: 'Mentions Légales',
      privacy: 'Politique de Confidentialité',
      terms: 'Conditions d\'Utilisation',
      rights: 'Tous droits réservés.',
    },
  },
};

export function getTranslation(locale: Locale): Translation {
  return translations[locale] || translations.nl;
}
