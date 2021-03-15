import http from "http";
import path from "path";
import { Browser, BrowserContext, Page } from "playwright";
import handler from "serve-handler";

import { launch as launchBrowserContext } from "../src/environment/launch";

export type FixturesServer = {
  close: () => void;
  url: string;
};

export type LaunchResult = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
};

export const launch = async ({
  devtools,
}: { devtools?: boolean } = {}): Promise<LaunchResult> => {
  const { browser, context } = await launchBrowserContext({
    devtools,
    headless: !devtools,
  });

  const page = await context.newPage();

  // workaround since we need to navigate for init script
  await page.goto("file://" + require.resolve("./fixtures/empty.html"));

  return { browser, context, page };
};

// https://gist.github.com/6174/6062387
export const randomString = (): string =>
  Math.random().toString(36).substring(2, 15);

export const setBody = async (page: Page, content: string): Promise<void> => {
  await page.setContent(`<html><body>${content}</body></html`);

  // we need to restart it after setting content
  // probabbly due to the way playwright overwrites the document when setting content
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).qawActionRecorder.stop();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).qawActionRecorder.start();
  });
};

export const serveFixtures = async (): Promise<FixturesServer> => {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: path.join(__dirname, "./fixtures"),
    });
  });

  return new Promise((resolve) => {
    server.listen(0, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const port = (server.address() as any).port;

      resolve({
        close: () => server.close(),
        url: `http://127.0.0.1:${port}`,
      });
    });
  });
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
