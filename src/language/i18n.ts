import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import de from './de.json';
import vt from './vt.json';
import gr from './gr.json';
import jp from './jp.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            de: { translation: de },
            vt: { translation: vt },
            gr: { translation: gr },
            jp: { translation: jp },
        },
        lng: 'en', // Standard-Sprache
        fallbackLng: 'en', // Fallback-Sprache, falls ein Schlüssel fehlt
        interpolation: {
            escapeValue: false, // React schützt bereits vor XSS
        },
    });

export default i18n;
