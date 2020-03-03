import { getBrowserType } from "@qawolf/types";
import { config as configDotenv } from "dotenv";
import path from "path";

const dotEnvPath = process.env.QAW_DOTENV_PATH;
configDotenv(dotEnvPath ? { path: dotEnvPath } : {});

const sandboxUrl = process.env.QAW_SANDBOX_URL || "http://localhost:3000/";

// TODO import from playwright utls?
const parseBool = (value: string | undefined) => {
  return !!value && value !== "false";
};

const browser = getBrowserType(process.env.QAW_BROWSER || "chromium");

let artifactPath = process.env.QAW_ARTIFACT_PATH;

if (artifactPath && require.main) {
  // store artifacts under the name of the main module, if there is one
  // ex. /artifacts/search.test.js
  artifactPath = path.join(artifactPath, path.basename(require.main.filename));
}

// store artifacts under the name of the browser being tested
if (artifactPath) {
  artifactPath = path.join(artifactPath, browser);
}

export const CONFIG = {
  artifactPath,
  disableVideoArtifact: parseBool(process.env.QAW_DISABLE_VIDEO_ARTIFACT),
  logLevel: process.env.QAW_LOG_LEVEL,
  // for internal use
  sandboxUrl
};
