import { ColorThemePicker } from "../ColorThemePicker";
import { ThemeToggle } from "../theme-toggle";
import { Settings, Palette, Volume2, Database } from "lucide-preact";
import { usePOSTranslation } from "@/hooks/use-pos-translation";

export default function SettingsDialog() {
  const { t } = usePOSTranslation();

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b">
        <Settings class="w-5 h-5 text-primary" />
        <h3 class="text-lg font-semibold">{t('dialogs:settings_detailed.system_settings')}</h3>
      </div>

      {/* Theme Settings */}
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Palette class="w-4 h-4 text-primary" />
          <h4 class="font-medium">{t('dialogs:settings_detailed.appearance')}</h4>
        </div>

        <div class="pl-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium">{t('dialogs:settings_detailed.dark_mode')}</label>
              <p class="text-xs text-muted-foreground">
                {t('dialogs:settings_detailed.dark_mode_description')}
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div class="pt-2">
            <ColorThemePicker />
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Volume2 class="w-4 h-4 text-primary" />
          <h4 class="font-medium">{t('dialogs:settings_detailed.audio')}</h4>
        </div>

        <div class="pl-6 space-y-3">
          <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <span class="text-sm font-medium">{t('dialogs:settings_detailed.sound_effects')}</span>
              <p class="text-xs text-muted-foreground">
                {t('dialogs:settings_detailed.sound_effects_description')}
              </p>
            </div>
            <input type="checkbox" class="w-4 h-4" />
          </div>
          <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <span class="text-sm font-medium">{t('dialogs:settings_detailed.transaction_sounds')}</span>
              <p class="text-xs text-muted-foreground">
                {t('dialogs:settings_detailed.transaction_sounds_description')}
              </p>
            </div>
            <input type="checkbox" class="w-4 h-4" />
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Database class="w-4 h-4 text-primary" />
          <h4 class="font-medium">{t('dialogs:settings_detailed.data')}</h4>
        </div>

        <div class="pl-6 space-y-3">
          <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <span class="text-sm font-medium">{t('dialogs:settings_detailed.auto_backup')}</span>
              <p class="text-xs text-muted-foreground">
                {t('dialogs:settings_detailed.auto_backup_description')}
              </p>
            </div>
            <input type="checkbox" class="w-4 h-4" defaultChecked />
          </div>
          <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <span class="text-sm font-medium">{t('dialogs:settings_detailed.cloud_sync')}</span>
              <p class="text-xs text-muted-foreground">
                {t('dialogs:settings_detailed.cloud_sync_description')}
              </p>
            </div>
            <input type="checkbox" class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
