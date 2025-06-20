import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Static imports for Spanish translations
import esCommon from './locales/es/common.json';
import esPos from './locales/es/pos.json';
import esErrors from './locales/es/errors.json';
import esDialogs from './locales/es/dialogs.json';
import esStates from './locales/es/states.json';

const resources = {
  'es-SV': {
    common: esCommon,
    pos: esPos,
    errors: esErrors,
    dialogs: esDialogs,
    states: esStates
  },
  // Fallback to same translations for general Spanish
  'es': {
    common: esCommon,
    pos: esPos,
    errors: esErrors,
    dialogs: esDialogs,
    states: esStates
  }
};

i18n
  .use(initReactI18next)
  .init({
    lng: 'es-SV', // Default to El Salvador Spanish
    fallbackLng: 'es',

    // Namespace configuration for POS domains
    ns: ['common', 'pos', 'errors', 'dialogs', 'states'],
    defaultNS: 'common',

    resources,

    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ',',
      format: (value, format, lng) => {
        if (format === 'currency') {
          return new Intl.NumberFormat(lng || 'es-SV', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
          }).format(value);
        }

        if (format === 'datetime') {
          return new Date(value).toLocaleString(lng || 'es-SV', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }

        if (format === 'date') {
          return new Date(value).toLocaleDateString(lng || 'es-SV');
        }

        if (format === 'time') {
          return new Date(value).toLocaleTimeString(lng || 'es-SV');
        }

        return value;
      }
    },

    // Development configuration
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng, ns, key) => {
      if (import.meta.env.DEV) {
        globalThis.console?.warn(`🌐 Missing translation: ${lng}.${ns}.${key}`);
      }
    },

    // POS-specific configuration
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,

    // Debug mode in development
    debug: import.meta.env.DEV && false // Set to true to enable debug logs
  });

export default i18n; 
