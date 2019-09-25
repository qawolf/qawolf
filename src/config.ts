import dotenv from "dotenv";

const dotEnvPath = process.env.DOTENV_PATH;
dotenv.config(dotEnvPath ? { path: dotEnvPath } : {});

const jsonLogging = process.env.LOG_TYPE === "json";

const savePath = process.env.SAVE_PATH || "/tmp/qawolf";

const seleniumPort = parseInt(process.env.SELENIUM_PORT || "", 10) || 4444;

const testUrl = process.env.TEST_URL || "";
const wsUrl = process.env.WS_URL || "";

export const CONFIG = {
  disableCsp: process.env.DISABLE_CSP === "true",
  fullScreen: process.env.FULL_SCREEN === "true",
  jsonLogging,
  savePath,
  seleniumPort,
  testUrl,
  wsUrl
};
