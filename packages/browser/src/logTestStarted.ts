// import { logger } from "@qawolf/logger";
// import { BrowserContext } from "./BrowserContext";

// TODO
// export const logTestStarted = (context: BrowserContext) => {
//   /**
//    * Log when a test starts in the browser to provide context.
//    */
//   const jasmine = (global as any).jasmine;
//   if (!jasmine || !jasmine.qawolf) return;

//   jasmine.qawolf.onTestStarted(async (name: string) => {
//     try {
//       // TODO find the current page?
//       const page = await context.page({ bringToFront: false });
//       await page.evaluate((testName: string) => {
//         console.log(`jest: ${testName}`);
//       }, name);
//     } catch (e) {
//       logger.debug(`could not log test started: ${e.toString()}`);
//     }
//   });
// };
