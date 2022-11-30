type Context = typeof globalThis | Window | void;

interface BoundGet<Res, This = Context> {
  get: (this: This) => Res;
}
interface BoundSet<Value, This = Context> {
  set: (this: This, value: Value) => void;
}

const documentTitle = Object.getOwnPropertyDescriptor(
  Document.prototype,
  "title"
)! as BoundGet<string, Document>;

const { querySelector } = Document.prototype;

const nativeHistory = Object.getOwnPropertyDescriptor(
  window,
  "history"
)! as BoundGet<History>;

const historyState = Object.getOwnPropertyDescriptor(
  History.prototype,
  "state"
)! as BoundGet<unknown, History> & BoundSet<unknown, History>;

const historyLength = Object.getOwnPropertyDescriptor(
  History.prototype,
  "state"
)! as BoundGet<number, History>;

const historyScrollRestoration = Object.getOwnPropertyDescriptor(
  History.prototype,
  "scrollRestoration"
)! as BoundGet<ScrollRestoration, History> &
  BoundSet<ScrollRestoration, History>;

const HTMLLinkElementHref = Object.getOwnPropertyDescriptor(
  HTMLLinkElement.prototype,
  "href"
)! as BoundGet<string, HTMLLinkElement> & BoundSet<string, HTMLLinkElement>;

export const getHTMLLinkElementHref = (link: HTMLLinkElement) =>
  HTMLLinkElementHref.get.call(link);

export const getDocumentQuerySelector = (document: Document) =>
  querySelector.bind(document);

export const getDocumentTitle = (document: Document) =>
  documentTitle.get.call(document);

export const getHistory = (context: typeof globalThis) => {
  const got = nativeHistory.get.call(context);

  return {
    forward: History.prototype.forward.bind(got),
    back: History.prototype.back.bind(got),
    go: History.prototype.go.bind(got),
    pushState: History.prototype.pushState.bind(got),
    replaceState: History.prototype.replaceState.bind(got),
    get length() {
      return historyLength.get.call(got);
    },
    get state() {
      return historyState.get.call(got);
    },
    set state(value: unknown) {
      historyState.set.call(got, value);
    },
    get scrollRestoration() {
      return historyScrollRestoration.get.call(got);
    },
    set scrollRestoration(value: ScrollRestoration) {
      historyScrollRestoration.set.call(got, value);
    },
  };
};
