import { CONFIG } from "@qawolf/config";
import { readFileSync } from "fs-extra";
import { dirname, resolve } from "path";

export const QAWOLF_WEB_SCRIPT = readFileSync(
  resolve(dirname(require.resolve("@qawolf/web")), "./qawolf.web.js"),
  "utf8"
)
  // only inject once
  .replace("var qawolf =", "window.qawolf = window.qawolf ||")
  // remove last semicolon for playwright sources
  .slice(0, -2);

export const buildCaptureLogsScript = (logLevel: string) => {
  return `
  if (!window.qaw_captureLogs) {
    window.qaw_captureLogs = true;
    window.qawolf.captureLogs("${logLevel}", window.qaw_log);
  }`;
};

export const buildRecordEventsScript = (pageIndex: number) =>
  `window.qaw_recorder = window.qaw_recorder || new qawolf.Recorder("${CONFIG.attribute}", ${pageIndex}, (event) => qaw_onRecordEvent(event));`;
