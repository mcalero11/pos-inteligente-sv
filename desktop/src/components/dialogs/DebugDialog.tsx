import { useState } from 'preact/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppState, AppState, ErrorType } from '@/contexts/AppStateContext';
import { Bug, Zap, AlertTriangle, RefreshCw, Settings } from 'lucide-preact';

export default function DebugDialog() {
  const { state, error, setState, clearError, handleError, handleFatalError, retry } = useAppState();
  const [isLoading, setIsLoading] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  const handleStateChange = async (newState: AppState) => {
    globalThis.console.log(`🔄 Debug: handleStateChange called with ${newState}`);
    setIsLoading(true);
    try {
      // Clear any existing error first if changing to a non-error state
      if (error && newState !== AppState.ERROR && newState !== AppState.FATAL_ERROR) {
        globalThis.console.log('🔄 Debug: Clearing existing error');
        clearError();
      }

      // Simulate async operation
      globalThis.console.log('🔄 Debug: Starting async operation');
      await new Promise(resolve => globalThis.setTimeout(resolve, 500));

      // Set the new state
      globalThis.console.log(`🔄 Debug: Setting state to ${newState}`);
      setState(newState);

      // Log the state change for debugging
      globalThis.console.log(`🔄 Debug: State changed to ${newState.toUpperCase()}`);
    } catch (err) {
      globalThis.console.error('❌ Error during state change:', err);
    } finally {
      setIsLoading(false);
      globalThis.console.log('🔄 Debug: handleStateChange completed');
    }
  };

  const triggerError = (type: ErrorType, message: string, recoverable: boolean = true) => {
    handleError(new Error(message), type, recoverable);
  };

  const triggerFatalError = () => {
    handleFatalError('Simulated fatal crash', 'This is a test of the fatal error handling system');
  };

  const getStateColor = (currentState: AppState) => {
    switch (currentState) {
      case AppState.READY: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case AppState.LOADING: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case AppState.ERROR: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case AppState.FATAL_ERROR: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case AppState.MAINTENANCE: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case AppState.OFFLINE: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current State */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Application State</h3>
          <Badge className={getStateColor(state)}>
            {state.toUpperCase()}
          </Badge>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error.type.toUpperCase()}: {error.message}
                </p>
                {error.details && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {error.details}
                  </p>
                )}
                <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                  {error.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* State Controls */}
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">State Controls</h3>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => handleStateChange(AppState.READY)}
            variant={state === AppState.READY ? "default" : "outline"}
            size="sm"
            disabled={isLoading}
          >
            Ready
          </Button>
          <Button
            onClick={() => handleStateChange(AppState.LOADING)}
            variant={state === AppState.LOADING ? "default" : "outline"}
            size="sm"
            disabled={isLoading}
          >
            Loading
          </Button>
          <Button
            onClick={() => handleStateChange(AppState.MAINTENANCE)}
            variant={state === AppState.MAINTENANCE ? "default" : "outline"}
            size="sm"
            disabled={isLoading}
          >
            Maintenance
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              globalThis.console.log('🔄 Debug: Offline button clicked');
              handleStateChange(AppState.OFFLINE);
            }}
            variant={state === AppState.OFFLINE ? "default" : "outline"}
            size="sm"
            disabled={isLoading}
          >
            Offline
          </Button>
        </div>
      </Card>

      {/* Error Simulation */}
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Error Simulation</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => triggerError(ErrorType.NETWORK, 'Simulated network timeout')}
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Zap className="w-4 h-4 mr-2" />
              Network Error
            </Button>
            <Button
              onClick={() => triggerError(ErrorType.DATABASE, 'Database connection failed')}
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Settings className="w-4 h-4 mr-2" />
              Database Error
            </Button>
            <Button
              onClick={() => triggerError(ErrorType.AUTHENTICATION, 'Session expired')}
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Auth Error
            </Button>
            <Button
              onClick={() => triggerError(ErrorType.VALIDATION, 'Invalid input data')}
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Bug className="w-4 h-4 mr-2" />
              Validation Error
            </Button>
          </div>

          <div className="border-t pt-3">
            <Button
              onClick={triggerFatalError}
              variant="outline"
              size="sm"
              className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Trigger Fatal Error
            </Button>
          </div>
        </div>
      </Card>

      {/* Recovery Actions */}
      {error && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Recovery Actions</h3>
          <div className="flex space-x-3">
            <Button
              onClick={retry}
              variant="default"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button
              onClick={() => handleStateChange(AppState.READY)}
              variant="outline"
              size="sm"
            >
              Force Ready
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 
