import { usePOSTranslation } from "@/hooks/use-pos-translation";

export default function LogsDialog() {
  const { t } = usePOSTranslation();

  return (
    <div className="space-y-4">
      <p>{t('dialogs:logs.description')}</p>
      <div className="space-y-2">
        <div className="p-3 border rounded text-sm">
          <span className="font-medium">2024-01-15 10:30:25</span> - {t('dialogs:logs.sample_entries.0')}
        </div>
        <div className="p-3 border rounded text-sm">
          <span className="font-medium">2024-01-15 10:25:15</span> - {t('dialogs:logs.sample_entries.1')}
        </div>
        <div className="p-3 border rounded text-sm">
          <span className="font-medium">2024-01-15 10:20:10</span> - {t('dialogs:logs.sample_entries.2')}
        </div>
      </div>
    </div>
  );
}
