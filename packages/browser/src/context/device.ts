// todo open issue
const playwright = require("playwright-core");
import { DeviceDescriptor } from "playwright-core/lib/types";

export const getDevice = (
  device: string | DeviceDescriptor = "desktop"
): DeviceDescriptor => {
  if (typeof device !== "string") {
    return device;
  }

  if (device === "desktop") {
    return {
      name: "Desktop",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
      // https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide
      viewport: {
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
        isMobile: false
      }
    };
  }

  if (playwright.devices[device]) {
    return playwright.devices[device];
  }

  throw new Error(`playwright.devices["${device}"] was not found`);
};
