import { render } from "preact";
import "@/styles/global.css";
// Initialize i18n before importing components
import "@/i18n";
import App from "@/components/App";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { DebugProvider } from "@/contexts/DebugContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { logger } from "@/lib/logger";

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
