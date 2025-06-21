import { useTranslation } from 'react-i18next';

export function usePOSTranslation() {
  const { t, i18n } = useTranslation(['pos', 'common', 'errors', 'dialogs', 'states']);

  // Utility function for currency formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language || 'es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Utility function for date/time formatting
  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(i18n.language || 'es-SV', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(i18n.language || 'es-SV');
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(i18n.language || 'es-SV');
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
