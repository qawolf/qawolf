import { Page } from 'playwright-core';
import { initEvaluateScript } from './initEvaluateScript';
import { QAWolfWeb } from '../../web';
import { LogCallback } from '../../web/interceptConsoleLogs';
import { addScriptToPage } from '../../web/addScript';

let logCallbackId = 0;

export const interceptConsoleLogs = async (
  page: Page,
  callback: LogCallback,
): Promise<void> => {
  await addScriptToPage(page);

  const callbackName = `interceptLogs${logCallbackId++}`;
  await page.exposeFunction(callbackName, callback);

  await initEvaluateScript(
    page,
    (callbackName: string) => {
      const web: QAWolfWeb = (window as any).qawolf;
      web.interceptConsoleLogs(callbackName);
    },
    callbackName,
  );
};
