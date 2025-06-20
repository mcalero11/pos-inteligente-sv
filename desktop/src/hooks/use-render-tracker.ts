import { useEffect, useRef } from 'preact/hooks';

interface RenderInfo {
  component: string;
  renderCount: number;
  lastRender: Date;
  props?: any;
  reasons?: string[];
}

// Global render tracking - only active when debugging is enabled
const renderStats = new Map<string, RenderInfo>();
let isDebuggingEnabled = import.meta.env.DEV; // Enable by default in development

// Function to enable/disable debugging
export function setRenderDebugging(enabled: boolean) {
  isDebuggingEnabled = enabled;
  if (!enabled) {
    renderStats.clear();
  }
}

export function useRenderTracker(componentName: string, props?: any) {
  // Early return if debugging is not enabled
  if (!isDebuggingEnabled) {
    return {
      renderCount: 0,
      timeSinceLastRender: 0,
      reasons: []
    };
  }
  const renderCount = useRef(0);
  const prevProps = useRef(props);
  const prevRenderTime = useRef(Date.now());

  renderCount.current += 1;
  const currentTime = Date.now();
  const timeSinceLastRender = currentTime - prevRenderTime.current;

  // Track render reasons
  const reasons: string[] = [];

  if (props && prevProps.current) {
    Object.keys(props).forEach(key => {
      if (props[key] !== prevProps.current[key]) {
        reasons.push(`${key} changed`);
      }
    });
  }

  // Update stats
  const statsInfo = {
    component: componentName,
    renderCount: renderCount.current,
    lastRender: new Date(),
    props,
    reasons
  };
  renderStats.set(componentName, statsInfo);

  // Debug log to verify tracking is working
  if (import.meta.env.DEV && renderCount.current && !isNaN(renderCount.current)) {
    globalThis.console.debug(`📊 Render tracked: ${componentName} (${renderCount.current} renders)`);
  }

  useEffect(() => {
    if (import.meta.env.DEV && renderCount.current > 5) { // Only log if more than 5 renders
      const logStyle = 'background: #ff6b6b; color: white; padding: 2px 5px; border-radius: 3px;';

      globalThis.console.group(`%c🔄 ${componentName} Render #${renderCount.current}`, logStyle);
      globalThis.console.log('⏱️ Time since last render:', `${timeSinceLastRender}ms`);

      if (reasons.length > 0) {
        globalThis.console.log('📝 Render reasons:', reasons);
      }

      if (props) {
        globalThis.console.log('📦 Props:', props);
      }

      if (renderCount.current > 10) {
        globalThis.console.warn(`⚠️ ${componentName} has rendered ${renderCount.current} times! Check for unnecessary re-renders.`);
      }

      globalThis.console.groupEnd();
    }

    prevProps.current = props;
    prevRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
    timeSinceLastRender,
    reasons
  };
}

// Hook to get all render stats
export function useRenderStats() {
  return Array.from(renderStats.values());
}

// Function to get render stats directly (not a hook)
export function getRenderStats() {
  return Array.from(renderStats.values());
}

// Debug function to log current render stats
export function logRenderStats() {
  const stats = getRenderStats();
  globalThis.console.log('📊 Current Render Stats:', stats);
  globalThis.console.log('📈 Total components tracked:', stats.length);
  globalThis.console.log('🔥 High render components:', stats.filter(s => s.renderCount > 5));
  return stats;
}

// Make it available globally for debugging
if (import.meta.env.DEV) {
  (globalThis as any).logRenderStats = logRenderStats;
  (globalThis as any).getRenderStats = getRenderStats;
}

// Hook to detect expensive renders
export function usePerformanceTracker(componentName: string, threshold = 16) {
  // Early return if debugging is not enabled
  if (!isDebuggingEnabled) {
    return;
  }

  const startTime = useRef(Date.now());

  useEffect(() => {
    const endTime = Date.now();
    const renderTime = endTime - startTime.current;

    if (renderTime > threshold && import.meta.env.DEV) {
      globalThis.console.warn(
        `🐌 Slow render detected in ${componentName}: ${renderTime}ms (threshold: ${threshold}ms)`
      );
    }

    startTime.current = Date.now();
  });
}

// Hook to track prop changes
export function usePropChangeTracker<T extends Record<string, any>>(
  componentName: string,
  props: T
) {
  // Early return if debugging is not enabled
  if (!isDebuggingEnabled) {
    return;
  }

  const prevProps = useRef<T>(props);

  useEffect(() => {
    if (import.meta.env.DEV && prevProps.current) {
      const changedProps: string[] = [];
      const addedProps: string[] = [];
      const removedProps: string[] = [];

      // Check for changed and added props
      Object.keys(props).forEach(key => {
        if (!(key in prevProps.current)) {
          addedProps.push(key);
        } else if (props[key] !== prevProps.current[key]) {
          changedProps.push(key);
        }
      });

      // Check for removed props
      Object.keys(prevProps.current).forEach(key => {
        if (!(key in props)) {
          removedProps.push(key);
        }
      });

      if (changedProps.length > 0 || addedProps.length > 0 || removedProps.length > 0) {
        globalThis.console.group(`📊 ${componentName} Props Analysis`);

        if (changedProps.length > 0) {
          globalThis.console.log('🔄 Changed:', changedProps);
          changedProps.forEach(key => {
            globalThis.console.log(
              `  ${key}:`,
              'Old:', prevProps.current[key],
              'New:', props[key]
            );
          });
        }

        if (addedProps.length > 0) {
          globalThis.console.log('➕ Added:', addedProps);
        }

        if (removedProps.length > 0) {
          globalThis.console.log('➖ Removed:', removedProps);
        }

        globalThis.console.groupEnd();
      }
    }

    prevProps.current = props;
  });
} 
