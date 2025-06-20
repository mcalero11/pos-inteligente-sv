import { createContext } from "preact";
import { useContext, useState, useCallback } from "preact/hooks";
import { setRenderDebugging } from "@/hooks/use-render-tracker";

interface DebugContextType {
  isRenderDebuggingActive: boolean;
  enableRenderDebugging: () => void;
  disableRenderDebugging: () => void;
  loadWDYR: () => Promise<void>;
}

const DebugContext = createContext<DebugContextType | null>(null);

export function DebugProvider({ children }: { children: any }) {
  const [isRenderDebuggingActive, setIsRenderDebuggingActive] = useState(false);
  const [wdyrLoaded, setWdyrLoaded] = useState(false);

  const loadWDYR = useCallback(async () => {
    if (!wdyrLoaded && import.meta.env.DEV) {
      try {
        await import("@/lib/wdyr");
        setWdyrLoaded(true);
        globalThis.console.log("🔍 WDYR (Why Did You Render) loaded");
      } catch (error) {
        globalThis.console.error("Failed to load WDYR:", error);
      }
    }
  }, [wdyrLoaded]);

  const enableRenderDebugging = useCallback(async () => {
    if (!isRenderDebuggingActive) {
      await loadWDYR();
      setRenderDebugging(true);
      setIsRenderDebuggingActive(true);
      globalThis.console.log("🐛 Render debugging enabled");
    }
  }, [isRenderDebuggingActive, loadWDYR]);

  const disableRenderDebugging = useCallback(() => {
    if (isRenderDebuggingActive) {
      setRenderDebugging(false);
      setIsRenderDebuggingActive(false);
      globalThis.console.log("🐛 Render debugging disabled");
    }
  }, [isRenderDebuggingActive]);

  return (
    <DebugContext.Provider
      value={{
        isRenderDebuggingActive,
        enableRenderDebugging,
        disableRenderDebugging,
        loadWDYR,
      }}
    >
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error("useDebug must be used within a DebugProvider");
  }
  return context;
} 
