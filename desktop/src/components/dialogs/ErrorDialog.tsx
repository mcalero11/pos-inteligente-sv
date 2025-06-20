import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppState, ErrorType } from "@/contexts/AppStateContext";
import { invoke } from "@tauri-apps/api/core";
import { logger } from "@/lib/logger";
import { usePOSTranslation } from "@/hooks/use-pos-translation";

interface ErrorDialogProps {
  onClose?: () => void;
  openDialog?: (dialogType: string, props?: any) => void;
}

const getErrorIcon = (type: ErrorType): string => {
  switch (type) {
    case ErrorType.NETWORK:
      return "🌐";
    case ErrorType.DATABASE:
      return "💾";
    case ErrorType.AUTHENTICATION:
      return "🔐";
    case ErrorType.PERMISSION:
      return "⚠️";
    case ErrorType.VALIDATION:
      return "❌";
    case ErrorType.CRASH:
      return "💥";
    default:
      return "⚠️";
  }
};

const getErrorColor = (type: ErrorType): string => {
  switch (type) {
    case ErrorType.NETWORK:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case ErrorType.DATABASE:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case ErrorType.AUTHENTICATION:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case ErrorType.PERMISSION:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case ErrorType.VALIDATION:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case ErrorType.CRASH:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};



export default function ErrorDialog({ onClose, openDialog }: ErrorDialogProps) {
  const { error, retry, clearError } = useAppState();
  const { t, formatDateTime } = usePOSTranslation();

  if (!error) {
    return null;
  }

  const handleViewLogs = async () => {
    try {
      await logger.info('User requested to view logs from error dialog');

      if (openDialog) {
        openDialog('logs');
      }
    } catch (err) {
      await logger.error('Failed to open logs dialog', err as Error);
    }
  };

  const handleOpenLogFolder = async () => {
    try {
      await logger.info('User requested to open log folder');
      // Open the log folder in the system file explorer
      await invoke('open_log_folder');
    } catch (err) {
      await logger.error('Failed to open log folder', err as Error);
    }
  };

  const handleRetry = () => {
    logger.info('User clicked retry from error dialog');
    retry();
    if (onClose) {
      onClose();
    }
  };

  const handleDismiss = () => {
    if (error.recoverable) {
      clearError();
    }
    if (onClose) {
      onClose();
    }
  };

  const isFatal = !error.recoverable;

  return (
    <Dialog
      isOpen={true}
      onClose={isFatal ? undefined : handleDismiss}
      title={isFatal ? t('errors:titles.critical') : t('errors:titles.application')}
      size="lg"
    >
      <div class="space-y-6">
        {/* Error Header */}
        <div class="flex items-start space-x-4">
          <div class="text-4xl">{getErrorIcon(error.type)}</div>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <Badge class={getErrorColor(error.type)}>
                {error.type.toUpperCase()}
              </Badge>
              {isFatal && (
                <Badge class="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  {t('errors:titles.critical').toUpperCase()}
                </Badge>
              )}
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-1">
              {error.message}
            </h3>
            <p class="text-sm text-muted-foreground">
              {t('errors:occurred_at', { timestamp: formatDateTime(error.timestamp) })}
            </p>
          </div>
        </div>

        {/* Error Details */}
        {error.details && (
          <div class="bg-muted p-4 rounded-lg">
            <h4 class="font-medium text-foreground mb-2">{t('errors:details')}</h4>
            <p class="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
              {error.details}
            </p>
          </div>
        )}

        {/* Stack Trace (only in development) */}
        {error.stack && import.meta.env.DEV && (
          <div class="bg-muted p-4 rounded-lg">
            <h4 class="font-medium text-foreground mb-2">{t('errors:stack_trace')}</h4>
            <pre class="text-xs text-muted-foreground font-mono whitespace-pre-wrap overflow-x-auto">
              {error.stack}
            </pre>
          </div>
        )}

        {/* Help Text */}
        <div class="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
            {t('errors:help.what_can_do')}
          </h4>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            {error.recoverable ? (
              <>
                {(t('errors:help.recoverable_steps', { returnObjects: true }) as string[]).map((step: string, index: number) => (
                  <li key={index}>• {step}</li>
                ))}
              </>
            ) : (
              <>
                {(t('errors:help.fatal_steps', { returnObjects: true }) as string[]).map((step: string, index: number) => (
                  <li key={index}>• {step}</li>
                ))}
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div class="space-y-3">
          {/* First row - Log actions */}
          <div class="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleViewLogs}
              variant="outline"
              class="flex-1"
            >
              {t('errors:actions.view_logs')}
            </Button>

            <Button
              onClick={handleOpenLogFolder}
              variant="outline"
              class="flex-1"
            >
              {t('errors:actions.open_log_folder')}
            </Button>
          </div>

          {/* Second row - Main actions */}
          <div class="flex flex-col sm:flex-row gap-3">
            {error.recoverable && (
              <Button
                onClick={handleRetry}
                class="flex-1"
              >
                {t('errors:actions.try_again')}
              </Button>
            )}

            {error.recoverable ? (
              <Button
                onClick={handleDismiss}
                variant="outline"
                class="flex-1"
              >
                {t('errors:actions.dismiss')}
              </Button>
            ) : (
              <Button
                onClick={() => globalThis.window?.location?.reload()}
                class="flex-1 bg-red-600 hover:bg-red-700"
              >
                {t('errors:actions.restart_app')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
} 
