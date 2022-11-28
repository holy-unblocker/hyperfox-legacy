import { forwardRef } from "react";
import type { RenderBackend } from "../Content";
import { SystemTab } from "../Content";

const Home = forwardRef<RenderBackend>((props, ref) => {
  return (
    <SystemTab ref={ref} title="Homepage">
      Welcome to HyperFox!
    </SystemTab>
  );
});

export default Home;
