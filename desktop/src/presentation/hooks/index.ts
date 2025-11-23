// Presentation layer hooks

// Dialog management
export { useDialog, type UseDialogReturn } from './use-dialog';

// Theme hooks
export { useTheme as useThemeHook } from './use-theme';

// Translation hooks
export { usePOSTranslation } from './use-pos-translation';

// Render performance tracking
export {
  useRenderTracker,
  usePerformanceTracker,
  usePropChangeTracker,
  useRenderStats,
  setPerformanceTracking,
  setRenderDebugging,
  getRenderStats,
  logRenderStats,
} from './use-render-tracker';
