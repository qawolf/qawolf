import { Size } from "@qawolf/types";
import { devices } from "puppeteer";

export const getDevice = (size: Size = "desktop"): devices.Device => {
  if (size === "desktop") {
    return {
      name: "Desktop",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
      // https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide
      viewport: {
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
      }
    };
  }

  if (size === "tablet") {
    // https://gs.statcounter.com/screen-resolution-stats/tablet/worldwide
    return devices["iPad"];
  } else if (size === "phone") {
    // https://deviceatlas.com/blog/most-popular-smartphones#us
    return devices["iPhone 7"];
  }

  throw new Error(`invalid size ${size}`);
};
