import { render } from "preact";
import "@/styles/global.css";
// Initialize i18n before importing components
import "@/i18n";
import App from "@/presentation/App";
import {
  ThemeProvider,
  AppStateProvider,
  DebugProvider,
  SettingsProvider,
  WindowManagerProvider,
} from "@/presentation/providers";
import { logger } from "@/infrastructure/logging";

// Log application startup
logger.info("POS Application starting up").catch(globalThis.console.error);

render(
  <DebugProvider>
    <WindowManagerProvider>
      <AppStateProvider>
        <SettingsProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </SettingsProvider>
      </AppStateProvider>
    </WindowManagerProvider>
  </DebugProvider>,
   
  document.getElementById("root")!
);
