import { config as configDotenv } from "dotenv";

const dotEnvPath = process.env.QAW_DOTENV_PATH;
configDotenv(dotEnvPath ? { path: dotEnvPath } : {});

const testUrl = process.env.QAW_TEST_URL || "http://localhost:5000/";

const parseBool = (value: string | undefined) => {
  return !!value && value !== "false";
};

const parseNumber = (value: string | undefined, defaultValue: number = 0) => {
  if (typeof value === "undefined") return defaultValue;

  return parseFloat(value);
};

export const CONFIG = {
  chromeExecutablePath: process.env.QAW_CHROME_EXECUTABLE_PATH,
  chromeOffsetX: parseNumber(process.env.QAW_CHROME_OFFSET_X, 0),
  chromeOffsetY: parseNumber(process.env.QAW_CHROME_OFFSET_Y, 125),
  dataAttribute: process.env.QAW_DATA_ATTRIBUTE || null,
  debug: parseBool(process.env.QAW_DEBUG),
  display: process.env.DISPLAY,
  domPath: process.env.QAW_DOM_PATH,
  findTimeoutMs: parseNumber(process.env.QAW_FIND_TIMEOUT_MS, 30000),
  headless: parseBool(process.env.QAW_HEADLESS),
  keyDelayMs: parseNumber(process.env.QAW_KEY_DELAY_MS, 0),
  logLevel: process.env.QAW_LOG_LEVEL,
  logPath: process.env.QAW_LOG_PATH,
  navigationTimeoutMs: parseNumber(
    process.env.QAW_NAVIGATION_TIMEOUT_MS,
    60000
  ),
  serial: parseBool(process.env.QAW_SERIAL),
  // slow down each step by 1s to make it watchable
  // this also gives sites time to setup their handlers
  sleepMs: parseNumber(process.env.QAW_SLEEP_MS, 1000),
  testUrl,
  videoPath: process.env.QAW_VIDEO_PATH
};
