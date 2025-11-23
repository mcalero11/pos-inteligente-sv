import { render } from "preact";
import "@/styles/global.css";
// Initialize i18n before importing components
import "@/i18n";
import App from "@/presentation/App";
import { ThemeProvider, AppStateProvider, DebugProvider, SettingsProvider } from "@/presentation/providers";
import { logger } from "@/infrastructure/logging";

// Log application startup
logger.info("POS Application starting up").catch(globalThis.console.error);

render(
  <DebugProvider>
    <AppStateProvider>
      <SettingsProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </SettingsProvider>
    </AppStateProvider>
  </DebugProvider>,
  // eslint-disable-next-line no-undef
  document.getElementById("root")!
);
