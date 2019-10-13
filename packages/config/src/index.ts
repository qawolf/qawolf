import dotenv from "dotenv";

const dotEnvPath = process.env.DOTENV_PATH;
dotenv.config(dotEnvPath ? { path: dotEnvPath } : {});

const testUrl = process.env.TEST_URL || "http://localhost:5000/";

const parseBool = (value: string | undefined) => {
  return !!value && value !== "false";
};

const parseNumber = (value: string | undefined) => {
  if (typeof value === "undefined") return value;

  return parseFloat(value);
};

export const CONFIG = {
  chromeExecutablePath: process.env.CHROME_EXECUTABLE_PATH,
  dataAttribute: process.env.DATA_ATTRIBUTE || null,
  headless: parseBool(process.env.HEADLESS),
  keepBrowserOpen: parseBool(process.env.KEEP_BROWSER_OPEN),
  logPath: process.env.LOG_PATH,
  saveBrowserWsPath: process.env.SAVE_BROWSER_WS_PATH,
  screenshotPath: process.env.SCREENSHOT_PATH,
  sleepAfterEach: parseNumber(process.env.SLEEP_AFTER_EACH),
  testUrl,
  useLocalModule: parseBool(process.env.USE_LOCAL_MODULE)
};
