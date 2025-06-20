import { useState, useRef, useEffect } from 'preact/hooks';
import { useAppState, ErrorType, AppState } from '@/contexts/AppStateContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bug,
  Wifi,
  Database,
  Shield,
  AlertTriangle,
  XCircle,
  Bomb,
  Activity,
  RefreshCw,
  X,
  FolderOpen,
  FileText
} from 'lucide-preact';

interface DebugWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DebugWindow({ isOpen, onClose }: DebugWindowProps) {
  const { state, error, handleError, handleFatalError, retry, clearError } = useAppState();
  const [lastAction, setLastAction] = useState<string>('');
  const modalRef = useRef<globalThis.HTMLDivElement>(null);

  // Handle escape key and outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as globalThis.Node)) {
        onClose();
      }
    };

    globalThis.document.addEventListener('keydown', handleEscape);
    globalThis.document.addEventListener('mousedown', handleClickOutside);

    return () => {
      globalThis.document.removeEventListener('keydown', handleEscape);
      globalThis.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const logAction = (action: string) => {
    setLastAction(`${new Date().toLocaleTimeString()}: ${action}`);
  };

  const triggerNetworkError = async () => {
    logAction('Triggered Network Error');
    // Generate log entries for testing
    const { logger } = await import('@/lib/logger');
    await logger.error('Simulated network error for testing', new Error('Network connection failed'));
    await logger.warn('Network connectivity issues detected');

    handleError(
      new Error("Failed to connect to server - simulated network failure"),
      ErrorType.NETWORK,
      true
    );
  };

  const triggerDatabaseError = async () => {
    logAction('Triggered Database Error');
    // Generate log entries for testing
    const { logger } = await import('@/lib/logger');
    await logger.error('Simulated database error for testing', new Error('Database connection timeout'));
    await logger.info('Database connection attempt failed, retrying...');

    handleError(
      new Error("Database connection timeout - simulated DB failure"),
      ErrorType.DATABASE,
      true
    );
  };

  const triggerAuthError = () => {
    logAction('Triggered Authentication Error');
    handleError(
      new Error("Invalid credentials - simulated auth failure"),
      ErrorType.AUTHENTICATION,
      true
    );
  };

  const triggerValidationError = () => {
    logAction('Triggered Validation Error');
    handleError(
      "Invalid product barcode format - simulated validation error",
      ErrorType.VALIDATION,
      true
    );
  };

  const triggerFatalError = () => {
    logAction('Triggered Fatal Error');
    handleFatalError(
      new Error("Critical system failure - simulated fatal error"),
      "Database corruption detected, system integrity compromised"
    );
  };

  const simulateCrash = () => {
    logAction('Simulated Application Crash');
    // This will be caught by the global error handler
    throw new Error("Simulated unhandled application crash for testing");
  };

  const handleRetry = () => {
    logAction('Clicked Retry');
    retry();
  };

  const handleClearError = () => {
    logAction('Cleared Error');
    clearError();
  };

  // Open log folder using Tauri command
  const openLogFolder = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_log_folder');
      logAction('Opened Log Folder');
    } catch (error) {
      globalThis.console.error('Failed to open log folder:', error);
      logAction('Failed to Open Log Folder');
    }
  };

  // View logs in browser console
  const viewLogs = () => {
    globalThis.console.log('📋 Recent application logs:');
    globalThis.console.log('Use browser developer tools to view detailed logs');
    logAction('Viewed Logs in Console');
  };

  // Generate test logs
  const generateTestLogs = async () => {
    try {
      const { logger } = await import('@/lib/logger');
      const { invoke } = await import('@tauri-apps/api/core');

      // Generate frontend logs
      await logger.trace('Test TRACE level log from debug window');
      await logger.debug('Test DEBUG level log from debug window');
      await logger.info('Test INFO level log from debug window');
      await logger.warn('Test WARNING level log from debug window');
      await logger.error('Test ERROR level log from debug window', new Error('Test error for logging'));

      // Generate logs with data
      await logger.info('Test log with data', {
        timestamp: new Date().toISOString(),
        testValue: 42,
        environment: 'development',
        action: 'test-log-generation'
      });

      // Generate user action logs
      await logger.logUserAction('Debug test action', {
        component: 'debug-window',
        action: 'generate-test-logs'
      });

      // Generate performance logs
      await logger.logPerformance('Test operation', 150);

      // Generate multiple rapid logs to ensure file writing
      for (let i = 1; i <= 5; i++) {
        await logger.info(`Rapid test log batch ${i}`, {
          iteration: i,
          batch: 'test-generation',
          timestamp: Date.now()
        });
      }

      // Generate backend logs using the new command
      await invoke('generate_test_logs');

      logAction('Generated Test Logs Successfully');
      globalThis.console.log('✅ Test logs generated successfully');
    } catch (error) {
      globalThis.console.error('Failed to generate test logs:', error);
      logAction('Failed to Generate Test Logs');
    }
  };

  const getStateColor = (currentState: AppState) => {
    switch (currentState) {
      case AppState.READY:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case AppState.LOADING:
      case AppState.INITIALIZING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case AppState.ERROR:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case AppState.FATAL_ERROR:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case AppState.OFFLINE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case AppState.MAINTENANCE:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!isOpen || !import.meta.env.DEV) {
    return null;
  }

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <Bug class="w-6 h-6 text-blue-600" />
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Debug Console
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  State machine testing and error simulation
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              class="h-8 w-8 p-0"
            >
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div class="flex-1 overflow-y-auto">
          {/* Current State */}
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Current Application State
                </h3>
                <Badge class={getStateColor(state)}>
                  <Activity class="w-3 h-3 mr-1" />
                  {state.toUpperCase()}
                </Badge>
              </div>

              {error && (
                <div class="text-right">
                  <div class="text-sm font-medium text-red-600 dark:text-red-400">
                    Active Error
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {error.type} - {error.recoverable ? 'Recoverable' : 'Fatal'}
                  </div>
                </div>
              )}
            </div>

            {lastAction && (
              <div class="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
                <strong>Last Action:</strong> {lastAction}
              </div>
            )}
          </div>

          {/* Error Simulation */}
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Error Simulation (Recoverable)
            </h3>

            <div class="flex flex-wrap gap-3 [&_button]:!ml-0">
              <div class="flex-1 min-w-0">
                <button
                  onClick={triggerNetworkError}
                  class="flex items-center justify-start h-10 px-3 text-sm font-medium rounded-md border transition-colors w-full text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:bg-primary/10 dark:hover:bg-primary/20"
                >
                  <Wifi class="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Network Error</span>
                </button>
              </div>

              <div class="flex-1 min-w-0">
                <button
                  onClick={triggerDatabaseError}
                  class="flex items-center justify-start h-10 px-3 text-sm font-medium rounded-md border transition-colors w-full text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900"
                >
                  <Database class="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Database Error</span>
                </button>
              </div>

              <div class="flex-1 min-w-0">
                <button
                  onClick={triggerAuthError}
                  class="flex items-center justify-start h-10 px-3 text-sm font-medium rounded-md border transition-colors w-full text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900"
                >
                  <Shield class="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Auth Error</span>
                </button>
              </div>

              <div class="flex-1 min-w-0">
                <button
                  onClick={triggerValidationError}
                  class="flex items-center justify-start h-10 px-3 text-sm font-medium rounded-md border transition-colors w-full text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 dark:text-orange-400 dark:border-orange-800 dark:bg-orange-950 dark:hover:bg-orange-900"
                >
                  <AlertTriangle class="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Validation Error</span>
                </button>
              </div>
            </div>
          </div>

          {/* Fatal Error Simulation */}
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Fatal Error Simulation (Non-recoverable)
            </h3>

            <div class="flex flex-wrap gap-3 [&_button]:!ml-0">
              <div class="flex-1 min-w-0">
                <Button
                  onClick={triggerFatalError}
                  variant="destructive"
                  size="sm"
                  class="!justify-start h-10 font-medium w-full"
                >
                  <div class="flex items-center">
                    <XCircle class="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>System Failure</span>
                  </div>
                </Button>
              </div>

              <div class="flex-1 min-w-0">
                <Button
                  onClick={simulateCrash}
                  variant="destructive"
                  size="sm"
                  class="!justify-start h-10 font-medium w-full"
                >
                  <div class="flex items-center">
                    <Bomb class="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Unhandled Crash</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Log Access */}
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Log Access
            </h3>

            <div class="flex flex-wrap gap-3 mb-3 [&_button]:!ml-0">
              <div class="flex-1 min-w-0">
                <button
                  onClick={viewLogs}
                  class="flex items-center justify-start h-10 px-3 text-sm font-medium rounded-md border transition-colors w-full text-violet-600 border-violet-200 bg-violet-50 hover:bg-violet-100 hover:text-violet-700 dark:text-violet-400 dark:border-violet-800 dark:bg-violet-950 dark:hover:bg-violet-900"
                >
                  <FileText class="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>View Logs</span>
                </button>
              </div>

              <div class="flex-1 min-w-0">
                <button
                  onClick={openLogFolder}
                  class="flex items-center justify-start h-10 px-3 text-sm font-medium rounded-md border transition-colors w-full text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-400 dark:border-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-900"
                >
                  <FolderOpen class="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Abrir carpeta de logs</span>
                </button>
              </div>
            </div>

            <div class="flex gap-3">
              <div class="flex-1">
                <button
                  onClick={generateTestLogs}
                  class="flex items-center justify-start h-10 px-3 text-sm font-medium rounded-md border transition-colors w-full text-muted-foreground border-border bg-muted/50 hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:border-border dark:bg-muted/30 dark:hover:bg-muted/60"
                >
                  <Activity class="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Generar logs de prueba</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Recovery */}
          {error && (
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Error Recovery Actions
              </h3>

              <div class="space-y-2">
                <div class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Error:</strong> {error.message}
                </div>

                {error.details && (
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Details:</strong> {error.details}
                  </div>
                )}

                <div class="flex space-x-2 mt-3">
                  {error.recoverable && (
                    <>
                      <Button
                        onClick={handleRetry}
                        size="sm"
                        class="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <RefreshCw class="w-3 h-3 mr-1" />
                        Retry
                      </Button>

                      <Button
                        onClick={handleClearError}
                        variant="outline"
                        size="sm"
                      >
                        Clear Error
                      </Button>
                    </>
                  )}

                  {!error.recoverable && (
                    <Button
                      onClick={() => globalThis.window?.location?.reload()}
                      variant="destructive"
                      size="sm"
                    >
                      <RefreshCw class="w-3 h-3 mr-1" />
                      Restart App
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Testing Instructions
          </h3>
          <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Recoverable errors</strong> show dialog overlay on POS interface</li>
            <li>• <strong>Fatal errors</strong> block the entire application</li>
            <li>• <strong>Unhandled crashes</strong> are caught by global error handler</li>
            <li>• <strong>Escape key</strong> or click outside to close this window</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
