import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export const readFile = (relativePath: string): string => {
  return readFileSync(resolve(__dirname, relativePath)).toString();
};

const generateTypesFile = () => {
  const playwrightProtocol = readFile(
    "../node_modules/playwright/types/protocol.d.ts"
  );
  const playwrightTypes = readFile(
    "../node_modules/playwright/types/types.d.ts"
  );

  const assertTypes = readFile("../node_modules/@types/node/assert.d.ts");
  const axiosTypes = readFile("../node_modules/axios/index.d.ts");
  const fakerTypes = readFile("../node_modules/@types/faker/index.d.ts");
  const globalTypes = readFile("../node_modules/@types/node/globals.d.ts");

  const types = `${globalTypes}

${assertTypes}

declare module 'axios' {
  ${axiosTypes}
}

declare module 'faker' {
  ${fakerTypes}
}

declare module 'playwright' {
    ${playwrightProtocol}
    ${playwrightTypes}
}

declare const assert: typeof import("assert");
declare const axios: typeof import("axios").default;
declare const devices: typeof import("playwright").devices;
declare const faker: typeof import("faker");

type LaunchOptions = Pick<import("playwright").BrowserContextOptions,
"acceptDownloads" |
"bypassCSP" |
"colorScheme" |
"deviceScaleFactor" |
"extraHTTPHeaders" |
"geolocation" |
"hasTouch" |
"httpCredentials" |
"ignoreHTTPSErrors" |
"isMobile" |
"locale" |
"offline" |
"permissions" |
"proxy" |
"storageState" |
"timezoneId" |
"userAgent" |
"viewport"
> &
Pick<import("playwright").LaunchOptions,
"args" |
"devtools" |
"env" |
"firefoxUserPrefs" |
"proxy" |
"slowMo" |
"timeout"> & {
  allowTracking?: boolean;
  browser?: "chromium" | "firefox" | "webkit";
  headless?: boolean;
};

/**
 * Launch a Playwright browser and context.
 *
 * \`\`\`js
 * // emulate a device
 * const { context } = await launch({ ...devices['iPhone 8'] });
 * \`\`\`
 *
 * \`\`\`js
 * // launch webkit
 * const { context } = await launch({ browser: "webkit" });
 * \`\`\`
 * 
 *  \`\`\`js
 * // open devtools
 * const { context } = await launch({ devtools: true });
 * \`\`\`
 */
declare function launch(
  options: LaunchOptions
): Promise<{
  browser: import("playwright").Browser;
  context: import("playwright").BrowserContext;
}>;

/**
 * Launch a Playwright browser and context.
 */
declare function launch(
  options: LaunchOptions
): Promise<{
  browser: import("playwright").Browser;
  context: import("playwright").BrowserContext;
}>;

/**
 * Assert the page or frame contains the specified element by selector.
 * 
 * If the element is not found before timeout, an error is thrown.
 * 
 * \`\`\`js
 * await assertElement(page, "#my-element");
 * \`\`\`
 *
 * \`\`\`js
 * await assertText(page, ".submit", { timeout: 1000 });
 * \`\`\`
 */
declare function assertElement(page: import('playwright').Page | import('playwright').Frame, selector: string, options?: { timeout?: number }): Promise<void>;

/**
 * Assert the page or frame contains the specified text. You can specify the element to check by passing a selector, otherwise it defaults to body.
 * 
 * If the element is not found or if the element does not contain the specified text before timeout, an error is thrown.
 * 
 * \`\`\`js
 * await assertText(page, "hello world!");
 * \`\`\`
 *
 * \`\`\`js
 * await assertText(page, "hello world!", { selector: "#my-input", timeout: 1000 });
 * \`\`\`
 */
declare function assertText(page: import('playwright').Page | import('playwright').Frame, text: string, options?: { selector?: string, timeout?: number }): Promise<void>;

/**
 * Test receiving an email to your team's inbox.
 * 
 * \`\`\`js
 * const { email, waitForMessage } = getInbox();
 * 
 * // use the email address in the test
 * await page.fill("#email", email);
 * await page.click("#submit");
 * 
 * // check the received email
 * const { from, html, subject, text } = await waitForMessage();
 * assert(subject.includes("Reset password"));
 * \`\`\`
 * 
 * \`\`\`js
 * // get your team's email address
 * // example: my-team@qawolf.email
 * const { email, waitForMessage } = getInbox();
 * 
 * // get a new email address
 * // example: my-team+a25sa5q@qawolf.email
 * const { email, waitForMessage } = getInbox({ new: true });
 * 
 * // get a custom email address
 * // example: my-team+admin@qawolf.email
 * const { email, waitForMessage } = getInbox({ id: "admin" });
 * 
 * // Pass after to wait for a message after that date.
 * // If not provided it will for a message after when getInbox was called.
 * const after = new Date();
 * const message = await waitForMessage({ after });
 * 
 * // Pass a timeout in milliseconds to override the default 60 seconds.
 * const message = await waitForMessage({ timeout: 120000 });
 * \`\`\`
 */
declare function getInbox(options?: { id?: string; new?: boolean; }): 
  {
    email: string; 
    sendMessage: (options: {
      html?: string;
      subject?: string;
      text?: string;
      to: string;
    }) => Promise<{ from: string; html: string; subject: string; text: string; to: string; }>;
    waitForMessage: (options?: { after?: Date; timeout?: number; }) => Promise<{ from: string; html: string; subject: string; text: string; to: string; urls: string[]>; }>;
  };

/**
 * Get the value of the specified element by selector on the page or frame.
 * 
 * If the element is not found before timeout, an error is thrown.
 * 
 * \`\`\`js
 * const value = await getValue(page, "#my-input");
 * \`\`\`
 *
 * \`\`\`js
 * const value = await getValue(page, "h1", { timeout: 1000 });
 * \`\`\`
 */
declare function getValue(page: import('playwright').Page | import('playwright').Frame, selector: string, options?: { timeout?: number }): Promise<boolean | string>;
`;

  writeFileSync("./public/types.txt", types);
};

generateTypesFile();
