import React from "react";
import Tabs from "@theme/Tabs";

const imageStyle = {
  height: "20px",
  marginRight: "8px"
};
const tabStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center"
};

const BROWSERS = [
  {
    label: "Chromium",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/chrome.png",
    value: "chromium"
  },
  {
    label: "Firefox",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/firefox.png",
    value: "firefox"
  },
  {
    label: "WebKit",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/safari.png",
    value: "webkit"
  },
  {
    label: "All browsers",
    src: "https://storage.googleapis.com/docs.qawolf.com/logos/select_all.png",
    value: "all"
  }
];

function BrowserTabs({ children, skipAll }) {
  const browsers = skipAll ? BROWSERS.slice(0, 3) : BROWSERS;

  const values = browsers.map(browser => {
    return {
      label: (
        <div style={tabStyle}>
          <img src={browser.src} style={imageStyle} />
          {browser.label}
        </div>
      ),
      value: browser.value
    };
  });

  return (
    <Tabs block defaultValue="chromium" values={values}>
      {children}
    </Tabs>
  );
}

export default BrowserTabs;
