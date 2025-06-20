import { useState, useEffect } from 'preact/hooks';
import { useRenderStats, useRenderTracker } from '@/hooks/use-render-tracker';
import { Button } from '@/components/ui/button';

export default function RenderStatsPanel() {
  useRenderTracker('RenderStatsPanel');
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    if (isVisible) {
      const interval = globalThis.setInterval(() => {
        setStats(useRenderStats());
      }, 1000);

      return () => globalThis.clearInterval(interval);
    }
  }, [isVisible]);

  if (!import.meta.env.DEV) {
    return null;
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      setStats(useRenderStats());
    }
  };

  const clearStats = () => {
    // Reset render counts (this would need to be implemented in the hook)
    globalThis.console.clear();
    globalThis.console.log('🧹 Render stats cleared');
  };

  return (
    <>
      {/* Toggle Button */}
      <div class="fixed top-4 right-4 z-50">
        <Button
          onClick={toggleVisibility}
          variant="outline"
          size="sm"
          class="bg-blue-600 text-white hover:bg-blue-700"
        >
          {isVisible ? '📊 Hide Stats' : '📊 Show Render Stats'}
        </Button>
      </div>

      {/* Stats Panel */}
      {isVisible && (
        <div class="fixed top-16 right-4 w-96 max-h-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-40 overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-gray-900 dark:text-white">🔄 Render Statistics</h3>
              <Button
                onClick={clearStats}
                variant="ghost"
                size="sm"
                class="text-xs"
              >
                🧹 Clear
              </Button>
            </div>
          </div>

          <div class="max-h-80 overflow-y-auto p-4">
            {stats.length === 0 ? (
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                No render data yet. Interact with the app to see statistics.
              </p>
            ) : (
              <div class="space-y-3">
                {stats
                  .sort((a, b) => b.renderCount - a.renderCount)
                  .map((stat) => (
                    <div
                      key={stat.component}
                      class="p-3 bg-gray-50 dark:bg-gray-700 rounded border"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-medium text-sm text-gray-900 dark:text-white">
                          {stat.component}
                        </h4>
                        <span
                          class={`px-2 py-1 text-xs rounded ${stat.renderCount > 10
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : stat.renderCount > 5
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                        >
                          {stat.renderCount} renders
                        </span>
                      </div>

                      <div class="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        <div>
                          📅 Last: {stat.lastRender.toLocaleTimeString()}
                        </div>

                        {stat.reasons && stat.reasons.length > 0 && (
                          <div>
                            📝 Reasons: {stat.reasons.join(', ')}
                          </div>
                        )}

                        {stat.renderCount > 10 && (
                          <div class="text-red-600 dark:text-red-400 font-medium">
                            ⚠️ High render count detected!
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div class="text-xs text-gray-600 dark:text-gray-400">
              💡 Check browser console for detailed render logs
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
