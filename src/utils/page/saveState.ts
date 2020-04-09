import { ensureFile, writeJSON } from 'fs-extra';
import { Page } from 'playwright';

// need to manually specify
// https://github.com/microsoft/playwright/issues/1732
type BrowserContextCookies = {
  name: string;
  value: string;
  domain: string;
  path: string;
  /**
   * Unix time in seconds.
   */
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
};

export interface State {
  cookies: BrowserContextCookies[];
  localStorage: object;
  sessionStorage: object;
}

const getState = async (page: Page): Promise<State> => {
  const context = page.context();
  const cookies = await context.cookies();
  const { localStorage, sessionStorage } = await page.evaluate(() => {
    return {
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
    };
  });

  return { cookies, localStorage, sessionStorage };
};

export const saveState = async (
  page: Page,
  savePath: string,
): Promise<void> => {
  const state = await getState(page);

  await ensureFile(savePath);
  return writeJSON(savePath, state);
};
