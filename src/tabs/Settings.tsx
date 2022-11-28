import { forwardRef } from "react";
import type { RenderBackend } from "../Content";
import { SystemTab } from "../Content";

const Home = forwardRef<RenderBackend>((props, ref) => {
  return (
    <SystemTab ref={ref} title="Settings">
      This is the settings page.
    </SystemTab>
  );
});

export default Home;
