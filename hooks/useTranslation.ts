import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { useEffect, useState } from 'react';

import en from '../locales/en.json';
import es from '../locales/es.json';

i18n.translations = { es, en };
i18n.fallbacks = true;

i18n.locale = Localization.locale || 'es';

export function useTranslation() {
  const [locale, setLocale] = useState(i18n.locale);

  useEffect(() => {
    i18n.locale = locale;
  }, [locale]);

  return {
    t: i18n.t,
    locale,
    setLocale
  };
}
