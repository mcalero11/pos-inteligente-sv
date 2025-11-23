import { useTranslation } from 'react-i18next';

export default function MaintenanceScreen() {
  const { t } = useTranslation('states');

  return (
    <div class="h-screen bg-muted text-foreground flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="text-6xl">🔧</div>
        <h1 class="text-2xl font-bold">{t('maintenance.title')}</h1>
        <p class="text-muted-foreground">
          {t('maintenance.message')}
          <br />
          {t('maintenance.please_wait')}
        </p>
      </div>
    </div>
  );
} 
