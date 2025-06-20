import { usePOSTranslation } from "@/hooks/use-pos-translation";

export default function HelpDialog() {
  const { t } = usePOSTranslation();

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{t('dialogs:help_shortcuts.keyboard_shortcuts')}</h3>
      <div className="space-y-2">
        <div className="flex justify-between p-2 border rounded">
          <span>F6</span>
          <span>{t('dialogs:help_shortcuts.toggle_help')}</span>
        </div>
        <div className="flex justify-between p-2 border rounded">
          <span>F7</span>
          <span>{t('dialogs:help_shortcuts.customer_management')}</span>
        </div>
        <div className="flex justify-between p-2 border rounded">
          <span>Ctrl+I</span>
          <span>{t('dialogs:help_shortcuts.inventory')}</span>
        </div>
        <div className="flex justify-between p-2 border rounded">
          <span>Ctrl+S</span>
          <span>{t('dialogs:help_shortcuts.settings')}</span>
        </div>
      </div>
    </div>
  );
}
