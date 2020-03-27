import { ChildProcess } from 'child_process';
import Debug from 'debug';
import open from 'open';
import { Page } from 'playwright';
import { file } from 'tempy';

const debug = Debug('qawolf:openScreenshot');

export const openScreenshot = async (page: Page): Promise<ChildProcess> => {
  const path = file({ extension: 'png' });
  await page.screenshot({ path });
  debug('saved screenshot to %s', path);
  const process = await open(path);
  debug('opened screenshot');
  return process;
};
