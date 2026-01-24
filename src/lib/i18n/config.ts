/**
 * Internationalization Configuration
 * Multi-language support for SEO content
 */

export const locales = ['nl', 'en', 'de', 'pl', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'nl';

export const localeNames: Record<Locale, string> = {
  nl: 'Nederlands',
  en: 'English',
  de: 'Deutsch',
  pl: 'Polski',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  nl: '🇳🇱',
  en: '🇬🇧',
  de: '🇩🇪',
  pl: '🇵🇱',
  fr: '🇫🇷',
};

// Geographic targeting per locale
export const localeGeo: Record<Locale, { country: string; region: string; currency: string }> = {
  nl: { country: 'NL', region: 'Europe', currency: 'EUR' },
  en: { country: 'GB', region: 'Europe', currency: 'GBP' },
  de: { country: 'DE', region: 'Europe', currency: 'EUR' },
  pl: { country: 'PL', region: 'Europe', currency: 'PLN' },
  fr: { country: 'FR', region: 'Europe', currency: 'EUR' },
};

// Hreflang mapping for SEO
export const hreflangMap: Record<Locale, string> = {
  nl: 'nl-NL',
  en: 'en-GB',
  de: 'de-DE',
  pl: 'pl-PL',
  fr: 'fr-FR',
};

// Industries/Niches with translations
export const industries = [
  'bouw',
  'transport',
  'horeca',
  'zorg',
  'retail',
  'schoonmaak',
  'beveiliging',
  'logistiek',
  'productie',
  'techniek',
  'agrarisch',
  'uitzendbureau',
] as const;

export type Industry = (typeof industries)[number];

export const industryTranslations: Record<Industry, Record<Locale, { name: string; slug: string }>> = {
  bouw: {
    nl: { name: 'Bouw & Constructie', slug: 'bouw-constructie' },
    en: { name: 'Construction', slug: 'construction' },
    de: { name: 'Bauwesen', slug: 'bauwesen' },
    pl: { name: 'Budownictwo', slug: 'budownictwo' },
    fr: { name: 'Construction', slug: 'construction' },
  },
  transport: {
    nl: { name: 'Transport & Logistiek', slug: 'transport-logistiek' },
    en: { name: 'Transport & Logistics', slug: 'transport-logistics' },
    de: { name: 'Transport & Logistik', slug: 'transport-logistik' },
    pl: { name: 'Transport i Logistyka', slug: 'transport-logistyka' },
    fr: { name: 'Transport & Logistique', slug: 'transport-logistique' },
  },
  horeca: {
    nl: { name: 'Horeca & Catering', slug: 'horeca-catering' },
    en: { name: 'Hospitality & Catering', slug: 'hospitality-catering' },
    de: { name: 'Gastronomie & Hotellerie', slug: 'gastronomie-hotellerie' },
    pl: { name: 'Gastronomia i Hotelarstwo', slug: 'gastronomia-hotelarstwo' },
    fr: { name: 'Hôtellerie & Restauration', slug: 'hotellerie-restauration' },
  },
  zorg: {
    nl: { name: 'Zorg & Welzijn', slug: 'zorg-welzijn' },
    en: { name: 'Healthcare', slug: 'healthcare' },
    de: { name: 'Gesundheitswesen', slug: 'gesundheitswesen' },
    pl: { name: 'Opieka Zdrowotna', slug: 'opieka-zdrowotna' },
    fr: { name: 'Santé', slug: 'sante' },
  },
  retail: {
    nl: { name: 'Retail & Winkels', slug: 'retail-winkels' },
    en: { name: 'Retail', slug: 'retail' },
    de: { name: 'Einzelhandel', slug: 'einzelhandel' },
    pl: { name: 'Handel Detaliczny', slug: 'handel-detaliczny' },
    fr: { name: 'Commerce de Détail', slug: 'commerce-detail' },
  },
  schoonmaak: {
    nl: { name: 'Schoonmaak & Facilitair', slug: 'schoonmaak-facilitair' },
    en: { name: 'Cleaning Services', slug: 'cleaning-services' },
    de: { name: 'Reinigungsdienste', slug: 'reinigungsdienste' },
    pl: { name: 'Usługi Sprzątające', slug: 'uslugi-sprzatajace' },
    fr: { name: 'Services de Nettoyage', slug: 'services-nettoyage' },
  },
  beveiliging: {
    nl: { name: 'Beveiliging & Security', slug: 'beveiliging-security' },
    en: { name: 'Security Services', slug: 'security-services' },
    de: { name: 'Sicherheitsdienste', slug: 'sicherheitsdienste' },
    pl: { name: 'Usługi Ochrony', slug: 'uslugi-ochrony' },
    fr: { name: 'Services de Sécurité', slug: 'services-securite' },
  },
  logistiek: {
    nl: { name: 'Logistiek & Warehousing', slug: 'logistiek-warehousing' },
    en: { name: 'Logistics & Warehousing', slug: 'logistics-warehousing' },
    de: { name: 'Logistik & Lagerhaltung', slug: 'logistik-lagerhaltung' },
    pl: { name: 'Logistyka i Magazynowanie', slug: 'logistyka-magazynowanie' },
    fr: { name: 'Logistique & Entreposage', slug: 'logistique-entreposage' },
  },
  productie: {
    nl: { name: 'Productie & Industrie', slug: 'productie-industrie' },
    en: { name: 'Manufacturing', slug: 'manufacturing' },
    de: { name: 'Produktion & Industrie', slug: 'produktion-industrie' },
    pl: { name: 'Produkcja i Przemysł', slug: 'produkcja-przemysl' },
    fr: { name: 'Production & Industrie', slug: 'production-industrie' },
  },
  techniek: {
    nl: { name: 'Techniek & Installatie', slug: 'techniek-installatie' },
    en: { name: 'Technical Services', slug: 'technical-services' },
    de: { name: 'Technik & Installation', slug: 'technik-installation' },
    pl: { name: 'Usługi Techniczne', slug: 'uslugi-techniczne' },
    fr: { name: 'Services Techniques', slug: 'services-techniques' },
  },
  agrarisch: {
    nl: { name: 'Agrarisch & Groen', slug: 'agrarisch-groen' },
    en: { name: 'Agriculture', slug: 'agriculture' },
    de: { name: 'Landwirtschaft', slug: 'landwirtschaft' },
    pl: { name: 'Rolnictwo', slug: 'rolnictwo' },
    fr: { name: 'Agriculture', slug: 'agriculture' },
  },
  uitzendbureau: {
    nl: { name: 'Uitzendbureau & Flex', slug: 'uitzendbureau-flex' },
    en: { name: 'Staffing Agency', slug: 'staffing-agency' },
    de: { name: 'Zeitarbeit', slug: 'zeitarbeit' },
    pl: { name: 'Agencja Pracy', slug: 'agencja-pracy' },
    fr: { name: 'Agence d\'Intérim', slug: 'agence-interim' },
  },
};
