import Debug from 'debug';
// import { appendFileSync } from 'fs';
// import { ensureDir } from 'fs-extra';
// import { dirname } from 'path';
import { Page } from 'playwright-core';
// import { QAWolfWeb } from '../../web';
// import { LogCallback } from '../../web/interceptConsoleLogs';

// const debug = Debug('qawolf:saveConsoleLogs');

// let logCallbackId = 0;

// export const interceptConsoleLogs = async (
//   page: Page,
//   callback: LogCallback,
// ): Promise<void> => {
//   // TODO refactor
//   // await addScriptToPage(page);

//   const callbackName = `interceptLogs${logCallbackId++}`;
//   await page.exposeFunction(callbackName, callback);

//   await initEvaluateScript(
//     page,
//     (callbackName: string) => {
//       const web: QAWolfWeb = (window as any).qawolf;
//       web.interceptConsoleLogs(callbackName);
//     },
//     callbackName,
//   );
// };

export const saveConsoleLogs = async (
  page: Page,
  savePath: string,
): Promise<void> => {
  console.log('page', page, 'savePath', savePath);
  // TODO
  // debug(`save console logs at ${savePath}`);
  // await ensureDir(dirname(savePath));
  // const callback = (level: string, message: string): void => {
  //   const line = `${level}: ${message}\n`;
  //   appendFileSync(savePath, line);
  // };
  // return interceptConsoleLogs(page, callback);
};
