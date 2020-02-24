// TODO...
// import { CONFIG } from "@qawolf/config";
// import { logger } from "@qawolf/logger";
// import { BrowserType, getBrowserType } from "@qawolf/types";
// import { platform } from "os";
// import playwright from "playwright";
// import { DeviceDescriptor } from "playwright-core/lib/types";
// import { LaunchOptions as PlaywrightLaunchOptions } from "playwright-core/lib/server/browserType";
// import {
//   CreateContextOptions,
//   QAWolfBrowserContext
// } from "./QAWolfBrowserContext";

// export type LaunchOptions = PlaywrightLaunchOptions &
//   Omit<CreateContextOptions, "device"> & {
//     browser?: BrowserType;
//     device?: DeviceDescriptor | string;
//   };

// export const buildLaunchOptions = (options: LaunchOptions) => {
//   const browserType = getBrowserType(options.browser || CONFIG.browser);

//   const device = getDevice(options.device);

//   const headless = options.headless || CONFIG.headless;

//   const windowSize = {
//     height: device.viewport.height,
//     width: device.viewport.width
//   };

//   let args: string[] = [];
//   if (browserType === "chromium") {
//     args = [
//       "--disable-dev-shm-usage",
//       "--no-default-browser-check",
//       "--window-position=0,0"
//     ];

//     if (platform() === "linux") {
//       // We use --no-sandbox because we cannot change the USER for certain CIs (like GitHub).
//       // "Ensure your Dockerfile does not set the USER instruction, otherwise you will not be able to access GITHUB_WORKSPACE"
//       args.push("--no-sandbox");
//     }

//     // browser frame with "controlled by automated"
//     windowSize.height += 120;

//     if (!headless) {
//       args.push(`--window-size=${windowSize.width},${windowSize.height}`);
//     }
//   } else if (browserType === "firefox") {
//     // browser frame
//     windowSize.height += 40;

//     if (!headless) {
//       args = [
//         "-width",
//         `${windowSize.width}`,
//         "-height",
//         `${windowSize.height}`
//       ];
//     }
//   } else if (browserType === "webkit") {
//     // browser frame
//     windowSize.height += 40;
//   }

//   const launchOptions = {
//     args,
//     ...options,
//     browserType,
//     device,
//     headless,
//     windowSize
//   };

//   return launchOptions;
// };

// export const launch = async (options: LaunchOptions = {}) => {
//   logger.verbose(`launch: ${JSON.stringify(options)}`);

//   const { browserType, windowSize, ...launchOptions } = buildLaunchOptions(
//     options
//   );

//   logger.verbose(`launch: browser ${JSON.stringify(launchOptions)}`);
//   try {
//     const playwrightBrowser = await playwright[browserType].launch(
//       launchOptions
//     );

//     const context = await QAWolfBrowserContext.create(
//       browserType,
//       playwrightBrowser,
//       launchOptions
//     );

//     // bring the first page to front (if possible)
//     // we do this in case it is a short test with only one action
//     // to make sure the browser shows up in the video
//     await context.page();

//     return context;
//   } catch (e) {
//     logger.error(`launch: failed ${e.toString()}`);
//     throw e;
//   }
// };
