import { useState, useEffect, useRef } from 'preact/hooks';
import { getRenderStats } from '@/hooks/use-render-tracker';
import { useDebug } from '@/contexts/DebugContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, RefreshCw, X, Clock, Zap, AlertTriangle } from 'lucide-preact';
import TestRenderComponent from './TestRenderComponent';

interface RenderStatsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RenderStatsWindow({ isOpen, onClose }: RenderStatsWindowProps) {
  const { isRenderDebuggingActive, enableRenderDebugging } = useDebug();
  const [stats, setStats] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'renderCount' | 'lastRender' | 'name'>('renderCount');
  const [filter, setFilter] = useState<'all' | 'high' | 'recent'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const modalRef = useRef<globalThis.HTMLDivElement>(null);

  // Enable render debugging when window opens
  useEffect(() => {
    if (isOpen && !isRenderDebuggingActive) {
      enableRenderDebugging();
    }
  }, [isOpen, isRenderDebuggingActive, enableRenderDebugging]);

  // Update stats when window opens
  useEffect(() => {
    if (isOpen) {
      setStats(getRenderStats());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoRefresh) {
      const interval = globalThis.setInterval(() => {
        setStats(getRenderStats());
      }, 1000);

      return () => globalThis.clearInterval(interval);
    }
  }, [isOpen, autoRefresh]);

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

  // Manual refresh
  const handleRefresh = () => {
    setStats(getRenderStats());
  };

  // Clear stats
  const handleClear = () => {
    globalThis.console.clear();
    globalThis.console.log('🧹 Render stats cleared');
    setStats([]);
  };

  if (!isOpen || !import.meta.env.DEV) {
    return null;
  }

  // Filter and sort stats
  const filteredStats = stats
    .filter(stat => {
      switch (filter) {
        case 'high':
          return stat.renderCount > 5;
        case 'recent':
          return Date.now() - stat.lastRender.getTime() < 10000; // Last 10 seconds
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'renderCount':
          return b.renderCount - a.renderCount;
        case 'lastRender':
          return b.lastRender.getTime() - a.lastRender.getTime();
        case 'name':
          return a.component.localeCompare(b.component);
        default:
          return 0;
      }
    });

  const totalRenders = stats.reduce((sum, stat) => sum + stat.renderCount, 0);
  const highRenderComponents = stats.filter(stat => stat.renderCount > 10).length;
  const averageRenders = stats.length > 0 ? Math.round(totalRenders / stats.length) : 0;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <BarChart3 class="w-6 h-6 text-purple-600" />
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Render Statistics
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Component re-render monitoring and performance analysis
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

        {/* Stats Summary */}
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-0 text-center">
              <div class="text-2xl font-bold text-blue-600">{stats.length}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Components Tracked</div>
            </div>
            <div class="flex-1 min-w-0 text-center">
              <div class="text-2xl font-bold text-green-600">{totalRenders}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Total Renders</div>
            </div>
            <div class="flex-1 min-w-0 text-center">
              <div class="text-2xl font-bold text-yellow-600">{averageRenders}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Average Renders</div>
            </div>
            <div class="flex-1 min-w-0 text-center">
              <div class="text-2xl font-bold text-red-600">{highRenderComponents}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">High Render Count</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              {/* Sort Options */}
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.currentTarget.value as any)}
                  class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                >
                  <option value="renderCount">Render Count</option>
                  <option value="lastRender">Last Render</option>
                  <option value="name">Component Name</option>
                </select>
              </div>

              {/* Filter Options */}
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.currentTarget.value as any)}
                  class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                >
                  <option value="all">All Components</option>
                  <option value="high">High Renders (&gt;5)</option>
                  <option value="recent">Recent (10s)</option>
                </select>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              {/* Auto Refresh Toggle */}
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                class="text-xs"
              >
                <Zap class="w-3 h-3 mr-1" />
                Auto Refresh
              </Button>

              {/* Manual Refresh */}
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                class="text-xs"
              >
                <RefreshCw class="w-3 h-3 mr-1" />
                Refresh
              </Button>

              {/* Clear Stats */}
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                class="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Test Component for Demo */}
        <div class="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <h3 class="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-200">
            Test Render Component (Auto-updating every 2s)
          </h3>
          <TestRenderComponent />
        </div>

        {/* Stats Table */}
        <div class="flex-1 overflow-auto max-h-96">
          {filteredStats.length === 0 ? (
            <div class="p-8 text-center">
              <BarChart3 class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">
                {stats.length === 0
                  ? "No render data yet. Interact with the app to see statistics."
                  : "No components match the current filter."
                }
              </p>
            </div>
          ) : (
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStats.map((stat) => {
                const timeSinceLastRender = Math.round((Date.now() - stat.lastRender.getTime()) / 1000);
                const isHighRender = stat.renderCount > 10;
                const isMediumRender = stat.renderCount > 5;

                return (
                  <div
                    key={stat.component}
                    class={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${isHighRender ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3">
                          <h4 class="font-medium text-gray-900 dark:text-white truncate">
                            {stat.component}
                          </h4>

                          {isHighRender && (
                            <Badge class="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <AlertTriangle class="w-3 h-3 mr-1" />
                              High Renders
                            </Badge>
                          )}

                          {isMediumRender && !isHighRender && (
                            <Badge class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Medium
                            </Badge>
                          )}
                        </div>

                        <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div class="flex items-center">
                            <RefreshCw class="w-3 h-3 mr-1" />
                            {stat.renderCount} renders
                          </div>

                          <div class="flex items-center">
                            <Clock class="w-3 h-3 mr-1" />
                            {timeSinceLastRender}s ago
                          </div>

                          <div>
                            📅 {stat.lastRender.toLocaleTimeString()}
                          </div>
                        </div>

                        {stat.reasons && stat.reasons.length > 0 && (
                          <div class="mt-2">
                            <div class="text-xs text-gray-600 dark:text-gray-300">
                              <strong>Last render reasons:</strong> {stat.reasons.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div class="ml-4">
                        <div class={`text-2xl font-bold ${isHighRender ? 'text-red-600' :
                          isMediumRender ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                          {stat.renderCount}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>
              💡 Check browser console for detailed render logs and WDYR output
            </div>
            <div>
              Auto-refresh: {autoRefresh ? '✅ On' : '❌ Off'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
