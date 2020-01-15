import { CONFIG } from "@qawolf/config";
import { Display } from "@qawolf/screen";
import { omit } from "lodash";
import { platform } from "os";
import { launch, LaunchOptions, Browser } from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";
import { logger } from "@qawolf/logger";
import { getDevice } from "./device";

interface LaunchPuppeteerOptions extends LaunchOptions {
  device?: Device;
  display?: Display;
}

export const launchPuppeteer = (
  options: LaunchPuppeteerOptions
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
    ...omit(options, "display")
  };

  if (platform() === "linux") {
    launchOptions!.args!.push("--disable-gpu");
    launchOptions!.args!.push("--disable-setuid-sandbox");
    launchOptions!.args!.push("--no-sandbox");
  }

  if (options.display) {
    launchOptions.env = {
      ...process.env,
      DISPLAY: options.display.screen
    };
  }

  logger.verbose(`launch puppeteer: ${JSON.stringify(launchOptions)}`);
  return launch(launchOptions);
};
