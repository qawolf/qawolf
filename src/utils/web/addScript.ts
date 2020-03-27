import { readFileSync } from 'fs';
import { Page } from 'playwright';
import { initEvaluateScript } from '../page/initEvaluateScript';

const scriptPath = require.resolve('../../build/playwrightutils.web.js');

const script = readFileSync(scriptPath, 'utf8').replace(
  'var playwrightutils =',
  'window.playwrightutils = window.playwrightutils ||',
);

type InjectedPage = Page & {
  _hasPlaywrightUtilsWeb: boolean;
};

export const addScript = async (page: Page): Promise<void> => {
  if ((page as InjectedPage)._hasPlaywrightUtilsWeb) return;
  (page as InjectedPage)._hasPlaywrightUtilsWeb = true;
  await initEvaluateScript(page, script);
};
