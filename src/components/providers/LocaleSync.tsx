"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function LocaleSync() {
  const { data: session } = useSession();
  const { setLocale } = useLocale();

  useEffect(() => {
    const preferred = session?.user?.locale;
    if (preferred) {
      const current = (typeof window !== 'undefined') ? localStorage.getItem('locale') : null;
      if (current !== preferred) {
        setLocale(preferred);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  return null;
}
