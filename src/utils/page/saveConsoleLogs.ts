import Debug from 'debug';
import { appendFileSync } from 'fs';
import { ensureDir } from 'fs-extra';
import { dirname } from 'path';
import { Page } from 'playwright';
import { interceptConsoleLogs } from './interceptConsoleLogs';

const debug = Debug('qawolf:saveConsoleLogs');

export const saveConsoleLogs = async (
  page: Page,
  savePath: string,
): Promise<void> => {
  debug(`save console logs at ${savePath}`);

  await ensureDir(dirname(savePath));

  const callback = (level: string, message: string): void => {
    const line = `${level}: ${message}\n`;
    appendFileSync(savePath, line);
  };

  return interceptConsoleLogs(page, callback);
};
