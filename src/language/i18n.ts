import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import de from './de.json';
import es from './es.json';
import zh from './zh.json';
import jp from './jp.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            de: { translation: de },
            es: { translation: es },
            zh: { translation: zh },
            jp: { translation: jp },
        },
        lng: 'de',
        fallbackLng: 'de',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
