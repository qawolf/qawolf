import Debug from "debug";
import fs from "fs";
import path from "path";

import config from "./config";
import { launch } from "./environment/launch";
import { RunnerServer } from "./server/RunnerServer";

const debug = Debug("qawolf:index");

const { access } = fs.promises;

const recorderScriptPath = require.resolve(
  path.join(__filename, `../../${config.RECORDER_SCRIPT_FILENAME}`)
);

export const warmUp = async (): Promise<void> => {
  debug("warm up");
  process.env.DISPLAY = ":0.0";
  // force the browser cold start (0.5s to 15s)
  // https://github.com/microsoft/playwright/issues/4345
  const { browser, context } = await launch({ headless: false });
  // create and navigate a page to prevent an issue where
  // the first page opened has an issue resolving a url
  const page = await context.newPage();
  await page.goto("https://google.com");
  await browser.close();
};

export const verifyRecorderScriptExists = async (): Promise<void> => {
  try {
    await access(recorderScriptPath);
  } catch (error) {
    debug(
      `QA Wolf recorder script not found at "${path.resolve(
        recorderScriptPath
      )}". `,
      "Did you do `npm run build-recorder-script`?"
    );
    process.exit(1);
  }
};

export const start = async (): Promise<RunnerServer> => {
  await verifyRecorderScriptExists();

  // warm up the session before starting the server or
  // notifying that the session is ready
  await warmUp();

  const server = await RunnerServer.start();

  process.on("SIGTERM", () => {
    server.close();
  });

  return server;
};

if (require.main === module) {
  start();
}
