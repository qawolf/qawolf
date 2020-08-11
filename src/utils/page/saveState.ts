import { ensureFile, writeJSON } from 'fs-extra';
import { Cookie, Page } from 'playwright';

export interface State {
  cookies: Cookie[];
  localStorage: { [name: string]: any };
  sessionStorage: { [name: string]: any };
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
