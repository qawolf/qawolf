import { platform } from "os";
import { LaunchOptions, launch, Browser } from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";
import { CONFIG } from "@qawolf/config";
import { getDevice } from "./device";

export const buildOptions = (device: Device) => {
  const launchOptions: LaunchOptions = {
    args: [
      "--disable-dev-shm-usage",
      "--no-default-browser-check",
      `--window-size=${device.viewport.width},${device.viewport.height}`
    ],
    defaultViewport: null,
    headless: CONFIG.headless,
    ignoreDefaultArgs: ["--enable-automation"]
  };

  if (platform() === "linux") {
    launchOptions!.args!.push("--disable-setuid-sandbox");
    launchOptions!.args!.push("--no-sandbox");
  }

  if (CONFIG.chromeExecutablePath) {
    launchOptions.executablePath = CONFIG.chromeExecutablePath;
  }

  return launchOptions;
};

export const launchPuppeteerBrowser = async (
  device?: Device
): Promise<Browser> => {
  const options = buildOptions(device || getDevice());
  const browser = await launch(options);
  return browser;
};
