import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import od from './locales/od.json';

const resources = {
  en: { translation: en },
  od: { translation: od },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('arise-lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
