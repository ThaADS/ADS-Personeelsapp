'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'nl' | 'en' | 'de' | 'pl';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: { code: Locale; name: string; flag: string }[];
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const SUPPORTED_LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('nl');

  useEffect(() => {
    // Load locale from localStorage or cookie
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && SUPPORTED_LOCALES.some(l => l.code === savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    
    // Set cookie for server-side
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
    
    // Reload page to apply new locale
    window.location.reload();
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, locales: SUPPORTED_LOCALES }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
