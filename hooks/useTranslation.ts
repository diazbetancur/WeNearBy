import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { useEffect, useState } from 'react';

import en from '../locales/en.json';
import es from '../locales/es.json';

const deviceLocale = Localization.getLocales()[0]?.languageCode || 'es';
const i18n = new I18n({ en, es });
i18n.enableFallback = true;
i18n.locale = deviceLocale;

// Función personalizada para traducir con warnings
const translateWithWarning = (key: string, options?: any) => {
  const translation = i18n.translate(key, options);
  
  // Si la traducción retorna la key significa que no se encontró
  if (translation === key || translation.includes('[missing')) {
    console.warn(`🚨 Translation missing for key: "${key}" in locale: "${i18n.locale}"`);
    return `[Missing: ${key}]`;
  }
  
  return translation;
};

export function useTranslation() {
  const [locale, setLocale] = useState(i18n.locale);

  useEffect(() => {
    i18n.locale = locale;
  }, [locale]);

  return {
    t: translateWithWarning,
    locale,
    setLocale
  };
}
