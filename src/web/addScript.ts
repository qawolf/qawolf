import { readFileSync } from 'fs';
import { BrowserContext } from 'playwright-core';
import { forEachPage, initEvaluateScript } from 'playwright-utils';

const scriptPath = require.resolve('../../build/qawolf.web.js');

export const webScript = readFileSync(scriptPath, 'utf8').replace(
  'var qawolf =',
  'window.qawolf = window.qawolf ||',
);

export const addScript = async (context: BrowserContext): Promise<void> => {
  await forEachPage(context, async page => initEvaluateScript(page, webScript));
};
