import { CONFIG } from "@qawolf/config";
import { Display } from "@qawolf/screen";
import { platform } from "os";
import { launch, LaunchOptions, Browser } from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";

interface LaunchPuppeteerOptions extends LaunchOptions {
  device: Device;
  display?: Display;
}

export const launchPuppeteer = (
  options: LaunchPuppeteerOptions
): Promise<Browser> => {
  const device = options.device;

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
      DISPLAY: options.display.screen
    };
  }

  return launch(launchOptions);
};
