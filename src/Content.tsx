import type { MutableRefObject } from "react";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  getDocumentQuerySelector,
  getDocumentTitle,
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
  //
  navigate(): void;
}

const systemHome = new URL("./about/home.html", global.location.toString());
const systemNewTab = new URL("./about/newtab.html", global.location.toString());
const systemSettings = new URL(
  "./about/settings.html",
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
      case "settings":
        return systemSettings.toString() + u.search + u.hash;
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
      case systemSettings.pathname:
        return "about:settings" + u.search + u.hash;
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
      else
        try {
          icon = new URL("/favicon.ico", location).toString();
        } catch (err) {
          // :blank?
          if (realLocation.protocol !== "about:") {
            // location is possibly about: url
            icon = new URL("/favicon.ico", realLocation).toString();
          }
        }

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
      navigate: () => {
        //
      },
    }),
    []
  );

  // eslint-disable-next-line jsx-a11y/iframe-has-title
  return <iframe ref={iframe} src={tab.src} />;
});

export default WebContent;
