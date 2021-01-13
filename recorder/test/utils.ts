import fs from "fs";
import { platform } from "os";
import path from "path";
import playwright, { Browser, BrowserContext, LaunchOptions } from "playwright";
import webpackConfig from "../webpack.config";

let recorderScript: string;

const getRecorderScriptAsString = async (): Promise<string> => {
  if (recorderScript) return recorderScript;

  // Read the output file that was built by setup-global.js
  const outputFile = path.join(
    webpackConfig.output.path,
    webpackConfig.output.filename
  );
  recorderScript = await fs.promises.readFile(outputFile, "utf8");
  return recorderScript;
};

export const TEST_URL = process.env.TEST_URL || "http://localhost:5000/";

export const DEFAULT_ATTRIBUTE_LIST =
  "data-cy,data-e2e,data-qa,/^data-test.*/,/^qa-.*/";

type BrowserName = "chromium" | "firefox" | "webkit";

export const parseBrowserName = (name?: string): BrowserName => {
  if (name === "firefox" || name === "webkit") return name;

  return "chromium";
};

export const getLaunchOptions = (
  browserName: BrowserName,
  options: LaunchOptions = {}
): LaunchOptions => {
  const launchOptions = {
    ...options,
  };

  const defaultArgs: string[] = [];

  if (browserName === "chromium" && platform() === "linux") {
    // We use --no-sandbox because we cannot change the USER for certain CIs (like GitHub).
    // "Ensure your Dockerfile does not set the USER instruction, otherwise you will not be able to access GITHUB_WORKSPACE"
    defaultArgs.push("--no-sandbox");
  }

  return {
    args: defaultArgs,
    // override args if they are provided
    ...launchOptions,
  };
};

export const launch = async (
  options: LaunchOptions & { startRecorder?: boolean } = {}
): Promise<Browser> => {
  const { startRecorder, ...otherOptions } = options;

  const browserName = parseBrowserName(process.env.QAWOLF_BROWSER);

  const launchOptions = getLaunchOptions(browserName, otherOptions);

  const browser = await playwright[browserName].launch(launchOptions);

  // The better way to do this long term would be to get a "context"
  // event added to Browser class in Playwright.
  const originalNewContext = browser.newContext.bind(browser);
  browser.newContext = async (...args): Promise<BrowserContext> => {
    const context = await originalNewContext(...args);
    await context.addInitScript(`
(() => {
  ${await getRecorderScriptAsString()}

  ${
    startRecorder
      ? "window.qawInstance = new window.qawolf.ActionRecorder();"
      : ""
  }
})();
`);

    return context;
  };

  return browser;
};
