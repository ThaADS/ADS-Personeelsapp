'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';

type Messages = Record<string, unknown>;

export function useTranslations() {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await import(`../../messages/${locale}.json`);
        setMessages(response.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to Dutch
        const fallback = await import(`../../messages/nl.json`);
        setMessages(fallback.default);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [locale]);

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: unknown = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : fallback || key;
  };

  return { t, isLoading, locale };
}
