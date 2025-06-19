import { ColorThemePicker } from "../ColorThemePicker";
import { ThemeToggle } from "../theme-toggle";
import { Settings, Palette, Volume2, Database } from "lucide-preact";

export default function SettingsDialog() {
  return (
    <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b">
        <Settings class="w-5 h-5 text-primary" />
        <h3 class="text-lg font-semibold">System Settings</h3>
      </div>

      {/* Theme Settings */}
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Palette class="w-4 h-4 text-primary" />
          <h4 class="font-medium">Appearance</h4>
        </div>

        <div class="pl-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium">Dark Mode</label>
              <p class="text-xs text-muted-foreground">
                Toggle between light and dark themes
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
          <h4 class="font-medium">Audio</h4>
        </div>

        <div class="pl-6 space-y-3">
          <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <span class="text-sm font-medium">Sound Effects</span>
              <p class="text-xs text-muted-foreground">
                Play sounds for button clicks and notifications
              </p>
            </div>
            <input type="checkbox" class="w-4 h-4" />
          </div>
          <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <span class="text-sm font-medium">Transaction Sounds</span>
              <p class="text-xs text-muted-foreground">
                Play sounds when completing transactions
              </p>
            </div>
            <input type="checkbox" class="w-4 h-4" />
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Database class="w-4 h-4 text-primary" />
          <h4 class="font-medium">Data</h4>
        </div>

        <div class="pl-6 space-y-3">
          <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <span class="text-sm font-medium">Auto Backup</span>
              <p class="text-xs text-muted-foreground">
                Automatically backup data every hour
              </p>
            </div>
            <input type="checkbox" class="w-4 h-4" defaultChecked />
          </div>
          <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <span class="text-sm font-medium">Cloud Sync</span>
              <p class="text-xs text-muted-foreground">
                Sync data with cloud storage
              </p>
            </div>
            <input type="checkbox" class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
