import { usePOSTranslation } from "@/hooks/use-pos-translation";

export default function UserDialog() {
  const { t } = usePOSTranslation();

  return (
    <div className="space-y-4">
      <p>{t('dialogs:system_menu.users.title')}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('common:buttons.add')} {t('common:labels.cashier')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('dialogs:system_menu.users.description')}
          </p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">{t('dialogs:users.user_permissions')}</h3>
          <p className="text-sm text-muted-foreground">{t('dialogs:users.manage_roles')}</p>
        </div>
      </div>
    </div>
  );
}
