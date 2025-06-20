# Debug System

The debug system provides comprehensive tools for testing and monitoring the POS application during development.

## Components

### DebugMenu

A contextual menu that appears when clicking the Debug button in the footer. Provides options to:

- Open Debug Window
- Open Render Statistics

### DebugWindow

A modal window for testing the state machine and error handling:

- **Error Simulation**: Test different error types (Network, Database, Auth, Validation)
- **Fatal Error Testing**: Test non-recoverable errors and crashes
- **State Monitoring**: View current application state and error details
- **Recovery Actions**: Test retry and error clearing functionality

### RenderStatsWindow

A comprehensive render monitoring tool that provides:

- **Real-time Statistics**: Component render counts, timing, and performance metrics
- **Filtering & Sorting**: View components by render count, recent activity, or name
- **Performance Warnings**: Visual indicators for components with high render counts
- **Auto-refresh**: Continuous monitoring with configurable refresh intervals
- **Detailed Information**: Render reasons, timestamps, and performance data

## Usage

1. **Access**: The Debug button only appears in development mode (`import.meta.env.DEV`)
2. **Click Debug**: Opens the contextual menu with available tools
3. **Select Tool**: Choose between Debug Window or Render Statistics
4. **Test & Monitor**: Use the tools to test error scenarios and monitor performance

## Features

### Debug Window Features

- Test all error types with realistic scenarios
- Monitor state transitions in real-time
- Test error recovery mechanisms
- Simulate application crashes safely
- View error details and recovery options

### Render Stats Features

- Track component re-renders with detailed reasons
- Performance monitoring with customizable thresholds
- Visual warnings for performance issues
- Sorting and filtering capabilities
- Auto-refresh for real-time monitoring
- Integration with Why Did You Render (WDYR)

## Development Only

Both tools are automatically disabled in production builds and only function when:

- `import.meta.env.DEV` is true
- The application is running in development mode

This ensures no debug tools are accidentally included in production builds.

## Integration

The debug system integrates with:

- **State Machine**: Direct access to state management functions
- **Error Handling**: Integration with global error handlers
- **Render Tracking**: Custom hooks for performance monitoring
- **WDYR**: Automatic detection of unnecessary re-renders
- **Logging System**: Access to application logs and log folder

## Best Practices

1. **Regular Monitoring**: Check render statistics periodically during development
2. **Error Testing**: Test all error scenarios before releases
3. **Performance Optimization**: Use render stats to identify optimization opportunities
4. **State Validation**: Verify state transitions work correctly under all conditions
