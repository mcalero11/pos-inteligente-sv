# State Machine Implementation

This POS application implements a comprehensive state machine to handle different application states and provide graceful error handling.

## Application States

The application can be in one of the following states:

### 1. `INITIALIZING`

- **Purpose**: App is starting up and performing initial setup
- **UI**: Loading screen with "Iniciando POS..." message
- **Duration**: Brief, automatically transitions to LOADING or READY

### 2. `LOADING`

- **Purpose**: App is processing a request or performing an operation
- **UI**: Loading screen with "Cargando..." message
- **Duration**: Variable, depends on the operation

### 3. `READY`

- **Purpose**: Normal operation mode
- **UI**: Full POS interface is displayed and functional
- **User Actions**: All POS operations are available

### 4. `ERROR`

- **Purpose**: Recoverable error has occurred
- **UI**: Error dialog overlay on top of POS interface
- **User Actions**: Can retry, view logs, or dismiss error
- **Recovery**: User can continue using the app after addressing the error

### 5. `FATAL_ERROR`

- **Purpose**: Non-recoverable error has occurred
- **UI**: Error dialog with no background POS interface
- **User Actions**: View logs, restart application
- **Recovery**: Requires app restart

### 6. `MAINTENANCE`

- **Purpose**: System is under maintenance
- **UI**: Maintenance screen with 🔧 icon
- **User Actions**: Wait for maintenance to complete

### 7. `OFFLINE`

- **Purpose**: No network connectivity
- **UI**: Offline screen with 📶 icon and retry button
- **User Actions**: Check connection and retry

## Error Types

The system categorizes errors into different types for better handling:

- **NETWORK**: Connection or API-related errors
- **DATABASE**: Data storage/retrieval errors
- **AUTHENTICATION**: Login or permission errors
- **PERMISSION**: Access control errors
- **VALIDATION**: Data validation errors
- **UNKNOWN**: Unclassified errors
- **CRASH**: Application crashes or fatal system errors

## Key Features

### Global Error Handling

- Automatically catches unhandled JavaScript errors
- Catches unhandled promise rejections
- Logs all errors with context and stack traces

### Error Dialog

- Displays error information with appropriate icons and colors
- Shows error details and stack traces (in development)
- Provides actionable buttons:
  - **Ver Logs**: Opens the logs dialog
  - **Abrir Carpeta de Logs**: Opens log folder in system file explorer
  - **Reintentar**: Retries the failed operation (for recoverable errors)
  - **Cerrar**: Dismisses recoverable errors
  - **Reiniciar Aplicación**: Reloads the app (for fatal errors)

### Logging Integration

- All state transitions are logged
- Error details are automatically logged
- User actions in error dialogs are logged

## Usage

### Using the State Machine

```typescript
import { useAppState, ErrorType } from '@/contexts/AppStateContext';

function MyComponent() {
  const { state, error, handleError, handleFatalError, retry } = useAppState();

  // Handle a recoverable error
  const handleNetworkError = () => {
    handleError(
      new Error("Failed to connect to server"),
      ErrorType.NETWORK,
      true // recoverable
    );
  };

  // Handle a fatal error
  const handleCriticalError = () => {
    handleFatalError(
      new Error("Database corruption"),
      "Critical system failure detected"
    );
  };

  return (
    <div>
      <p>Current state: {state}</p>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### State Transitions

The state machine automatically handles transitions:

1. **App Start**: `INITIALIZING` → `LOADING` → `READY`
2. **Recoverable Error**: `READY` → `ERROR` → `READY` (after retry/dismiss)
3. **Fatal Error**: `READY` → `FATAL_ERROR` → `INITIALIZING` (after restart)
4. **Manual State Changes**: Use `setState()` for custom transitions

## Testing

The application includes a debug dialog accessible via the "Debug" button in the footer. This allows testing different error scenarios:

- **Network Error**: Simulates a recoverable network error
- **Validation Error**: Simulates a recoverable validation error  
- **Fatal Error**: Simulates a non-recoverable system error
- **Crash**: Triggers an unhandled exception to test global error handling

## Files Structure

```
src/
├── contexts/
│   └── AppStateContext.tsx          # State machine context and provider
├── components/
│   ├── App.tsx                      # Main app component with state routing
│   ├── LoadingScreen.tsx            # Loading state UI
│   ├── StateDemo.tsx                # Debug component for testing
│   └── dialogs/
│       └── ErrorDialog.tsx          # Error state UI
└── main.tsx                         # App entry point with providers
```

## Backend Integration

The state machine integrates with Tauri commands:

- **`open_log_folder`**: Opens the log directory in the system file explorer
- Automatically handles command failures and converts them to appropriate error states

## Best Practices

1. **Always use error types**: Categorize errors for better UX
2. **Make errors recoverable when possible**: Allow users to retry operations
3. **Provide context**: Include helpful error messages and details
4. **Log everything**: Use the integrated logging for debugging
5. **Test error scenarios**: Use the debug dialog to test error handling
6. **Handle edge cases**: Consider network failures, permissions, etc.

## Future Enhancements

Potential improvements to the state machine:

- Add loading progress indicators
- Implement automatic retry logic for network errors
- Add error reporting/telemetry
- Implement offline mode with data synchronization
- Add state persistence across app restarts
