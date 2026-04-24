import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { AtlasThemeProvider } from "@diligentcorp/atlas-react-bundle";
import { applyCatalogFromStorage } from "./data/persistence/applyCatalogSnapshot.js";
import { resetCatalogStorage } from "./data/persistence/catalogStore.js";
import App from "./App";

void (async () => {
  try {
    await applyCatalogFromStorage();
  } catch (e) {
    console.error("Catalog hydration failed; clearing persisted catalog.", e);
    resetCatalogStorage();
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <AtlasThemeProvider tokenMode="lens">
          <App />
        </AtlasThemeProvider>
      </BrowserRouter>
    </StrictMode>,
  );
})();
