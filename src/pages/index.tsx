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
          "about:preferences",
          "https://youtube.com/",
          /*"about:preferences",
        "about:preferences",
        "about:preferences",
        "about:preferences",
        "about:preferences",
        "about:preferences",
        "about:preferences",
        "about:preferences",
        "about:preferences",
        "about:preferences",*/
          "https://holyubofficial.net/",
          "https://holyubofficial.net/proxy.html",
          // "https://holyubofficial.net/terms.html",
        ]}
      />
    </>
  );
}
