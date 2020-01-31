import { CONFIG } from "@qawolf/config";
import playwright from "playwright";
import { ConnectOptions as PlaywrightConnectOptions } from "playwright-core/lib/browser";
import { getDevice } from "./device";
import { logTestStarted } from "./launch";
import {
  QAWolfBrowserContext,
  QAWolfContextOptions
} from "./QAWolfBrowserContext";

export type ConnectOptions = PlaywrightConnectOptions & QAWolfContextOptions;

// TODO refactor connect, launch and launchPlaywright to a Launcher...

export const connect = async (options: ConnectOptions) => {
  const playwrightBrowser = await playwright[
    options.browser || CONFIG.browser
  ].connect(options);

  const device = getDevice(options.device);

  const playwrightBrowserContext = await playwrightBrowser.newContext({
    userAgent: device.userAgent,
    viewport: device.viewport
  });

  await playwrightBrowserContext.newPage();

  const qawolfContext = new QAWolfBrowserContext({
    // TODO consider how to deal with capture on connected browser
    capture: null,
    debug: options.debug || CONFIG.debug,
    device,
    logLevel: options.logLevel || CONFIG.logLevel || "error",
    navigationTimeoutMs: options.navigationTimeoutMs,
    playwrightBrowser,
    playwrightBrowserContext,
    recordEvents: options.recordEvents
  });

  const context = qawolfContext.decorated;

  if (options.url) await context.goto(options.url);

  logTestStarted(context);

  return context;
};
