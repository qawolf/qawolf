import { logger } from "@qawolf/logger";
import { QAWolfWeb } from "@qawolf/web";
import { JSHandle, Page as PuppeteerPage } from "puppeteer";

export const captureLogs = (page: PuppeteerPage) => {
  // XXX port to rrweb
  page.on("console", async msg => {
    const url = page.url().substring(0, 40);

    try {
      const args = await Promise.all(
        msg.args().map(arg => formatJsHandle(arg))
      );
      const consoleMessage = args.filter(v => !!v).join(", ");
      if (!consoleMessage.length) return;

      // log as console.verbose(arg1, ...)
      logger.verbose(`${url} console.${msg.type()}(${consoleMessage})`);
    } catch (e) {
      // if argument parsing crashes log the original message
      // ex. when the context is destroyed due to page navigation
      // XXX this is why we need to change logging to be intercepted on the client
      logger.verbose(`${url}: ${msg.text()}`);
    }
  });

  const logError = (e: Error) => {
    logger.verbose(
      `page ${page.url().substring(0, 40)}: console.error("${e.toString()}")`
    );
  };
  page.on("error", logError);
  page.on("pageerror", logError);
};

const formatJsHandle = (jsHandle: JSHandle) => {
  const element = jsHandle.asElement();

  return jsHandle.executionContext().evaluate(
    (obj, element) => {
      try {
        if (element) {
          // log elements by their xpath
          const qawolf: QAWolfWeb = (window as any).qawolf;
          return qawolf.xpath.getXpath(element);
        }

        return JSON.stringify(obj);
      } catch (e) {
        return obj.toString();
      }
    },
    jsHandle,
    element
  );
};
