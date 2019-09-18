import * as dotenv from "dotenv";

const dotEnvPath = process.env.DOTENV_PATH;
dotenv.config(dotEnvPath ? { path: dotEnvPath } : {});

const jsonLogging = process.env.LOG_TYPE === "json";

const savePath = process.env.SAVE_PATH || "/tmp/jacob";

const seleniumPort = parseInt(process.env.SELENIUM_PORT || "", 10) || 5100;

export const CONFIG = {
  fullScreen: process.env.FULL_SCREEN === "true",
  jsonLogging,
  savePath,
  seleniumPort
};
