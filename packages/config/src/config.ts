import { config as configDotenv } from "dotenv";
import path from "path";

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

let artifactPath = process.env.QAW_ARTIFACT_PATH;
if (artifactPath && require.main) {
  // store artifacts under the name of the main module, if there is one
  // ex. /artifacts/search.test.js
  artifactPath = path.join(artifactPath, path.basename(require.main.filename));
}

export const CONFIG = {
  artifactPath,
  attribute: process.env.QAW_ATTRIBUTE || null,
  chromeOffsetX: parseNumber(process.env.QAW_CHROME_OFFSET_X, 0),
  chromeOffsetY: parseNumber(process.env.QAW_CHROME_OFFSET_Y, 125),
  debug: parseBool(process.env.QAW_DEBUG),
  headless: parseBool(process.env.QAW_HEADLESS),
  logLevel: process.env.QAW_LOG_LEVEL,
  serial: parseBool(process.env.QAW_SERIAL),
  // slow down each step by 1s to make it watchable
  // this also gives sites time to setup their handlers
  sleepMs: parseNumber(process.env.QAW_SLEEP_MS, 1000),
  // for internal use
  testUrl,
  timeoutMs: parseNumber(process.env.QAW_TIMEOUT_MS, 30000)
};
