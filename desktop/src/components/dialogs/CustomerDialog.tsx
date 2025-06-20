import { usePOSTranslation } from "@/hooks/use-pos-translation";

export default function CustomerDialog() {
  const { t } = usePOSTranslation();

  return (
    <div className="space-y-4">
      <p>{t('dialogs:customer.description')}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('dialogs:customer.add_customer')}</h3>
          <p className="text-sm text-muted-foreground">{t('dialogs:customer.add_description')}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('dialogs:customer.search_customers')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('dialogs:customer.search_description')}
          </p>
        </div>
      </div>
    </div>
  );
}
