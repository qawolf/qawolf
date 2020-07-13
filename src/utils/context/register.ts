import Debug from 'debug';
import { readFileSync } from 'fs';
import { BrowserContext, Page } from 'playwright-core';
import { basename, join } from 'path';
import { loadConfig } from '../../config';
import { Registry } from '../Registry';
import { saveArtifacts } from './saveArtifacts';

const debug = Debug('qawolf:register');

const scriptPath = require.resolve('../../../build/qawolf.web.js');
const webScript = readFileSync(scriptPath, 'utf8');

export type IndexedPage = Page & {
  createdIndex: number;
};

export type RegisteredBrowserContext = BrowserContext & {
  _qawRegistered: boolean;
};

export const addInitScript = async (context: BrowserContext): Promise<void> => {
  const attribute = JSON.stringify(loadConfig().attribute);

  const script =
    '(() => {\n' +
    webScript +
    `\nnew qawolf.PageEventCollector({ attribute: ${attribute} });\n` +
    '})();';

  await context.addInitScript(script);
};

export const isRegistered = (context: BrowserContext): boolean => {
  return !!(context as RegisteredBrowserContext)._qawRegistered;
};

export const getArtifactPath = (): string | null => {
  let artifactPath = process.env.QAW_ARTIFACT_PATH;
  if (!artifactPath) return null;

  if (require.main) {
    // store artifacts under the name of the main module, if there is one
    // ex. /artifacts/search.test.js
    artifactPath = join(artifactPath, basename(require.main.filename));
  }

  // store artifacts under the name of the browser being tested
  const browserName = process.env.QAW_BROWSER;
  if (browserName && artifactPath) {
    artifactPath = join(artifactPath, browserName);
  }

  return artifactPath;
};

export const indexPages = async (context: BrowserContext): Promise<void> => {
  /**
   * Set page.createdIndex on pages.
   */
  let index = 0;

  const pages = context.pages();
  if (pages.length > 1) {
    throw new Error(
      `Cannot index pages when more than 1 exist (${pages.length})`,
    );
  }

  if (pages[0]) {
    debug(`index existing page ${index}`);
    (pages[0] as IndexedPage).createdIndex = index++;
  }

  context.on('page', (page: IndexedPage) => {
    debug(`index created page ${index}`);
    page.createdIndex = index++;
  });
};

export const register = async (context: BrowserContext): Promise<void> => {
  Registry.instance().setContext(context);

  if (isRegistered(context)) return;
  (context as RegisteredBrowserContext)._qawRegistered = true;

  const promises: Promise<any>[] = [];

  promises.push(addInitScript(context));

  promises.push(indexPages(context));

  const artifactPath = getArtifactPath();
  if (artifactPath) {
    promises.push(saveArtifacts(context, artifactPath));
  }

  await Promise.all(promises);
};
