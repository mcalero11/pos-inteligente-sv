import { FileText, Clock, Receipt, User } from "lucide-preact";
import { Button } from "@/components/ui/button";
import { usePOSTranslation } from "@/hooks/use-pos-translation";

interface EndOfDayDialogProps {
  onClose: () => void;
  onConfirm?: () => void;
  transactionCount?: number;
  dailyTotal?: number;
  sessionStart?: Date;
  cashierName?: string;
}

function EndOfDayDialog({
  onClose,
  onConfirm,
  transactionCount = 42,
  dailyTotal = 1250.75,
  sessionStart = new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  cashierName = "John Doe",
}: EndOfDayDialogProps) {
  const { t, formatCurrency } = usePOSTranslation();
  const currentTime = new Date();

  const handleConfirm = () => {
    // Placeholder function for end of day process
    // In a real app, this would call an API
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const sessionDurationHours = Math.floor(
    (currentTime.getTime() - sessionStart.getTime()) / (1000 * 60 * 60)
  );
  const sessionDurationMinutes = Math.floor(
    ((currentTime.getTime() - sessionStart.getTime()) % (1000 * 60 * 60)) /
    (1000 * 60)
  );

  return (
    <div class="space-y-4">
      <div class="text-center space-y-2">
        <p class="text-lg font-semibold">{t('dialogs:end_of_day.title')}</p>
        <div class="bg-primary-light dark:bg-primary-dark p-4 rounded-lg space-y-2">
          <div class="flex justify-between">
            <span class="flex items-center gap-2">
              <User class="w-4 h-4" />
              {t('dialogs:end_of_day.cashier')}
            </span>
            <span class="font-semibold">{cashierName}</span>
          </div>
          <div class="flex justify-between">
            <span class="flex items-center gap-2">
              <Receipt class="w-4 h-4" />
              {t('dialogs:end_of_day.total_transactions')}
            </span>
            <span class="font-semibold">{transactionCount}</span>
          </div>
          <div class="flex justify-between">
            <span>{t('dialogs:end_of_day.daily_total')}</span>
            <span class="font-semibold text-primary dark:text-primary">
              {formatCurrency(dailyTotal)}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="flex items-center gap-2">
              <Clock class="w-4 h-4" />
              {t('dialogs:end_of_day.session_duration')}
            </span>
            <span class="font-semibold">
              {sessionDurationHours}h {sessionDurationMinutes}m
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <p class="text-sm text-muted-foreground">
          {t('dialogs:end_of_day.generate_report')}
        </p>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" class="flex-1" onClick={onClose}>
          {t('common:buttons.cancel')}
        </Button>
        <Button
          class="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground dark:bg-primary dark:hover:bg-primary-hover dark:text-primary-foreground"
          onClick={handleConfirm}
        >
          <FileText class="w-4 h-4 mr-2" />
          {t('dialogs:end_of_day.generate_cardex')}
        </Button>
      </div>
    </div>
  );
}

export default EndOfDayDialog;
