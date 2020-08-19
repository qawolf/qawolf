import Debug from 'debug';
import { appendFileSync, ensureDir } from 'fs-extra';
import { join } from 'path';
import { BrowserContext } from 'playwright';
import { getFfmpegPath, saveVideo, PageVideoCapture } from 'playwright-video';
import { forEachPage } from './forEach';
import { IndexedPage } from './indexPages';
import { LogEvent } from '../../types';

const debug = Debug('qawolf:saveArtifacts');

const capturesToStop: PageVideoCapture[] = [];

export const saveConsoleLogs = async (
  context: BrowserContext,
  saveDir: string,
): Promise<void> => {
  const logPath = new Map<number, string>();

  await context.exposeBinding(
    'qawLogEvent',
    ({ page }, { level, message }: LogEvent) => {
      const pageIndex = (page as IndexedPage).createdIndex;
      if (!logPath.has(pageIndex)) {
        const timestamp = Date.now();
        debug(`save logs for page ${pageIndex} at ${timestamp}`);
        logPath.set(
          pageIndex,
          join(saveDir, `logs_${pageIndex}_${timestamp}.txt`),
        );
      }

      appendFileSync(logPath.get(pageIndex), `${level}: ${message}\n`);
    },
  );
};

export const saveArtifacts = async (
  context: BrowserContext,
  saveDir: string,
): Promise<void> => {
  // only record a video if ffmpeg installed
  const includeVideo = !!getFfmpegPath();
  let pageCount = 0;

  await ensureDir(saveDir);

  await saveConsoleLogs(context, saveDir);

  await forEachPage(context, async (page) => {
    const timestamp = Date.now();
    const pageIndex = pageCount++;
    debug(`save artifacts for page ${pageIndex} at ${timestamp}`);

    try {
      if (includeVideo) {
        debug(`save video for page ${pageIndex}`);
        const capture = await saveVideo(
          // playwright-video still depends on playwright-core
          page as any,
          join(saveDir, `video_${pageIndex}_${timestamp}.mp4`),
        );
        capturesToStop.push(capture);
      } else {
        debug(`ffmpeg not found, skipping video for page ${pageIndex}`);
      }
    } catch (error) {
      debug(`cannot save artifacts for page ${pageIndex}: ${error.message}`);
    }
  });
};

export const stopVideos = async (): Promise<void> => {
  await Promise.all(capturesToStop.map((capture) => capture.stop()));
};
