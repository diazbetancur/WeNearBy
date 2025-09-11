import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { useEffect, useState } from 'react';

import en from '../locales/en.json';
import es from '../locales/es.json';

const deviceLocale = Localization.getLocales()[0]?.languageCode || 'es';
const i18n = new I18n({ en, es });
i18n.enableFallback = true;
i18n.locale = deviceLocale;

export function useTranslation() {
  const [locale, setLocale] = useState(i18n.locale);

  useEffect(() => {
    i18n.locale = locale;
  }, [locale]);

  return {
    t: i18n.translate.bind(i18n),
    locale,
    setLocale
  };
}
