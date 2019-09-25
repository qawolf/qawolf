import { slug } from "cuid";
import { BrowserObject } from "webdriverio";
import { injectClient } from "./browserUtils";
import { CONFIG } from "../config";
import { Connection } from "./Connection";
import { logger } from "../logger";
import { Server } from "./Server";

type CreateConnectionArgs = {
  id?: string;
  browser: BrowserObject;
  server: Server;
  windowHandle?: string;
};

export const createConnection = async (args: CreateConnectionArgs) => {
  let { id = slug(), browser, server, windowHandle } = args;
  logger.debug(`createConnection ${args}`);

  if (windowHandle) {
    await browser.switchToWindow(windowHandle);
  } else {
    windowHandle = await browser.getWindowHandle();
  }

  const socketPromise = server.onConnection(id);

  await injectClient(browser, {
    id,
    uri: `${CONFIG.wsUrl}:${server.port}`
  });

  const socket = await socketPromise;

  const connection = new Connection(socket, windowHandle);
  return connection;
};
