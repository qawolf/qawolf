import { readFileSync } from 'fs';
import { join } from 'path';
import { BrowserContext } from 'playwright-core';
import { forEachPage, initEvaluateScript } from 'playwright-utils';

export const WEB_SCRIPT = readFileSync(
  join(__dirname.replace('/src', '/build'), 'createplaywright.web.js'),
  'utf8',
).replace(
  'var createplaywright =',
  'window.createplaywright = window.createplaywright ||',
);

export const addWebScript = async (context: BrowserContext): Promise<void> => {
  await forEachPage(context, async page =>
    initEvaluateScript(page, WEB_SCRIPT),
  );
};
