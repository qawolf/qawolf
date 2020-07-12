import { readFileSync } from 'fs';
import { Page } from 'playwright-core';
import { initEvaluateScript } from '../utils';

const scriptPath = require.resolve('../../build/qawolf.web.js');

export const webScript = readFileSync(scriptPath, 'utf8');

type InjectedPage = Page & {
  _hasQAWolfWeb: boolean;
};

export const addScriptToPage = async (page: Page): Promise<void> => {
  if ((page as InjectedPage)._hasQAWolfWeb) return;
  (page as InjectedPage)._hasQAWolfWeb = true;

  await initEvaluateScript(page, webScript);
};
