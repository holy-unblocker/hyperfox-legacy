import "./styles/root.scss";
import App from "./App";
import { createRoot } from "react-dom/client";
import { lazy, StrictMode, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { registerSW } from "./uv";

const root = createRoot(document.getElementById("root") as HTMLElement);

const AppSW = lazy(() => registerSW().then(() => ({ default: App })));

root.render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Suspense>
          <AppSW />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
