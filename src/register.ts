import { BrowserContext } from 'playwright';
import { register as registerHtmlSelector } from 'playwright-html-selector';
import { indexPages, saveArtifacts, ReplContext } from 'playwright-utils';
import { CONFIG } from './config';

let htmlSelectorRegistered = false;

export const register = async (context: BrowserContext): Promise<void> => {
  ReplContext.set('context', context);

  const promises: Promise<any>[] = [];

  promises.push(indexPages(context));

  if (!htmlSelectorRegistered) {
    htmlSelectorRegistered = true;
    promises.push(registerHtmlSelector());
  }

  if (CONFIG.artifactPath) {
    promises.push(saveArtifacts(context, CONFIG.artifactPath));
  }

  await Promise.all(promises);
};
