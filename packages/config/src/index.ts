import dotenv from "dotenv";

const dotEnvPath = process.env.QAW_DOTENV_PATH;
dotenv.config(dotEnvPath ? { path: dotEnvPath } : {});

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
  dataAttribute: process.env.QAW_DATA_ATTRIBUTE || null,
  headless: parseBool(process.env.QAW_HEADLESS),
  locatorTimeoutMs: parseNumber(process.env.QAW_LOCATOR_TIMEOUT_MS, 30000),
  logLevel: process.env.QAW_LOG_LEVEL,
  logPath: process.env.QAW_LOG_PATH,
  sleepMs: parseNumber(process.env.QAW_SLEEP_MS, 0),
  testUrl
};
