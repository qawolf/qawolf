import { CONFIG } from "@qawolf/config";
import { platform } from "os";
import { launch, LaunchOptions, Browser } from "playwright";
import { Device } from "playwright/DeviceDescriptors";
import { logger } from "@qawolf/logger";
import { getDevice } from "./device";

interface LaunchPlaywrightOptions extends LaunchOptions {
  device?: Device;
  display?: string;
}

export const launchPlaywright = (
  options: LaunchPlaywrightOptions
): Promise<Browser> => {
  const device = options.device || getDevice();

  const launchOptions: LaunchOptions = {
    args: [
      "--disable-dev-shm-usage",
      "--no-default-browser-check",
      "--window-position=0,0",
      `--window-size=${device.viewport.width + CONFIG.chromeOffsetX},${device
        .viewport.height + CONFIG.chromeOffsetY}`
    ],
    defaultViewport: null,
    headless: CONFIG.headless,
    ...options
  };

  if (platform() === "linux") {
    launchOptions!.args!.push("--disable-gpu");
    launchOptions!.args!.push("--disable-setuid-sandbox");
    launchOptions!.args!.push("--no-sandbox");
  }

  if (options.display) {
    launchOptions.env = {
      ...process.env,
      DISPLAY: options.display
    };
  }

  logger.verbose(`launch playwright: ${JSON.stringify(launchOptions)}`);
  return launch(launchOptions);
};
