import { render } from "preact";
import "@/styles/global.css";
import POS from "@/windows/POS";
import { ThemeProvider } from "@/contexts/ThemeContext";

render(
  <ThemeProvider>
    <POS />
  </ThemeProvider>,
  // eslint-disable-next-line no-undef
  document.getElementById("root")!
);
