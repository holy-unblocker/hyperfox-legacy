import type { ReactNode } from "react";
import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import styles from "./styles/Tabs.module.scss";

export interface RenderBackend {
  title: string;
}

export const SystemTab = forwardRef<
  RenderBackend,
  { title: string; icon?: string; children: ReactNode }
>(({ title, children }, ref) => {
  useImperativeHandle(
    ref,
    () => ({
      title,
    }),
    [title]
  );

  return <div className={styles.systemTab}>{children}</div>;
});

const WebContent = forwardRef<RenderBackend, { src: string }>(
  ({ src }, ref) => {
    const [title, setTitle] = useState(src);
    const iframe = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
      const interval = setInterval(() => {
        const window = iframe.current?.contentWindow;
        if (!window) return;
        setTitle(window.document.title || src);
      }, 100);

      return () => clearInterval(interval);
    });

    useImperativeHandle(
      ref,
      () => ({
        title,
      }),
      [title]
    );

    // eslint-disable-next-line jsx-a11y/iframe-has-title
    return <iframe ref={iframe} src={translateOut(src)} />;
  }
);

const systemHome = new URL("./system/home.html", global.location.toString());
const systemNewTab = new URL(
  "./system/newtab.html",
  global.location.toString()
);
const systemSettings = new URL(
  "./system/settings.html",
  global.location.toString()
);

export const translateOut = (url: string) => {
  const u = new URL(url);

  if (u.protocol === "about:" && u.hostname === "") {
    switch (u.pathname) {
      case "blank":
        return "about:blank";
      case "home":
        return systemHome.toString() + u.search + u.hash;
      case "newtab":
        return systemNewTab.toString() + u.search + u.hash;
      case "settings":
        return systemSettings.toString() + u.search + u.hash;
    }
  }

  return __uv$config.prefix + __uv$config.encodeUrl(url);
};

export const translateIn = (url: string) => {
  const u = new URL(url);

  if (u.origin === global.location.origin) {
    switch (u.pathname) {
      case systemHome.pathname:
        return "about:home" + u.search + u.hash;
      case systemNewTab.pathname:
        return "about:newtab" + u.search + u.hash;
      case systemSettings.pathname:
        return "about:settings" + u.search + u.hash;
    }
  }

  if (!url.startsWith(__uv$config.prefix)) console.warn("Unknown tab URL");

  return __uv$config.decodeUrl(url.slice(__uv$config.prefix.length));
};

export default WebContent;
