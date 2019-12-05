import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Event } from "@qawolf/types";
import fs from "fs-extra";
import path from "path";
import { Page } from "./Page";
import { retryExecutionError } from "../retry";
import { eventWithTime } from "rrweb/typings/types";

const qawolfJs = fs.readFileSync(
  path.resolve(path.dirname(require.resolve("@qawolf/web")), "./qawolf.web.js"),
  "utf8"
);

const recordDomJs = `${fs.readFileSync(
  path.resolve(path.dirname(require.resolve("rrweb")), "../dist/rrweb.min.js"),
  "utf8"
)}

if (!window.qaw_rrweb) {
  window.qaw_rrweb = true;
  rrweb.record({ emit: event => qaw_onDomEvent(event) });
}
`;

export const bundleJs = (
  recordDom: boolean,
  recordEvents: boolean,
  pageIndex: number
) => {
  const recordEventsJs = `window.qaw_recorder = window.qaw_recorder || new qawolf.Recorder("${CONFIG.dataAttribute}", ${pageIndex}, (event) => qaw_onEvent(event));`;

  let bundle = qawolfJs;
  if (recordDom) bundle += recordDomJs;
  if (recordEvents) bundle += recordEventsJs;
  return bundle;
};

export const captureDomEvents = async (page: Page) => {
  await page.super.exposeFunction("qaw_onDomEvent", (event: eventWithTime) => {
    page.domEvents.push(event);
  });
};

export const captureEvents = async (page: Page) => {
  await page.super.exposeFunction("qaw_onEvent", (event: Event) => {
    logger.debug(`Page: received event ${JSON.stringify(event)}`);
    page.events.push(event);
  });
};

export const injectBundle = async (
  page: Page,
  recordDom: boolean,
  recordEvents: boolean
) => {
  const bundle = bundleJs(recordDom, recordEvents, page.index);

  if (recordDom) {
    await captureDomEvents(page);
  }

  if (recordEvents) {
    await captureEvents(page);
  }

  await Promise.all([
    retryExecutionError(() => page.super.evaluate(bundle)),
    page.super.evaluateOnNewDocument(bundle)
  ]);
};
