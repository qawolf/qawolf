import dotenv from "dotenv";

const dotEnvPath = process.env.DOTENV_PATH;
dotenv.config(dotEnvPath ? { path: dotEnvPath } : {});

const testUrl = process.env.TEST_URL || "";

const parseBool = (value: string | undefined) => {
  return !!value && value !== "false";
};

export const CONFIG = {
  chromeExecutablePath: process.env.CHROME_EXECUTABLE_PATH,
  headless: parseBool(process.env.HEADLESS),
  keepBrowserOpen: parseBool(process.env.KEEP_BROWSER_OPEN),
  saveBrowserWsPath: process.env.SAVE_BROWSER_WS_PATH,
  screenshotPath: process.env.SCREENSHOT_PATH,
  testUrl,
  useLocalModule: parseBool(process.env.USE_LOCAL_MODULE)
};
