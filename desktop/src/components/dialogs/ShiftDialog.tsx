import { usePOSTranslation } from "@/hooks/use-pos-translation";

export default function ShiftDialog() {
  const { t } = usePOSTranslation();

  return (
    <div className="space-y-4">
      <p>{t('dialogs:shift.description')}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('dialogs:shift.start_shift')}</h3>
          <p className="text-sm text-muted-foreground">{t('dialogs:shift.start_description')}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('dialogs:shift.end_shift')}</h3>
          <p className="text-sm text-muted-foreground">{t('dialogs:shift.end_description')}</p>
        </div>
      </div>
    </div>
  );
}
