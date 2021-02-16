import { v4 as uuidv4 } from "uuid";

export const DEFAULT_ATTRIBUTE_LIST =
  "data-cy,data-e2e,data-qa,/^data-test.*/,/^qa-.*/";

export const buildRunnerApiKey = (): string => {
  const uuid = uuidv4().split("-").join("");
  return `qawolf_${uuid}`;
};

const RUNNER_ID = process.env.QAWOLF_RUNNER_ID;

const config = {
  API_URL: process.env.QAWOLF_API_URL || "https://app.qawolf.com/api",
  DEFAULT_ATTRIBUTE_LIST,
  // 1080 viewport + 100 browser
  DISPLAY_HEIGHT: process.env.QAWOLF_DISPLAY_HEIGHT || 1180,
  // 1280 viewport + 8 scrollbar
  DISPLAY_WIDTH: process.env.QAWOLF_DISPLAY_WIDTH || 1288,
  FFMPEG_PATH: process.env.FFMPEG_PATH || "/usr/bin/ffmpeg",
  INTERNAL_SERVER_PORT: 26368,
  RECORDER_SCRIPT_FILENAME: "qawolf.recorder.js",
  RUNNER_API_KEY: RUNNER_ID ? buildRunnerApiKey() : undefined,
  RUNNER_ID,
  RUNNER_STATUS_URL:
    process.env.QAWOLF_RUNNER_STATUS_URL ||
    "http://localhost/.qawolf/runner/status",
};

export default config;
