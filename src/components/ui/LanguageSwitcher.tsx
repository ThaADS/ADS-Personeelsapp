'use client';

import { useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = locales.find(l => l.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span>{currentLocale?.flag}</span>
        <span className="hidden sm:inline">{currentLocale?.name}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {locales.map((localeOption) => (
                <button
                  key={localeOption.code}
                  onClick={() => {
                    setLocale(localeOption.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    locale === localeOption.code
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="mr-3">{localeOption.flag}</span>
                  <span>{localeOption.name}</span>
                  {locale === localeOption.code && (
                    <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
