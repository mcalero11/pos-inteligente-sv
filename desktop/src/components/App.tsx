import { useAppState, AppState } from "@/contexts/AppStateContext";
import POS from "@/windows/POS";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { useRenderTracker, usePerformanceTracker } from "@/hooks/use-render-tracker";

export default function App() {
  const { state, error } = useAppState();


  // Track renders for the main App component
  useRenderTracker('App', { state, error });
  usePerformanceTracker('App');

  // Show loading screen for initializing and loading states
  if (state === AppState.INITIALIZING || state === AppState.LOADING) {
    return <LoadingScreen state={state} />;
  }

  // Show error screen for error states
  if ((state === AppState.ERROR || state === AppState.FATAL_ERROR) && error) {
    return <ErrorScreen showPOSBackground={state === AppState.ERROR} />;
  }

  // Show maintenance screen
  if (state === AppState.MAINTENANCE) {
    return <MaintenanceScreen />;
  }

  // TODO: Add unauthenticated states

  // Default: Show the POS interface for READY state
  return <POS />;
} 
