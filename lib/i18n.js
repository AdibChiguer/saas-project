/**
 * Utilitaires de formatage multilingue
 */

export const formatCurrency = (amount, locale = 'fr-FR') => {
  const currencyMap = {
    'fr-FR': 'EUR',
    'nl-NL': 'EUR',
    'en-US': 'USD'
  };
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyMap[locale] || 'EUR',
  }).format(amount);
};

export const formatDate = (date, locale = 'fr-FR') => {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

export const getMessages = (locale) => {
  const messages = {
    fr: require('@/messages/fr.json'),
    en: require('@/messages/en.json'),
    nl: require('@/messages/nl.json')
  };
  return messages[locale] || messages.fr;
};
