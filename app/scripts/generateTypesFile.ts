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
  const globalTypes = readFile("../node_modules/@types/node/globals.d.ts");

  const types = `${globalTypes}

${assertTypes}

declare module 'axios' {
  ${axiosTypes}
}

declare module 'playwright' {
    ${playwrightProtocol}
    ${playwrightTypes}
}

declare const assert: typeof import("assert");
declare const axios: typeof import("axios").default;
declare const devices: typeof import("playwright").devices;

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
`;

  writeFileSync("./public/types.txt", types);
};

generateTypesFile();
