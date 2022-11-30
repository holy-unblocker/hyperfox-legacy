import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const TabApp = lazy(() => import("./pages/index"));
const AboutHome = lazy(() => import("./pages/about/home"));
const AboutNewTab = lazy(() => import("./pages/about/newtab"));
const AboutPreferences = lazy(() => import("./pages/about/preferences"));

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <Suspense>
            <TabApp />
          </Suspense>
        }
        index
      />
      <Route
        element={
          <Suspense>
            <AboutHome />
          </Suspense>
        }
        path="/about/home.html"
      />
      <Route
        element={
          <Suspense>
            <AboutNewTab />
          </Suspense>
        }
        path="/about/newtab.html"
      />
      <Route
        element={
          <Suspense>
            <AboutPreferences />
          </Suspense>
        }
        path="/about/settings.html"
      />
    </Routes>
  );
}
