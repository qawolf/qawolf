import { readFileSync } from 'fs';
import { BrowserContext, Page } from 'playwright';
import { forEachPage, initEvaluateScript } from '../utils';

const scriptPath = require.resolve('../../build/qawolf.web.js');

export const webScript = readFileSync(scriptPath, 'utf8').replace(
  'var qawolf =',
  'window.qawolf = window.qawolf ||',
);

type InjectedPage = Page & {
  _hasQAWolfWeb: boolean;
};

export const addScriptToPage = async (page: Page): Promise<void> => {
  if ((page as InjectedPage)._hasQAWolfWeb) return;
  (page as InjectedPage)._hasQAWolfWeb = true;

  await initEvaluateScript(page, webScript);
};

export const addScriptToContext = async (
  context: BrowserContext,
): Promise<void> => {
  await forEachPage(context, async (page) => addScriptToPage(page));
};
