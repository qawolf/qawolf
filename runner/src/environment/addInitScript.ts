import fs from "fs";
import { BrowserContext } from "playwright";

import config from "../config";

const { readFile } = fs.promises;
const recorderScriptPath = require.resolve(
  `../../${config.RECORDER_SCRIPT_FILENAME}`
);

export const addInitScript = async (context: BrowserContext): Promise<void> => {
  // You might be tempted to move this `readFile` call into the root
  // of this file, but our development env script actually relies
  // on this load happening at launch time. This allows us to hot
  // reload the recorder script without needing to restart the
  // runner server.
  const script = await readFile(recorderScriptPath, "utf8");
  await context.addInitScript(script);
};
