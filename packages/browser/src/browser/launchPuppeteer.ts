import { CONFIG } from "@qawolf/config";
import { platform } from "os";
import { launch, LaunchOptions, Browser } from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";

const buildLaunchOptions = (options: LaunchOptions, device: Device) => {
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

  return launchOptions;
};

export const launchPuppeteer = (
  options: LaunchOptions,
  device: Device
): Promise<Browser> => {
  return launch(buildLaunchOptions(options, device));
};
