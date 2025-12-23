"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function LocaleSync() {
  const { data: session } = useSession();
  const { setLocale } = useLocale();

  useEffect(() => {
    const preferred = (session?.user as unknown as { locale?: string })?.locale;
    if (preferred && (preferred === 'nl' || preferred === 'pl' || preferred === 'en' || preferred === 'de')) {
      const current = (typeof window !== 'undefined') ? localStorage.getItem('locale') : null;
      if (current !== preferred) {
        setLocale(preferred as 'nl' | 'pl' | 'en' | 'de');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  return null;
}
