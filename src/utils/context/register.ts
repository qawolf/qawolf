import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { BrowserContext } from 'playwright';
import { loadConfig } from '../../config';
import { indexPages } from './indexPages';
import { Registry } from '../Registry';
import { saveArtifacts } from './saveArtifacts';

const scriptPath = require.resolve('../../../build/qawolf.web.js');
const webScript = readFileSync(scriptPath, 'utf8');

export type RegisteredBrowserContext = BrowserContext & {
  _qawRegistered: boolean;
};

export const addInitScript = async (context: BrowserContext): Promise<void> => {
  const attribute = JSON.stringify(loadConfig().attribute);

  const script =
    '(() => {\n' +
    webScript +
    `new qawolf.PageEventCollector({ attribute: ${attribute} });\n` +
    'qawolf.interceptConsoleLogs();\n' +
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
