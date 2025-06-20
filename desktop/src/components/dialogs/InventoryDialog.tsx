import { usePOSTranslation } from "@/hooks/use-pos-translation";

export default function InventoryDialog() {
  const { t } = usePOSTranslation();

  return (
    <div className="space-y-4">
      <p>{t('dialogs:inventory.title')}</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('dialogs:inventory.add_product')}</h3>
          <p className="text-sm text-muted-foreground">{t('dialogs:inventory.add_description')}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('dialogs:inventory.stock_management')}</h3>
          <p className="text-sm text-muted-foreground">{t('dialogs:inventory.stock_description')}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('pos:products.low_stock')}</h3>
          <p className="text-sm text-muted-foreground">{t('pos:products.search_placeholder')}</p>
        </div>
      </div>
    </div>
  );
}
