import fs from "fs-extra";
import { remote, BrowserObject } from "webdriverio";
import { CONFIG } from "../config";
import { ConnectOptions } from "../web/Client";
import { logger } from "../logger";

const webBundle = fs.readFileSync("build/qawolf.web.js", "utf8");

export const createBrowser = async (
  url?: string,
  desiredCapabilities?: WebDriver.DesiredCapabilities
) => {
  logger.debug("create Browser");

  const browser = await remote({
    // default to chrome
    capabilities: desiredCapabilities || getChromeCapabilities(),
    logLevel: "warn",
    port: CONFIG.seleniumPort
  });

  if (url) {
    await browser.url(url);
  }

  return browser;
};

export const injectClient = (
  browser: BrowserObject,
  connect?: ConnectOptions
) => {
  let script = webBundle;

  if (connect) {
    script += `(new qawolf.Client()).connect(${JSON.stringify(connect)})`;
  }

  return browser.execute(script);
};

const getChromeCapabilities = () => {
  const chromeOptions = {
    args: ["--disable-dev-shm-usage", "--no-sandbox", "--window-position=0,0"],
    // allow injecting into protected sites
    extensions: [fs.readFileSync("./bin/disable_csp.zip").toString("base64")],
    // disable "Chrome is being controlled by automated software"
    // https://github.com/GoogleChrome/puppeteer/issues/2070#issuecomment-521313694
    excludeSwitches: ["enable-automation"],
    useAutomationExtension: false
  };

  // disable "Chrome is being controlled by automated software"
  // from https://github.com/Codeception/CodeceptJS/issues/563#issuecomment-310688797
  (chromeOptions as any).prefs = { credentials_enable_service: false };

  if (CONFIG.fullScreen) {
    chromeOptions.args.push("--kiosk");
  }

  const capabilities: WebDriver.DesiredCapabilities = {
    // need this sign we self-signed our certificate
    acceptInsecureCerts: true,
    browserName: "chrome",
    "goog:chromeOptions": chromeOptions
  };

  return capabilities;
};
