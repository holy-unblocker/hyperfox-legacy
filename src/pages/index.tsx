import { Helmet } from "react-helmet-async";
import Tabs from "../Tabs";

export default function TabApp() {
  return (
    <>
      <Helmet>
        <title>HyperTabs</title>
      </Helmet>
      <Tabs
        initialTabs={[
          "about:home",
          "about:settings",
          /*"about:settings",
        "about:settings",
        "about:settings",
        "about:settings",
        "about:settings",
        "about:settings",
        "about:settings",
        "about:settings",
        "about:settings",
        "about:settings",*/
          "https://holyubofficial.net/",
          "https://holyubofficial.net/proxy.html",
          // "https://holyubofficial.net/terms.html",
        ]}
      />
    </>
  );
}
