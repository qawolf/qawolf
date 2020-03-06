import { readFileSync } from 'fs';
import { join } from 'path';
import { BrowserContext } from 'playwright-core';
import { forEachPage, initEvaluateScript } from 'playwright-utils';

export const WEB_SCRIPT = readFileSync(
  join(__dirname.replace('/src', '/build'), '../qawolf.web.js'),
  'utf8',
).replace('var qawolf =', 'window.qawolf = window.qawolf ||');

export const addWebScript = async (context: BrowserContext): Promise<void> => {
  await forEachPage(context, async page =>
    initEvaluateScript(page, WEB_SCRIPT),
  );
};
