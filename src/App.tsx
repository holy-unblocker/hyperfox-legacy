import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const TabApp = lazy(() => import("./pages/index"));
const SystemHome = lazy(() => import("./pages/system/home"));
const SystemNewTab = lazy(() => import("./pages/system/newtab"));
const SystemSettings = lazy(() => import("./pages/system/settings"));

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
            <SystemHome />
          </Suspense>
        }
        path="/system/home.html"
      />
      <Route
        element={
          <Suspense>
            <SystemNewTab />
          </Suspense>
        }
        path="/system/newtab.html"
      />
      <Route
        element={
          <Suspense>
            <SystemSettings />
          </Suspense>
        }
        path="/system/settings.html"
      />
    </Routes>
  );
}
