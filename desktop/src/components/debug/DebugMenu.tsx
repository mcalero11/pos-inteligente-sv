import { useRef, useEffect } from 'preact/hooks';
import { Button } from '@/components/ui/button';
import { Bug, BarChart3, Monitor, X } from 'lucide-preact';

interface DebugMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDebugWindow: () => void;
  onOpenRenderStats: () => void;
}

export default function DebugMenu({
  isOpen,
  onClose,
  onOpenDebugWindow,
  onOpenRenderStats
}: DebugMenuProps) {
  const menuRef = useRef<globalThis.HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as globalThis.Node)) {
        onClose();
      }
    };

    if (isOpen) {
      globalThis.document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      globalThis.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      globalThis.document.addEventListener('keydown', handleEscape);
    }

    return () => {
      globalThis.document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      class="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
    >
      {/* Header */}
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <Bug class="w-4 h-4 text-blue-600" />
            <h3 class="font-semibold text-gray-900 dark:text-white">Debug Tools</h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            class="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Development debugging utilities
        </p>
      </div>

      {/* Menu Items */}
      <div class="py-2">
        <button
          onClick={() => {
            onOpenDebugWindow();
            onClose();
          }}
          class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <Monitor class="w-5 h-5 text-green-600" />
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                Debug Window
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Open state machine testing tools in new window
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            onOpenRenderStats();
            onClose();
          }}
          class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <BarChart3 class="w-5 h-5 text-purple-600" />
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                Render Statistics
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Monitor component re-renders and performance
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          💡 These tools are only available in development mode
        </div>
      </div>
    </div>
  );
}
