import { forwardRef, lazy, memo, Suspense } from "react";
import type { RenderBackend } from "./Content";
import WebContent from "./Content";

const Home = lazy(() => import("./tabs/Home"));
const Settings = lazy(() => import("./tabs/Settings"));

const ContentAuto = memo(
  forwardRef<RenderBackend, { src: string }>(({ src }, ref) => {
    switch (src) {
      case "about:home":
        return (
          <Suspense>
            <Home ref={ref} />
          </Suspense>
        );
      case "about:settings":
        return (
          <Suspense>
            <Settings ref={ref} />
          </Suspense>
        );
      default:
        return <WebContent ref={ref} src={src} />;
    }
  })
);

export default ContentAuto;
