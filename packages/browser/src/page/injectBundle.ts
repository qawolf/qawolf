import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Event } from "@qawolf/types";
import { readFileSync } from "fs-extra";
import { dirname, resolve } from "path";
import { eventWithTime } from "rrweb/typings/types";
import { Page } from "./Page";
import { retryExecutionError } from "../retry";

const qawolfJs = readFileSync(
  resolve(dirname(require.resolve("@qawolf/web")), "./qawolf.web.js"),
  "utf8"
)
  // only inject once
  .replace("var qawolf =", "window.qawolf = window.qawolf ||");

const recordDomJs = `${readFileSync(
  resolve(dirname(require.resolve("rrweb")), "../dist/rrweb.min.js"),
  "utf8"
)}

if (!window.qaw_rrweb) {
  window.qaw_rrweb = true;
  rrweb.record({ emit: event => qaw_onDomEvent(event) });
}
`;

const recordEventsJs = (pageIndex: number) =>
  `window.qaw_recorder = window.qaw_recorder || new qawolf.Recorder("${CONFIG.attribute}", ${pageIndex}, (event) => qaw_onEvent(event));`;

export const bundleJs = (
  recordDom: boolean,
  recordEvents: boolean,
  pageIndex: number
) => {
  let bundle = qawolfJs;
  if (recordDom) bundle += recordDomJs;
  if (recordEvents) bundle += recordEventsJs(pageIndex);
  return bundle;
};

export const captureDomEvents = async (page: Page) => {
  await page.exposeFunction("qaw_onDomEvent", (event: eventWithTime) => {
    page.qawolf.domEvents.push(event);
  });
};

export const captureEvents = async (page: Page) => {
  await page.exposeFunction("qaw_onEvent", (event: Event) => {
    logger.debug(`Page: received event ${JSON.stringify(event)}`);
    page.qawolf.events.push(event);
  });
};

export const captureLogs = async (page: Page) => {
  await page.exposeFunction(
    "qaw_log",
    // TODO change to browser logger.
    (level: keyof Console, message: string) => console[level](message)
  );
};

export const injectBundle = async (
  page: Page,
  recordDom: boolean,
  recordEvents: boolean
) => {
  const bundle = bundleJs(recordDom, recordEvents, page.qawolf.index);

  const functionPromises = [captureLogs(page)];

  if (recordDom) {
    functionPromises.push(captureDomEvents(page));
  }

  if (recordEvents) {
    functionPromises.push(captureEvents(page));
  }

  await Promise.all(functionPromises);

  await Promise.all([
    retryExecutionError(() => page.evaluate(bundle)),
    page.evaluateOnNewDocument(bundle)
  ]);
};
