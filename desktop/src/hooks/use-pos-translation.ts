import { useTranslation } from 'react-i18next';

export function usePOSTranslation() {
  const { t, i18n } = useTranslation(['pos', 'common', 'errors', 'dialogs', 'states']);

  // Utility function for currency formatting
  const formatCurrency = (amount: number) => {
    return t('{{amount, currency}}', { amount });
  };

  // Utility function for date/time formatting
  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return t('{{date, datetime}}', { date: dateObj });
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return t('{{date, date}}', { date: dateObj });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return t('{{date, time}}', { date: dateObj });
  };

  // POS-specific translation helpers
  const getPaymentMethodLabel = (method: string) => {
    return t(`pos:payment.methods.${method}`, { defaultValue: method });
  };

  const getErrorTitle = (errorType: string) => {
    return t(`errors:titles.${errorType}`, { defaultValue: t('errors:titles.unknown') });
  };

  const getCustomerTypeLabel = (type: 'general' | 'partner' | 'vip') => {
    return t(`pos:header.${type}_customer`);
  };

  // Pluralization helper for items
  const getItemsCount = (count: number) => {
    return t('pos:cart.items_count', { count });
  };

  return {
    t,
    i18n,
    formatCurrency,
    formatDateTime,
    formatDate,
    formatTime,
    getPaymentMethodLabel,
    getErrorTitle,
    getCustomerTypeLabel,
    getItemsCount
  };
} 
