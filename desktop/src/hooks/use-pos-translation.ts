import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'preact/hooks';
import { settingsService } from '../lib/settings-service';
import { logger } from '../lib/logger';

export function usePOSTranslation() {
  const { t, i18n } = useTranslation(['pos', 'common', 'errors', 'dialogs', 'states']);
  const [currency, setCurrency] = useState<string>('USD'); // Default fallback

  // Load currency setting on mount and subscribe to changes
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const currentCurrency = await settingsService.getSetting('currency');
        setCurrency(currentCurrency);
      } catch (error) {
        logger.warn('Failed to load currency setting, using default:', error);
        setCurrency('USD');
      }
    };

    loadCurrency();

    // Subscribe to currency changes
    const unsubscribe = settingsService.subscribeToChanges((key, value) => {
      if (key === 'currency') {
        setCurrency(value as string);
      }
    });

    return unsubscribe;
  }, []);

  // Utility function for currency formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language || 'es-SV', {
      style: 'currency',
      currency: currency,
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
    currency,
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
