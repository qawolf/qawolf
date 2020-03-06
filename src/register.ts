import { BrowserContext } from 'playwright';
import { register as registerHtmlSelector } from 'playwright-html-selector';
import { saveArtifacts, ReplContext } from 'playwright-utils';
import { CONFIG } from './config';

let htmlSelectorRegistered = false;

export const register = async (context: BrowserContext): Promise<void> => {
  ReplContext.set('context', context);

  if (!htmlSelectorRegistered) {
    htmlSelectorRegistered = true;
    await registerHtmlSelector();
  }

  if (CONFIG.artifactPath) await saveArtifacts(context, CONFIG.artifactPath);
};
