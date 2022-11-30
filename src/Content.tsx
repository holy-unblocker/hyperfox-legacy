import type { MutableRefObject } from "react";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  getDocumentQuerySelector,
  getDocumentTitle,
  getHistory,
  getHTMLLinkElementHref,
} from "./contextNatives";

export interface Tab {
  src: string;
  address: string;
  title: string;
  icon?: string;
  key: number;
  shouldFocus: boolean;
  /**
   * If the tab was ever focused and should load the content.
   */
  load: boolean;
  contentRef: MutableRefObject<WebContentRef | null>;
}

export interface WebContentRef {
  back: () => void;
  forward: () => void;
  reload: () => void;
}

const systemHome = new URL("./about/home.html", global.location.toString());
const systemNewTab = new URL("./about/newtab.html", global.location.toString());
const systemPreferences = new URL(
  "./about/preferences.html",
  global.location.toString()
);

const uvAbsolute = global.location.origin + __uv$config.prefix;

/**
 *
 * @param url Clean printable string
 * @returns IFrame/Proxied SRC
 */
export const translateOut = (url: string) => {
  const u = new URL(url);

  if (u.protocol === "about:" && u.hostname === "") {
    switch (u.pathname) {
      case "home":
        return systemHome.toString() + u.search + u.hash;
      case "newtab":
        return systemNewTab.toString() + u.search + u.hash;
      case "preferences":
        return systemPreferences.toString() + u.search + u.hash;
      case "blank":
      default:
        return "about:blank";
    }
  }

  return uvAbsolute + __uv$config.encodeUrl(url);
};

/**
 *
 * @param url IFrame/Proxied SRC
 * @returns Clean printable string
 */
export const translateIn = (url: string) => {
  try {
    new URL(url);
  } catch (err) {
    console.trace("BAD URL", url);
  }
  const u = new URL(url);

  if (u.origin === global.location.origin) {
    switch (u.pathname) {
      case systemHome.pathname:
        return "about:home" + u.search + u.hash;
      case systemNewTab.pathname:
        return "about:newtab" + u.search + u.hash;
      case systemPreferences.pathname:
        return "about:preferences" + u.search + u.hash;
    }
  }

  if (url.startsWith(uvAbsolute))
    return __uv$config.decodeUrl(url.slice(uvAbsolute.length));

  // console.warn("Unknown tab URL");

  return url;
};

const WebContent = forwardRef<
  WebContentRef,
  {
    tab: Tab;
    setTab: (tab: Tab) => void;
  }
>(({ tab, setTab }, ref) => {
  const iframe = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const window = iframe.current?.contentWindow;
      if (!window) return;
      const realLocation = new URL(window.location.toString());
      const location = new URL(translateIn(realLocation.toString()));

      let icon: string | undefined;

      const querySelector = getDocumentQuerySelector(window.document);
      const iconSelector = querySelector<HTMLLinkElement>('link[rel*="icon"]');
      const href = iconSelector && getHTMLLinkElementHref(iconSelector);
      if (href) icon = translateIn(href);
      // about pages will provide a link
      else if (location.protocol !== "about:")
        icon = new URL("/favicon.ico", location).toString();

      setTab({
        ...tab,
        icon,
        title: getDocumentTitle(window.document) || location.toString(),
        address: location.toString(),
      });
    }, 100);

    return () => clearInterval(interval);
  });

  useImperativeHandle(
    ref,
    () => ({
      back: () => {
        const window = iframe.current?.contentWindow;
        if (!window) return;
        const history = getHistory(window);
        history.back();
      },
      forward: () => {
        const window = iframe.current?.contentWindow;
        if (!window) return;
        const history = getHistory(window);
        history.forward();
      },
      reload: () => {
        const window = iframe.current?.contentWindow;
        if (!window) return;
        window.location.reload();
      },
    }),
    []
  );

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe ref={iframe} src={tab.src} />;
});

export default WebContent;
