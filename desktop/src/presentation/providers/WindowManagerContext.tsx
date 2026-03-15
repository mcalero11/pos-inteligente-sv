import { createContext } from "preact";
import {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "preact/hooks";
import { ComponentChildren } from "preact";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface SaleWindowInfo {
  label: string;
  saleNumber: number;
}

interface SaleWindowCreated {
  label: string;
  sale_number: number;
}

interface WindowManagerContextType {
  isMainWindow: boolean;
  windowLabel: string;
  saleNumber: number | null;
  activeChildWindows: SaleWindowInfo[];
  createSaleWindow: () => Promise<SaleWindowCreated | null>;
  hasActiveChildren: boolean;
}

const WindowManagerContext = createContext<
  WindowManagerContextType | undefined
>(undefined);

/**
 * Extract sale number from URL query parameter.
 * Child windows are created with ?sale=N in the URL.
 */
function getSaleNumberFromUrl(): number | null {
  const params = new URLSearchParams(window.location.search);
  const sale = params.get("sale");
  return sale ? parseInt(sale, 10) : null;
}

interface WindowManagerProviderProps {
  children: ComponentChildren;
}

export function WindowManagerProvider({
  children,
}: WindowManagerProviderProps) {
  const [currentWindowLabel, setCurrentWindowLabel] = useState<string>("main");
  const [activeChildWindows, setActiveChildWindows] = useState<
    SaleWindowInfo[]
  >([]);

  // Use refs to store unlisten functions to avoid cleanup race conditions
  const unlistenCreatedRef = useRef<(() => void) | null>(null);
  const unlistenDestroyedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Check if running in Tauri context
    if (typeof window === "undefined" || !window.__TAURI__) {
      console.warn("[WindowManager] Not running in Tauri context");
      return;
    }

    const current = getCurrentWindow();
    setCurrentWindowLabel(current.label);

    // Only main window manages child windows
    if (current.label !== "main") {
      return;
    }

    const setupListeners = async () => {
      try {
        // Listen for window creation events from backend
        unlistenCreatedRef.current = await current.listen<SaleWindowCreated>(
          "window-created",
          (event) => {
            const { label, sale_number } = event.payload;
            setActiveChildWindows((prev) => {
              // Avoid duplicates
              if (prev.some((w) => w.label === label)) {
                return prev;
              }
              return [...prev, { label, saleNumber: sale_number }];
            });
          }
        );

        // Listen for window destruction events from backend
        unlistenDestroyedRef.current = await current.listen<string>(
          "window-destroyed",
          (event) => {
            const destroyedLabel = event.payload;
            setActiveChildWindows((prev) =>
              prev.filter((w) => w.label !== destroyedLabel)
            );
          }
        );
      } catch (error) {
        console.error(
          "[WindowManager] Failed to setup event listeners:",
          error
        );
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      try {
        if (unlistenCreatedRef.current) {
          unlistenCreatedRef.current();
          unlistenCreatedRef.current = null;
        }
        if (unlistenDestroyedRef.current) {
          unlistenDestroyedRef.current();
          unlistenDestroyedRef.current = null;
        }
      } catch (error) {
        // Ignore cleanup errors during hot reload or app shutdown
        console.debug(
          "[WindowManager] Cleanup error (expected during hot reload):",
          error
        );
      }
    };
  }, []);

  const isMainWindow = currentWindowLabel === "main";

  // For child windows, get sale number from URL query parameter
  const saleNumber = isMainWindow ? null : getSaleNumberFromUrl();

  const createSaleWindow =
    useCallback(async (): Promise<SaleWindowCreated | null> => {
      try {
        // Backend handles counter, label generation, and window creation
        const result = await invoke<SaleWindowCreated>("create_sale_window");
        return result;
      } catch (error) {
        console.error("[WindowManager] Failed to create sale window:", error);
        return null;
      }
    }, []);

  const hasActiveChildren = activeChildWindows.length > 0;

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: WindowManagerContextType = useMemo(
    () => ({
      isMainWindow,
      windowLabel: currentWindowLabel,
      saleNumber,
      activeChildWindows,
      createSaleWindow,
      hasActiveChildren,
    }),
    [
      isMainWindow,
      currentWindowLabel,
      saleNumber,
      activeChildWindows,
      createSaleWindow,
      hasActiveChildren,
    ]
  );

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider"
    );
  }
  return context;
}
