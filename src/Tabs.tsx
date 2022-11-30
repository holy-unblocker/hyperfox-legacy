import clsx from "clsx";
import type {
  MouseEventHandler,
  MutableRefObject,
  ReactElement,
  ReactNode,
} from "react";
import {
  createRef,
  useLayoutEffect,
  useEffect,
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import type { WebContentRef, Tab } from "./Content";
import WebContent, { translateOut } from "./Content";
import styles from "./styles/Tabs.module.scss";

interface TabbingProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  bumpedTab: number | null;
  order: number;
  focused: boolean;
  tabList: MutableRefObject<HTMLDivElement | null>;
  bumpTab: (by: number) => boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
  onClose: () => void;
}

const Tabbing = ({
  tab,
  focused,
  tabList,
  bumpedTab,
  order,
  bumpTab,
  onClick,
  onClose,
}: TabbingProps) => {
  const [mouseDown, setMouseDown] = useState(false);
  const origin = useRef<[number, number] | null>(null);
  const moving = useRef(false);
  const [grabX, setGrabX] = useState<number | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const [prevOffsetLeft, setPrevOffsetLeft] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!container.current) return;
    setPrevOffsetLeft(container.current.offsetLeft);
  }, [order]);

  useLayoutEffect(() => {
    if (tab.key === bumpedTab || mouseDown) return;

    const con = container.current;
    const firstLeft = prevOffsetLeft;
    if (!con || typeof firstLeft !== "number") return;
    const changeInX = firstLeft - con.offsetLeft;

    if (changeInX) {
      // Before the DOM paints, invert child to old position
      con.style.transform = `translateX(${changeInX}px)`;
      con.style.transition = "transform 0s";

      requestAnimationFrame(() => {
        con.style.transform = "";
        con.style.transition = "";
      });
    }
  }, [bumpedTab, mouseDown, order, prevOffsetLeft, tab.key, tab.src]);

  useEffect(() => {
    const con = container.current;
    const tabListC = tabList.current;
    const or = origin.current;

    if (!con || !tabListC || !mouseDown || !or || typeof grabX !== "number")
      return;

    const listener = (event: MouseEvent) => {
      // emulate sensitivity
      if (
        !moving.current &&
        Math.hypot(event.clientX - or[0], event.clientY - or[1]) > 10
      ) {
        moving.current = true;
        con.style.transition = "transform 0s";
        document.documentElement.classList.add("dragging");
      }
      if (!moving.current) return;

      const offset = Math.max(
        Math.min(
          event.clientX - grabX - con.offsetLeft,
          tabListC.offsetWidth -
            tabListC.offsetLeft -
            con.offsetLeft -
            con.offsetWidth
        ),
        0 - con.offsetLeft + tabListC.offsetLeft
      );
      const step = con.clientWidth / 2 + (offset > 0 ? 10 : -10);
      const fromOrigin = or[0] - event.clientX;
      const bumpBy = ~~(offset / step);
      if (bumpBy && Math.abs(fromOrigin) > 10 && bumpTab(bumpBy))
        origin.current = [event.clientX, event.clientY];
      con.style.transform = offset ? `translateX(${offset}px)` : "";
    };

    const mouseUpListener = (event: MouseEvent) => {
      if (event.button !== 0) return;
      document.documentElement.classList.remove("dragging");
      con.style.transform = "";
      con.style.transition = "";
      moving.current = false;
      setMouseDown(false);
    };

    window.addEventListener("mousemove", listener);
    window.addEventListener("mouseup", mouseUpListener);

    return () => {
      window.removeEventListener("mousemove", listener);
      window.removeEventListener("mouseup", mouseUpListener);
    };
  }, [bumpTab, grabX, mouseDown, origin, tabList]);

  return (
    <div
      ref={container}
      className={clsx(styles.tab, focused && styles.focused)}
      title={tab.title}
      style={{
        order,
      }}
      onMouseDown={(event) => {
        onClick(event);
        if (event.buttons !== 1) return;
        setMouseDown(true);
        origin.current = [event.clientX, event.clientY];
        setGrabX(event.clientX - event.currentTarget.offsetLeft);
      }}
    >
      {tab.icon && <img src={tab.icon} alt="" className={styles.icon} />}
      <span className={styles.title}>{tab.title}</span>
      <button
        className={styles.closeTab}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

// createTab(src, tabs, setTabs)

const tabKey = (tabs: Tab[]) => {
  for (let i = 0; i !== 1e3; i++) {
    if (tabs.some((tab) => tab.key === i)) continue;
    return i;
  }

  throw new Error("Failure allocating key");
};

interface NavBarRef {
  focus(): void;
}

const NavBar = forwardRef<NavBarRef, { tab?: Tab; setTab: (tab: Tab) => void }>(
  ({ tab, setTab }, ref) => {
    const [focused, setFocused] = useState(false);
    const input = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => input.current?.focus(),
      }),
      [input]
    );

    useEffect(() => {
      if (!input.current || !tab) return;

      if (typeof tab.address === "string" && !focused)
        input.current.value = tab.address;
    }, [tab, focused, input]);

    return (
      <div className={styles.navBar}>
        <form
          className={styles.addressBar}
          onSubmit={(event) => {
            event.preventDefault();
            if (!input.current || !tab) return;
            const formed = new URL(input.current.value).toString();
            const ref =
              createRef<WebContentRef | null>() as MutableRefObject<WebContentRef | null>;
            ref.current = null;

            setTab({
              ...tab,
              src: translateOut(formed),
              address: formed,
              title: formed,
            });
          }}
        >
          <input
            type="text"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            ref={input}
          />
        </form>
      </div>
    );
  }
);

const Tabs = ({ initialTabs }: { initialTabs?: string[] }) => {
  const tabList = useRef<HTMLDivElement | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [uiScale, setUiScale] = useState(0);

  useEffect(() => {
    const newTabs: Tab[] = [];

    if (initialTabs)
      for (const src of initialTabs) {
        const formed = new URL(src).toString();
        const ref =
          createRef<WebContentRef | null>() as MutableRefObject<WebContentRef | null>;
        ref.current = null;
        newTabs.push({
          src: translateOut(formed),
          address: formed,
          title: formed,
          load: false,
          key: tabKey(newTabs),
          contentRef: ref,
        });
      }

    setTabs(newTabs);
    if (newTabs[0]) focusTab(newTabs[0]);
  }, [initialTabs]);

  const [focusedTabKey, setFocusedTabKey] = useState<number | null>(null);
  const [bumpedTab, setBumpedTab] = useState<number | null>(null);

  const tabbing: ReactElement<typeof Tabbing>[] = [];
  const content: ReactNode[] = [];

  const focusTab = (tab: Tab) => {
    tab.load = true;
    setFocusedTabKey(tab.key);
  };
  useEffect(() => {
    const resize = () => {
      setUiScale(
        (tabList.current?.children[0]?.clientWidth || 0) < 150 ? 1 : 0
      );
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [tabs]);

  const setSomeTab = (tab: Tab | void, newTab: Tab) => {
    if (!tab) return;
    const i = tabs.indexOf(tab);
    if (i !== -1) tabs[i] = newTab;
    setTabs([...tabs]);
  };

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];

    const destroyTab = () => {
      setTabs([...tabs.filter((t) => t.key !== tab.key)]);
      if (focusedTabKey === tab.key) {
        const i = tabs.indexOf(tab);
        focusTab(tabs[i - 1] || tabs[i + 1] || null);
      }
    };

    const setTab = setSomeTab.bind(null, tab);

    const focused = focusedTabKey === tab.key;

    tabbing.push(
      <Tabbing
        tab={tab}
        setTab={setTab}
        tabList={tabList}
        bumpedTab={bumpedTab}
        order={i}
        bumpTab={(by) => {
          const i = tabs.indexOf(tab);
          if ((by < 0 && i === 0) || (by > 0 && i === tabs.length - 1))
            return false;
          const newTabs = [...tabs];
          newTabs.splice(i, 1);
          newTabs.splice(i + by, 0, tab);
          setTabs(newTabs);
          setBumpedTab(tab.key);
          return true;
        }}
        focused={focused}
        onClick={(event) => {
          if (event.buttons === 4) destroyTab();
          else if (event.buttons === 1) focusTab(tab);
        }}
        onClose={destroyTab}
        key={tab.key}
      />
    );

    // preserve order of content
    // react will reattach the iframe regardless of whatever we do to preserve the value (same keys, memo()) and will break the content
    content[tab.key] = (
      <div className={clsx(styles.tabContent, focused && styles.focused)}>
        {tab.load && (
          <WebContent
            ref={tab.contentRef}
            tab={tab}
            setTab={setTab}
            key={tab.key}
          />
        )}
      </div>
    );
  }

  const focusedTab = tabs.find((tab) => tab.key === focusedTabKey);

  const navBar = useRef<NavBarRef | null>(null);

  return (
    <>
      <div className={styles.tabs} data-scale={uiScale}>
        <div
          className={styles.tabList}
          ref={tabList}
          onSubmit={(event) => event.preventDefault()}
        >
          {tabbing}
        </div>
        <button
          className={styles.newTab}
          onClick={() => {
            const src = "about:newtab";
            const ref =
              createRef<WebContentRef | null>() as MutableRefObject<WebContentRef | null>;
            ref.current = null;
            const tab: Tab = {
              src: translateOut(src),
              address: src,
              title: src,
              load: false,
              key: tabKey(tabs),
              contentRef: ref,
            };
            tabs.push(tab);
            setTabs([...tabs]);
            focusTab(tab);
            navBar.current?.focus();
          }}
        >
          +
        </button>
      </div>
      <div className={styles.browserBar}>
        <NavBar
          ref={navBar}
          tab={focusedTab}
          setTab={setSomeTab.bind(null, focusedTab)}
        />
      </div>
      {content}
    </>
  );
};

export default Tabs;
