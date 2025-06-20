import { useTranslation } from 'react-i18next';

export default function OfflineScreen() {
  const { t } = useTranslation('states');

  return (
    <div class="h-screen bg-muted text-foreground flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="text-6xl">📶</div>
        <h1 class="text-2xl font-bold">{t('offline.title')}</h1>
        <p class="text-muted-foreground">
          {t('offline.message')}
          <br />
          {t('offline.check_connection')}
        </p>
        <button
          class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => globalThis.window?.location?.reload()}
        >
          {t('offline.retry')}
        </button>
      </div>
    </div>
  );
} 
