import dotenv from "dotenv";

const dotEnvPath = process.env.DOTENV_PATH;
dotenv.config(dotEnvPath ? { path: dotEnvPath } : {});

const jsonLogging = process.env.LOG_TYPE === "json";

const savePath = process.env.SAVE_PATH || "/tmp/qawolf";

const testUrl = process.env.TEST_URL || "";

export const CONFIG = {
  fullScreen: process.env.FULL_SCREEN === "true",
  headless: process.env.HEADLESS === "true",
  jsonLogging,
  savePath,
  testUrl
};
