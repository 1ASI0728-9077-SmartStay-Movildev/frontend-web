import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';
let locale = 'es';
try { if (['es', 'en'].includes(localStorage.getItem('smartstay.locale'))) locale = localStorage.getItem('smartstay.locale'); } catch { /* Use Spanish. */ }
export default createI18n({ legacy: false, locale, fallbackLocale: 'es', messages: { en, es } });
