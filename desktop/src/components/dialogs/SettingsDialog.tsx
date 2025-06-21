import { ColorThemePicker } from "../ColorThemePicker";
import { ThemeToggle } from "../theme-toggle";
import { Settings, Palette, Database, DollarSign, Building, Receipt } from "lucide-preact";
import { usePOSTranslation } from "@/hooks/use-pos-translation";
import { useSettings } from "@/contexts/SettingsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "preact/hooks";
import { logger } from "@/lib/logger";

export default function SettingsDialog() {
  const { t } = usePOSTranslation();
  const { settings, updateSettings, isLoading, error } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update local settings when global settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  }, [settings]);

  const handleSettingChange = (key: string, value: any) => {
    if (!localSettings) return;

    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localSettings || !hasChanges) return;

    try {
      setSaving(true);

      // Find changed settings
      const changes: any = {};
      Object.keys(localSettings).forEach(key => {
        if (settings && localSettings[key as keyof typeof localSettings] !== settings[key as keyof typeof settings]) {
          changes[key] = localSettings[key as keyof typeof localSettings];
        }
      });

      if (Object.keys(changes).length > 0) {
        await updateSettings(changes);
        logger.info('Settings saved successfully', changes);
      }

      setHasChanges(false);
    } catch (err) {
      logger.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span class="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div class="text-center py-8 text-red-600">
        <p>Error cargando configuración: {error}</p>
        <Button variant="outline" class="mt-2" onClick={() => globalThis.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!localSettings) {
    return (
      <div class="text-center py-8 text-muted-foreground">
        <p>No se pudo cargar la configuración</p>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-2 pb-2 border-b">
        <Settings class="w-5 h-5 text-primary" />
        <h3 class="text-lg font-semibold">{t('dialogs:settings_detailed.system_settings')}</h3>
      </div>

      {/* Financial Settings */}
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <DollarSign class="w-4 h-4 text-primary" />
          <h4 class="font-medium">Configuración Financiera</h4>
        </div>

        <div class="pl-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium block mb-1">Tasa de Impuesto (%)</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={localSettings.taxRate}
                onInput={(e: any) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0)}
                class="w-full"
              />
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Moneda</label>
              <Select
                value={localSettings.currency}
                onValueChange={(value: string) => handleSettingChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="SVC">SVC - Colón Salvadoreño</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Building class="w-4 h-4 text-primary" />
          <h4 class="font-medium">Información de la Empresa</h4>
        </div>

        <div class="pl-6 space-y-4">
          <div>
            <label class="text-sm font-medium block mb-1">Nombre de la Empresa</label>
            <Input
              value={localSettings.companyName}
              onInput={(e: any) => handleSettingChange('companyName', e.target.value)}
              placeholder="Mi Farmacia"
              class="w-full"
            />
          </div>
          <div>
            <label class="text-sm font-medium block mb-1">Dirección</label>
            <Input
              value={localSettings.companyAddress}
              onInput={(e: any) => handleSettingChange('companyAddress', e.target.value)}
              placeholder="Dirección de la empresa"
              class="w-full"
            />
          </div>
          <div>
            <label class="text-sm font-medium block mb-1">Teléfono</label>
            <Input
              value={localSettings.companyPhone}
              onInput={(e: any) => handleSettingChange('companyPhone', e.target.value)}
              placeholder="Número de teléfono"
              class="w-full"
            />
          </div>
        </div>
      </div>

      {/* Receipt Settings */}
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Receipt class="w-4 h-4 text-primary" />
          <h4 class="font-medium">Configuración de Recibos</h4>
        </div>

        <div class="pl-6 space-y-4">
          <div>
            <label class="text-sm font-medium block mb-1">Pie de Recibo</label>
            <Input
              value={localSettings.receiptFooter}
              onInput={(e: any) => handleSettingChange('receiptFooter', e.target.value)}
              placeholder="Gracias por su compra"
              class="w-full"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium block mb-1">Cliente por Defecto</label>
              <Input
                value={localSettings.defaultCustomerName}
                onInput={(e: any) => handleSettingChange('defaultCustomerName', e.target.value)}
                placeholder="Cliente General"
                class="w-full"
              />
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Tipo de Cliente por Defecto</label>
              <Select
                value={localSettings.defaultCustomerType}
                onValueChange={(value: string) => handleSettingChange('defaultCustomerType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="partner">Socio</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
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

      {/* System Settings */}
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Database class="w-4 h-4 text-primary" />
          <h4 class="font-medium">Configuración del Sistema</h4>
        </div>

        <div class="pl-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium block mb-1">Alerta de Stock Bajo</label>
              <Input
                type="number"
                min="1"
                value={localSettings.lowStockAlert}
                onInput={(e: any) => handleSettingChange('lowStockAlert', parseInt(e.target.value) || 10)}
                class="w-full"
              />
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Tiempo de Sesión (minutos)</label>
              <Input
                type="number"
                min="60"
                max="1440"
                value={localSettings.sessionTimeout}
                onInput={(e: any) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 480)}
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div class="flex items-center justify-between pt-4 border-t">
          <p class="text-sm text-muted-foreground">
            Tienes cambios sin guardar
          </p>
          <div class="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              class="bg-primary hover:bg-primary-hover"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
