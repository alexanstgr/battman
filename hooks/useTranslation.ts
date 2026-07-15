import { useContext } from 'react';

import { LanguageContext } from '@/context/LanguageContext';
import { en } from '@/locales/en';
import { el } from '@/locales/el';

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  const language = ctx?.language ?? 'en';
  return language === 'el' ? el : en;
}
