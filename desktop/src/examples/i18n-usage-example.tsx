// Example file showing how to use the i18n system in your POS application
import { useTranslation } from 'react-i18next';
import { usePOSTranslation } from '@/hooks/use-pos-translation';

// Example 1: Basic translation usage
function BasicExample() {
  const { t } = useTranslation('common');

  return (
    <div>
      <button>{t('buttons.save')}</button>
      <button>{t('buttons.cancel')}</button>
      <label>{t('labels.name')}</label>
    </div>
  );
}

// Example 2: Using multiple namespaces
function MultiNamespaceExample() {
  const { t } = useTranslation(['pos', 'common', 'dialogs']);

  return (
    <div>
      <h1>{t('dialogs:system_menu.title')}</h1>
      <p>{t('pos:cart.empty_message')}</p>
      <button>{t('common:buttons.close')}</button>
    </div>
  );
}

// Example 3: Using the custom POS hook
function POSTranslationExample() {
  const {
    t,
    formatCurrency,
    formatDateTime,
    getPaymentMethodLabel,
    getItemsCount
  } = usePOSTranslation();

  const total = 125.50;
  const itemCount = 3;
  const now = new Date();

  return (
    <div>
      <p>{getItemsCount(itemCount)}</p>
      <p>{t('common:labels.total')}: {formatCurrency(total)}</p>
      <p>{formatDateTime(now)}</p>
      <p>{getPaymentMethodLabel('cash')}</p>
    </div>
  );
}

// Example 4: Interpolation with variables
function InterpolationExample() {
  const { t } = useTranslation('pos');
  const customerName = "Juan Pérez";
  const sessionDuration = 45;

  return (
    <div>
      <p>{t('header.customer', { name: customerName })}</p>
      <p>{t('footer.session_time', { duration: sessionDuration })}</p>
    </div>
  );
}

// Example 5: Conditional translations
function ConditionalExample() {
  const { t } = useTranslation(['errors', 'common']);
  const hasError = true;
  const errorType = 'network';

  return (
    <div>
      {hasError && (
        <div>
          <h3>{t(`errors:titles.${errorType}`)}</h3>
          <button>{t('common:buttons.retry')}</button>
        </div>
      )}
    </div>
  );
}

// Example 6: Error handling with fallbacks
function ErrorHandlingExample() {
  const { t } = useTranslation('pos');

  return (
    <div>
      {/* If translation key doesn't exist, show fallback */}
      <p>{t('non_existent_key', { defaultValue: 'Fallback text' })}</p>

      {/* Or handle missing translations gracefully */}
      <p>{t('pos:cart.title', 'Carrito')}</p>
    </div>
  );
}

// Example 7: Currency and date formatting
function FormattingExample() {
  const { t } = useTranslation('common');

  const amount = 1250.75;
  const date = new Date();

  return (
    <div>
      {/* Currency formatting */}
      <p>{t('{{amount, currency}}', { amount })}</p>

      {/* Date formatting */}
      <p>{t('{{date, datetime}}', { date })}</p>
      <p>{t('{{date, date}}', { date })}</p>
      <p>{t('{{date, time}}', { date })}</p>
    </div>
  );
}

export {
  BasicExample,
  MultiNamespaceExample,
  POSTranslationExample,
  InterpolationExample,
  ConditionalExample,
  ErrorHandlingExample,
  FormattingExample
}; 
