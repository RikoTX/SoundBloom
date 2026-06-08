import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ant-design/v5-patch-for-react-19";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { initI18n } from "./i18n";
import { initTheme } from "./theme/initTheme";

initTheme();

const redirectPath = sessionStorage.getItem("redirect");
if (redirectPath) {
  sessionStorage.removeItem("redirect");
  window.history.replaceState(null, "", redirectPath);
}

const root = createRoot(document.getElementById("root"));

initI18n()
  .then(() => {
    root.render(
      <StrictMode>
        <BrowserRouter basename="/SoundBloom">
          <App />
        </BrowserRouter>
      </StrictMode>
    );
  })
  .catch((err) => {
    console.error("i18n init failed:", err);
    root.render(
      <StrictMode>
        <BrowserRouter basename="/SoundBloom">
          <App />
        </BrowserRouter>
      </StrictMode>
    );
  });
