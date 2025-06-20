import { useState, useEffect } from 'preact/hooks';
import { getRenderStats } from '@/hooks/use-render-tracker';
import { useDebug } from '@/contexts/DebugContext';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Clock, Zap, AlertTriangle, BarChart3 } from 'lucide-preact';

interface PerformanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to safely handle numbers and prevent NaN
const safeNumber = (value: any, fallback: number = 0): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? fallback : num;
};

// Helper function to safely format numbers
const formatNumber = (value: any, decimals: number = 0): string => {
  const num = safeNumber(value);
  return num.toFixed(decimals);
};

// Helper function to safely calculate percentages (unused but kept for future use)
// const safePercentage = (value: any, total: any): number => {
//   const numValue = safeNumber(value);
//   const numTotal = safeNumber(total);
//   if (numTotal === 0) return 0;
//   return safeNumber((numValue / numTotal) * 100);
// };

export default function PerformanceDialog({ isOpen, onClose }: PerformanceDialogProps) {
  const { isRenderDebuggingActive, enableRenderDebugging } = useDebug();
  const [stats, setStats] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'renderCount' | 'lastRender' | 'name'>('renderCount');
  const [filter, setFilter] = useState<'all' | 'high' | 'recent'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Enable render debugging when dialog opens
  useEffect(() => {
    if (isOpen && !isRenderDebuggingActive) {
      enableRenderDebugging();
    }
  }, [isOpen, isRenderDebuggingActive, enableRenderDebugging]);

  // Update stats when dialog opens
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

  // No need for manual escape/click handling - Dialog component handles this

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

  // Filter and sort stats with NaN protection
  const filteredStats = stats
    .filter(stat => {
      const renderCount = safeNumber(stat?.renderCount);
      const lastRender = stat?.lastRender instanceof Date ? stat.lastRender : new Date();
      const timeSinceRender = safeNumber(Date.now() - lastRender.getTime());

      switch (filter) {
        case 'high':
          return renderCount > 5;
        case 'recent':
          return timeSinceRender < 10000; // Last 10 seconds
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const aValue = safeNumber(a?.[sortBy === 'lastRender' ? 'lastRender' : sortBy]);
      const bValue = safeNumber(b?.[sortBy === 'lastRender' ? 'lastRender' : sortBy]);

      switch (sortBy) {
        case 'renderCount': {
          return bValue - aValue;
        }
        case 'lastRender': {
          const aTime = a?.lastRender instanceof Date ? a.lastRender.getTime() : 0;
          const bTime = b?.lastRender instanceof Date ? b.lastRender.getTime() : 0;
          return safeNumber(bTime) - safeNumber(aTime);
        }
        case 'name': {
          const aName = String(a?.component || '');
          const bName = String(b?.component || '');
          return aName.localeCompare(bName);
        }
        default:
          return 0;
      }
    });

  // Calculate safe statistics
  const totalRenders = stats.reduce((sum, stat) => sum + safeNumber(stat?.renderCount), 0);
  const highRenderComponents = stats.filter(stat => safeNumber(stat?.renderCount) > 10).length;
  const averageRenders = stats.length > 0 ? safeNumber(totalRenders / stats.length) : 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Performance Inspector"
      size="xl"
    >
      <div className="space-y-6">
        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Component re-render monitoring and performance analysis
        </p>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{formatNumber(stats.length)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Components</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{formatNumber(totalRenders)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Renders</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">{formatNumber(averageRenders, 1)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Renders</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{formatNumber(highRenderComponents)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">High Count</div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* Top Row: Sort and Filter Options */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Sort:</span>
              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'renderCount' | 'lastRender' | 'name')}>
                <SelectTrigger size="sm" className="min-w-0 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="renderCount">Render Count</SelectItem>
                  <SelectItem value="lastRender">Last Render</SelectItem>
                  <SelectItem value="name">Component Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Filter:</span>
              <Select value={filter} onValueChange={(value: string) => setFilter(value as 'all' | 'high' | 'recent')}>
                <SelectTrigger size="sm" className="min-w-0 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Components</SelectItem>
                  <SelectItem value="high">High Renders (&gt;5)</SelectItem>
                  <SelectItem value="recent">Recent (10s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bottom Row: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Refresh Toggle */}
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              className="text-xs flex-shrink-0"
            >
              <Zap className="w-3 h-3 mr-1" />
              Auto
            </Button>

            {/* Manual Refresh */}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-xs flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>

            {/* Clear Stats */}
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="text-xs flex-shrink-0"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Stats Table */}
        <div className="overflow-auto max-h-80 border border-gray-200 dark:border-gray-700 rounded-lg">
          {filteredStats.length === 0 ? (
            <div className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.length === 0
                  ? "No render data yet. Interact with the app to see statistics."
                  : "No components match the current filter."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStats.map((stat, index) => {
                const renderCount = safeNumber(stat?.renderCount);
                const lastRender = stat?.lastRender instanceof Date ? stat.lastRender : new Date();
                const timeSinceLastRender = Math.round(safeNumber(Date.now() - lastRender.getTime()) / 1000);
                const isHighRender = renderCount > 10;
                const isMediumRender = renderCount > 5;
                const componentName = String(stat?.component || `Unknown-${index}`);

                return (
                  <div
                    key={`${componentName}-${index}`}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${isHighRender ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {componentName}
                          </h4>

                          {isHighRender && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                              <AlertTriangle className="w-2 h-2 mr-1" />
                              High
                            </Badge>
                          )}

                          {isMediumRender && !isHighRender && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                              Med
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <RefreshCw className="w-2 h-2 mr-1" />
                            {formatNumber(renderCount)}
                          </div>

                          <div className="flex items-center">
                            <Clock className="w-2 h-2 mr-1" />
                            {formatNumber(timeSinceLastRender)}s
                          </div>

                          <div className="truncate">
                            {lastRender.toLocaleTimeString()}
                          </div>
                        </div>

                        {stat?.reasons && Array.isArray(stat.reasons) && stat.reasons.length > 0 && (
                          <div className="mt-1">
                            <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                              <strong>Reasons:</strong> {stat.reasons.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-3 text-right">
                        <div className={`text-lg font-bold ${isHighRender ? 'text-red-600' :
                          isMediumRender ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                          {formatNumber(renderCount)}
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
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div>
            💡 Check browser console for detailed logs
          </div>
          <div>
            Auto-refresh: {autoRefresh ? '✅ On' : '❌ Off'}
          </div>
        </div>
      </div>
    </Dialog>
  );
} 
