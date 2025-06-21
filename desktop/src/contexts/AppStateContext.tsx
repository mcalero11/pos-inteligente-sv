import { createContext } from "preact";
import { useContext, useState, useEffect, useCallback, useMemo } from "preact/hooks";
import { ComponentChildren } from "preact";
import { logger } from "@/lib/logger";
import { useRenderTracker, setPerformanceTracking } from "@/hooks/use-render-tracker";
import { databaseService } from "@/lib/database";
import { settingsService } from "@/lib/settings-service";

/**
 * AppState is a state machine for the POS application.
 * It is used to track the state of the application, like loading, authenticated, etc.
 */
export enum AppState {
  INITIALIZING = 'initializing',
  LOADING = 'loading',

  // Organization Authentication States
  ORG_UNAUTHENTICATED = 'org_unauthenticated',     // Need org authentication
  ORG_AUTHENTICATING = 'org_authenticating',       // Validating org authentication

  // Cashier Authentication States  
  CASHIER_UNAUTHENTICATED = 'cashier_unauthenticated', // Need PIN
  CASHIER_AUTHENTICATING = 'cashier_authenticating',   // Validating PIN

  READY = 'ready',
  ERROR = 'error',
  FATAL_ERROR = 'fatal_error',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline'
}

/**
 * ErrorType is a type of error that can occur in the application.
 * It is used to track the type of error that occurred.
 */
export enum ErrorType {
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
  CRASH = 'crash'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: Date;
  recoverable: boolean;
  stack?: string;
}

export interface AppStateContextType {
  state: AppState;
  error: AppError | null;
  isLoading: boolean;

  // State transitions
  setState: (state: AppState) => void;
  setError: (error: AppError) => void;
  clearError: () => void;
  retry: () => void;

  // Error helpers
  handleError: (error: Error | string, type?: ErrorType, recoverable?: boolean) => void;
  handleFatalError: (error: Error | string, details?: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ComponentChildren;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, setState] = useState<AppState>(AppState.INITIALIZING);
  const [error, setErrorState] = useState<AppError | null>(null);

  const isLoading = state === AppState.INITIALIZING || state === AppState.LOADING;

  // Track renders for this critical context
  useRenderTracker('AppStateProvider', { state, error, isLoading });

  // Memoized functions to prevent infinite re-renders
  const setError = useCallback((newError: AppError) => {
    setErrorState(newError);
    setState(newError.recoverable ? AppState.ERROR : AppState.FATAL_ERROR);
    // Fire and forget logging to avoid blocking UI
    logger.error(`${newError.recoverable ? 'Recoverable' : 'Fatal'} error occurred`, {
      type: newError.type,
      message: newError.message,
      details: newError.details
    }).catch(globalThis.console.error);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
    setState(AppState.READY);
    // Fire and forget logging
    logger.info('Error cleared, returning to ready state').catch(globalThis.console.error);
  }, []);

  const handleError = useCallback((
    errorInput: Error | string,
    type: ErrorType = ErrorType.UNKNOWN,
    recoverable: boolean = true
  ) => {
    const message = typeof errorInput === 'string' ? errorInput : errorInput.message;
    const stack = typeof errorInput === 'string' ? undefined : errorInput.stack;

    const appError: AppError = {
      type,
      message,
      details: typeof errorInput === 'string' ? undefined : errorInput.toString(),
      timestamp: new Date(),
      recoverable,
      stack
    };

    setError(appError);
  }, [setError]);

  const handleFatalError = useCallback((errorInput: Error | string, details?: string) => {
    const message = typeof errorInput === 'string' ? errorInput : errorInput.message;
    const stack = typeof errorInput === 'string' ? undefined : errorInput.stack;

    const appError: AppError = {
      type: ErrorType.CRASH,
      message,
      details,
      timestamp: new Date(),
      recoverable: false,
      stack
    };

    setError(appError);
  }, [setError]);

  const initializeApp = useCallback(async () => {
    try {
      // Temporarily reduce performance tracking sensitivity during initialization
      setPerformanceTracking(false);

      setState(AppState.LOADING);
      logger.info('Initializing POS application').catch(globalThis.console.error);

      // Step 1: Initialize database
      logger.info('Connecting to database...').catch(globalThis.console.error);
      await databaseService.connect();

      // Allow UI to breathe
      await new Promise(resolve => globalThis.setTimeout(resolve, 50));

      // Step 2: Test basic database operations
      logger.info('Testing database operations...').catch(globalThis.console.error);
      const categories = await databaseService.getAllCategories();
      const users = await databaseService.getAllUsers();
      const settings = await databaseService.getAllSystemSettings();

      logger.info(`Database ready: ${categories.length} categories, ${users.length} users, ${settings.length} settings`).catch(globalThis.console.error);

      if (users.length === 0) {
        logger.warn('No users found - database seeder needs to be run').catch(globalThis.console.error);
      }

      // Allow UI to update
      await new Promise(resolve => globalThis.setTimeout(resolve, 50));

      // Step 3: Initialize settings service (loads and caches settings)
      logger.info('Loading application settings...').catch(globalThis.console.error);
      await settingsService.getSettings();

      // Final UI update delay
      await new Promise(resolve => globalThis.setTimeout(resolve, 100));

      // Step 4: Application ready
      setState(AppState.READY);
      logger.info('POS application ready').catch(globalThis.console.error);

      // Re-enable performance tracking after initialization
      globalThis.setTimeout(() => setPerformanceTracking(true), 1000);
    } catch (err) {
      logger.error('Failed to initialize application', err as Error).catch(globalThis.console.error);

      // Determine error type based on the error
      let errorType = ErrorType.UNKNOWN;
      if (err instanceof Error) {
        if (err.message.includes('database') || err.message.includes('Database')) {
          errorType = ErrorType.DATABASE;
        } else if (err.message.includes('network') || err.message.includes('connection')) {
          errorType = ErrorType.NETWORK;
        }
      }

      handleError(err as Error, errorType, true); // Mark as recoverable so user can retry
    }
  }, [handleFatalError, handleError]);

  const retry = useCallback(() => {
    if (error) {
      logger.info('Retrying after error', { errorType: error.type }).catch(globalThis.console.error);

      // For fatal errors, just clear the error and set to ready state
      // Don't reinitialize to avoid potential loops
      if (!error.recoverable) {
        setErrorState(null);
        setState(AppState.READY);
      } else {
        clearError();
      }
    }
  }, [error, clearError]);

  // Initialize app only once
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Global error handler with proper dependencies and loop prevention
  useEffect(() => {
    let errorCount = 0;
    const maxErrors = 3;
    let lastErrorTime = 0;

    const handleUnhandledError = (event: globalThis.ErrorEvent) => {
      const now = Date.now();

      // Prevent error loops by limiting frequency and count
      if (now - lastErrorTime < 1000) {
        errorCount++;
        if (errorCount > maxErrors) {
          globalThis.console.error('Too many errors, stopping error handling to prevent loop');
          return;
        }
      } else {
        errorCount = 1;
      }
      lastErrorTime = now;

      // Skip tooltip-related errors to prevent loops
      const errorMessage = event.error?.message || event.message || '';
      if (errorMessage.includes('getBoundingClientRect') || errorMessage.includes('tooltip')) {
        globalThis.console.warn('Skipping tooltip-related error to prevent loop:', errorMessage);
        return;
      }

      // Fire and forget logging to avoid blocking UI
      logger.error('Unhandled error caught by global handler', event.error).catch(globalThis.console.error);
      handleError(event.error || event.message, ErrorType.CRASH, true);
    };

    const handleUnhandledRejection = (event: globalThis.PromiseRejectionEvent) => {
      const now = Date.now();

      // Prevent error loops
      if (now - lastErrorTime < 1000) {
        errorCount++;
        if (errorCount > maxErrors) {
          globalThis.console.error('Too many promise rejections, stopping handling to prevent loop');
          return;
        }
      } else {
        errorCount = 1;
      }
      lastErrorTime = now;

      // Fire and forget logging to avoid blocking UI
      logger.error('Unhandled promise rejection', event.reason).catch(globalThis.console.error);
      handleError(event.reason || 'Unhandled promise rejection', ErrorType.UNKNOWN, true);
    };

    globalThis.window.addEventListener('error', handleUnhandledError);
    globalThis.window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      globalThis.window.removeEventListener('error', handleUnhandledError);
      globalThis.window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: AppStateContextType = useMemo(() => ({
    state,
    error,
    isLoading,
    setState,
    setError,
    clearError,
    retry,
    handleError,
    handleFatalError
  }), [state, error, isLoading, setError, clearError, retry, handleError, handleFatalError]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
} 
