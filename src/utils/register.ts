import { BrowserContext } from 'playwright';
import { register as registerHtmlSelector } from 'playwright-html-selector';
import { basename, join } from 'path';
import { indexPages } from './context/indexPages';
import { saveArtifacts } from './context/saveArtifacts';
import { Registry } from './Registry';

let htmlSelectorRegistered = false;

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

  const promises: Promise<any>[] = [];

  promises.push(indexPages(context));

  if (!htmlSelectorRegistered) {
    htmlSelectorRegistered = true;
    promises.push(registerHtmlSelector());
  }

  const artifactPath = getArtifactPath();
  if (artifactPath) {
    promises.push(saveArtifacts(context, artifactPath));
  }

  await Promise.all(promises);
};
