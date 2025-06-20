import { useState, useEffect } from 'preact/hooks';
import { useRenderTracker } from '@/hooks/use-render-tracker';

export default function TestRenderComponent() {
  const [count, setCount] = useState(0);
  const [timestamp, setTimestamp] = useState(Date.now());

  // Track renders for this test component
  useRenderTracker('TestRenderComponent', { count, timestamp });

  // Auto-increment count every 2 seconds to trigger renders
  useEffect(() => {
    const interval = globalThis.setInterval(() => {
      setCount(c => c + 1);
      setTimestamp(Date.now());
    }, 2000);

    return () => globalThis.clearInterval(interval);
  }, []);

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-sm font-semibold mb-2">Test Render Component</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Count: {count} | Last update: {new Date(timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
} 
